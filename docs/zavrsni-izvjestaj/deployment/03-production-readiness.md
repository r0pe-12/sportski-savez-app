# Production readiness checklist (v1.0)

> **Pokriva profesorov zahtjev 3b:** prijedlog kako bi se sistem pustio u rad (produkcija).

Cilj: prelaz iz staging-a u punu produkciju za sve škole u CG. **Ne radi se u Phase 4** (van scope-a ADIS predaje); ovaj dokument je **prijedlog** za naručioca (Sportski savez CG, Ministarstvo prosvjete).

## Razlike staging vs production

| Tema | Staging | Production |
|---|---|---|
| Host | Laravel Cloud Hobby | Laravel Cloud Production tier (autoscaling on) |
| App tier | 1 instance | 2+ instances (min 2 za HA) iza load balancer-a |
| DB | PostgreSQL 1 GB | PostgreSQL 10+ GB + read replika |
| Cache/Queue | Redis 256 MB | Redis 1 GB+ + dedicated worker tier |
| Storage | S3 versioning on | S3 versioning + lifecycle 30 dana + cross-region replication |
| Email | SES sandbox | SES production + verified domain |
| OCR | `FakeOcrAdapter` | Google Vision API (production, rate limited 100 req/min) |
| eDnevnik | `FakeEDnevnikAdapter` | Pravi HTTP adapter, feature flag on |
| Monitoring | Pulse | Pulse + Sentry + CloudWatch + uptime monitoring (UptimeRobot ili Better Stack) |
| Backup | Daily auto | Daily auto + weekly off-site (S3 cross-region) + monthly restore vježba |
| Pilot | 1 škola, 1 takmičenje | 2-3 škole, postepeni rollout, 3-mjesečni pilot |
| SSL | Let's Encrypt auto (Laravel Cloud) | Same, sa HSTS preload + custom domain |
| DDoS | Basic (Cloudflare proxy) | Advanced (Cloudflare Pro + rate limiting per-IP) |

## Pre-production checklist

### Pravni i administrativni

- [ ] **Sporazum sa Ministarstvom prosvjete za eDnevnik integraciju** — pisani sporazum o pristupu eDnevnik HTTP API-ju, scope (samo `getStudent(jmb)`), SLA i fallback ako API padne. Bez ovog, `EDNEVNIK_ADAPTER=fake` mora ostati i u produkciji.
- [ ] **AZLP saglasnost framework** — usaglašena ToS + Privacy Policy + Data Processing Agreement sa AZLP (Agencija za zaštitu ličnih podataka CG).
- [ ] **Pravna validnost digitalnih potvrda** — sa Ministarstvom zdravlja: prihvatamo li skenirane ili samo elektronski potpisane PDF-ove? Trenutno: skenirane (OCR validacija kroz Google Vision).
- [ ] **Saglasnost roditelja workflow** — ako se uvodi (van Phase 4 scope-a, meta-plan §9 NE-radi lista), pravna analiza forme saglasnosti, retencija dokumenata.
- [ ] **Ugovor sa Sportskim savezom** — ko je data controller, ko data processor, ko snosi troškove hosting-a, SLA prema školama.
- [ ] **Brand i imenovanje** — domen (`skolski-sport-cg.me` ili `savez.gov.me` ili custom), logo, branding guideline.

### Tehnička pripravnost

- [ ] **Penetration test** — eksterni security audit, fokus na OWASP Top 10 (injection, broken auth, sensitive data exposure, XXE, broken access control, security misconfiguration, XSS, insecure deserialization, vulnerable components, insufficient logging). Otkriveni nalazi popravljeni i retest pozitivan.
- [ ] **WCAG AA audit** — accessibility pregled svih stranica. Min: kontrast 4.5:1, keyboard navigacija, screen reader labels (aria-label), focus indicators.
- [ ] **Load test** — k6 ili Apache Bench simulacija za peak load (300 ekipa po takmičenju, 100 paralelnih upload-a). Cilj: p95 response time < 500ms na 10x očekivanog peak-a.
- [ ] **DR plan** — Disaster Recovery dokument: RPO 24h (data loss tolerance), RTO 4h (downtime tolerance). Restore procedura testirana barem 1 put prije produkcije.
- [ ] **Backup restore vježba** — weekly task: restore production backup na staging, validate integrity, log u `backup-restore-log.md`. Failure-friendly: ako vježba padne, postavlja alarm.
- [ ] **Smoke test posle deploy-a** — 5 ključnih URL-ova mora vratiti 200 OK posle svakog deploy-a:
  - `/` (home, public)
  - `/login` (public)
  - `/dashboard` (kao admin, autentifikovani)
  - `/teams` (kao profesor, autentifikovani)
  - `/ai-dnevnik` (public)
- [ ] **Monitoring alarmi** — postavljen Sentry alert za error rate > 1%, CloudWatch alarm za DB CPU > 80%, uptime monitor za 5xx response > 5%.
- [ ] **CSP header** — Content Security Policy konfigurisan da odbije inline scriptove osim tačno definisane Inertia/Vite hash-eve.
- [ ] **CSRF middleware** — verifikovan na svim POST/PUT/DELETE rutama (default Laravel, ali audit).
- [ ] **Rate limiting** — `/login` route ograničen na 5 pokušaja/min/IP, `/register` ograničen na 3/h/IP.
- [ ] **OCR cost cap** — Google Vision pre-paid budget alarm + circuit breaker u `OcrAdapter` koji isključuje requests kad mjesečni budget istekne.

### Operativna pripravnost

