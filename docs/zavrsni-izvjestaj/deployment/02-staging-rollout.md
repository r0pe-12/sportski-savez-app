# Staging rollout — prijedlog (v1.0)

> **Pokriva profesorov zahtjev 3b:** prijedlog kako bi se sistem pustio u rad (pilot).

Cilj: pustiti aplikaciju na staging environment sa 1 školom i 1 takmičenjem prije produkcijskog rollout-a. Ovaj dokument je **prijedlog za naručioca** — staging deployment nije izvršen u Phase 4 (van scope-a ADIS predaje).

## Ciljna platforma: Laravel Cloud (Hobby tier)

**Zašto Laravel Cloud:**
- Best-in-class hosting za Laravel + Inertia (zero config)
- Autoscaling iz kutije
- Managed PostgreSQL + Redis + S3 + observability (Laravel Pulse + dedicated metrics)
- Vite build pipeline ugrađen u deploy hook
- Preporučen od Laravel core team-a (spec §11 ga referenca)

**Alternativa:** DigitalOcean App Platform, AWS Elastic Beanstalk, ili bare VPS sa Ploi/Forge. Cijena slična, više konfiguracije, više operativnog tereta.

## Arhitektura staging-a

| Komponenta | Staging | Razlog |
|---|---|---|
| Host | Laravel Cloud Hobby (~$10/mjesec) | Dovoljno za 1 školu i ~50 učenika |
| App tier | 1 instance, autoscaling off | Niska load tokom pilot-a |
| PHP | 8.3 FPM | Match dev (composer.json `"php": "^8.3"`) |
| DB | PostgreSQL 16 managed (1 GB) | Test migracija sa SQLite → PG; spec piše schema agnostično (§7) |
| Cache/Queue | Redis 7 (256 MB) | Match prod konfig, hvata `sync` vs `redis` driver greške |
| Sessions | Redis | Match prod; SQLite session backend ne skalira |
| Storage | S3 bucket `skolski-sport-staging-storage` sa versioning on | Test private file storage; medical certs su privatni |
| Email | AWS SES (sandbox mode) | Verifikovani recipient list ručno; pravi SES production tek u T4 |
| OCR | `FakeOcrAdapter` (file-name konvencija) | Pravi Google Vision tek u produkciji (spec §10.3, feature flag) |
| eDnevnik | `FakeEDnevnikAdapter` (deterministic by JMB hash) | Pravi adapter iza feature flag, ručno enable kad Ministarstvo da pristup |
| Monitoring | Laravel Pulse | Built-in, dovoljno za pilot |
| Logging | CloudWatch Logs (kroz Laravel Cloud) | Daily rotation, 30 dana retention |

## Koraci

### 1. Provision Laravel Cloud projekta

1. https://cloud.laravel.com/ → New Project
2. Connect GitHub repo `sportski-savez-app`
3. Region: `eu-central-1` (Frankfurt — najbliža CG, najmanja latencija)
4. Plan: Hobby
5. PHP runtime: 8.3, Node runtime: 22

### 2. Konfiguriši environment varijable

U Laravel Cloud dashboard → Environment → Add:

```env
APP_NAME="Sportski savez CG (Staging)"
APP_ENV=staging
APP_DEBUG=false
APP_URL=https://staging.skolski-sport-cg.app
APP_LOCALE=me
APP_FALLBACK_LOCALE=me

LOG_CHANNEL=stack
LOG_STACK=daily

DB_CONNECTION=pgsql
# DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD se automatski popunjavaju
# kad attach-uješ Postgres add-on

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
BROADCAST_CONNECTION=log

FILESYSTEM_DISK=s3
AWS_BUCKET=skolski-sport-staging-storage
AWS_DEFAULT_REGION=eu-central-1
# AWS_ACCESS_KEY_ID i AWS_SECRET_ACCESS_KEY iz Laravel Cloud secrets

MAIL_MAILER=ses
MAIL_FROM_ADDRESS=staging-notify@skolski-sport-cg.app
MAIL_FROM_NAME="${APP_NAME}"

# Feature flag-ovi za eksterne adaptere
EDNEVNIK_ADAPTER=fake
OCR_ADAPTER=fake
```

**Sigurnosna napomena:** sve secret vrijednosti (DB password, AWS keys, APP_KEY) upisuju se kroz Laravel Cloud Secrets vault, ne kroz `.env` koji se commit-uje.

### 3. Attach add-ons

U Laravel Cloud dashboardu:
- **Database**: PostgreSQL 16 (1 GB)
- **Cache**: Redis 7 (256 MB)
- **Storage**: S3 bucket (auto-create kroz Cloud dashboard ili custom AWS account)

### 4. Deploy

```bash
git push origin main
```

Laravel Cloud automatski izvršava build steps:
- `composer install --no-dev --optimize-autoloader --no-interaction`
- `npm ci && npm run build` (regeneriše Wayfinder + Vite manifest)
- `php artisan config:cache`
- `php artisan route:cache`
- `php artisan view:cache`
- `php artisan migrate --force` (additive — vidi CLAUDE.md sekcija 2.1)
- `php artisan db:seed --force` (samo pri prvom deploy-u — idempotentni seederi)
- Start FPM + queue:work + scheduler

