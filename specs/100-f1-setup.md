# F1 — Faza 0: Setup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase:** 0 (sekvencijalno) · **Track ID:** F1 · **Procijenjeno:** 2 dana
**Spec referenca:** [`specs/001-sportski-savez.md`](001-sportski-savez.md) sekcije 15, 10
**Meta-plan:** [`specs/000-paralelni-plan.md`](000-paralelni-plan.md) sekcija 4.2
**Blokira:** sve naredne track-ove · **Blokiran-od:** —

**Goal:** Repo, env i CI spremni za sekvencijalni F2 i naredne paralelne phase-ove. Split `routes/web.php` na `require` pattern. **Single agent**.

**Architecture:** Bez biznis logike. Samo: env varijable, route file split (9 feature fajlova), pre-commit hook, worktree konvencija u markdown-u. CI postoji (`.github/workflows/tests.yml` + `lint.yml`); samo verifikujemo da prolazi nakon route split-a.

**Tech Stack:** Laravel 13, PHP 8.3, već instalirano (vidjeti `composer.json`). Nove dependency: nikakve.

---

## Pre-flight provjera

- [ ] **Provjeri da nema neispraženih izmjena u `routes/web.php` i `.env.example`**

```powershell
git status --short
```

Očekivano: `routes/web.php` i `.env.example` nisu modifikovani u radnoj kopiji (sve postojeće modifikacije iz `git status` ne smiju biti u ovim fajlovima).

---

## Task 1: Ažuriraj `.env.example` sa svim projektnim varijablama

**Files:**
- Modify: `.env.example` (60+ redova trenutno, dodaje se sekcija na dno)

Spec sekcija 15.2 traži `ADMIN_EMAIL`/`ADMIN_PASSWORD` za seedovani admin. T1.3 i T2.* track-ovi traže `FAKE_OCR_*`, `FAKE_EDNEVNIK_*` feature flag-ove (spec 10.3). `MAIL_MAILER=log` već je tu, samo dodajemo komentar.

- [ ] **Step 1: Dopuni `.env.example` sa novom sekcijom na kraju fajla**

Dodaj ispod `VITE_APP_NAME="${APP_NAME}"` (red 65):

```env

# === Sportski savez ===
ADMIN_EMAIL=admin@savez.test
ADMIN_PASSWORD=Adm1n!Test
ADMIN_NAME="Sistemski Admin"

# Mock adapters (FakeOcrAdapter / FakeEDnevnikAdapter)
# Kada true — koristi fake; kada false — koristi pravi HTTP adapter (Phase 11+, ne pilot)
OCR_ADAPTER=fake
EDNEVNIK_ADAPTER=fake

# Queue connections (database je default; redis u produkciji)
QUEUE_OCR_CONNECTION=database
QUEUE_EDNEVNIK_CONNECTION=database
QUEUE_NOTIFICATIONS_CONNECTION=database

# File storage
FILESYSTEM_PRIVATE_DISK=local
```

- [ ] **Step 2: Provjeri da `php artisan config:show` ne baca grešku**

Run:
```powershell
php artisan config:show app.name
```
Expected: prints `Laravel` (ili APP_NAME vrijednost) bez stack trace-a.

- [ ] **Step 3: Commit**

```powershell
git add .env.example
git commit -m "F1: add project env vars (admin seed, fake adapters, queue connections)"
```

---

## Task 2: Kreiraj placeholder route fajlove (9 fajlova)

**Files:**
- Create: `routes/auth.php`
- Create: `routes/admin.php`
- Create: `routes/teams.php`
- Create: `routes/sports.php`
- Create: `routes/competitions.php`
- Create: `routes/students.php`
- Create: `routes/results.php`
- Create: `routes/audit.php`
- Create: `routes/public.php`

Po meta-plan sekciji 4.2, svaki track edituje samo svoj route fajl. F1 kreira sve placeholdere sa minimalnim sadržajem da `routes/web.php` `require` prolazi bez fatalne greške.

- [ ] **Step 1: Kreiraj `routes/auth.php` sa placeholder komentarom**

```php
<?php

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
| Owner: T1.1 (Auth + Korisnici + UI shell)
| Fortify će registrovati svoje rute kroz FortifyServiceProvider; ovde idu
| custom auth rute (npr. role-based redirect, 2FA recovery UI ako bude trebao).
*/

use Illuminate\Support\Facades\Route;

// Placeholder — T1.1 popunjava
```

