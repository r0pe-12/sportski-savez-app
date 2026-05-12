# Paralelni implementacijski plan — Sistem školskog sporta CG

**Verzija:** 1.0 (2026-05-13)
**Spec referenca:** [`specs/001-sportski-savez.md`](001-sportski-savez.md) v1.1
**Strategija:** Subagent driven development + git worktrees
**Cilj:** Funkcionalan sistem koji radi end-to-end na localhost-u sa svim 10 UC-ova, mock adapterima za eksterne servise.

---

## 1. Pregled

### 1.1 Skala paralelizma
- **Phase 0:** sekvencijalno (2 koraka)
- **Phase 1:** **3 paralelna track-a**
- **Phase 2:** **7 paralelnih track-ova** (UC5 razbijen na 3 podtrak-a)
- **Phase 3:** sekvencijalno (2 koraka)

Teorijsko ubrzanje u odnosu na linearno: **~3–4×**.

### 1.2 Šta dobijamo na kraju
Funkcionalan sistem koji demonstrira sve što spec opisuje:
- 10 UC-ova rade end-to-end
- Audit log za svaku state izmjenu
- In-app notifikacije + email u log fajlu
- Mock OCR i eDnevnik adapter-i
- Zelena Pest test suita > 70% coverage
- Browser smoke testovi prošli

### 1.3 Šta NE dobijamo (eksplicitno out-of-scope)
- Pravi OCR (Google Cloud Vision), pravi eDnevnik, AWS SES, S3, RDS — mock-ovi su dovoljni za demo
- AZLP cleanup workflow (`purge-graduates`, `/profile/export`) — odloženo, nije za funkcionalnost
- Saglasnost roditelja workflow — `parental_consent` polje ostaje boolean, NE BLOKIRA flow
- Sve iz spec sekcije 2 "Van obima" (mobilna app, plaćanja, bulk import, itd.)

---

## 2. Mapa zavisnosti

```
                    PHASE 0 (sekvencijalno)
                    ┌─────────────────────┐
                    │ F1: Setup           │
                    │ F2: Migracije+model │
                    └─────────┬───────────┘
                              │ blokira sve
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
           PHASE 1 (3 paralelna)
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │ T1.1        │  │ T1.2        │  │ T1.3        │
    │ Auth+UI     │  │ Sports/     │  │ Cross-      │
    │ shell       │  │ Competitions│  │ cutting     │
    │ UC1,UC2,UC7 │  │ UC9         │  │ Infra       │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           └────────────────┼────────────────┘
                            │ phase merge checkpoint
       ┌────────┬───────────┼───────────┬────────┐
       ▼        ▼           ▼           ▼        ▼
                   PHASE 2 (7 paralelnih)
  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
  │T2.1a │ │T2.1b │ │T2.1c │ │T2.2  │ │T2.3  │ │T2.4  │ │T2.5  │
  │UC5   │ │UC5   │ │UC5   │ │UC8   │ │UC10  │ │UC3   │ │UC4   │
  │Form  │ │OCR   │ │Submit│ │eDnev │ │Result│ │Profil│ │Raspor│
  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘
     └───────┴────────┴────────┴────────┴────────┴────────┘
                            │ phase merge checkpoint
                            ▼
                   PHASE 3 (sekvencijalno)
                    ┌─────────────────────┐
                    │ T3.1 Audit log UI   │
                    │ T3.2 Smoke + e2e    │
                    └─────────────────────┘
                            │
                            ▼
                       v1.0 release
```

---

## 3. Track katalog

