<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.3
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/wayfinder (WAYFINDER) - v0
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v3
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.
- To check environment variables, read the `.env` file directly.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- The `{name}` argument should not include the test suite directory. Use `php artisan make:test --pest SomeFeatureTest` instead of `php artisan make:test --pest Feature/SomeFeatureTest`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>

---

# Projektne instrukcije — Sistem školskog sporta CG (ADIS)

**Kontekst:** Ovaj repo je informacioni sistem za Sportski savez Crne Gore. Predmet: ADIS, Univerzitet Donja Gorica. Vlasnik: Petar Simonović.

## 1. Source of truth (REDOSLIJED PRI SVAKOM POČETKU SESIJE)

Pročitaj redom prije bilo kakve implementacije:
1. **`specs/001-sportski-savez.md`** — Glavni spec (v1.1, 17 sekcija). Spec je single source of truth. Sadrži funkcionalne zahtjeve (UC1–UC10), domain model, NFR, arhitekturu, naming konvencije, permission matricu, state dijagrame, file storage konvenciju, glossary.
2. **`specs/000-paralelni-plan.md`** — Meta-plan (v1.1). 14 track-ova kroz 4 phase grupe. Mapa zavisnosti, merge konvencije, worktree konvencije, demo scenari.
3. **`specs/{1XX}-{track-id}-*.md`** — Per-track placeholderi (popunjavaju se kroz `/plan`).
4. **`docs/fajlovi/`** — Originalni SVD/Analitika/Dizajn dokumenti (kontekst, ne ažurirati).

## 2. KRITIČNA PRAVILA (čitaj prije svake destruktivne komande)

### 2.1 Database safety — NIKAD ne brisati bazu
- **ZABRANJENO:** `php artisan migrate:fresh`, `migrate:fresh --seed`, `migrate:refresh`, `migrate:rollback` (osim ako ne ide ispod 2026_05_12_194833), `db:wipe`, `schema:dump --prune`, direktan `DROP TABLE ai_dnevnik_sesije`, `TRUNCATE`.
- **Razlog:** `ai_dnevnik_sesije` tabela čuva evidenciju rada za ADIS predaju. Sesija 15+ postoje **samo u bazi** (stari `Dnevnik_AI_v1.3.md` se više ne ažurira).
- **Sigurne alternative:**
  - Dev: `php artisan migrate` (additive) + `php artisan db:seed` (idempotent, svi seederi su `updateOrCreate`/by-unique-column)
  - Testovi: `RefreshDatabase` trait (transaction rollback, ne dira radnu bazu) ili `:memory:` SQLite kroz `.env.testing`
  - Ako MORA fresh: backup `ai_dnevnik_sesije` u JSON, `php artisan migrate:fresh`, restore odmah. Ali preferiraj **prvo predložiti korisniku alternativu**.
- **Detaljnije:** `~/.claude/projects/{project}/memory/feedback_database_safety.md`

### 2.2 AI dnevnik workflow

**OBAVEZNO — prije bilo kakvog rada u novoj sesiji.** Ako ovo propustiš, korisnik gubi evidenciju rada za ADIS predaju.

- **Sesija = cio razgovor** (jedna conversation u Claude Code), NE pojedinačan prompt.
- **Tabela:** `ai_dnevnik_sesije` · **Model:** `App\Models\AiDnevnikSesija` · **Public ruta:** `/ai-dnevnik` · **Seeder:** `database/seeders/AiDnevnikSeeder.php`

**Prvi tool call svake nove sesije MORA biti INSERT u dnevnik.** Ne piši kod, ne čitaj fajlove, ne odgovaraj — prvo upiši sesiju. Recept ispod.

- **Prvi prompt sesije:** INSERT novi red sa `MAX(broj)+1`. Polja `instrukcije/output/odluke/ishod` sa `### Prompt 1` sekcijom.
- **Svaki naredni prompt iste sesije:** UPDATE postojeći red. Append `### Prompt N` sekcije u sva četiri text polja.
- **Recept (INSERT/UPDATE):**
  1. Piši PHP fajl u `storage/app/tmp_session_N.php` (multiline puca u `tinker --execute`)
  2. `php artisan tinker --execute 'require base_path("storage/app/tmp_session_N.php");'`
  3. **`php artisan ai-dnevnik:sync-seeder`** — regeneriše seeder iz baze (dual-write)
  4. Obriši `storage/app/tmp_session_N.php`
