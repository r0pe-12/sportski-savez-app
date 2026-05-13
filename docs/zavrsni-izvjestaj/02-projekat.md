# Projekat — arhitektura, tehnologije, okruženje, UML (konsolidovano izvještavanje 2.2)

> **Pokriva:** profesorov zahtjev 4 dio (b) — "Artefakte vezane za projekat (arhitektura, okruženje, izbor tehnologije, UML dijagrami)"
> **Konsolidacija:** `docs/fajlovi/Projektni_dizajn_v1.2.md` + `specs/001-sportski-savez.md` §8–§13 + 6 UML dijagrama iz T4.1

## 1. Arhitektura sistema

Sistem je projektovan kao **Laravel monolit** sa jasno odvojenim slojevima (HTTP, Application, Domain, Infrastructure). Frontend nije zaseban projekat — **Inertia.js most** omogućava da se React komponente serviraju direktno iz Laravel rute, čime se izbjegava komplikacija odvojenog SPA-a.

### Slojevita arhitektura

- **HTTP sloj** — Controller-i primaju zahtjeve, validacija kroz Form Request klase, vraćaju Inertia odgovore
- **Application sloj** — Service klase orkestriraju biznis logiku (`TeamRegistrationService`, `EDnevnikVerificationService`, `ResultEntryService`, `AuditLogger`, `MedicalCertificateStateMachine`)
- **Domain sloj** — Eloquent modeli, enum-i, value objekti (DTO-ovi za adaptere)
- **Infrastructure sloj** — Adapter klase (Fake* adapteri iza feature flag-ova), Notifications, Queue Jobs

### Component dijagram

Vidi [`uml/04-component-dijagram.puml`](uml/04-component-dijagram.puml) za vizuelni prikaz slojevite arhitekture sa svim ključnim komponentama i njihovim vezama na eksterne servise.

### Ključne odluke

- **Monolit umjesto microservisa** — broj korisnika nije veliki, ne treba scaling per-service. Operativna jednostavnost je važnija od teoretske skalabilnosti.
- **Inertia.js** — server-side router, type-safe frontend kroz Wayfinder, nema duplog auth-a (sesije, ne JWT). Backend ostaje Laravel idiom (Controllers + Blade-zamjena React).
- **Eloquent direktno** — bez Repository pattern wrapper-a (meta-plan §9: YAGNI). Eloquent već enkapsulira CRUD i query builder; dodatni sloj je apstrakcija bez vrijednosti za projekat ove veličine.
- **Adapter pattern za eksterne servise** — `FakeOcrAdapter` i `FakeEDnevnikAdapter` implementiraju interfejse, pravi servisi iza feature flag-ova. Tijekom razvoja i CI svi testovi rade protiv Fake-a; pravi adapteri se uključuju tek u produkciji.

## 2. Izbor tehnologije

(Iz spec §10.)

| Sloj | Izbor | Razlog |
|---|---|---|
| Backend framework | Laravel 13 | Maturity, ekosistem, Inertia first-party support |
| Auth | Laravel Fortify | Frontend-agnostičan, Inertia kompatibilan, nije Sanctum (jer ne treba API token za SPA istog porijekla) |
| Frontend | React 19 + Inertia 3 | Reaktivne UI komponente bez SPA komplikacije |
| Build | Vite + Wayfinder | Type-safe rute, HMR u dev modu |
| Styling | Tailwind 4 + shadcn/ui | Utility-first, design system iz kutije |
| DB (dev) | SQLite | Jednostavnije, schema agnostično |
| DB (prod) | PostgreSQL | Managed, indeksiranje, full-text search za audit log |
| Cache/Queue (dev) | database driver | Default Laravel, nema dodatnih zavisnosti |
| Cache/Queue (prod) | Redis | Match Laravel Cloud defaults |
| Email | log driver (dev), SES (prod) | Standard Laravel mailers |
| File storage | local (dev), S3 (prod) | Filesystem disk apstrakcija |
| OCR | FakeOcrAdapter (dev), Google Vision (prod, feature flag) | Pravi servis košta novac za testiranje |
| eDnevnik | FakeEDnevnikAdapter (dev), pravi HTTP (prod, feature flag) | Pravi adapter zahtjeva sporazum sa Ministarstvom |
| Testing | Pest 4 + Playwright (browser) | Modern PHP test syntax + headless browser smoke |