| ID | Naziv | Phase | UC | Procijenjeno | Blokira | Blokiran-od | Plan fajl |
|---|---|---|---|---|---|---|---|
| F1 | Setup | 0 | n/a | 2 dana | sve | n/a | [`100-f1-setup.md`](100-f1-setup.md) |
| F2 | Migracije + modeli | 0 | n/a | 3 dana | sve | F1 | [`101-f2-migracije-modeli.md`](101-f2-migracije-modeli.md) |
| T1.1 | Auth + Korisnici + UI shell | 1 | UC1, UC2, UC7 | 1.5 nedjelje | T2.* | F2 | [`110-t1.1-auth-korisnici-ui-shell.md`](110-t1.1-auth-korisnici-ui-shell.md) |
| T1.2 | Sportovi + raspored | 1 | UC9 | 1 nedjelja | T2.1*, T2.3, T2.5 | F2 | [`111-t1.2-sportovi-raspored.md`](111-t1.2-sportovi-raspored.md) |
| T1.3 | Cross-cutting infra | 1 | (cross) | 1 nedjelja | T2.* | F2 | [`112-t1.3-cross-cutting-infra.md`](112-t1.3-cross-cutting-infra.md) |
| T2.1a | UC5 Team Registration Form | 2 | UC5 | 1 nedjelja | — | T1.1, T1.2, T1.3 | [`120-t2.1a-uc5-team-form.md`](120-t2.1a-uc5-team-form.md) |
| T2.1b | UC5 OCR Pipeline | 2 | UC5, UC6 | 1 nedjelja | — | T1.3 | [`121-t2.1b-uc5-ocr-pipeline.md`](121-t2.1b-uc5-ocr-pipeline.md) |
| T2.1c | UC5 Submission | 2 | UC5 | 1 nedjelja | — | T1.1, T1.3, T2.1a | [`122-t2.1c-uc5-submission.md`](122-t2.1c-uc5-submission.md) |
| T2.2 | UC8 eDnevnik verifikacija | 2 | UC8 | 1.5 nedjelje | — | T1.1, T1.3 | [`123-t2.2-uc8-ednevnik.md`](123-t2.2-uc8-ednevnik.md) |
| T2.3 | UC10 Rezultati i medalje | 2 | UC10 | 2 nedjelje | — | T1.1, T1.2 | [`124-t2.3-uc10-rezultati.md`](124-t2.3-uc10-rezultati.md) |
| T2.4 | UC3 Učenički profil + istorija | 2 | UC3 | 1.5 nedjelje | — | T1.1 | [`125-t2.4-uc3-ucenicki-profil.md`](125-t2.4-uc3-ucenicki-profil.md) |
| T2.5 | UC4 Public raspored | 2 | UC4 | 1 nedjelja | — | T1.2 | [`126-t2.5-uc4-public-raspored.md`](126-t2.5-uc4-public-raspored.md) |
| T3.1 | Audit log UI dashboard | 3 | (cross) | 3 dana | T3.2 | T1.3, sve T2.* | [`130-t3.1-audit-log-dashboard.md`](130-t3.1-audit-log-dashboard.md) |
| T3.2 | Integration smoke + e2e | 3 | (cross) | 4 dana | — | T3.1 | [`131-t3.2-integration-smoke-e2e.md`](131-t3.2-integration-smoke-e2e.md) |

---

## 4. Merge konvencije (shared edit zones)

### 4.1 Problemi i rješenja

| Shared fajl | Problem | Rješenje |
|---|---|---|
| `routes/web.php` | 5+ track-ova dodaju rute → garantovan konflikt | **Split na `routes/{feature}.php`.** `web.php` samo `require __DIR__.'/teams.php'` itd. Svaki track edituje **isključivo** svoj fajl. T1.3 u Phase 1 kreira split kao prvi korak. |
| `database/seeders/DatabaseSeeder.php` | Svi track-ovi dodaju svoj seeder poziv | **Konvencija:** alfabetska lista u `$this->call([...])`, jedan seeder po liniji. Git merge je trivijalan ako konfliktovi su line-additions. |
| `app/Http/Middleware/HandleInertiaRequests.php` | Featuri možda hoće dodati shared props | **Pravilo:** feature dodaje `via FooServiceProvider::boot()` registraciju Inertia::share() umjesto editovanja middleware-a. |
| `lang/me/*.php` | Svaki track ima svoj namespace | **Konvencija:** po fajl po feature: `lang/me/teams.php`, `lang/me/students.php`. Nula konflikta. |
| Migracije timestamps | Dva agenta generišu u istom trenutku | Worktree-ovi imaju različite create-time-ove ako se kreiraju razdvojeno. Niskorizično, ali ako se desi: rename jednog migracija sa kasnijim timestampom prije merge-a. |
| `composer.json` / `package.json` | Nova dependency | **Pravilo:** pre-merge koordinacija. Track koji uvodi novu dependency dodaje notu u svom planu i obavještava glavni conversation. |
| Wayfinder generated TS | Auto-regen post-merge | Generated fajlovi su u `.gitignore` (provjeriti `resources/js/actions/`, `resources/js/routes/`). Posle merge-a uvijek run `npm run build` koji regeneriše. |
| `config/{servis}.php` | Po servisu | Nova config samo iz svog feature-a; ako više track-ova hoće isti config (npr. `notifications.php`), koordinacija. |