- **Dual-write pravilo:** baza i seeder MORAJU biti in-sync na kraju svake izmjene. Posle SVAKE INSERT/UPDATE-a u tabeli, **odmah** pokreni `php artisan ai-dnevnik:sync-seeder`. Komit sadrži samo seeder diff (DB je instant kroz tinker).
- **Markdown markup koji se renderuje na `/ai-dnevnik`:** `### Heading`, `**bold**`, `` `code` ``, `- item`, `1. item`, prazne linije = paragrafi. **NE:** tabele, linkovi, code blokovi sa ```.
- **Subagenti NE upisuju** — samo glavni conversation.
- **Detaljnije:** `~/.claude/projects/{project}/memory/feedback_dnevnik_ai_logging.md`

## 3. Stack i ključne odluke (iz spec sekcije 10)

| Tema | Odluka | Razlog |
|---|---|---|
| Auth | **Fortify + Inertia sesije** (NE Sanctum) | Već instalirano, bolji fit za Inertia SPA bez API tokena |
| DB (dev) | **SQLite** (`database/database.sqlite`) | Jednostavnije; spec piše schema agnostično |
| Cache/queue (dev) | **`database` driver** | Default Laravel; Redis u produkciji |
| OCR | **`FakeOcrAdapter`** (file-name konvencija) | Pravi Google Vision iza feature flag-a kasnije |
| eDnevnik | **`FakeEDnevnikAdapter`** (deterministic by JMB) | Pravi HTTP iza feature flag-a kasnije |
| Email | **`log` driver** u dev (u `storage/logs/laravel.log`) | `ses` u produkciji |
| File storage | **`storage/app/private/`** lokalno | S3 u produkciji |
| Frontend | React 19, Tailwind 4, shadcn/ui, Wayfinder | Već instalirano |

## 4. Naming conventions (spec sekcija 10.4)

**Princip:** engleski za tehničke artefakte, crnogorski za UI preko `lang/me/`.

| Artefakt | Konvencija | Primjer |
|---|---|---|
| Tabele | `snake_case` množina engleski | `users`, `teams`, `team_members`, `medical_certificates` |
| Modeli | `PascalCase` jednina engleski | `Student`, `Team`, `MedicalCertificate` |
| Kontrolleri | `PascalCase + Controller` | `TeamRegistrationController` |
| Service/Adapter/Policy/Job | `PascalCase + sufiks` | `TeamRegistrationService`, `FakeOcrAdapter`, `TeamPolicy`, `ValidateMedicalCertificateJob` |
| Rute URL | `kebab-case` engleski | `/teams`, `/students/{student}/profile` |
| React komponente | `PascalCase` u `kebab-case.tsx` | `TeamRegistrationForm` u `team-registration-form.tsx` |
| UI tekst | crnogorski preko `__('key')` | `__('teams.create_button')` → "Nova prijava ekipe" |

**Izuzeci:** `AiDnevnikSesija` (predmet-specifičan), `jmb` (CG-specific, ne `personal_id`).

**Glossary:** spec sekcija 17 ima mapping crnogorski domain ↔ engleski tehnički za sve entitete i pojmove.

## 5. Paralelni implementacijski plan (4 phase, 14 track-ova)

```
Phase 0 (sekvencijalno): F1 Setup → F2 Migracije+modeli
Phase 1 (3 paralelna):   T1.1 Auth+UI shell · T1.2 Sportovi+raspored · T1.3 Cross-cutting infra
Phase 2 (7 paralelnih):  T2.1a Form · T2.1b OCR · T2.1c Submit (UC5 split) ·
                         T2.2 eDnevnik · T2.3 Rezultati · T2.4 Profil · T2.5 Raspored
Phase 3 (sekvencijalno): T3.1 Audit log dashboard → T3.2 Smoke + e2e
                         → v1.0 tag (funkcionalnost spremna)
Phase 4 (predaja za     T4.1 UML dijagrami · T4.2 V&V + deployment · T4.3 finalni izvještaj + demo
završni ispit):          → v1.1 tag (predaja za ADIS spremna)
                         **Radi se POSLIJE implementacije** — UML iz koda, V&V citira sesije, demo iz radne aplikacije.