- [ ] **Step 2: Kreiraj `routes/admin.php`**

```php
<?php

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
| Owner: T1.1 (user/school admin). Ostali "admin-only" CRUD-ovi za sport,
| competition, result idu u resource-specific fajl sa Route::middleware('role:admin').
*/

use Illuminate\Support\Facades\Route;

// Placeholder — T1.1 popunjava
```

- [ ] **Step 3: Kreiraj `routes/teams.php`**

```php
<?php

/*
|--------------------------------------------------------------------------
| Teams Routes
|--------------------------------------------------------------------------
| Owners: T2.1a (form), T2.1b (OCR pipeline), T2.1c (submit) — koordinišu.
*/

use Illuminate\Support\Facades\Route;

// Placeholder — T2.1a/b/c popunjavaju
```

- [ ] **Step 4: Kreiraj `routes/sports.php`**

```php
<?php

/*
|--------------------------------------------------------------------------
| Sports Routes (public read + admin CRUD u istom fajlu po middleware grupi)
|--------------------------------------------------------------------------
| Owner: T1.2 (Sportovi + raspored)
*/

use Illuminate\Support\Facades\Route;

// Placeholder — T1.2 popunjava
```

- [ ] **Step 5: Kreiraj `routes/competitions.php`**

```php
<?php

/*
|--------------------------------------------------------------------------
| Competitions Routes (public read + admin CRUD)
|--------------------------------------------------------------------------
| Owner: T1.2 (Sportovi + raspored)
*/

use Illuminate\Support\Facades\Route;

// Placeholder — T1.2 popunjava
```

- [ ] **Step 6: Kreiraj `routes/students.php`**

```php
<?php

/*
|--------------------------------------------------------------------------
| Students Routes
|--------------------------------------------------------------------------
| Owners: T2.2 (eDnevnik verifikacija), T2.4 (učenički profil + istorija).
*/

use Illuminate\Support\Facades\Route;

// Placeholder — T2.2 i T2.4 popunjavaju
```

- [ ] **Step 7: Kreiraj `routes/results.php`**

```php
<?php

/*
|--------------------------------------------------------------------------
| Results Routes (admin-only CRU, public read za rezultate)
|--------------------------------------------------------------------------
| Owner: T2.3 (Rezultati i medalje)
*/

use Illuminate\Support\Facades\Route;

// Placeholder — T2.3 popunjava
```

- [ ] **Step 8: Kreiraj `routes/audit.php`**

```php
<?php

/*
|--------------------------------------------------------------------------
| Audit Log Routes (admin-only read)
|--------------------------------------------------------------------------
| Owner: T3.1 (Audit log dashboard)
*/

use Illuminate\Support\Facades\Route;

// Placeholder — T3.1 popunjava
```

- [ ] **Step 9: Kreiraj `routes/public.php` i seli welcome + ai-dnevnik tu**

Trenutno `routes/web.php` ima welcome (`/`) i ai-dnevnik (`/ai-dnevnik`) rute. Po meta-plan 4.2 oba idu u `routes/public.php` pa se njihov fajl može deliti više track-ova bez konflikta.

```php
<?php

/*
|--------------------------------------------------------------------------
| Public Routes (welcome, ai-dnevnik, public schedule kasnije)
|--------------------------------------------------------------------------
| Owners: F1 (initial welcome + ai-dnevnik), T2.5 (public schedule).
*/

use App\Http\Controllers\AiDnevnikController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::get('/ai-dnevnik', [AiDnevnikController::class, 'show'])->name('ai-dnevnik');
```

- [ ] **Step 10: Verifikuj sve fajlove su kreirani**

```powershell
Get-ChildItem routes\*.php | Select-Object Name
```
Expected: lista uključuje `auth.php`, `admin.php`, `teams.php`, `sports.php`, `competitions.php`, `students.php`, `results.php`, `audit.php`, `public.php`, `web.php`, `console.php`, `settings.php`.

- [ ] **Step 11: Commit**

```powershell
git add routes/auth.php routes/admin.php routes/teams.php routes/sports.php routes/competitions.php routes/students.php routes/results.php routes/audit.php routes/public.php
git commit -m "F1: scaffold per-feature route files for parallel track ownership"
```

---