### 4.2 Plan za split `routes/web.php`

**Izvodi F1 (Setup) u Phase 0 kao prvi korak:**
```php
// routes/web.php (poslije split-a)
<?php

require __DIR__.'/auth.php';        // T1.1
require __DIR__.'/admin.php';       // T1.1 (user/school admin only)
require __DIR__.'/sports.php';      // T1.2 (sve sport rute, uključujući admin CRUD)
require __DIR__.'/competitions.php';// T1.2 (sve competition rute)
require __DIR__.'/teams.php';       // T2.1a/b/c (sve team rute)
require __DIR__.'/students.php';    // T2.2, T2.4 (verifikacija + profile)
require __DIR__.'/results.php';     // T2.3 (sve result rute, uključujući admin CRUD)
require __DIR__.'/audit.php';       // T3.1 (audit dashboard)
require __DIR__.'/public.php';      // T2.5, T1.3 (public schedule, welcome, ai-dnevnik)
```

**Pravilo:** `routes/admin.php` sadrži **isključivo** rute za admin upravljanje korisnicima i školama (T1.1 territory). Sva ostala "admin-only" rute (admin CRUD sportova, takmičenja, rezultata) idu u resource-specific fajl sa `Route::middleware('role:admin')` group. Razlog: smanjenje shared edit zone.

Primjer: `routes/sports.php` ima public read rute + admin-only CRUD rute u istom fajlu, group-ovane po middleware-u.

Postojeći `web.php` rute (welcome, settings, ai-dnevnik) sele se u `public.php`.

---

## 5. Git worktree konvencije

### 5.1 Naming
- **Worktree direktorij:** `../sportski-savez-app-{track-id}/` (npr. `../sportski-savez-app-t2.1a/`)
- **Branch:** `feature/{track-id}-{kratki-naziv}` (npr. `feature/t2.1a-uc5-team-form`)
- **PR title:** `[{track-id}] {kratki naslov}` (npr. `[T2.1a] UC5 — Team Registration Form`)

### 5.2 Lifecycle
```bash
# Kreiranje worktree-a (iz glavnog repo-a)
git worktree add ../sportski-savez-app-t2.1a -b feature/t2.1a-uc5-team-form

# Subagent radi u worktree-u
cd ../sportski-savez-app-t2.1a
# (work happens here, agent reads specs/00X-...md za svoj track)

# Pre-merge checklist (sam track u svom worktree-u)
vendor/bin/pint --dirty --format agent
php artisan test --compact
npm run build  # regeneriše Wayfinder
git push -u origin feature/t2.1a-uc5-team-form

# Glavni conversation pravi PR, review, merge
# Posle merge cleanup
git worktree remove ../sportski-savez-app-t2.1a
git branch -d feature/t2.1a-uc5-team-form
```

### 5.3 Pravila
- **Svaki worktree čita samo svoj plan** (`specs/00X-...md`) + spec + meta-plan.
- **Subagent NE čita druge plan fajlove** — to čuva fokus i sprečava cross-contamination.
- **Glavni conversation upravlja PR-ovima i merge-ovima** — ne subagent.

---

## 6. Phase boundary checkpoint protokol

### 6.1 Posle Phase 0
**Trigger:** F2 (migracije i modeli) merge-an u main.
**Akcije:**
1. `git checkout main && git pull`
2. `php artisan migrate` — passes (additive only, **ne fresh** — čuvamo `ai_dnevnik_sesije`)
3. `php artisan db:seed` — passes (svi seederi su idempotentni po spec 15.2)
4. `php artisan test --compact` — zelena (testovi koriste `RefreshDatabase` trait sa transaction rollback ili `:memory:` SQLite, ne diraju radnu bazu)
5. **Verifikacija schema:** `mcp__laravel-boost__database-schema` vraća sve entitete iz spec sekcije 7.
6. **Demo:** `php artisan tinker --execute 'App\Models\Student::count()'` vraća > 0.

> **VAŽNO:** `php artisan migrate:fresh` je **zabranjen** jer drop-uje `ai_dnevnik_sesije` (Sesija 15+ postoje samo u bazi). Vidjeti `feedback_database_safety` memoriju.

**Posle ovog:** kreiraju se 3 worktree-a za Phase 1 (T1.1, T1.2, T1.3).

