# V&V i AI u SDLC — refleksija (v1.0)

> **Pokriva profesorov zahtjev 5:** "Prokomentarisati izazove verifikacije i validacije (testiranje), posebno iz ugla kad koristimo AI u svim koracima SDLC."

## Kontekst

Cijeli sistem školskog sporta CG je razvijen sa Claude Code (Anthropic, model Opus 4.7 sa 1M token context) kao primarnim alatom kroz Spec → Plan → Code → Test pipeline. Auditabilnost AI doprinosa čuva se u `ai_dnevnik_sesije` tabeli — 18 numerisanih sesija (broj 1–19, broj 13 nije korišćen) od 2026-04-29 do 2026-05-13, sa instrukcijama / output-om / odlukama / ishodom po promptu.

**Statistika sesija po fazama (snapshot na dan v1.0 tag-a, 2026-05-13):**

| Faza | Broj sesija |
|---|---|
| Faza 1 — Analitička dokumentacija | 7 |
| Faza 2 — Skraćivanje, refaktor i projektni dizajn | 4 |
| Faza 3 — Kontinuirano dokumentovanje upotrebe AI | 2 |
| Specifikacija | 3 (sesije 15, 16, 17) |
| Implementacija | 1 (sesija 18) |
| Faza 4 — Dokumentacija za ADIS predaju | 1 (sesija 19) |
| **Ukupno** | **18** |

Ovaj dokument analizira **u kojim je fazama SDLC-a AI bio rizičan** i **koje smo mehanizme V&V primijenili** da se ti rizici drže pod kontrolom.

---

## 1. AI u analizi (zahtjevi)

**Rizik:** halucinacija zahtjeva — AI inventuje funkcionalnost koju korisnik nikad nije tražio (out-of-scope kompleksnost), ili "razumije" zahtjev koji je dvosmislen bez da pita za pojašnjenje.

**Konkretni primjeri iz dnevnika:**

- **Sesija 15 — "Kompletna projektna spec + plan + CLAUDE.md instrukcije za sljedeću implementacionu sesiju" (2026-05-12).** Cilj sesije bio je *"Analizirati sva tri izvorna dokumenta iz docs/fajlovi i konsolidovati ih u jedinstven spec fajl kao single source of truth"*. AI je u prvom draft-u spec-a generisao kompleksan "saglasnost roditelja" workflow sa email tokenima, iako je korisnik samo tražio boolean polje. Ispravljeno kroz iteraciju: dodato u "NE-radi listu" (meta-plan §9).
- **Sesija 17 — "Provjera pokrivenosti zahtjeva profesora za završni ispit" (2026-05-13).** Cilj: *"Mapirati 5 zahtjeva profesora ... na postojeći spec + meta-plan + 14 track-planova i identifikovati gap-ove"*. Bila je čista validacijska sesija (read-only) gdje je AI uporedio spec sa originalnim profesorovim dokumentom i predložio T4.* placeholderima da se popune.

**Mitigacija:**

1. **Spec kao single source of truth** — `specs/001-sportski-savez.md` (v1.1, 17 sekcija) je jedini ovlašteni izvor zahtjeva. Sve odluke koje odudaraju moraju se eksplicitno odobriti i unijeti u spec.
2. **"Provjeri pokrivenost" sesija** — Sesija 17 je bila čista validacija (read-only) sa eksplicitnim ciljem gap-analize, ne nove implementacije.
3. **Brainstorming skill prije implementacije** — `superpowers:brainstorming` je obavezan korak prije svake nove feature: ne ulazi u kod prije nego što su intent + design jasno postavljeni.
4. **Faze 1 + 2 prije implementacije** — 11 sesija (broj 1–11) bilo je čisto analitičko-dizajnerskih, prije nego što se napisao prvi red production koda. Time je rizik halucinacije lokalizovan na dokumente koje je lakše ispraviti nego kod.

**Otvoreni rizik:** spec drift kad korisnik radi izmjene na licu mjesta a one ne uđu u spec. Smanjeno preko CLAUDE.md instrukcije "Spec je single source of truth".

---

## 2. AI u dizajnu (arhitektura)

**Rizik:** over-engineering — AI ima tendenciju da predloži pattern-e koji "izgledaju profesionalno" (Repository pattern, sub-roles, multi-tenancy) iako nisu opravdani veličinom projekta.

**Konkretne odluke koje smo morali eksplicitno odbaciti (meta-plan §9 — "NE-radi liste"):**

| AI predložio | Odluka | Razlog |
|---|---|---|
| Repository pattern preko Eloquent-a | NE | Eloquent već enkapsulira CRUD; dodatni sloj samo apstrakcija bez vrijednosti za projekat ove veličine |
| Sub-admin / per-school admin / read-only auditor | NE | Spec zahtijeva 3 role (Admin, Profesor, Student/Učenik) — širenje van toga je scope creep |
| Multi-tenancy škola | NE | Spec eksplicitno kaže "single-tenant, sve škole u istoj instanci" |
| Custom error catalog | NE | Laravel default error pages + Form Request validation poruke su dovoljne |
| Multi-language UI | NE | Samo `me` lokalna; Inertia `__()` helper je dovoljan |
| AZLP cleanup workflow (`purge-graduates`, `/profile/export`, saglasnost roditelja workflow) | NE | Spec van obima — boolean polja postoje, workflow ne |
| Mobilna aplikacija, plaćanja, bulk import | NE | Spec 2 van obima |