- [ ] **Runbook za incidente** — `docs/operations/runbook.md` (van scope-a Phase 4): šta uraditi kad DB padne, kad queue zaglavi, kad OCR rate-limit pogodi, kad eDnevnik API padne. Step-by-step playbook za svaki scenario.
- [ ] **On-call rotacija** — 2+ admina obučena za debugging produkcije, kontakt brojevi u PagerDuty ili Better Stack.
- [ ] **Korisnička podrška** — email alias `support@savez.me`, response SLA 24h tokom radnih dana, Slack ili Discord kanal za real-time komunikaciju sa pilot školama.
- [ ] **Dokumentacija za korisnike** — video tutorijali (3-5 min po UC-u) ili PDF priručnik za 5 ključnih UC-ova (UC1 registracija, UC3 učenički profil, UC5 prijava ekipe, UC8 eDnevnik verifikacija, UC10 rezultati). Snimci iz T4.3 demo videa mogu biti baza.
- [ ] **Admin onboarding** — webinar (60 min) za sve admin korisnike kroz Ministarstvo prosvjete. Pokriva: kreiranje škole, kreiranje profesora, kreiranje sporta + takmičenja, dodjeljivanje medalja.
- [ ] **Status page** — public `status.skolski-sport-cg.me` (Better Stack ili Cronitor) sa real-time uptime i historija incidenata.

### Compliance

- [ ] **GDPR / AZLP saglasnosti** — checkbox u registraciji + privacy policy link + data export endpoint (`/profile/export` — van Phase 4 scope-a, planirano za narednu iteraciju per meta-plan §9).
- [ ] **Data retention policy** — definisana retencija:
  - `audit_log_entries`: 5 godina po AZLP minimum
  - `medical_certificates`: 7 godina po AZLP (zdravstveni podaci)
  - Inactive accounts (no login 3 godine): anonimizovati ili obrisati
  - `ai_dnevnik_sesije`: indefinitely (akademski artifact)
- [ ] **Encryption at rest** — PostgreSQL TDE on (Laravel Cloud default), S3 SSE-S3 on, Redis AUTH on.
- [ ] **Encryption in transit** — HTTPS only, HSTS header sa `max-age=31536000; includeSubDomains; preload`, TLS 1.2 minimum (1.3 preporučeno).
- [ ] **Personal data minimization** — JMB je sensitive (lična karta CG); čuva se hash-iran u `audit_log_entries` (ne plaintext), plaintext samo u `students` tabeli iza role-based access.
- [ ] **Right to erasure (član 17 GDPR)** — endpoint `/profile/delete` koji anonimizuje korisnika (zadržava audit log sa hashed user_id, briše PII).
- [ ] **Audit log immutability** — append-only constraint na `audit_log_entries` na DB nivou (PostgreSQL trigger koji odbija UPDATE i DELETE osim za superuser-a).

## Rollout strategija

### Faza 1: 2-3 pilot škole (mjesec 1)

- Najveće 3 škole iz Podgorice (najveći volume, najlakši feedback loop)
- Daily standup sa pilot admin-ima prvih 2 nedjelje
- Sve UAT bug-ovi su P0/P1 prije širenja
- Cilj: 0 P0 bugova, max 5 P1 bugova na kraju mjeseca

### Faza 2: Region Podgorice + Nikšić (mjesec 2)

- Dodaj 5-10 škola
- Monitoring metrike: response time p95 < 500ms, error rate < 0.5%
- Korisnička podrška response SLA poštovan (24h)
- Cilj: 50+ ekipa registrovanih, 200+ učenika

### Faza 3: Cijela CG (mjesec 3+)

- Otključati registraciju za sve škole CG
- Marketing kroz Ministarstvo prosvjete (school admin onboarding webinar)
- Postavljen feature feedback kanal (Linear ili GitHub Issues javno)
- Cilj: pokrivanje svih osnovnih + srednjih škola CG do kraja školske godine

## Sunset / migration plan

Ako se sistem **menja** (rewrite, kupovina drugog vendor-a) ili **gasi**:

1. **Notify korisnike 90 dana unaprijed** — email + in-app banner + obavijest kroz Ministarstvo prosvjete
2. **Export svih podataka** za škole — JSON arhiva sa svim njihovim učenicima, ekipama, rezultatima, dokumentima. Schema dokumentovana, format stabilan.
3. **Sunset audit log** — finalni eksport `audit_log_entries` tabele, čuvati 5 godina po AZLP nakon shutdown-a (cold storage S3 Glacier).
4. **AI dnevnik** (`ai_dnevnik_sesije`) — academic artifact, čuvati indefinitely (predaja za ADIS predmet je permanentni dokument, ne smije se gubiti).
5. **DNS sunset** — domen ostaje 1 godinu sa redirect-om na novi sistem (ili na "service decommissioned" stranicu) za SEO i bookmark continuity.

## Reference

- Spec (`specs/001-sportski-savez.md`) §10.3 — eksterni servisi (OCR, eDnevnik, email, storage)
- Spec §11 — deployment opis (Laravel Cloud target, autoscaling, observability)
- Spec §15 — sigurnosna pravila i AZLP referenca
- Meta-plan (`specs/000-paralelni-plan.md`) §9 — NE-radi liste (saglasnost roditelja, multi-tenancy, mobile, AZLP cleanup workflow)
- `docs/zavrsni-izvjestaj/04-vv-i-ai-u-sdlc.md` sekcija 5 — AI u deployment-u rizici
- `02-staging-rollout.md` — staging je preduvjet za produkciju
- CLAUDE.md sekcija 2.1 — Database safety pravila (zabranjen `migrate:fresh`)