### 6.2 Posle Phase 1
**Trigger:** sva 3 track-a Phase 1 merge-ana u main.
**Akcije:**
1. Rebase main, run `php artisan migrate` (additive, ne fresh), run tests
2. **Demo scenario:**
   - Login kao admin (`admin@savez.test` / iz `.env`)
   - Kreiraj školu, dodaj profesora, učenika, sport, takmičenje
   - Logout, login kao profesor — vidi sportove i takmičenja
3. Smoke test svih route-a (Pest browser test za 200 status na ključnim).

**Posle ovog:** kreiraju se 7 worktree-ova za Phase 2 (T2.1a/b/c, T2.2, T2.3, T2.4, T2.5).

### 6.3 Posle Phase 2
**Trigger:** svih 7 track-ova Phase 2 merge-ano.
**Akcije:**
1. Rebase, `php artisan migrate` (additive), full test suite
2. **Kompletan demo:**
   - Profesor kreira ekipu → dodaje 3 člana → uploaduje potvrde (FakeOcr validira) → potpisuje
   - Admin verifikuje učenike (FakeEDnevnik vraća deterministic) → odobrava ekipu
   - Admin unosi rezultate posle takmičenja
   - Učenik vidi medalju na svom profilu
   - Provjeri audit log u DB-u (sve akcije logovane)
3. Pest test coverage > 70%.

**Posle ovog:** Phase 3 sekvencijalno.

### 6.4 Posle Phase 3
**Trigger:** T3.2 merge-an.
**Akcije:**
1. Browser smoke prošao (sve ključne stranice bez JS errora)
2. `git tag v1.0`
3. Demo cutoff — ovo je predaja za ADIS.

---

## 7. AI dnevnik pravila tokom paralelnog rada

**KLJUČNO:** subagenti NE upisuju u `ai_dnevnik_sesije`. Samo glavni conversation.

| Šta | Ko |
|---|---|
| Subagent dispatch (rad u worktree-u) | Subagent samo radi rad, vraća output |
| Output svih subagenta iste phase boundary | Glavni conversation sintezuje u jedan dnevnik zapis |
| Sesija = jedan veliki ciklus rada | Glavni conversation odlučuje granicu |

**Primjer sesije za Phase 2:**
- Naslov: "Phase 2 paralelna implementacija (UC5 + UC8 + UC10 + UC3 + UC4)"
- Polja `instrukcije/output/odluke/ishod` imaju `### Prompt N` sekcije za svaki ciklus user → glavni conversation
- Output od 7 paralelnih subagenta se konsoliduje u markdown listu po track-u
- Detalji iz feedback_dnevnik_ai_logging.md memorije važe

---

## 8. Style i arhitektonske konvencije (must-follow za sve agente)

Svaki track plan reference-uje:
- **Naming** (spec sekcija 10.4): engleski tehnički, crnogorski UI
- **Layering** (spec sekcija 9.2): Http → Application → Domain + Infrastructure
- **Glossary** (spec sekcija 17): domain ↔ tech mapping
- **Permission** (spec sekcija 13.4): policy klase za svaki entitet
- **State** (spec sekcija 7.4): explicit `status` kolona, ne bool flagovi
- **File storage** (spec sekcija 11.5): UUID v4 paths, never original ime
- **Notifications** (spec sekcija 9.5): event → channel matrica
- **Queue** (spec sekcija 9.4): što ne mora biti sinhrono, baci u queue

**Pre-merge zahtjevi (acceptance criteria iz spec sekcije 14):**
- Pest feature test + 2 alt toka
- Pint formatiran (`vendor/bin/pint --dirty --format agent`)
- Wayfinder regenerated (`npm run build` prošao)
- TypeScript bez `any` u javnim signaturama
- UI verifikovan na 360px + 1280px
- Audit log zapis za svaku state izmjenu
- Policy / Form Request authorize() odbija pogrešnu rolu

---

## 9. NE-radi liste (over-engineering prevencija)

### Globalno NE radi (svi track-ovi)
- Repository pattern — koristimo Eloquent direktno (spec 9.3)
- Sub-admin / per-school admin / read-only auditor role
- Multi-tenancy škola (otvoreno pitanje iz spec 16)
- Mobilna app, plaćanja, bulk import (spec 2 — van obima)
- AZLP cleanup workflow (`purge-graduates`, `/profile/export`)
- Saglasnost roditelja workflow (polje ostaje, workflow ne)
- Anonimizacija rezultata
- Pravna validnost certifikata
- Custom error catalog (Laravel default je dovoljan)
- Multi-language UI (samo me)
- Decision log fajl (changelog u spec-u je dovoljan)
- Notification preferences UI

