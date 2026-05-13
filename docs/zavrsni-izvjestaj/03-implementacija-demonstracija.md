# Implementacija i demonstracija (izvještavanje 3)

> **Pokriva:** profesorov zahtjev 4 dio (b-bis) — "Demonstracija i implementacija (snimak ekrana aplikacije u upotrebi za par UC-ova, diskusija integracije, instalacije, testiranja)"
> **Konsolidacija:** spec §15 (pipeline) + meta-plan §10 (demo scenari) + faktički status

## 1. Implementacijski pipeline — pregled

Implementacija je organizovana kroz **paralelni plan sa 14 track-ova kroz 4 phase grupe**:

| Phase | Track-ovi | Status | Tag |
|---|---|---|---|
| 0 (sekvencijalno) | F1 Setup, F2 Migracije+modeli | ✅ Završeno | (no tag) |
| 1 (paralelno) | T1.1 Auth+UI shell, T1.2 Sportovi+raspored, T1.3 Cross-cutting infra | ✅ Završeno | (no tag) |
| 2 (paralelno) | T2.1a UC5 Form, T2.1b UC5 OCR, T2.1c UC5 Submit, T2.2 UC8 eDnevnik, T2.3 UC10 Rezultati, T2.4 UC3 Profil, T2.5 UC4 Raspored | ✅ Završeno | (no tag) |
| 3 (sekvencijalno) | T3.1 Audit log dashboard, T3.2 Smoke + e2e | ✅ Završeno | `v1.0` |
| 4 (paralelno + sekvencijalno) | T4.1 UML, T4.2 V&V+deployment, T4.3 (ovaj) | 🚧 U toku | `v1.1` (planiran) |

**Metaplan:** [`specs/000-paralelni-plan.md`](../../specs/000-paralelni-plan.md).

## 2. Faktički status implementiranih UC-ova

| UC | Naziv | Track | Pest testovi |
|---|---|---|---|
| UC1 | Registracija | T1.1 | `tests/Feature/Auth/RegistrationTest.php`, `RoleRegistrationTest.php` |
| UC2 | Login | T1.1 | `Auth/AuthenticationTest.php`, `RoleRedirectTest.php` |
| UC3 | Pregled profila/istorije | T2.4 | `Student/ProfileTest.php`, `PhotoTest.php` |
| UC4 | Public raspored | T2.5 | `ScheduleTest.php` |
| UC5 | Prijava ekipe | T2.1a/b/c | `Team/TeamCreateTest.php`, `TeamMemberTest.php`, `TeamSubmitTest.php`, `MedicalCertificate/UploadTest.php`, `Jobs/ValidateMedicalCertificateJobTest.php` |
| UC6 | Korisnici i škole CRUD | T1.1 + admin | `Admin/SchoolCrudTest.php`, `UserCrudTest.php` |
| UC7 | Audit log dashboard | T3.1 | `Admin/AuditLogDashboardTest.php`, `Auth/AuditLogTest.php` |
| UC8 | eDnevnik verifikacija | T2.2 | `Admin/StudentVerificationTest.php`, `Jobs/VerifyStudentWithEDnevnikJobTest.php` |
| UC9 | Notifikacije | T1.3 + per UC | `Notifications/TeamNotificationsTest.php`, `NotificationShareTest.php` |
| UC10 | Rezultati i medalje | T2.3 | `Admin/ResultEntryTest.php`, `Policies/ResultPolicyTest.php` |

**Sveukupno:** 329 Pest testova, 957 assertion-a, prolaze u ~8.4 sekunde.

## 3. Integracija eksternih sistema

### 3.1 OCR (Google Vision)

Implementiran **Adapter pattern** sa interfejsom + Fake + (planiran) Real:

```
app/Adapters/Ocr/
├── FakeOcrAdapter.php       ← file-name konvencija (valid_*.pdf → Valid status)
└── Dto/
    └── OcrResult.php        ← doctor_name, institution, valid_to
```

Pravi servis Google Vision se dodaje kroz `GoogleVisionOcrAdapter` koji implementira isti interfejs. Switch preko feature flag-a `OCR_ADAPTER=fake|vision`. Razlog: pravi Google Vision košta ~$1.50 per 1000 OCR poziva, ne treba za development.

