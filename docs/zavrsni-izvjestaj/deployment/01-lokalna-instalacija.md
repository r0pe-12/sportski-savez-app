# Lokalna instalacija — korak-po-korak (v1.0)

> **Pokriva profesorov zahtjev 3a/3b:** priprema za puštanje u rad + integracija.

Cilj: pustiti aplikaciju na lokalnoj mašini za ~10 minuta od čistog checkout-a. Testirano na Windows 11, macOS 14, Ubuntu 24.04.

## Prerequisites

| Alat | Verzija | Provjera |
|---|---|---|
| PHP | 8.3+ (iz `composer.json`: `"php": "^8.3"`) | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js | 20+ LTS (preporučeno 22) | `node -v` |
| npm | 10+ | `npm -v` |
| Git | 2.x | `git --version` |
| SQLite | 3.x (PDO ekstenzija PHP-a) | `php -m | findstr sqlite` (Windows) ili `php -m \| grep sqlite` (Unix) |

**Windows:** preporučujemo PHP iz https://windows.php.net/download/ (zip distribucija, dodati u PATH, uključiti `extension=pdo_sqlite`, `extension=mbstring`, `extension=openssl`, `extension=fileinfo` u `php.ini`). Composer https://getcomposer.org/Composer-Setup.exe. Node https://nodejs.org/ (LTS).

**macOS:**
```bash
brew install php@8.3 composer node git sqlite
brew link --force --overwrite php@8.3
```

**Linux (Ubuntu 24.04):**
```bash
sudo apt-get update
sudo apt-get install -y php8.3 php8.3-{cli,xml,mbstring,sqlite3,curl,zip,gd,intl} composer nodejs npm git
```

Ako Ubuntu repo ima stari Node, instaliraj iz NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Koraci

### 1. Clone repozitorija

```bash
git clone <repo-url> sportski-savez-app
cd sportski-savez-app
```

### 2. Backend dependencies

```bash
composer install
```

Očekivani izlaz: "Generating optimized autoload files ... 100+ packages installed". Trajanje 30s–2min zavisno od cache-a.

### 3. Frontend dependencies

```bash
npm install
```

Trajanje: 2–5 minuta zavisno od mreže.

### 4. Environment

```bash
# Linux/macOS:
cp .env.example .env

# Windows PowerShell:
Copy-Item .env.example .env
```

```bash
php artisan key:generate
```

Očekivani izlaz: `Application key set successfully.`

### 5. SQLite baza

```bash
# Linux/macOS:
touch database/database.sqlite

# Windows PowerShell:
New-Item -ItemType File database/database.sqlite -Force:$false
```

### 6. Migrate + seed

```bash
php artisan migrate
php artisan db:seed
```

Očekivani izlaz: 30+ migracija "DONE", svi seederi zelenu poruku (admin user, profesor user, škole, sportovi, takmičenja, AI dnevnik).

**VAŽNO:** NIKAD ne pokreći `php artisan migrate:fresh` jer briše `ai_dnevnik_sesije` tabelu koja čuva evidenciju rada za ADIS predaju (vidi CLAUDE.md sekcija 2.1). Ako MORA fresh: backup tabele kroz `php artisan db:seed --class=AiDnevnikSeeder` posle migracije.

### 7. Storage symlink (za upload foldere)

```bash
php artisan storage:link
```

### 8. Pokreni dev server

```bash
composer run dev
```

Pokreće paralelno: `php artisan serve` (port 8000), `npm run dev` (Vite port 5173), `php artisan queue:work` (queue worker), `php artisan pail` (log tail).

Ako `composer run dev` ne radi (Windows bez `concurrently`), pokreni ručno u 4 terminala:

```powershell
# Terminal 1 — web server
php artisan serve

# Terminal 2 — Vite dev server (HMR)
npm run dev

# Terminal 3 — queue worker (OBAVEZNO za OCR i eDnevnik)
php artisan queue:work

# Terminal 4 — log tail (opciono, korisno za debug)
php artisan pail
```

### 9. Otvori u browseru

```
http://localhost:8000
```

Trebao bi vidjeti landing stranicu sa dugmadima "Prijava" i "Registracija".

### 10. Login kao admin

Iz seedera (`database/seeders/DatabaseSeeder.php` i `docs/dev-credentials.md`):

| Email | Lozinka | Rola |
|---|---|---|
| `admin@savez.test` | `Adm1n!Test` | Admin |
| `profesor1@savez.test` | `Prof1!Test` | Profesor |

(Provjeri tačne vrijednosti u `database/seeders/DatabaseSeeder.php` ako se razlikuju — credentials evoluiraju kroz iteracije.)

### 11. Demo scenariji

