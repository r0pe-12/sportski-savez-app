# AI Dnevnik — DB-driven public ruta (Design Spec)

**Datum:** 2026-05-12
**Status:** Approved, in implementation
**Autori:** Petar Simonović (vlasnik projekta), Claude Opus 4.7 (brainstorming partner)

## Context

Trenutno se sadržaj AI dnevnika održava u dva fajla u `docs/fajlovi/`:
- `Dnevnik_AI_v1.3.md` — primarni (čitljiv u git diff-u)
- `Dnevnik_AI_v1.3.docx` — deliverable za predaju (regeneriše se kroz docx skill)

Posle svakog Claude prompta, oba fajla se ažuriraju novom "Sesijom X" (trenutno 12 sesija u 3 faze). Ovaj workflow je manuelan, podložan drift-u između .md i .docx, i nije dostupan eksterno (npr. profesoru) bez slanja fajla.

Cilj ove feature: premjestiti sadržaj dnevnika u bazu kao single source of truth i izložiti ga preko javne rute `/ai-dnevnik` (Inertia React stranica) tako da posjetilac vidi cijeli dnevnik u modernom Card timeline formatu, grupisan po fazama.

## Odluke iz brainstorminga (sve potvrđene)

1. **Source of truth**: Baza = master. `.md`/`.docx` se generišu iz baze kasnije, kad zatreba (export komanda u budućnosti — YAGNI sad).
2. **Pisanje sesija**: Claude direktno preko `php artisan tinker --execute` (nema admin UI, nema komandni alat).
3. **UI prikaz**: Card timeline grupisan po Fazama (Faza 1/2/3 kao H2 headinzi, sesije kao shadcn `<Card>` komponente).
4. **Sadržaj rute**: Cijeli dnevnik — header (Uvod, Svrha, Metodologija, Tabela alata) i Refleksija/Plan su hardcoded u TSX-u (rijetko se mijenjaju), Sesije su DB-driven.
5. **Discoverability**: Nema linka sa welcome-a. Samo direktan URL.
6. **Export komanda**: Kasnije, kad zatreba.

## Arhitektura

### Backend (Laravel 13 + SQLite)

**Migracija** — `ai_dnevnik_sesije` tabela:
```
id, broj (uint, unique), naslov (string), datum (date),
faza (string), cilj (text), alat (string), instrukcije (text),
output (text), odluke (text), ishod (text), timestamps
```
Index: `broj`, `faza`, `datum`.

**Model** `App\Models\AiDnevnikSesija`:
- `$casts = ['datum' => 'date']`
- `$fillable` za sva polja osim id/timestamps
- Scope `scopeOrderedByBroj()` za prikaz

**Controller** `AiDnevnikController@show`:
```php
$fazeSaSesijama = AiDnevnikSesija::orderedByBroj()->get()->groupBy('faza');
return Inertia::render('ai-dnevnik', ['fazeSaSesijama' => $fazeSaSesijama]);
```

**Ruta** u `routes/web.php`:
```php
Route::get('/ai-dnevnik', [AiDnevnikController::class, 'show'])->name('ai-dnevnik');
```
**Bez** auth middleware-a. Wayfinder automatski generiše typed funkciju.

**Seeder** `AiDnevnikSeeder` upisuje 12 postojećih sesija iz trenutnog `.md`-a. Idempotentan (truncate ili check pre insert).

### Frontend (Inertia React 19 + shadcn UI + Tailwind v4)

**Stranica** `resources/js/pages/ai-dnevnik.tsx`:
```
<Head title="AI Dnevnik — Sistem školskog sporta CG" />
<main className="mx-auto max-w-4xl px-6 py-12 space-y-12">
  Header (H1 + verzija + meta)
  Sekcija 1 — Uvod (hardcoded TSX): Svrha + Metodologija + Tabela alata
  Sekcija 2 — Evidencija sesija (DB-driven):
    Za svaku fazu: H2 + map sesija kao <Card>
      CardHeader: Badge sesija + datum + H3 naslov
      CardContent: 6 key:value polja (Cilj/Alat/Instrukcije/Output/Odluke/Ishod)
  Sekcija 3 — Refleksija (hardcoded TSX): 3 podsekcije
  Sekcija 4 — Plan ažuriranja (hardcoded TSX)
</main>
```
Bez `app-layout.tsx` (sidebar nije potreban za public). Koristi shadcn `Card`, `CardHeader`, `CardContent`, `Badge`, `Table`, `Separator`.

## Data Flow

1. **Pisanje**: Claude nakon prompta → `php artisan tinker --execute 'AiDnevnikSesija::create([...])'`
2. **Čitanje**: Posjetilac → `/ai-dnevnik` → controller → groupBy('faza') → Inertia → React Card timeline
3. **Predaja**: `php artisan dnevnik:export` (kasnije implementacija) regeneriše `.md`/`.docx`

## Critical Files

| File | Status | Purpose |
|------|--------|---------|
| `database/migrations/2026_05_12_*_create_ai_dnevnik_sesije_table.php` | new | Tabela schema |
| `app/Models/AiDnevnikSesija.php` | new | Eloquent model |
| `app/Http/Controllers/AiDnevnikController.php` | new | show() metod |
| `routes/web.php` | edit | Dodati public rutu |
| `database/seeders/AiDnevnikSeeder.php` | new | 12 postojećih sesija |
| `database/seeders/DatabaseSeeder.php` | edit | Pozvati AiDnevnikSeeder |
| `resources/js/pages/ai-dnevnik.tsx` | new | Public stranica |
| `tests/Feature/AiDnevnikTest.php` | new | Pest feature test |

## Verification

- Browser smoke test: posjeti `/ai-dnevnik`, provjeri 3 faze (Faza 1: 7, Faza 2: 4, Faza 3: 1+).
- `php artisan test --compact --filter=AiDnevnikTest` mora proći.
- `php artisan tinker --execute 'AiDnevnikSesija::count()'` vraća >= 12.
- Wayfinder TS tipovi za `aiDnevnik` rutu rade bez greške.

## Out of Scope

- Admin UI za CRUD sesija.
- `php artisan dnevnik:export` komanda.
- Link sa welcome.tsx.
- Pretraga, paginacija, filteri.
- Multi-language.
