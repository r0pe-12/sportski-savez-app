# Demo skripta — Sistem školskog sporta CG

## Pre-flight (jednom)

```powershell
# NE migrate:fresh — čuva ai_dnevnik_sesije
php artisan migrate
php artisan db:seed
```

Otvori `composer run dev` za serve + queue:work + vite.

Provjeri da queue worker sluša:
```powershell
php artisan queue:work --queue=ocr,ednevnik,default --tries=3
```

## Demo tok (15 minuta)

### Korak 1: Admin login (1 min)
- Otvori `http://localhost:8000/login`
- Email: `admin@savez.test`, Lozinka: `Adm1n!Test` (iz .env)
- Redirect na `/admin/users` — vidi seedovane korisnike

### Korak 2: Pregled admin panela (2 min)
- `/admin/schools` — 5–7 OŠ
- `/admin/sports` — 8–10 sportova, timski i individualni
- `/admin/competitions` — 3–5 takmičenja
- `/admin/audit-log` — već nekoliko zapisa iz seed-a

### Korak 3: UC5 kao profesor (5 min)
- Logout, login kao `prof.os-pg-001.1@savez.test` / `password`
- Klikni "Nova prijava ekipe" → bira "DP OŠ Košarka 2026"
- U edit page-u, dodaj 5 učenika klikom na "Dodaj" u student selector-u
- Za svakog člana uploaduj fajl sa imenom `{ime}_{prezime}_2028-12-31.pdf`
  - Fake OCR validira u backgrundu (status pending → valid)
  - Sačekaj 2 sekunde (poll refresh-uje stranicu)
- Klikni "Pregled i potpis" → unesi puno ime profesora → "Potpiši i predaj"

### Korak 4: Admin odobravanje (1 min)
- Logout, login admin
- `/admin/teams` → klikni submitted ekipu → "Odobri"

### Korak 5: UC8 verifikacija (2 min)
- `/admin/students` → klikni nekog → "Pokreni verifikaciju"
- Pokreni queue: `php artisan queue:work --once --queue=ednevnik`
- Refresh — status mismatched ili verified (zavisi od JMB-a)
- Ako mismatched, vidi MismatchTable; klikni "Manuelno potvrdi"

### Korak 6: UC10 rezultati (2 min)
- `/admin/competitions` → bira past competition (sa active ekipama)
- Klik "Rezultati" → unesi placement 1/2/3 za ekipe → "Sačuvaj rezultate"

### Korak 7: UC3 — učenik vidi medalju (1 min)
- Logout, login kao učenik iz tima koji je dobio rezultat
- `/profile` → vidi MedalShelf sa medaljom + istorija sa rezultatom

### Korak 8: Audit log (1 min)
- Login admin, `/admin/audit-log`
- Filter po akciji "team" — pokaže team.created, team.submitted, team.approved
- Klikni "Detalji" na neki zapis → vidi JSON payload

## Šta provjeravaš

- Nijedan console error
- Mobile responsive na 360px
- Audit log ima > 15 zapisa
- Notifikacije u Inertia bell ikoni
- Email u `storage/logs/laravel.log` (TeamSubmitted, ParentMismatched)
- `php artisan test --compact` — sve zelene