## 3. Okruženje (deployment)

(Detaljno u [`deployment/`](deployment/).)

| Tema | Dev | Production |
|---|---|---|
| Host | localhost (artisan serve + Vite) | Laravel Cloud |
| DB | SQLite (`database/database.sqlite`) | PostgreSQL managed + read replika |
| Cache/Queue | database driver | Redis |
| Storage | `storage/app/private/` | S3 (versioning + lifecycle) |
| Email | `storage/logs/laravel.log` | AWS SES |
| OCR | Fake (file-name) | Google Vision |
| eDnevnik | Fake (deterministic by JMB) | Pravi HTTP (Ministarstvo prosvjete) |
| Monitoring | Pail tail | Pulse + Sentry + CloudWatch |

**Deployment dijagram:** vidi [`uml/06-deployment-dijagram.puml`](uml/06-deployment-dijagram.puml) za vizuelni prikaz dev vs prod okruženja sa svim eksternim servisima.

## 4. Package struktura

(Iz git tree-a aplikacije, faktički stanje na v1.0.)

```
app/
├── Adapters/         ← Fake adapteri (OCR, eDnevnik) + DTO + Exception
├── Enums/            ← 7 enum-a (UserRole, SportType, TeamStatus, MedicalCertificateStatus, StudentVerificationStatus, MedalType, CompetitionStatus)
├── Http/
│   ├── Controllers/  ← 21 controller (Admin/ + root)
│   ├── Middleware/   ← role, audit, locale
│   └── Requests/     ← Form Request validacije
├── Jobs/             ← 3 queue job-a (Validate, Verify, Expire)
├── Models/           ← 12 modela + STI (User → Professor)
├── Notifications/    ← email + database
├── Policies/         ← per model authorization
└── Services/         ← 9 servisa

routes/
├── web.php          ← root, require-uje sve ostale
├── admin.php        ← admin samo CRUD korisnika i škola
├── teams.php        ← UC5 prijava ekipe
├── sports.php       ← admin CRUD
├── competitions.php ← admin CRUD
├── students.php     ← UC3, UC8
├── results.php      ← UC10
├── auth.php         ← Fortify rute
├── settings.php     ← profil + security
├── audit.php        ← UC7 dashboard
├── public.php       ← UC4 raspored
└── console.php      ← scheduler tasks

resources/js/
├── pages/           ← Inertia React stranice
├── components/      ← FormCard, side panel, sidebar
└── layouts/         ← Auth, App, Public

database/
├── migrations/      ← 13 migracija (uključujući ai_dnevnik_sesije)
├── seeders/         ← idempotent seeders + AiDnevnikSeeder
└── factories/       ← per model factories

tests/
├── Feature/         ← ~50 feature testova
├── Browser/         ← Pest 4 smoke + e2e
└── Unit/            ← few unit testova
```

**Package dijagram:** vidi [`uml/05-package-dijagram.puml`](uml/05-package-dijagram.puml).

## 5. UI principi

(Iz Projektni_dizajn §2 + faktički UI.)

- **Mobile-first** — sve stranice rade na 360px, optimizovane za 1280px desktop
- **shadcn/ui komponente** — Button, Input, Select, Card, Dialog, Sheet
- **Tailwind utility classes** — bez custom CSS osim za teme
- **Pristup u jeziku** — UI tekst preko `__('key')` u `lang/me/`
- **Form pattern** — `useForm` hook + `<FormCard>` + side panel za kontekstualne hint-ove
- **Sidebar nav** — collapse-able, role-aware (admin vidi admin meni)

**Dizajn diff od original Projektni_dizajn:**
- Originalno: skicirani wireframe-ovi
- Implementirano: stvarne stranice sa shadcn/ui komponentama, side panel za hint-ove, FormCard wrapper za sve admin create/edit stranice
- Vidjet u demo snimcima ([`demo/`](demo/))

## 6. API ugovori (Inertia)

(Iz Projektni_dizajn §3 + spec §12.)

Inertia ne koristi tradicionalni REST API — sve rute vraćaju Inertia response sa props-ima. Wayfinder generiše TypeScript funkcije za sve rute:

```typescript
// Auto-generisano: @/actions/App/Http/Controllers/TeamController
import { TeamController } from '@/actions/App/Http/Controllers/TeamController';

// U React komponenti:
const form = useForm({ name: '', professor_id: 0, sport_id: 0 });
form.post(TeamController.store.url());
```

Tree-shakable: nekorišćene rute se ne uključuju u bundle.

**Detaljni ugovori:** vidi spec §12 (API ugovori) i tipove u `resources/js/types/`.

## 7. Sigurnost i AZLP

(Iz spec §13.)

- **Auth:** Fortify (sesije, ne JWT), 2FA opciono za admin
- **CSRF:** Laravel default (cookie + token)
- **XSS:** Inertia escape-uje sve props-e, React JSX escape-uje text node-ove
- **SQL Injection:** Eloquent prepared statements
- **Mass assignment:** Form Request `validated()` umjesto `request()->all()`
- **Authorization:** Policy klase + middleware `role:admin/professor/student`
- **Audit log:** state izmjene preko `AuditLogger::log($action, $subject, $payload)`

**Penetration test:** planiran za production rollout (vidi [`deployment/03-production-readiness.md`](deployment/03-production-readiness.md)).

**Security audit test:** `tests/Feature/Integration/SecurityAuditTest.php` provjerava CSRF, mass assignment, authorization i audit log entries.

## 8. UML dijagrami

Šest UML dijagrama generisanih iz **stvarno implementiranog koda** (Phase 0–3, v1.0 tag), izvor PlantUML + (planiran) PNG render preko VS Code "PlantUML" extension-a.

| # | Dijagram | Izvor | Pokriva |
|---|---|---|---|
| 1 | [Klasni dijagram](uml/01-klasni-dijagram.puml) | `app/Models/` + `app/Enums/` | Domain model: 11 entiteta + 7 enum-a + STI User/Professor |
| 2 | [Sequence UC5](uml/02-sequence-uc5.puml) | `TeamController` + `TeamRegistrationService` + `FakeOcrAdapter` + `ValidateMedicalCertificateJob` | Prijava ekipe: async OCR upload + sync submit |
| 3 | [Sequence UC8](uml/03-sequence-uc8.puml) | `StudentVerificationController` + `EDnevnikVerificationService` + `FakeEDnevnikAdapter` | eDnevnik verifikacija: 3 grane (verified/mismatched/unavailable) |
| 4 | [Component dijagram](uml/04-component-dijagram.puml) | spec §9.2 + `app/` struktura | Slojevita arhitektura sa adapter pattern |
| 5 | [Package dijagram](uml/05-package-dijagram.puml) | `app/`, `routes/`, `resources/js/`, `database/`, `tests/` | Laravel struktura sa split route-ovima |
| 6 | [Deployment dijagram](uml/06-deployment-dijagram.puml) | `composer.json` + `.env.example` + spec §11 | Dev (SQLite + log mail + Fake adapteri) vs prod (Laravel Cloud) |

Detalji i uputstvo za render: [`uml/README.md`](uml/README.md).

## Diff naspram originalnog Projektni_dizajn

| Tema | Originalno | Implementirano | Razlog |
|---|---|---|---|
| Auth | Sanctum | Fortify | Sanctum je za API token-e (mobile, third-party); ne treba za istog porijekla Inertia SPA |
| DB dev | PostgreSQL | SQLite | Jednostavnije za ocjenjivača, schema agnostično piše |
| React verzija | 18 | 19 | 19 je stabilno; Inertia 3 zahtjeva 18+, ali 19 daje server components heads-up |
| Repository pattern | Predložen | Odbijen | Eloquent već enkapsulira (meta-plan §9: YAGNI) |
| Multi-language UI | Predloženo | Samo `me` | Spec eksplicitno (van scope-a) |
| Email driver dev | smtp | log | Jednostavnije, sve u `storage/logs/laravel.log` |
| Custom error catalog | Predložen | Odbijen | Laravel default + Form Request validation poruke su dovoljne |

## Reference

- [Projektni dizajn v1.2 (original)](../fajlovi/Projektni_dizajn_v1.2.md)
- [Glavni spec §8–§13](../../specs/001-sportski-savez.md)
- [Sva UML dokumentacija](uml/README.md)
- [Deployment uputstva](deployment/README.md)
- [Sljedeće poglavlje: Implementacija i demonstracija](03-implementacija-demonstracija.md)