### 3.2 eDnevnik (Ministarstvo prosvjete)

Implementiran **Adapter pattern** sa interfejsom + Fake + (planiran) Real:

```
app/Adapters/EDnevnik/
├── FakeEDnevnikAdapter.php  ← deterministic by JMB (parsira DOB + region kod)
├── Dto/
│   └── EDnevnikStudentDto.php
└── Exceptions/
    ├── EDnevnikNotFoundException.php
    └── EDnevnikUnavailableException.php
```

Pravi servis se dodaje kroz `RealEDnevnikAdapter` koji radi HTTP POST na eDnevnik API. Switch preko `EDNEVNIK_ADAPTER=fake|real`. Razlog: pravi adapter zahtjeva sporazum sa Ministarstvom prosvjete.

**Sequence dijagram UC8** sa sve 3 grane (verified/mismatched/unavailable): [`uml/03-sequence-uc8.puml`](uml/03-sequence-uc8.puml).

### 3.3 Notifikacije (Email + Database)

Laravel **Notifications** sistem podržava više kanala. v1.0 implementacija:

- **Email** preko `log` driver-a u dev-u (zapisuje u `storage/logs/laravel.log`); planirana SES u produkciji
- **Database** kanal čuva notifikacije u `notifications` tabeli, pojavljuju se u UI bell ikoni

Test: `tests/Feature/Notifications/TeamNotificationsTest.php`.

## 4. Instalacija

Detaljno: [`deployment/01-lokalna-instalacija.md`](deployment/01-lokalna-instalacija.md).

**Brza verzija:**

```bash
git clone <repo>
cd sportski-savez-app
composer install && npm install
cp .env.example .env && php artisan key:generate
touch database/database.sqlite
php artisan migrate && php artisan db:seed
composer run dev
# http://localhost:8000 — admin@savez.test / Adm1n!Test
```

## 5. Testiranje

### 5.1 Pest test suite

- **329 testova, 957 assertion-a**
- **Lokacije:** `tests/Feature/` (većina), `tests/Browser/` (smoke + e2e), `tests/Unit/` (par)
- **Pokrenuti:** `php artisan test --compact`
- **Trajanje:** ~8.4 sekundi (sa `RefreshDatabase` trait-om koji koristi transaction rollback)

### 5.2 Coverage prioriteti

Cilj nije bio 100% line coverage, već **behavior coverage** ključnih scenarija:
- Sve glavne happy path-ove za svih 9 UC
- Sve alt path-ove (3 grane u UC8, validation errors u UC5)
- Sve Policy authorization scenarije (positive + negative)
- State izmjene koje moraju da pišu u audit log

### 5.3 Browser smoke

Pest 4 sa Playwright-style API. Pokriva:
- Login + register pages render bez JS error-a
- Admin dashboard sve sub-stranice load-uju
- Public raspored renderuje
- UC5 i UC8 cijeli flow kroz browser (slowest, ~3s po test-u)

Test: `tests/Feature/Integration/SmokePagesTest.php`, `Journey1Uc5Test.php`, `Journey2Uc8Test.php`, `Journey3Uc10Uc3Test.php`.

### 5.4 Security audit

Test: `tests/Feature/Integration/SecurityAuditTest.php`. Pokriva:
- CSRF token check
- Mass assignment kroz Form Request
- Authorization on every admin URL
- Audit log entry on every state change

### 5.5 Performance smoke

Test: `tests/Feature/Integration/PerformanceSmokeTest.php`. Provjerava:
- Admin dashboard load < 500ms (sa 100 timova u DB)
- Audit log paginacija < 200ms (sa 1000 zapisa)

## 6. Demo scenariji

Vidi snimke ekrana u [`demo/`](demo/). Detaljna uputstva za snimanje su u [`demo/README.md`](demo/README.md).

### Scenario 1: UC5 — Prijava ekipe