### Šta da agent **ignoriše** ako mu se učini da bi pomoglo
- Dodavanje novih kolona koje nisu u Domain modelu (spec 7.1)
- Migration koje mijenjaju postojeće tabele iz F2
- Repository klase
- Novi paketi iz composer (osim ako track plan eksplicitno traži)
- Refaktor `User` modela (ostaje Single Table Inheritance po spec 7.2)

---

## 10. Demo scenario po fazi

### Posle Phase 0
```bash
# NE migrate:fresh — gubimo ai_dnevnik_sesije. Vidjeti feedback_database_safety.
php artisan migrate           # additive — primjenjuje samo nove migracije iz F2
php artisan db:seed           # idempotent — bezbjedno za re-run
php artisan tinker --execute 'echo App\Models\Student::count();'
# Očekuje > 0
```

### Posle Phase 1
1. Browser → `http://localhost/login`
2. Login kao `admin@savez.test`
3. Admin panel → Schools → Create "OŠ Sutjeska PG"
4. Admin panel → Users → Create profesora vezanog za tu školu
5. Admin panel → Sports → Verifikuj seed-ovane sportove
6. Admin panel → Competitions → Create "Državno prvenstvo OŠ — Košarka 2026"
7. Logout, login kao profesor → vidi katalog sportova i predstojeća takmičenja

### Posle Phase 2
1. Login kao profesor
2. `/teams/create` → bira sport → dodaje 5 učenika (jedan po jedan) → uploaduje potvrde (FakeOcr validira po naming konvenciji) → potpisuje
3. Logout, login kao admin
4. Admin → verifikuje 2 učenika kroz mock eDnevnik (jedan vraća verified, drugi mismatched)
5. Admin → odobrava ekipu (submitted → active)
6. Simuliraj kraj takmičenja → admin unosi rezultate (1. mjesto, zlato)
7. Logout, login kao učenik → vidi medalju na profilu
8. DB query: `audit_log` ima > 15 zapisa za ovaj flow

### Posle Phase 3
1. Admin → `/admin/audit-log` → vidi sve akcije u tabeli sa filterima (po user-u, action, datum)
2. Browser smoke (Pest 4 Browser): `php artisan test --filter=SmokeTest` zelena
3. Sve stranice rade bez console errora
4. `git tag v1.0` — predaja spremna

---

## 11. Otvorena pitanja

1. **Trajanje** — phase-by-phase procjena je u sekciji 3 (Track katalog). Da li sumarizujemo gantt-style timeline?
2. **Demo cutoff datum** — koji datum je predaja za ADIS? Treba li raditi backward planning?
3. **JMB algoritam validacija** — spec sekcija 16 ostavlja kao otvoreno; pretpostavljam regex format check u F2 (`/^\d{13}$/`); ako želiš algoritam kontrolne cifre, to ide u F2 plan.
4. **Fotografija učenika** — opciono ili obavezno? Trenutno spec ostavlja otvoreno; pretpostavljam opciono za prvu iteraciju.
5. **2FA scope** — samo za admin nalog ili svi? Trenutno Fortify config dozvoljava sve; pretpostavljam svi (Fortify default).

Pitanja se rješavaju u relevantnom track planu, ne sad.

---

## 12. Changelog

| Verzija | Datum | Izmjena |
|---|---|---|
| 1.0 | 2026-05-13 | Inicijalni meta-plan. 14 track-ova kroz 4 phase grupe. Brainstorm odluke: roadmap + placeholderi, UC5 razbijen na 3 podtrak-a, T1.4 spojen sa T1.1, phase boundary merges, per-track testovi, fokus na funkcionalnost (ne AZLP regulator). |
| 1.1 | 2026-05-13 | **Database safety constraint:** `migrate:fresh` zabranjen u svim phase-ovima — čuvamo `ai_dnevnik_sesije`. Phase 0 checkpoint koristi `migrate` + `db:seed` (oba aditivna/idempotentna). Demo skripta i F2 acceptance ažurirani. Nova `feedback_database_safety` memorija dokumentuje pravilo. |