**UC5 (Prijava ekipe):**
1. Login kao Profesor
2. `/teams` → "Nova prijava"
3. Bira sport (npr. Košarka), takmičenje
4. Dodaje 3–5 učenika iz svoje škole
5. Za svakog uploaduje PDF/JPG ljekarske potvrde (testna potvrda iz `tests/Fixtures/medical_certs/valid.pdf` ako postoji, ili bilo koji PDF — `FakeOcrAdapter` koristi file-name konvenciju)
6. Čeka da OCR validacija završi (queue:work mora biti aktivan)
7. Vraća se na prijavu → Potpiši (svoje ime i prezime) → Submit
8. Status ekipe prelazi u "Pending review"

**UC8 (eDnevnik verifikacija):**
1. Login kao Admin
2. `/admin/students` → bira nepotvrđenog učenika
3. "Verifikuj kroz eDnevnik" → dispatchuje job (radi `FakeEDnevnikAdapter`, deterministic by JMB)
4. Refresh stranice nakon ~2 sekunde
5. Status: Verified / Mismatched / Unavailable (zavisno od JMB-a — `FakeEDnevnikAdapter` koristi hash JMB-a za odluku)

**UC10 (Rezultati i medalje):**
1. Login kao Admin
2. `/admin/competitions/{id}/results` → unosi place + medal za ekipe
3. Login kao Student/Profesor → student profil pokazuje medalju u sekciji "Postignuća"

**AI dnevnik pregled (bez logina):**
- `http://localhost:8000/ai-dnevnik` — pregled svih 18 sesija sa instrukcijama, output-om, odlukama i ishodom

## Troubleshooting

### "Unable to locate file in Vite manifest"

```bash
npm run build
```

Ovo generiše production manifest. Za dev mod, jednostavno pokreni `npm run dev` u zasebnom terminalu — Inertia automatski hot-reloaduje.

### "Class 'Pdo_Sqlite' not found"

PHP nije kompajliran sa SQLite extenzijom. 
- Ubuntu: `sudo apt-get install php8.3-sqlite3`
- Windows: provjeri `php.ini` da je `extension=pdo_sqlite` uncommented, restartuj php-cli
- macOS Homebrew: trebao bi biti uključen po default-u; ako nije, `brew reinstall php@8.3`

### "Permission denied" za `storage/`

```bash
# Linux/macOS:
chmod -R 775 storage bootstrap/cache
sudo chown -R $USER:www-data storage bootstrap/cache  # ako koristiš Apache/Nginx

# Windows:
# Obično nema problema — pokreni terminal kao admin ako bude
```

### Wayfinder rute nedostaju u frontendu (`Cannot find module '@/actions/...'`)

```bash
npm run build
# ili tokom dev moda — Wayfinder Vite plugin automatski regeneriše na change
```

Ako tek nakon `npm run build` i dalje nedostaju, provjeri da `vite.config.ts` ima `wayfinder()` plugin uključen.

### Queue worker neaktivan (UC5 OCR ne radi — potvrde ostaju u "pending" stanju)

Provjeri da `php artisan queue:work` radi u zasebnom terminalu. Bez worker-a, `ValidateMedicalCertificateJob` ostaje u "pending" stanju i potvrda ne dobija status. Logovi u `storage/logs/laravel.log` ako worker padne.

### Email se ne šalje u dev modu

U dev modu email se piše u `storage/logs/laravel.log` (driver `log`). Provjeri tu, ne u inbox. Da se zaista šalje, podesi `MAIL_MAILER=smtp` u `.env` i konfiguriši SMTP host/port/credentials.

### `composer run dev` ne nalazi `concurrently`

Windows PowerShell ponekad ne može da pokrene paralelne procese kroz `composer.json` scripts. Pokreni 4 terminala ručno kao u koraku 8.

### `php artisan migrate` baca "no such table" za već migrirane tabele

Vjerovatno si pokrenuo seed prije migracije. Solution: `php artisan migrate` prvo, pa `php artisan db:seed`. **NE pokreći `migrate:fresh`** — koristi `php artisan migrate:rollback` SAMO ako rollback ne ide ispod migracije `2026_05_12_194833` (CLAUDE.md sekcija 2.1).

## Verifikacija da je instalacija uspjela

Pokreni Pest testove:

```bash
php artisan test --compact
```

Očekivano: **329 / 329 testova zelena, ~957 assertion-a, ~10s** (per Sesija 18 ishod u dnevniku).

Ako svi prolaze, instalacija je validna.

## Sljedeći koraci

- [Staging rollout](02-staging-rollout.md)
- [Production readiness checklist](03-production-readiness.md)
- [V&V i AI u SDLC refleksija](../04-vv-i-ai-u-sdlc.md)