## Task 3: Refaktoriši `routes/web.php` na require pattern

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Napiši failing test prvo (rute izložene su iste posle split-a)**

Kreiraj `tests/Feature/RoutingTest.php`:

```php
<?php

use function Pest\Laravel\get;

it('welcome route renders', function () {
    get('/')->assertOk();
});

it('ai-dnevnik route renders', function () {
    get('/ai-dnevnik')->assertOk();
});

it('dashboard route requires auth', function () {
    get('/dashboard')->assertRedirect('/login');
});

it('route list is loadable without fatal', function () {
    $exitCode = \Illuminate\Support\Facades\Artisan::call('route:list', ['--columns' => 'name']);
    expect($exitCode)->toBe(0);
});
```

- [ ] **Step 2: Pokreni test — trenutni `web.php` ga PROLAZI (jer su rute još u njemu)**

Run:
```powershell
php artisan test --compact --filter=RoutingTest
```
Expected: 4/4 PASS (proverava baseline prije refaktora).

- [ ] **Step 3: Refaktoriši `routes/web.php` na pure require fajl**

Prepiši `routes/web.php` u cijelosti:

```php
<?php

/*
|--------------------------------------------------------------------------
| Web Routes — splitter
|--------------------------------------------------------------------------
| Po meta-plan 4.2 — svaki feature edituje samo svoj fajl u routes/.
| NE dodavaj rute direktno ovde; dodaj ih u feature-specific fajl.
*/

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/sports.php';
require __DIR__.'/competitions.php';
require __DIR__.'/teams.php';
require __DIR__.'/students.php';
require __DIR__.'/results.php';
require __DIR__.'/audit.php';
require __DIR__.'/public.php';
require __DIR__.'/settings.php';

use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
```

> **Napomena:** `dashboard` ruta ostaje u `web.php` privremeno; T1.1 će je premjestiti u `routes/auth.php` (ili novi role-aware fajl). F1 ne dira tu — samo split izvodi.

- [ ] **Step 4: Pokreni RoutingTest — sad mora ponovo PASS sa novim split layout-om**

Run:
```powershell
php artisan test --compact --filter=RoutingTest
```
Expected: 4/4 PASS (ako `welcome` i `ai-dnevnik` ne radi → fajl `routes/public.php` nije pravilno povezan).

- [ ] **Step 5: Verifikuj `route:list` izlazi bez fatalne greške i sve naše rute postoje**

Run:
```powershell
php artisan route:list --except-vendor
```
Expected: u listi se vide imena `home`, `ai-dnevnik`, `dashboard`, `profile.edit`, `profile.update`, itd. Nijedan crveni `Error: Failed to require ...`.

- [ ] **Step 6: Commit**

```powershell
git add routes/web.php tests/Feature/RoutingTest.php
git commit -m "F1: split routes/web.php into per-feature require pattern + smoke test"
```

---

## Task 4: Kreiraj `AGENTS.md` sa worktree konvencijama

**Files:**
- Create: `AGENTS.md`

Meta-plan sekcija 5 ima konvencije; AGENTS.md prikazuje sažetak u root-u da subagent dispatched u worktree (koji ne vidi `specs/`) ima ovo lako dostupno.

- [ ] **Step 1: Napiši `AGENTS.md`**

