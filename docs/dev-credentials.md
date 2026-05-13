# Dev login credentials

Pristupni podaci za sve seedovane korisnike u dev bazi (`database/database.sqlite`).

> Seederi su idempotent (`firstOrCreate` / `updateOrCreate`). Generisani komandom:
> ```powershell
> php artisan db:seed
> ```

**Lozinka za sve korisnike (osim admina): `password`**

---

## Admin (1 korisnik)

| Polje | Vrijednost |
|---|---|
| **Email** | `admin@savez.test` |
| **Password** | `Adm1n!Test` (iz `.env` `ADMIN_PASSWORD`, fallback `password`) |
| **Ime** | Sistemski Admin |
| **Škola** | — |

Pristup: kompletan admin panel (`/admin/users`, `/admin/schools`, `/admin/sports`, `/admin/competitions`, `/admin/teams` approve/reject, `/admin/students` verifikacija, `/admin/competitions/{c}/results`, `/admin/audit-log`).

---

## Profesori (14 korisnika — 2 po školi × 7 škola)

Konvencija: `prof.{školski_kod}.{1|2}@savez.test`

| Škola (kod) | Naziv | Email |
|---|---|---|
| **OS-PG-001** | OŠ "Sutjeska" (Podgorica) | `prof.os-pg-001.1@savez.test` |
| OS-PG-001 | OŠ "Sutjeska" | `prof.os-pg-001.2@savez.test` |
| **OS-PG-002** | OŠ "Štampar Makarije" (Podgorica) | `prof.os-pg-002.1@savez.test` |
| OS-PG-002 | OŠ "Štampar Makarije" | `prof.os-pg-002.2@savez.test` |
| **OS-BD-001** | OŠ "Maksim Gorki" (Budva) | `prof.os-bd-001.1@savez.test` |
| OS-BD-001 | OŠ "Maksim Gorki" | `prof.os-bd-001.2@savez.test` |
| **OS-HN-001** | OŠ "Vladimir Nazor" (Herceg Novi) | `prof.os-hn-001.1@savez.test` |
| OS-HN-001 | OŠ "Vladimir Nazor" | `prof.os-hn-001.2@savez.test` |
| **OS-BB-001** | OŠ "Anto Đedović" (Bar) | `prof.os-bb-001.1@savez.test` |
| OS-BB-001 | OŠ "Anto Đedović" | `prof.os-bb-001.2@savez.test` |
| **OS-NK-001** | OŠ "Mileva Lajović Lalatović" (Nikšić) | `prof.os-nk-001.1@savez.test` |
| OS-NK-001 | OŠ "Mileva Lajović Lalatović" | `prof.os-nk-001.2@savez.test` |
| **OS-CT-001** | OŠ "Lovćenski partizanski odred" (Cetinje) | `prof.os-ct-001.1@savez.test` |
| OS-CT-001 | OŠ "Lovćenski partizanski odred" | `prof.os-ct-001.2@savez.test` |

Pristup: prijava ekipa (`/teams/create`), dodavanje učenika svoje škole, OCR upload medicinskih potvrda, submit za odobrenje, povlačenje, pregled svojih timova.

---

## Učenici (70 korisnika — 10 po školi × 7 škola)

Konvencija: `student.{13-cifreni-JMB}@savez.test`

| Škola | JMB raspon | Broj |
|---|---|---|
| OS-PG-001 (Sutjeska) | `0000000000001` – `0000000000010` | 10 |
| OS-PG-002 (Štampar Makarije) | `0000000000011` – `0000000000020` | 10 |
| OS-BD-001 (Maksim Gorki) | `0000000000021` – `0000000000030` | 10 |
| OS-HN-001 (Vladimir Nazor) | `0000000000031` – `0000000000040` | 10 |
| OS-BB-001 (Anto Đedović) | `0000000000041` – `0000000000050` | 10 |
| OS-NK-001 (Mileva Lajović Lalatović) | `0000000000051` – `0000000000060` | 10 |
| OS-CT-001 (Lovćenski partizanski odred) | `0000000000061` – `0000000000070` | 10 |

Primjeri:
- `student.0000000000001@savez.test` (Učenik 1, OŠ Sutjeska, razred 8-2)
- `student.0000000000003@savez.test` (Učenik 3, OŠ Sutjeska, razred 9-1)
- `student.0000000000041@savez.test` (Učenik 41, OŠ Anto Đedović, Bar)

Pristup: lični profil (`/profile`), istorija takmičenja, medalje, eDnevnik verifikacioni status, drugi učenici svoje škole (read-only).

---

## File upload dev gotcha (Windows + Herd PHP)

Ako koristiš `php artisan serve` na Windowsu (Herd PHP), upload medicinskih
potvrda neće raditi — PHP-jev built-in server **ne pokupi `-d upload_tmp_dir`
flag** i `$_FILES['file']['error']` vraća `6` (`UPLOAD_ERR_NO_TMP_DIR`).
Backend kod je ispravan (Pest test `MedicalCertificate/UploadTest` prolazi
sa `UploadedFile::fake()`).

Tri rješenja (po redoslijedu jednostavnosti):

1. **Edituj `php.ini`** (Herd: `C:\Users\<user>\.config\herd\bin\php83\php.ini`):
   ```ini
   upload_tmp_dir = "C:\Users\<user>\Desktop\UDG-2\ADIS\sportski_savez\sportski-savez-app\storage\app\uploads-tmp"
   upload_max_filesize = 20M
   post_max_size = 24M
   ```
   Restartuj `php artisan serve`.

2. **Koristi Herd "Park" / Valet site umjesto `artisan serve`** — Herd
   konfiguriše Nginx/PHP-FPM koji čita pravi `php.ini` i upload radi
   normalno.

3. **Production deploy** — Nginx + PHP-FPM ili Apache + mod_php imaju
   pravilan upload_tmp_dir setup van kutije.

Admin može uvijek preko `/admin/certificates/{id}/manual-approve` da odobri
potvrdu manualno bez upload-a (kao fallback).

## Brz reset DB-a (ako treba)

> **NIKAD ne pokreći `migrate:fresh`** — briše `ai_dnevnik_sesije` tabelu.

Sigurno ponovno seedovanje (idempotentno, ne briše postojeće):
```powershell
php artisan db:seed
```

Ako stvarno hoćeš čistu DB:
```powershell
# Backup dnevnika prvo
php artisan ai-dnevnik:sync-seeder
# (briše SVE) — koristi tek u krajnjoj nuždi
php artisan migrate:fresh --seed
```

---

## Dnevnik napomena

Lozinke iznad su **samo dev**. U produkciji:
- Admin lozinka dolazi iz `ADMIN_PASSWORD` env varijable (kompleksna)
- Profesori i učenici sami postavljaju lozinku kroz registraciju (Fortify)
- Password policy: min 12 char + mixed case + brojevi + simboli + uncompromised (produkcija); bez ograničenja u devu

Detalji: `app/Providers/AppServiceProvider.php::configureDefaults()`.