### 5. Health check

```bash
curl https://staging.skolski-sport-cg.app/up
```

Očekivano: 200 OK sa `{"status":"ok"}` payload-om (Laravel `up` endpoint za health check). Laravel Cloud automatski poll-uje ovaj endpoint za uptime monitoring.

### 6. Pilot data setup

```bash
# Iz lokalnog terminala:
laravel-cloud ssh staging
```

Unutar SSH sesije:

```bash
php artisan tinker
```

```php
// Kreiraj 1 školu
$school = App\Models\School::factory()->create([
    'name' => 'Gimnazija Petar I',
    'code' => 'GP1',
    'city' => 'Cetinje',
]);

// Kreiraj 1 admina za tu školu
App\Models\User::factory()->admin()->create([
    'email' => 'admin.gp1@savez.me',
    'name' => 'Petar Admin',
]);

// Kreiraj 1 takmičenje
$sport = App\Models\Sport::where('name', 'Košarka')->first()
    ?? App\Models\Sport::factory()->create([
        'name' => 'Košarka',
        'members_count' => 5,
        'substitutes_count' => 3,
    ]);

App\Models\Competition::factory()->create([
    'sport_id' => $sport->id,
    'name' => 'Pilot turnir 2026',
    'starts_at' => now()->addDays(14),
]);
```

(Imena polja i factory-ja zavise od finalnog migration shape-a — provjeri `database/factories/` prije pokretanja.)

### 7. UAT sa korisnicima

Pozvati 2-3 profesora iz pilot škole, dati im kredencijale, tražiti da:

1. Registruje 5 učenika kroz UC1
2. Uploaduje ljekarske potvrde (`FakeOcrAdapter` će reagovati na file-name konvenciju, npr. `valid.pdf` → status `valid`)
3. Prijavi ekipu za pilot turnir (UC5 — full flow sa potpisom)
4. Verifikuje učenike kroz fake eDnevnik (UC8)

Sakupiti feedback i bug log u zasebnom dokumentu `uat-feedback.md` (van obima za predaju, planirano za narednu iteraciju).

### 8. Smoke test posle deploy-a

Verifikuj 5 ključnih URL-ova:

```bash
for path in / /login /dashboard /teams /ai-dnevnik; do
  echo -n "$path: "
  curl -o /dev/null -s -w "%{http_code}\n" "https://staging.skolski-sport-cg.app$path"
done
```

Očekivani izlazi:
- `/` → 200 (landing)
- `/login` → 200
- `/dashboard` → 302 (redirect na login, ako nije autentifikovan)
- `/teams` → 302
- `/ai-dnevnik` → 200 (public)

## Eksterni servisi (iz spec §10.3)

Spec §10.3 specificira sljedeće eksterne servise — staging koristi **fake adaptere** za svaki:

| Servis | Production | Staging | Strategija |
|---|---|---|---|
| OCR (medical certificate parsing) | Google Vision API | `FakeOcrAdapter` (file-name konvencija) | Feature flag `OCR_ADAPTER=fake/google_vision` |
| eDnevnik (student verifikacija) | Pravi HTTP API Ministarstva | `FakeEDnevnikAdapter` (deterministic by JMB hash) | Feature flag `EDNEVNIK_ADAPTER=fake/http` |
| Email | AWS SES production | AWS SES sandbox | `.env` `MAIL_MAILER` |
| File storage | S3 production bucket | S3 staging bucket | `FILESYSTEM_DISK=s3` + bucket env |
| Cache | Redis | Redis | Match konfig |
| Queue | Redis | Redis | Match konfig |
| DB | PostgreSQL prod | PostgreSQL staging | `DB_CONNECTION=pgsql` |

**Razlog za fake adaptere u staging-u:** real eDnevnik API zahtijeva pisani sporazum sa Ministarstvom prosvjete (vidi `03-production-readiness.md` pre-production checklist), a Google Vision košta po request-u — nije održivo za pilot test 50 učenika.

## Rollback strategija

Ako staging deploy padne:

1. **DB migration rollback** — NE radimo `migrate:rollback` ispod `2026_05_12_194833` (CLAUDE.md sekcija 2.1, čuva `ai_dnevnik_sesije`). Umjesto toga: kreiraj reverse migration koja vraća schema na prethodno stanje, deployuj, pa fix-uj kod.
2. **App rollback** — `git revert <commit-sha>`, push, Laravel Cloud automatski redeploy. Trajanje ~3-5 minuta.
3. **Backup restore** — Laravel Cloud auto-backup daily (PostgreSQL i S3 versioning); ako se baza pokvari, restore iz Cloud dashboard-a → Backups → Select date → Restore.
4. **Hot fix** — ako rollback nije izvodljiv (npr. schema change već primijenjen), forward fix u novom commit-u + brzom deploy-u.

## Sljedeći koraci

- [Production readiness checklist](03-production-readiness.md) — pre-production pravne, tehničke, operativne i compliance pripreme
- [V&V i AI u SDLC](../04-vv-i-ai-u-sdlc.md) sekcija 5 — AI u deployment-u rizici i mitigacije