```markdown
# AGENTS.md — Worktree i track konvencije

Ovaj projekat koristi paralelni implementacijski plan (vidjeti `specs/000-paralelni-plan.md`). Subagenti dispatched u worktree-u trebaju ove konvencije.

## Source of truth

Pre bilo kakve implementacije pročitaj redom:
1. `specs/001-sportski-savez.md` (spec v1.1, single source of truth)
2. `specs/000-paralelni-plan.md` (meta-plan, mapa zavisnosti)
3. `specs/{1XX}-{track-id}-*.md` — plan tvog track-a

Glavni `CLAUDE.md` u root-u ima i kritična pravila (database safety, AI dnevnik workflow).

## Worktree konvencija

- **Direktorij:** `../sportski-savez-app-{track-id}/` (npr. `../sportski-savez-app-t2.1a/`)
- **Branch:** `feature/{track-id}-{kratki-naziv}` (npr. `feature/t2.1a-uc5-team-form`)
- **PR title:** `[{track-id}] {kratki naslov}`

```powershell
git worktree add ../sportski-savez-app-t2.1a -b feature/t2.1a-uc5-team-form
```

## Pre-merge checklist (run u svom worktree-u)

1. `vendor/bin/pint --dirty --format agent` — Pint clean
2. `php artisan test --compact` — zelena suita
3. `npm run build` — regeneriše Wayfinder bez TS errora
4. UI verifikovan na 360px (mobile) i 1280px (desktop)
5. Audit log zapis za svaku state izmjenu
6. Policy / Form Request `authorize()` odbija pogrešnu rolu

## Shared edit zones (NE dirati ako nije tvoj fajl)

Vidjeti meta-plan 4.1. Sažetak:
- `routes/web.php` je već split — edituj samo svoj `routes/{feature}.php`
- `database/seeders/DatabaseSeeder.php` — jedan poziv po liniji, alfabetski
- `app/Http/Middleware/HandleInertiaRequests.php` — koristi feature ServiceProvider `boot()` umjesto direktnog edit-a
- `lang/me/*.php` — po fajl po feature

## Database safety (KRITIČNO)

**NIKAD** ne pokreći `php artisan migrate:fresh`, `migrate:refresh`, `migrate:rollback` (ispod 2026_05_12_194833), `db:wipe`, `TRUNCATE ai_dnevnik_sesije`. Tabela `ai_dnevnik_sesije` čuva evidenciju rada za ADIS predaju; Sesija 15+ postoji samo u bazi.

Sigurne komande:
- Dev: `php artisan migrate` (additive) + `php artisan db:seed` (idempotent)
- Testovi: `RefreshDatabase` trait (transaction rollback) ili `:memory:` SQLite kroz `.env.testing`

## Subagent ograničenja

- Subagent NE upisuje u `ai_dnevnik_sesije` — samo glavni conversation
- Subagent čita SAMO svoj plan + meta-plan + spec — ne druge track planove
- Glavni conversation upravlja PR-ovima i merge-ovima

## Naming (vidjeti spec sekcija 10.4)

Engleski za sve tehničke artefakte (tabele, modeli, kontrolleri, rute), crnogorski za UI tekst preko `lang/me/`.

## Stack

- PHP 8.3, Laravel 13, Inertia 3, Fortify 1, Wayfinder 0
- React 19, Tailwind 4, shadcn/ui (Radix)
- Pest 4 za sve testove
- SQLite dev DB (`database/database.sqlite`)
```

- [ ] **Step 2: Commit**

```powershell
git add AGENTS.md
git commit -m "F1: add AGENTS.md with worktree + track conventions for subagents"
```

---

## Task 5: Pre-commit hook za Pint (opcionalno za F1, ali useful)

**Files:**
- Create: `.git/hooks/pre-commit` (lokalno, NE commit-ovan) — alternativno, dokumentovano u AGENTS.md

> **Napomena:** Git hooks nisu version-controlled. Za team konzistentnost, dovoljno je dokumentovati i ostaviti CI da uhvati formatting probleme (`lint.yml` već to radi).

- [ ] **Step 1: Dodaj sekciju u `AGENTS.md` za opciono lokalni pre-commit hook**

Append na `AGENTS.md`:

```markdown

## Opciono — lokalni pre-commit Pint hook

Nije obavezno (CI će uhvatiti). Ako želiš lokalno:

PowerShell (Windows):
```powershell
@'
#!/bin/sh
./vendor/bin/pint --dirty --format agent
git add -u
'@ | Set-Content .git/hooks/pre-commit -Encoding utf8
```
```

- [ ] **Step 2: Commit**

```powershell
git add AGENTS.md
git commit -m "F1: document optional local pre-commit Pint hook"
```

---

## Task 6: Verifikuj `composer run dev` skripta

**Files:**
- (provjera) `composer.json` skripta `dev` koja pokreće `php artisan serve` + `queue:listen` + `npm run dev` concurrent

Skripta već postoji u `composer.json:53-55`. Provjera da radi.

- [ ] **Step 1: Pokreni `composer run dev` u zasebnom shell-u i potvrdi da svi servisi pokreću se**

> **Korisniku:** ovo zahtjeva interaktivni shell. Ako agent radi automatski, samo provjeri da `composer.json` ima `dev` skriptu.

Verifikacija fajla:
```powershell
Get-Content composer.json | Select-String -Pattern "concurrently" -SimpleMatch
```
Expected: red sa `npx concurrently ...` postoji.

- [ ] **Step 2: Provjeri da `pail` paket postoji (logovi tail u dev-u)**

```powershell
Get-Content composer.json | Select-String -Pattern "laravel/pail" -SimpleMatch
```
Expected: `"laravel/pail": "^1.2.5"` u require-dev.

> **NE dodaj `php artisan pail` u `dev` skriptu sad** — već imamo `queue:listen`. Pail se može dodati u T1.3 ako zatreba.

- [ ] **Step 3: Bez commit-a (nije bilo izmjena u ovom task-u)**

---

## Task 7: Verifikuj CI workflow zelena na ovoj grani

**Files:**
- (provjera) `.github/workflows/tests.yml`, `lint.yml`

CI postoji. Posle našeg route split-a, `tests.yml` će pokrenuti `RoutingTest` koji smo dodali u Task 3.

- [ ] **Step 1: Push trenutnu granu i provjeri CI**

> **Korisniku:** ako radimo direktno na `main` bez PR-a, push-uj i provjeri Actions tab na GitHub-u.

```powershell
git push origin main
```

Provjeri:
- `https://github.com/{owner}/{repo}/actions` (lint workflow → zeleno)
- `tests` workflow → zeleno (sve postojeće Auth/Dashboard/AiDnevnik testove + naš RoutingTest)

Ako CI nije konfigurisan za remote pushevu, preskoči ovaj korak — verifikacija lokalno je dovoljna.

- [ ] **Step 2: Lokalna verifikacija ekvivalentna CI**

```powershell
vendor/bin/pint --test --format agent
php artisan test --compact
npm run build
```

Expected:
- Pint: `No fixable issues found` ili lista fajlova bez problema
- Tests: sve postojeće (Auth*, Dashboard, AiDnevnik) + RoutingTest PASS
- Build: bez warnings, Wayfinder generisao bez TS errora

---

## Task 8: Final clean-up + AI dnevnik upis

**Files:**
- (provjera) ništa za commit; samo dnevnik

- [ ] **Step 1: Provjeri git status čist**

```powershell
git status
```
Expected: `working tree clean` osim možda neispraženih dokumenata koji nisu vezani za F1 (npr. `CLAUDE.md`, `graphify-out/*` koji su bili modified na startu).

- [ ] **Step 2: Provjeri svi 9 route fajlovi load-uju se**

```powershell
php artisan route:cache
php artisan route:clear
```
Expected: oba prolaze bez errora.

- [ ] **Step 3: Glavni conversation upisuje dnevnik (NE subagent)**

Vidjeti `feedback_dnevnik_ai_logging` memoriju. Sesija se nastavlja (UPDATE) ili kreira (INSERT) — glavni conversation odlučuje granicu sesije.

---

## Acceptance criteria (mapped na spec sekcija 14)

- [x] Sva 9 placeholder route fajlova postoji i loaduje se bez errora (`route:list` PASS)
- [x] `php artisan route:list` izlazi bez greške
- [x] `composer.json` ima `dev` skriptu koja pokreće `serve + queue + vite` concurrent (već postoji)
- [x] CI workflow zelen (lokalno verifikovano `pint`, `test`, `build`)
- [x] AGENTS.md sa worktree konvencijama postoji
- [x] `.env.example` ima `ADMIN_*`, `OCR_ADAPTER`, `EDNEVNIK_ADAPTER`, queue varijable

## NE radi

- Nemoj kreirati Controller-e, modele, migracije (F2/Phase 1+ radi to)
- Nemoj instalirati nove pakete osim ako apsolutno treba (sve već imamo)
- Nemoj dirati `User` model strukturu (F2 radi)
- Nemoj `migrate:fresh` ili bilo koju destruktivnu DB komandu

## Self-review checklist

- Spec sekcija 15 (Pipeline faze) — F1 = "Setup" trajanja 1 nedjelje sa "funkcionalan dev environment" → ✓
- Meta-plan sekcija 4.2 (Plan za split routes/web.php) — 9 fajlova kreirani ✓
- Meta-plan sekcija 5 (worktree konvencije) — dokumentovano u AGENTS.md ✓
- Meta-plan sekcija 9 (NE radi) — F1 ne implementira biznis logiku ✓
- Database safety — F1 ne dira DB ✓
