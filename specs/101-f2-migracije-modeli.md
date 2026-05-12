# F2 — Faza 0: Migracije i modeli

**Phase:** 0 (sekvencijalno) · **Track ID:** F2 · **Procijenjeno:** 3 dana
**Spec referenca:** [`specs/001-sportski-savez.md`](001-sportski-savez.md) sekcije 7, 13.3, 17
**Meta-plan:** [`specs/000-paralelni-plan.md`](000-paralelni-plan.md)
**Blokira:** sve Phase 1+ track-ove · **Blokiran-od:** F1

---

## Cilj
**Sve** migracije, **svi** Eloquent modeli, **sve** factory klase iz Domain modela odjednom. Posle ovog naredni track-ovi ne dodaju **nove** entitete (samo dopune kolona ili indexe ako apsolutno treba). **Single agent**.

## Ulazi (preduslovi)
- F1 završen i merge-an
- Spec sekcija 7 (Domain model), 13.3 (Audit log model), 17 (Glossary) — engleska imena

## Izlazi (deliverables)

### Migracije (po redoslijedu)
- [ ] `schools` (već definisana logika)
- [ ] Dopuna `users` tabele: `role` enum, `school_id` nullable FK, `verified_at`, `phone`, soft deletes
- [ ] `professors` profile data (ili kolone na `users`) — STI po spec 7.2
- [ ] `students` (ili profile data na `users` ako STI radi) sa `jmb`, `grade`, `verification_status`, `parental_consent` bool
- [ ] `sports` sa `slug`, `name`, `type` enum (team_sport, individual_sport), `members_count`, `substitutes_count`, soft deletes
- [ ] `competitions` sa `slug`, `name`, `sport_id`, `start_date`, `end_date`, `location`, `status`
- [ ] `teams` sa `school_id`, `competition_id`, `professor_id`, `status` enum (draft, submitted, active, rejected, cancelled, withdrawn, completed), `signature`, `signed_at`, `signature_ip`
- [ ] `team_members` sa `team_id`, `student_id`, `position` (nullable, npr. "kapiten")
- [ ] `medical_certificates` sa `team_member_id`, `original_filename`, `path`, `status` enum (pending, valid, expired, invalid, manual_review, superseded), `issued_at`, `expires_at`, `extracted_name`, `ocr_confidence` decimal
- [ ] `results` polimorfan: `subject_type`/`subject_id` (Team ili TeamMember), `competition_id`, `placement` int, `medal_type` enum (gold, silver, bronze, participation, none)
- [ ] `audit_log` sa `user_id` nullable, `action` string, `subject_type`/`subject_id` polimorfan, `payload` json, `ip`, `user_agent`, `created_at` (NO updated_at, immutable)

### Modeli (Eloquent)
- [ ] `User`, `Professor` *(ako STI)*, `Student`, `Admin`, `School`, `Sport`, `Competition`, `Team`, `TeamMember`, `MedicalCertificate`, `Result`, `AuditLogEntry`
- [ ] Sve relacije po spec 7.3
- [ ] `SportType`, `TeamStatus`, `MedicalCertificateStatus`, `StudentVerificationStatus`, `MedalType` enum klase (`app/Enums/`)
- [ ] Casts (`status` → enum, `signed_at` → datetime, itd.)

### Factory i seed klase
- [ ] Factory za svaki model
- [ ] `CrnogorskiProvider` Faker provider sa CG imenima, prezimenima, mjestima, validnim JMB-om
- [ ] `AdminUserSeeder`, `SchoolSeeder`, `SportSeeder`, `ProfessorSeeder`, `StudentSeeder`, `CompetitionSeeder`, `TeamSeeder`, `ResultSeeder` (sve sa idempotency po spec 15.2)
- [ ] `DatabaseSeeder` poziva alfabetskim redom (jedan po liniji za merge friendliness)

## Shared edit zones
- `database/seeders/DatabaseSeeder.php` — postaviti pattern jedan-poziv-po-liniji
- `composer.json` — ako Faker dependency nije već instaliran

## Acceptance criteria
- `php artisan migrate` (additive) prolazi clean i primjenjuje sve nove migracije iz F2
- `php artisan db:seed` (idempotent, čuva `ai_dnevnik_sesije`) prolazi clean
- `php artisan tinker --execute 'App\Models\Student::count()'` > 0
- `ai_dnevnik_sesije` tabela ostaje netaknuta (Sesija 15+ podaci očuvani)
- **NIKAD `migrate:fresh`** — vidjeti `feedback_database_safety` memoriju
- `php artisan tinker --execute 'App\Models\Team::with(["members.student", "competition.sport"])->first()'` vraća kompletan graf
- Pest unit testovi za sve enum klase (validacija dozvoljenih vrijednosti)
- Pest unit test za factory svake klase (jedna instanca se kreira bez errora)

## NE radi
- Nemoj kreirati Controller-e (to su Phase 1+ track-ovi)
- Nemoj kreirati Policy klase (T1.1 to radi)
- Nemoj kreirati Service klase (Phase 2 track-ovi)
- Nemoj implementirati state machine logiku (samo enum vrijednosti i kolone)
- Nemoj dodavati indexe koje spec ne traži

## TODO (popunjava `/plan`)
- [ ] Tačan migracioni redoslijed sa FK zavisnostima
- [ ] STI vs polimorfna implementacija za User/Professor/Student/Admin — finalna odluka
- [ ] JMB validacija u factory (algoritam ili regex)