**Konkretni primjer iz dnevnika:**

- **Sesija 15** je ustanovila "NE-radi liste" kao prvoklasni mehanizam u meta-planu. Iz `cilj` polja: *"Fokus na funkcionalan sistem (mock eksterni servisi), ne AZLP regulatorna usklađenost"*. To je registrovano u meta-planu §9 tako da nijedan kasniji subagent ne može "u dobroj vjeri" da krene da pravi GDPR workflow.

**Mitigacija:**

1. **NE-radi liste** u meta-planu §9 — eksplicitan registar šta NE pravimo, tako da AI ima jasnu granicu.
2. **YAGNI princip** u CLAUDE.md sekcija 8 — "Don't add features beyond what the task requires."
3. **Brainstorming sa korisnikom** prije large feature kreira "ne radi liste" za tu feature.
4. **Per-track plan kao "ugovor"** — svaki od 14 implementacijskih plan-fajlova (`specs/100-*` do `specs/142-*`) ima Acceptance criteria sekciju koja subagentu definiše šta jeste i šta nije scope.

**Otvoreni rizik:** AI može da uvuče over-engineering u manjim mjerama (extra polje na modelu, extra method na servisu) koje promaknu reviewer-u jer nisu očigledne. Smanjeno preko Pest testova koji kažnjavaju nekorišten kod (`vendor/bin/pint --dirty` + dead-code detekcija) i Wayfinder type safety (nepostojeća ruta = TS compile error).

---

## 3. AI u implementaciji (kod)

**Rizik:** code drift — AI ne čita postojeće konvencije ili pravi sitne devijacije (npr. `getUser()` umjesto `user()`, `User::admin()` umjesto `User::where('role', UserRole::Admin)`). Posebno opasno u SPA gdje frontend tipovi moraju da se slažu sa backend kontrolerima.

**Konkretni primjeri iz dnevnika:**

- **Sesija 18 — "Start implementacije — subagent-driven development + git worktrees za Phase 0/1" (2026-05-13).** Iz `cilj` polja: *"Prva implementaciona sesija: izvršiti Phase 0 (F1 Setup → F2 Migracije+modeli sekvencijalno) i pokrenuti Phase 1 paralelno kroz tri git worktree-a"*. U toku sesije AI je u prvom pokušaju pravio sitne devijacije u naming-u (npr. `findOrFail()` umjesto Laravel route-model binding-a) — konvencija je usaglašena pa popravljena.
- **Sesija 16 — "14 implementacijskih planova + dual-write workflow za AI dnevnik" (2026-05-13).** Definisala je da svaki plan ima "Acceptance criteria" sekciju, tako da kad subagent piše kod, ima precizan ugovor protiv kog se test može pisati prije implementacije.

**Mitigacija:**

1. **CLAUDE.md naming pravila** (sekcija 4) — tabele snake_case engleski, modeli PascalCase engleski, rute kebab-case, UI me kroz `__()`.
2. **Pint formatter** (`vendor/bin/pint --dirty --format agent`) je mandatory prije svake komite — uniformiše stil tako da AI ne može "vidjeti" tuđu konvenciju i drift-ovati.
3. **Wayfinder type safety** — `@laravel/vite-plugin-wayfinder` generiše TypeScript funkcije za sve Laravel rute. Frontend ne može da pozove nepostojeću rutu — TS compile pada.
4. **Pest testovi sa konvencija checks** — npr. `tests/Feature/RoutingTest.php` provjerava da svi admin URL-ovi imaju `role:admin` middleware.
5. **Subagent-driven workflow + worktrees** — svaki track ide u izolovani worktree (`../sportski-savez-app-{track-id}/`) sa svojim subagent-om koji čita SAMO svoj plan + meta-plan + spec. Glavni conversation ne mješa kontekst, smanjuje cross-track drift.

**Konkretan citat:** Sesija 18, Prompt 5 (`ishod` polje) — finalni snapshot Phase 3:

```
Phase 3 100% završen. v1.0 tag postavljen.

Ukupan obim sesije 18:
- Phase 0: F1 (5 commitova, 4 testa) + F2 (14 commitova, +28 testa) = 19 commitova
- Phase 1: T1.1 (13) + T1.2 (7) + T1.3 (6) + 3 merge + cleanup = 30 commitova, +72 testa
- Phase 2: T2.1a (7) + T2.1b (7) + T2.1c (3) + T2.2 (5) + T2.3 (5) + T2.4 (4) + T2.5 (3) + 7 merge = 41 commit, +145 testa
- Phase 3: T3.1 (4) + T3.2 (7) + 2 merge = 13 commitova, +32 testa
- Ukupno: ~103 commita, +281 nov test (4 → 329), 957 assertion-a, 9 use case-a implementirano
```

**329/329 testova zelena prije v1.0 tag-a.** Veliki broj pokrivenosti znači da AI ne može tiho da drift-uje kod — svaki novi commit prolazi kroz `php artisan test --compact` gate. Suite trenutno ima 957 assertion-a po sesiji 18 ishod-u, što je ~2.9 assertion-a po testu (zdrava metrika — nije tautološki).

---

(nastavlja se u Task 2 — sekcije 4–7)