```

**Phase merge cadence:** posle svake phase boundary, sve worktree-ove rebase na novi main. Detalji: meta-plan sekcija 6.

**Worktree konvencija:**
- Direktorij: `../sportski-savez-app-{track-id}/`
- Branch: `feature/{track-id}-{kratki-naziv}`
- PR title: `[{track-id}] {naslov}`
- Subagent čita SAMO svoj plan + meta-plan + spec
- Glavni conversation upravlja PR-ovima i merge-ovima

## 6. Acceptance criteria pre-merge (svaki track)

Iz spec sekcije 14 + meta-plan sekcija 8:
- [ ] Pest feature test za glavni tok + 2 alt toka
- [ ] `vendor/bin/pint --dirty --format agent` clean
- [ ] `php artisan test --compact` zelena
- [ ] `npm run build` bez warnings (regeneriše Wayfinder)
- [ ] TypeScript bez `any` u javnim signaturama React komponenti
- [ ] UI verifikovan na 360px (mobile) i 1280px (desktop)
- [ ] Audit log zapis za svaku state izmjenu
- [ ] Policy / Form Request `authorize()` odbija pogrešnu rolu
- [ ] **NIJEDNA `migrate:fresh` referenca u kodu, CI, ili dokumentaciji**

## 7. Shared edit zones (sprečavanje merge konflikata)

Iz meta-plan sekcija 4.1:
- `routes/web.php` razbijen na `require` pattern. Svaki feature edituje **isključivo** svoj fajl (`routes/teams.php`, `routes/sports.php`, itd.). `routes/admin.php` sadrži samo user/school admin; resource CRUD admin rute idu u resource-specific fajl sa `Route::middleware('role:admin')` group.
- `DatabaseSeeder::run()` koristi alfabetsku listu, jedan poziv po liniji.
- `HandleInertiaRequests` ne diramo direktno; feature ServiceProvider boot() registruje `Inertia::share()`.
- `lang/me/{feature}.php` — po fajl po feature.

## 8. NE radi liste (over-engineering prevencija)

Iz meta-plan sekcija 9:
- Repository pattern (koristi Eloquent direktno)
- Sub-admin / per-school admin / read-only auditor role
- Multi-tenancy škola
- Mobilna app, plaćanja, bulk import (spec 2 van obima)
- AZLP cleanup workflow (`purge-graduates`, `/profile/export`, saglasnost roditelja workflow)
- Custom error catalog (Laravel default je dovoljan)
- Multi-language UI (samo `me`)

## 9. Skills aktivacija (kad raditi šta)

| Domain | Skill | Kad aktivirati |
|---|---|---|
| Bilo koji Laravel backend | `laravel-best-practices` | Pisanje/review controller, model, migration, service, queries |
| Autentifikacija | `fortify-development` | Login, register, password reset, 2FA, Fortify config |
| Inertia React UI | `inertia-react-development` | React stranice, forme, `useForm`, `<Link>`, layouts |
| Tailwind UI | `tailwindcss-development` | Bilo koji utility class rad |
| Wayfinder rute | `wayfinder-development` | Frontend treba pozvati backend rutu |
| Pest testovi | `pest-testing` | Bilo koji test piše, edit, fix |
| Brainstorming | `superpowers:brainstorming` | Pre svake nove feature/track implementacije |
| TDD | `superpowers:test-driven-development` | Pisanje testova pre implementacije |
| Plan pisanje | `superpowers:writing-plans` | Pretvaranje placeholder fajla u konkretan plan |
| Subagent paralelizam | `superpowers:dispatching-parallel-agents` | Kad više nezavisnih taskova mogu raditi paralelno |
| Worktrees | `superpowers:using-git-worktrees` | Pre starta paralelnih track-ova |

## 10. Boost MCP tool preference

- **Pre-implementation:** `mcp__laravel-boost__search-docs` sa version-aware query-jima.
- **DB inspekcija:** `mcp__laravel-boost__database-schema` (summary first), `mcp__laravel-boost__database-query` (read-only SQL).
- **URL share:** `mcp__laravel-boost__get-absolute-url` prije slanja URL-a korisniku.
- **Debugging:** `mcp__laravel-boost__browser-logs`, `mcp__laravel-boost__last-error`, `mcp__laravel-boost__read-log-entries`.

## 11. Početak implementacije (kad krenemo iz sljedeće sesije)

**Predloženi redoslijed:**
1. `/plan` za F1 Setup (placeholder: `specs/100-f1-setup.md`) — sekvencijalno
2. `/plan` za F2 Migracije+modeli (`specs/101-f2-migracije-modeli.md`) — sekvencijalno, blokira sve
3. Phase 1 — paralelno 3 worktree-a za T1.1, T1.2, T1.3
4. Phase 2 — paralelno 7 worktree-ova
5. Phase 3 — sekvencijalno

**Prvi conkretni korak:** kad korisnik kaže "kreni", pokreni `/plan` (ili `superpowers:writing-plans` skill) sa argumentom `specs/100-f1-setup.md` da popuniš placeholder u konkretan implementacioni plan.

## 12. Reagovanje na otvorena pitanja iz spec sekcije 16

Pitanja se **NE rješavaju unaprijed** — rješavaju se u relevantnom track planu. Trenutno otvorena (po spec v1.1):
- JMB algoritam validacija (regex format check za sad u F2)
- Foto učenika obavezna ili opciono (pretpostavka: opciono)
- Saglasnost roditelja workflow (van obima — polje ostaje boolean, workflow ne)
- Audit log retention (van obima)
- 2FA scope (Fortify default — svi mogu opciono)
- Multi-tenancy škola (van obima)
- Notification digest (kasnije feature)