1. Login kao `profesor1@savez.test`
2. `/teams` → "Nova prijava"
3. Bira sport (npr. Košarka), takmičenje (npr. "Pilot turnir 2026")
4. Dodaje 5 učenika iz svoje škole
5. Za svakog uploaduje PDF ljekarsku potvrdu
6. Čeka 1-2 sekunde da OCR queue job validira (status Pending → Valid)
7. Kucnut svoje puno ime kao potpis → Submit
8. Status ekipe: Submitted; notifikacija profesoru i adminima

Detaljnije: [`demo/uc5-prijava-ekipe.mp4`](demo/uc5-prijava-ekipe.mp4) (snima se ručno).

### Scenario 2: UC8 — eDnevnik verifikacija

1. Login kao `admin@savez.test`
2. `/admin/students` → bira nepotvrđenog učenika
3. "Verifikuj kroz eDnevnik" dugme → dispatchuje VerifyStudentWithEDnevnikJob
4. Refresh stranice nakon ~1 sekunde
5. Status: Verified / Mismatched / Unavailable (zavisno od JMB-a u FakeEDnevnikAdapter)
6. Audit log zapis u `/admin/audit-log`

Detaljnije: [`demo/uc8-ednevnik-verifikacija.mp4`](demo/uc8-ednevnik-verifikacija.mp4) (snima se ručno).

### Scenario 3: UC10 — Rezultati i medalje

1. Login kao admin
2. `/admin/competitions/{id}/results` → unosi place + medal za svaku ekipu
3. Logout, login kao učenik iz nagrađene ekipe
4. `/profile` → vidi medalju + brojač osvojenih medalja

Detaljnije: [`demo/uc10-rezultati-medalje.mp4`](demo/uc10-rezultati-medalje.mp4) (snima se ručno).

## 7. Šta NIJE implementirano

Eksplicitne **out-of-scope** funkcionalnosti iz spec §2 i meta-plan §9:

- **Bulk import učenika** (CSV/Excel) — predloženo u spec-u, van scope-a v1.0
- **Saglasnost roditelja workflow** — boolean polje postoji, full workflow van scope-a
- **AZLP cleanup workflow** — `purge-graduates` command, `/profile/export` endpoint, parental consent workflow — van scope-a
- **Multi-language UI** — samo crnogorski, English van scope-a
- **Mobilna aplikacija** — samo web responsive
- **Plaćanja** — nije planirano
- **Sub-admin role po školi** — single admin role za cijeli Savez
- **Read-only auditor role** — admin vidi sve, nema čistog audit-only role
- **Multi-tenancy škola** — sve škole u jednoj instanci, ne odvojene tenant baze
- **Custom error catalog** — Laravel default error pages + Form Request validation poruke
- **Pravi Google Vision OCR** — Fake adapter iza feature flag-a
- **Pravi eDnevnik HTTP adapter** — Fake adapter iza feature flag-a, planiran kada se zaključi sporazum

## 8. AI doprinos u implementaciji

Sav rad sa Claude Code (Anthropic Opus 4.7, 1M context) je zabilježen u `ai_dnevnik_sesije` tabeli:

- **Ukupno 19 sesija** od 2026-05-12 do 2026-05-13
- **Faze:** Eksperimentisanje (rane sesije), Specifikacija (15, 16, 17), Implementacija (18), Dokumentacija (19)
- **Sve sesije javno dostupne na:** `/ai-dnevnik` (dok aplikacija radi lokalno)
- **Dual-write u seeder:** `database/seeders/AiDnevnikSeeder.php` se regeneriše posle svake izmjene tabele kroz `php artisan ai-dnevnik:sync-seeder`

Detaljna refleksija o AI u SDLC: [`04-vv-i-ai-u-sdlc.md`](04-vv-i-ai-u-sdlc.md).

## Reference

- [Glavni spec §15 (pipeline)](../../specs/001-sportski-savez.md)
- [Meta-plan §10 (demo scenari)](../../specs/000-paralelni-plan.md)
- [V&V + AI u SDLC](04-vv-i-ai-u-sdlc.md)
- [Deployment](deployment/README.md)
- [UML dijagrami](uml/README.md)
- [Demo snimci](demo/README.md)
- [Sljedeće poglavlje: V&V + AI u SDLC](04-vv-i-ai-u-sdlc.md)
