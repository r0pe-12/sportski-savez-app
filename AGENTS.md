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
