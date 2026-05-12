# Sistem školskog sporta Crne Gore — Specifikacija

**Predmet:** Analiza i dizajn informacionih sistema (ADIS) · Univerzitet Donja Gorica
**Status:** Draft v1.0 (2026-05-12)
**Konsolidovani izvori:**
- `docs/fajlovi/SVD_v2.1.md` — Vizija sistema
- `docs/fajlovi/Projektna_analitika_v3.1.md` — Use Case-ovi i domain model
- `docs/fajlovi/Projektni_dizajn_v1.2.md` — Arhitektura, UI, API, pipeline

Ovaj dokument je **single source of truth** za implementaciju. Planovi (`/plan`) i taskovi (`/task`) referencu uzimaju ovdje. Kad se spec promijeni — bumpaj verziju i upiši izmjenu u "Changelog" na kraju.

---

## 1. Pregled

### 1.1 Problem
Sportski savez Crne Gore organizuje školska sportska takmičenja, ali se cjelokupan proces prijave i evidencije odvija na papiru. Posljedice:

- Spor i nepouzdan ručni proces — gubici dokumenata, sporo provjeravanje potvrda
- Nepostojanje centralne evidencije učesnika, rezultata i istorije takmičenja
- Nedostatak tragova obrade osjetljivih podataka maloljetnika (AZLP rizik)

### 1.2 Rješenje
Centralizovan web informacioni sistem sa tri uloge i jednim eksternim sistemom:

- **Profesor** — prijavljuje ekipu uz upload ljekarskih potvrda
- **Učenik** — pristupa svom profilu i istoriji takmičenja
- **Administrator (Savez)** — upravlja sistemom, rasporedom i unosi rezultate
- **eDnevnik (eksterni)** — verifikacija statusa učenika

Sistem automatski OCR-uje ljekarske potvrde, vodi centralnu evidenciju i raspored takmičenja, šalje notifikacije i bilježi sve akcije u nepromjenljiv audit log radi AZLP usklađenosti.

### 1.3 Sistemske sposobnosti
| Sposobnost | Opis |
|---|---|
| Digitalna prijava ekipa | Profesor formira ekipu, dodaje učenike i uploaduje ljekarske potvrde. |
| OCR validacija potvrda | Sistem ekstrahuje datume i ime sa potvrde, signalizira istekle ili nevalidne. |
| Profili učenika | Lični podaci, fotografija, istorija takmičenja, rezultata i osvojenih medalja. |
| Katalog sportova i raspored | Centralna evidencija sportova (timski / individualni) i kalendar takmičenja. |
| Unos rezultata | Administrator unosi plasmane i medalje; sistem ažurira profile učenika. |
| Notifikacije i audit log | Email + in-app obavještenja; nepromjenljiv zapis svih akcija (AZLP). |
| eDnevnik integracija | Verifikacija statusa učenika kroz državni sistem. |

---

## 2. Obim sistema

| U obimu | Van obima |
|---|---|
| Web aplikacija sa tri uloge | Mobilna aplikacija |
| Digitalna prijava ekipa + OCR potvrda | Plaćanja kotizacija |
| Profili učenika sa istorijom | Live streaming takmičenja |
| Raspored takmičenja i katalog sportova | Pravna validacija medicinskog sadržaja potvrda |
| Notifikacije i audit log | Sportski rezultati van škole (klubovi, selekcije) |
| Integracija sa eDnevnikom (mock prvo) | Bulk import učenika |
| AZLP usklađenost | Vanjski API za treća lica |

---

## 3. Stakeholderi i interesi

| Stakeholder | Interes |
|---|---|
| Sportski savez CG | Centralno upravljanje takmičenjima i evidencija školskog sporta. |
| Profesor | Brza i pouzdana prijava ekipa bez papirne administracije. |
| Učenik (i roditelj) | Tačan profil i transparentan uvid u obradu ličnih podataka. |
| AZLP (regulator) | Usklađenost sa Zakonom o zaštiti podataka maloljetnika. |

---

## 4. Ograničenja i pretpostavke

**Pravna i regulatorna:**
- Zakon o zaštiti podataka CG — poseban režim za maloljetnike (AZLP).
- Pravna validnost digitalnih ljekarskih potvrda zahtijeva usaglašavanje sa Ministarstvom zdravlja.
- Integracija sa eDnevnikom uslovljena sporazumom sa Ministarstvom prosvjete.

**Tehničke pretpostavke za prvu iteraciju:**
- Korisnici imaju savremen browser sa JavaScript-om uključenim (Inertia + React).
- Profesori često koriste mobilni — UI mora biti mobile-first.
- Konekcija može biti slaba — autosave forme za prijavu ekipe i retry za upload-e.

---

## 5. Funkcionalni zahtjevi

### 5.1 Aktori
- **Profesor** (primarni) — registracija ekipa, upravljanje sopstvenim profilom.
- **Učenik** (primarni) — read-only pregled svog profila i istorije.
- **Administrator** (primarni) — globalno upravljanje sistemom.
- **eDnevnik** (eksterni sistem) — izvor verifikacije statusa učenika.
- **Sistem (interni)** — nosilac automatskih akcija (OCR, audit, notifikacije).

### 5.2 Use Case katalog
| ID | Naziv | Aktor | Opis |
|---|---|---|---|
| UC1 | Registracija | Profesor / Učenik | Korisnik kreira nalog uz osnovne lične podatke i podatke o školi. |
| UC2 | Prijava na sistem | Svi | Autentifikacija sa kredencijalima; sistem bilježi audit zapis. |
| UC3 | Pregled profila i istorije | Profesor / Učenik | Pregled ličnih podataka, vođenih timova, takmičenja, rezultata i medalja. |
| UC4 | Pregled rasporeda | Profesor / Učenik | Read-only pristup centralnom kalendaru takmičenja. |
| UC5 | **Prijava ekipe na takmičenje** | Profesor | **Centralni UC.** Profesor formira ekipu, dodaje učenike, uploaduje ljekarske potvrde i potpisuje prijavu. |
| UC6 | OCR validacija potvrde | Sistem (interni) | Automatska ekstrakcija i provjera datuma i imena na ljekarskoj potvrdi. `<<include>>` u UC5. |
| UC7 | Upravljanje korisnicima i školama | Administrator | CRUD nad nalozima i školama; verifikacija kroz eDnevnik. |
| UC8 | Verifikacija učenika (eDnevnik) | Administrator | Provjera redovnosti i statusa učenika kroz državni sistem. `<<include>>` u UC7. |
| UC9 | Upravljanje sportovima i rasporedom | Administrator | Katalog sportova (timski / individualni) i kalendar takmičenja. |
| UC10 | Unos rezultata | Administrator | Plasmani i medalje po završetku takmičenja; razlikuje timske od individualnih sportova. |

### 5.3 Detaljni UC5 — Prijava ekipe na takmičenje

| | |
|---|---|
| **ID i naziv** | UC5 — Prijaviti ekipu na takmičenje |
| **Primarni aktor** | Profesor |
| **Preduslovi** | Profesor je prijavljen i verifikovan; učenici registrovani; sport i takmičenje postoje u sistemu. |
| **Postuslovi** | Ekipa registrovana; potvrde pohranjene i validirane; notifikacija poslata. |
| **Trigger** | Profesor pristupa formi za prijavu ekipe. |

**Glavni tok:**
1. Profesor pristupa formi za prijavu ekipe.
2. Sistem prikazuje katalog sportova; profesor bira sport.
3. Sistem prikazuje pravila sporta (tip, broj članova).
4. Profesor dodaje učenika i uploaduje ljekarsku potvrdu.
5. Sistem (UC6) OCR-uje potvrdu i validira datume i ime.
6. Koraci 4–5 se ponavljaju za svakog člana ekipe.
7. Profesor potpisuje prijavu unosom punog imena.
8. Sistem registruje ekipu i šalje notifikaciju.

**Alternativni tokovi:**
| Tačka | Alternativa |
|---|---|
| 5a | Potvrda istekla ili nevalidna — sistem signalizira; profesor uploaduje novu validnu potvrdu. |
| 5b | OCR ne uspijeva (loš sken) — sistem traži novi upload kvalitetnijeg dokumenta. |
| 7a | Potpis ne odgovara registrovanom imenu — sistem odbija i traži ponovni unos. |

**Sistemske operacije izvedene iz SSD-a:**
- `pristupiPrijaviEkipe()`
- `izaberiSport(sportId)`
- `dodajClana(ucenikId, ljekarskaPotvrda)`
- `potpisiPrijavu(punoIme)`

### 5.4 Detaljni UC8 — Verifikacija učenika (eDnevnik)
- Admin pokreće verifikaciju iz UC7 (`<<include>>`).
- `EDnevnikVerificationService` dohvata lokalne podatke, poziva `EDnevnikAdapter`, poredi, ažurira status.
- Pri **podudaranju** — učenik se markira `verified`.
- Pri **nepodudaranju** — učenik ostaje `unverified` sa listom razlika; admin manuelno odlučuje. Nema brisanja.
- Svaki pristup eDnevniku se loguje u audit log (AZLP zahtjev za pristup obrazovnim podacima maloljetnika).

---

## 6. CRUD matrica
*C = Create, R = Read, U = Update, D = Delete*

| UC | Korisnik | Škola | Sport | Takmičenje | Ekipa | ČlanEkipe | LjekarskaPotvrda | Rezultat |
|---|---|---|---|---|---|---|---|---|
| UC1 Registracija | C | R | | | | | | |
| UC2 Prijava na sistem | R | | | | | | | |
| UC3 Pregled profila | R | R | R | R | R | R | | R |
| UC4 Pregled rasporeda | | R | R | R | R | | | |
| UC5 Prijava ekipe | R | R | R | R | C | C | C | |
| UC6 OCR validacija | | | | | | | RU | |
| UC7 Upravljanje korisnicima | CRUD | CRUD | | | | | | |
| UC8 Verifikacija eDnevnik | RU | R | | | | | | |
| UC9 Sportovi i raspored | | | CRU | CRUD | | | | |
| UC10 Unos rezultata | | | | R | R | R | | CRU |

**Zapažanja:**
- UC7 ima CRUD nad dva entiteta — najsrazmjerniji uticaj.
- UC9 — Sport nema `D` operaciju (deaktivacija umjesto brisanja, čuva integritet istorije).
- UC5 je read-heavy + create — ne mijenja postojeće entitete.

---

## 7. Domain model

### 7.1 Entiteti

| Entitet | Opis |
|---|---|
| **Korisnik** (apstraktan) | Generalizacija — nadklasa za Profesora, Učenika i Administratora. Drži zajedničke atribute (id, ime, prezime, email, password, role, audit polja). |
| **Profesor** | Korisnik koji prijavljuje ekipe. Pripada školi. |
| **Učenik** | Korisnik sa profilom, fotografijom i istorijom. Pripada školi. Ima `verified` status iz eDnevnika. |
| **Administrator** | Korisnik bez vezivanja za školu; ima globalna prava. |
| **Škola** | Obrazovna ustanova. Sadrži profesore i učenike. |
| **Sport** | Definicija sporta (naziv, tip: TIMSKI / INDIVIDUALNI, pravila — broj članova). Tip je immutable. |
| **Takmičenje** | Konkretan događaj — sport, datum, lokacija. Vezuje se za Sport. |
| **Ekipa** | Prijava na takmičenje. Vezuje se za Profesora, Takmičenje, Sport. Sadrži članove. |
| **ČlanEkipe** | Zasebna klasa između Učenika i Ekipe — ima sopstvenu ljekarsku potvrdu po prijavi. |
| **LjekarskaPotvrda** | Fajl + metapodaci (datum izdavanja, datum isteka, ime sa potvrde, OCR status). Vezuje se za ČlanEkipe. |
| **Rezultat** | Plasman/medalja. Vezuje se za Ekipu (timski) **ili** za ČlanEkipe (individualni), nikad oba. |
| **TipSporta** (enum) | `TIMSKI`, `INDIVIDUALNI`. |

### 7.2 Ključne odluke u modelovanju
- **Korisnik kao apstraktna klasa** — generalizacija u Profesora, Učenika i Administratora. Implementacija: jedna tabela `users` + `role` enum (Single Table Inheritance) ili `userable` polimorfna relacija. **Odluka:** STI sa `role` enum + atributi specifični za rolu nullable. Tako da Fortify radi jednoobrazno.
- **ČlanEkipe je zasebna klasa** — ima sopstvenu ljekarsku potvrdu po prijavi (ne globalnu potvrdu na učeniku).
- **Rezultat polimorfan** — vezan za Ekipu **ili** ČlanEkipe (`subject_type` + `subject_id`).
- **Sport ima immutable tip** — ne mijenja se nakon kreiranja zbog očuvanja istorijskih podataka.
- **Soft delete za Sport** — deaktivacija umjesto brisanja.

### 7.3 Ključne relacije
- `Skola 1—N Korisnik` (Profesor, Učenik)
- `Profesor 1—N Ekipa`
- `Sport 1—N Takmicenje`
- `Sport 1—1 Takmicenje` *(jedan sport po takmičenju)*
- `Takmicenje 1—N Ekipa`
- `Ekipa N—M Ucenik` kroz `ClanEkipe`
- `ClanEkipe 1—1 LjekarskaPotvrda`
- `Rezultat morphs to (Ekipa | ClanEkipe)`

### 7.4 State dijagrami (stanja i prelazi)

Tri entiteta imaju netrivijalan lifecycle. Stanja se čuvaju u eksplicitnoj `status` koloni (string enum) na entitetu, ne kao bool flagovi.

#### 7.4.1 Team (Ekipa) — registracija lifecycle

| Stanje | Opis | Dozvoljeni prelazi → |
|---|---|---|
| `draft` | Profesor počeo prijavu, ekipa nije potpisana | `submitted`, `cancelled` |
| `submitted` | Potpisana, čeka da admin uplati / odobri | `active`, `rejected`, `cancelled` |
| `active` | Odobrena za učešće na takmičenju | `completed`, `withdrawn` |
| `rejected` | Admin odbio (npr. nevalidna škola, prekasno) | *(terminalno)* |
| `cancelled` | Profesor povukao prije submit-a ili admin prije active | *(terminalno)* |
| `withdrawn` | Ekipa se povukla sa aktivnog takmičenja | *(terminalno)* |
| `completed` | Takmičenje završeno, rezultati uneseni | *(terminalno)* |

**Pravila:**
- Iz `draft` → `submitted` zahtijeva: svi članovi ekipe imaju `medical_certificate.status = valid`, potpis profesora odgovara registrovanom imenu.
- Iz `submitted` → `active` može samo Admin.
- `active` → `completed` automatski kad admin unese rezultate (UC10).

#### 7.4.2 MedicalCertificate (LjekarskaPotvrda) — OCR validacija

| Stanje | Opis | Dozvoljeni prelazi → |
|---|---|---|
| `pending` | Tek uploadovana, queue job postavlja se za OCR | `valid`, `expired`, `invalid`, `manual_review` |
| `valid` | OCR uspio, datum izdavanja u redu, ime se poklapa | `expired` *(po datumu)*, `superseded` |
| `expired` | Datum isteka prošao | `superseded` |
| `invalid` | OCR uspio ali ime ili datumi ne odgovaraju | `superseded` |
| `manual_review` | OCR neuspješan (loš sken), čeka admin pregled | `valid`, `invalid`, `superseded` |
| `superseded` | Profesor uploadovao novu potvrdu koja zamjenjuje ovu | *(terminalno)* |

**Pravila:**
- `pending` → `valid/expired/invalid` postavlja `OcrValidationJob` (background queue).
- `pending` → `manual_review` ako adapter vrati grešku ili confidence ispod praga.
- Cron job `medical-certificates:expire` jednom dnevno markira `valid` potvrde kao `expired` kad datum prođe.

#### 7.4.3 Student (Učenik) — eDnevnik verifikacija

| Stanje | Opis | Dozvoljeni prelazi → |
|---|---|---|
| `unverified` | Tek registrovan, eDnevnik provjera nije pokrenuta | `pending`, `verified`, `mismatched` |
| `pending` | Admin pokrenuo verifikaciju, čeka eDnevnik odgovor | `verified`, `mismatched`, `failed` |
| `verified` | eDnevnik potvrdio podatke (svi se poklapaju) | `unverified` *(reset)*, `pending` *(re-check)* |
| `mismatched` | eDnevnik vratio podatke koji se ne poklapaju | `verified` *(admin manuelno potvrdi)*, `unverified` *(reset)* |
| `failed` | eDnevnik nedostupan / učenik ne postoji u eDnevniku | `pending` *(retry)*, `unverified` |

**Pravila:**
- Učenik može učestvovati u ekipi u stanjima `verified`, `unverified`, `mismatched` (UI upozorava ali ne blokira). U stanju `pending` ili `failed` — može, ali sa flag-om "verifikacija u toku".
- Audit log obavezan za svaki prelaz u `verified` ili `mismatched`.

---

## 8. Nefunkcionalni zahtjevi (NFR)

| Kategorija | Zahtjev |
|---|---|
| **Sigurnost** | Sve rute iza autentifikacije osim `/login`, `/register`, `/forgot-password`. Role-based authorization preko Laravel Policy-ja. CSRF + XSS zaštita (Inertia default). |
| **AZLP** | Svaki pristup podacima maloljetnika logovan u audit log (immutable, write-only). Brisanje po isteku školovanja. Anonimizacija rezultata. Eksplicitna saglasnost roditelja prije obrade. |
| **Performanse** | P95 latencija HTML odgovora < 500ms za read rute. Cache (Redis ili `cache:` tabela) za katalog sportova i raspored. |
| **Skalabilnost** | Background queue (jobs tabela / Redis) za OCR i email notifikacije. |
| **Pristupačnost** | WCAG AA kontrasti, navigacija tastaturom, semantički HTML. shadcn/ui je default — već usklađen. |
| **Mobile-first** | Tailwind responsive utility klase; ključni tokovi (UC5) testirani na 360px širine. |
| **Otpornost** | Autosave forme za UC5; retry sa exponential backoff za eksterne pozive. |
| **Observability** | Strukturalno logovanje (Laravel Log + Pail u dev); CloudWatch u produkciji. |
| **i18n** | Crnogorski (latinica) kao default. Stringovi u `lang/me/` da bi se kasnije mogao dodati ćirilični/engleski variant. |

---

## 9. Arhitektura sistema

### 9.1 Slojeviti pristup (Laravel monolit + Inertia)
```
┌─ HTTP sloj         (Controller-i, Form Request, Resource, Middleware)
├─ Application sloj  (Service klase — TeamRegistrationService, ...)
├─ Domain sloj       (Eloquent modeli, enumi, value objekti, Policy)
└─ Infrastructure    (Repository, Adapter — EDnevnik, GoogleVision, SES)
```

### 9.2 Layering pravila
- **Http → Application** — Controller-i pozivaju Service-e, ne direktno modele ili repository-je.
- **Application → Domain + Infrastructure** — Service-i koriste modele i repository-je/adaptere.
- **Domain** — nezavisan: modeli i value objekti ne smiju zavisiti od Service-a, Repository-ja ili Controller-a.
- **Infrastructure → Domain** — Repository-ji i Adapter-i koriste modele kao return type, ali nemaju biznis logiku.
- **Frontend (resources/js)** — komunicira sa Controller-ima kroz Inertia rute, bez direktnog pristupa Service-ima.

### 9.3 Ključne arhitektonske odluke
- **Monolit umjesto microservisa** — broj korisnika nije velik, kompleksnost deployment-a microservisa nije opravdana.
- **Inertia.js most** — frontend nije zaseban projekat; React komponente serviraju se direktno iz Laravel rute. Wayfinder daje tipizirane funkcije za rute.
- **Adapter pattern za eksterne sisteme** — eDnevnik, Google Vision i SES iza adapter klasa → lako mock-ovanje u testovima.
- **Repository pattern (opciono)** — apstrahuje Eloquent ORM iza interface-a. **Za prvu iteraciju:** koristimo Eloquent direktno iz Service-a; Repository uvodimo tek ako test bol postane stvarna.

### 9.4 Background jobs / Queue strategija

**Driver:** `database` u dev-u (Laravel default, vidljivo u `jobs` tabeli), `redis` u produkciji.

**Pravilo:** sinhrono ostaje samo ono što korisnik mora vidjeti odmah u istom HTTP odgovoru. Sve eksterne pozive i tešku obradu bacamo u queue.

| Job | Queue | Trigger | Sinhrono ili async | Retry | Razlog |
|---|---|---|---|---|---|
| `ValidateMedicalCertificateJob` | `ocr` | Upload potvrde u UC5 | async (queue) | 3× exp backoff | OCR poziv traje 2–10s, ne smije blokirati HTTP odgovor. |
| `VerifyStudentWithEDnevnikJob` | `ednevnik` | Admin akcija u UC8 | async (queue) | 3× exp backoff | eDnevnik može biti spor (10s) ili nedostupan. |
| `SendTeamSubmittedNotification` | `notifications` | Team transition `draft → submitted` | async | 3× exp backoff | Email slanje, ne treba čekati. |
| `SendCompetitionScheduleNotification` | `notifications` | Admin promijeni raspored | async | 3× exp backoff | Bulk slanje. |
| `ExpireMedicalCertificatesJob` | `default` | Cron daily 02:00 | scheduled | n/a | Periodičan posao, ne user-triggered. |
| `AzlpPurgeGraduatesJob` | `default` | Cron monthly | scheduled | n/a | AZLP brisanje, niskog prioriteta. |
| `AuditLogWrite` | n/a | Svaka write akcija | sinhrono (eager dispatch) | n/a | Audit MORA biti zapisan prije commit-a transakcije. |

**Worker setup (produkcija):**
- 1× worker za `ocr` queue (njeguje rate limit ka Google Vision API-ju)
- 1× worker za `ednevnik` queue (rate limit ka državnom sistemu)
- 2× worker za `notifications` i `default`

**Failed jobs:** vidljive u `failed_jobs` tabeli, admin UI za retry/delete u kasnijoj fazi.

### 9.5 Notification matrica

Event → kanal → primalac → template → blokira li transakciju.

| Event | Email | In-app | Primalac | Template | Sinhrono? |
|---|---|---|---|---|---|
| Team submitted (UC5 zadnji korak) | ✓ | ✓ | Profesor + Admin tima | `team-submitted` | ne (queue) |
| Team approved (admin → `active`) | ✓ | ✓ | Profesor | `team-approved` | ne |
| Team rejected | ✓ | ✓ | Profesor | `team-rejected` (sa razlogom) | ne |
| Medical certificate validated | — | ✓ | Profesor (kreator ekipe) | `cert-validated` | ne |
| Medical certificate invalid | ✓ | ✓ | Profesor | `cert-invalid` (sa razlogom) | ne |
| Medical certificate manual review | ✓ | ✓ | Admin | `cert-manual-review` | ne |
| Student verified via eDnevnik | — | ✓ | Admin | `student-verified` | ne |
| Student mismatched | ✓ | ✓ | Admin | `student-mismatched` | ne |
| Competition schedule changed | ✓ | ✓ | Svi profesori sa ekipama na tom takmičenju | `competition-schedule-changed` | ne (queue, bulk) |
| Result entered | — | ✓ | Profesor + članovi ekipe | `result-entered` | ne |
| Password reset request | ✓ | — | Korisnik | Fortify default | ne |
| Email verification | ✓ | — | Korisnik | Fortify default | ne |
| 2FA recovery codes generated | — | ✓ | Korisnik | Fortify default | sinhrono (security) |

**Implementacioni paterni:**
- Sve notifikacije su `Illuminate\Notifications\Notification` klase u `app/Notifications/`.
- Email kroz `mail` channel (SES u prod, `log` u dev).
- In-app kroz `database` channel (`notifications` tabela), prikazani u UI navbar bell ikoni.
- Bulk slanje (npr. promjena rasporeda) ide kroz `Notification::send($users, new ...)` koji automatski queue-uje.
- Korisnik može preference (opciono kasnije) — za sad sve enabled by default.

---

## 10. Tehnološki stack

### 10.1 Stack za prvu iteraciju (instaliran u repo-u)

| Tehnologija | Verzija | Uloga |
|---|---|---|
| Laravel | 13.x | Backend framework — rute, controller-i, ORM, validacija, cache, queue. |
| PHP | 8.3+ | Runtime za Laravel. |
| **Fortify** | 1.x | **Autentifikacija (web, Inertia sesije). Zamjena za Sanctum iz dizajna.** |
| Inertia.js (Laravel) | 3.x | Adapter Laravel ↔ React. |
| @inertiajs/react | 3.x | Inertia React client (Link, Form, useForm, useHttp). |
| Wayfinder | 0.x | Auto-generisane TypeScript funkcije za Laravel rute. |
| React | 19.x | Frontend komponente. |
| Tailwind CSS | 4.x | Utility-first CSS. |
| shadcn/ui | — | UI primitivi (forme, modali, tabele). |
| Pest | 4.x | Testovi (Feature, Unit, Browser). |
| Pail | 1.x | Real-time log tail u dev-u. |
| Boost | 2.x | MCP server za Laravel kontekst (search-docs, schema, query). |

### 10.2 Razlike u odnosu na Projektni dizajn v1.2
| Tema | Dizajn v1.2 | Odluka za implementaciju |
|---|---|---|
| Auth | Laravel Sanctum | **Fortify + Inertia sesije** — već instalirano; bolji fit za Inertia SPA bez API tokena. Sanctum se može dodati kasnije ako bude API klijent. |
| Baza (dev) | PostgreSQL 16 | **SQLite za dev** (jednostavnije pokretanje), PostgreSQL/MySQL kao opcija za produkciju. Schema se piše agnostično. |
| Cache/queue (dev) | Redis 7 | **`database` driver za cache/queue u dev-u** (Laravel default). Redis u produkciji. |
| Frontend stack | React 18 | **React 19** — već instalirano. |
| CSS | Tailwind 3 | **Tailwind 4** — već instalirano. |

### 10.3 Eksterni servisi (mock prvo)
| Servis | Svrha | Stanje za prvu iteraciju |
|---|---|---|
| **eDnevnik API** | Verifikacija statusa učenika (UC8) | `EDnevnikAdapter` interface + `FakeEDnevnikAdapter` koji vraća deterministički odgovor iz seed-ovanih JMB-ova. Pravi HTTP adapter iza feature flag-a kad sporazum sa Ministarstvom prosvjete bude potpisan. |
| **Google Cloud Vision API** | OCR ljekarskih potvrda (UC6) | `OcrAdapter` interface + `FakeOcrAdapter` koji vraća ekstrahovane datume iz file-name konvencije (`ime_prezime_2026-12-31.pdf`) ili default validan dokument. |
| **AWS SES** | Email notifikacije | Laravel default `log` mailer u dev-u; `ses` driver u produkciji. |

### 10.4 Naming conventions

**Princip:** engleski za sve tehničke artefakte, crnogorski za korisniku vidljive stringove kroz `lang/me/` translation fajlove. Domain mapping je u sekciji 18 (Glossary).

| Artefakt | Konvencija | Primjer |
|---|---|---|
| Tabele (DB) | `snake_case`, množina, engleski | `users`, `students`, `teams`, `team_members`, `medical_certificates`, `schools`, `sports`, `competitions`, `results`, `audit_log` |
| Kolone (DB) | `snake_case`, engleski, jasna semantika | `created_at`, `medical_certificate_id`, `verified_at`, `status` |
| Enum vrijednosti | `snake_case` string, engleski | `draft`, `submitted`, `manual_review`, `team_sport`, `individual_sport` |
| Eloquent modeli | `PascalCase`, jednina, engleski | `App\Models\Student`, `App\Models\Team`, `App\Models\MedicalCertificate` |
| Controller-i | `PascalCase` + `Controller`, engleski | `TeamRegistrationController`, `StudentVerificationController`, `AdminUserController` |
| Form Request klase | `PascalCase` + `Request`, engleski | `RegisterTeamRequest`, `UpdateStudentProfileRequest` |
| Service klase | `PascalCase` + `Service`, engleski | `TeamRegistrationService`, `EDnevnikVerificationService`, `OcrValidationService` |
| Adapter klase | `PascalCase` + `Adapter`, engleski | `EDnevnikAdapter`, `GoogleVisionAdapter`, `FakeOcrAdapter` |
| Policy klase | `PascalCase` + `Policy`, engleski | `TeamPolicy`, `StudentPolicy`, `ResultPolicy` |
| Notification klase | `PascalCase` + `Notification`, engleski | `TeamSubmittedNotification`, `MedicalCertificateInvalidNotification` |
| Job klase | `PascalCase` + `Job`, engleski | `ValidateMedicalCertificateJob`, `VerifyStudentWithEDnevnikJob` |
| Route names | `dot.case`, engleski, hijerarhija | `teams.create`, `teams.store`, `admin.users.index`, `students.profile.show` |
| Route URL segments | `kebab-case`, engleski, množina za resource | `/teams`, `/students/{student}/profile`, `/admin/medical-certificates` |
| React komponente | `PascalCase`, engleski, fajlovi u `kebab-case.tsx` | `TeamRegistrationForm` u `team-registration-form.tsx` |
| React pages (Inertia) | `kebab-case.tsx`, engleski | `resources/js/pages/teams/create.tsx`, `students/profile.tsx` |
| Translation keys | `dot.case`, engleski (key), crnogorski (vrijednost) | `lang/me/teams.php` → `'create_button' => 'Nova prijava ekipe'` |
| UI tekst | crnogorski latinica preko `__('key')` | `__('teams.create_button')` → "Nova prijava ekipe" |
| Email subject/body | crnogorski preko Notification template | `Mail::view('emails.team-submitted')` sa CG sadržajem |
| Validation poruke | crnogorski u `lang/me/validation.php` | "Polje :attribute je obavezno." |
| Komentari u kodu | engleski (PHPDoc), kratki | `/** @return Collection<int, Team> */` |

**Izuzeci od pravila:**
- `AiDnevnikSesija` model i `ai_dnevnik_sesije` tabela ostaju u crnogorskoj formi jer su predmet-specifični (ADIS, Univerzitet Donja Gorica). Ovo NIJE precedens za nove tabele.
- Polja koja su crnogorski-specifična pojmovi bez prevoda: `jmb` (Jedinstveni Matični Broj) ostaje `jmb`, ne `personal_id`. Slično `sifra_skole` može biti `school_code`.

**Plural / singular pravilo (Laravel default):**
- Tabela = množina (`teams`), Model = jednina (`Team`), Controller = može biti jednina ili "resourceful" oblik (`TeamController`).
- Belongs-to FK = `{singular_owner}_id` (`team_id`, `student_id`).

---

## 11. API ugovori (eksterni servisi)

### 11.1 eDnevnik
**`GET /students/{jmb}`** — Header-i: `X-API-Key`, `Accept: application/json`

Odgovor 200:
```json
{
  "jmb": "0101005250001",
  "ime": "Petar",
  "prezime": "Petrović",
  "sifra_skole": "OS-PG-001",
  "razred": "8-2",
  "redovan": true,
  "datum_zadnjeg_statusa": "2026-04-20"
}
```

Greške: `404` (učenik ne postoji), `401` (nevažeći API ključ), `429` (rate limit, exponential backoff), `503` (privremeno nedostupan, status `pending`, retry).

### 11.2 Google Cloud Vision
**`POST /v1/images:annotate`** — Service Account JSON ključ čuva se u AWS Secrets Manager (produkcija) ili `.env` (dev).

Zahtjev:
```json
{
  "requests": [{
    "image": { "content": "<base64>" },
    "features": [{ "type": "DOCUMENT_TEXT_DETECTION" }],
    "imageContext": { "languageHints": ["sr", "bs", "hr"] }
  }]
}
```

Post-procesiranje: regex ekstrakcija datuma izdavanja i isteka, pretraga imena učenika u tekstu, poređenje sa lokalnim zapisom.

### 11.3 AWS SES
- Pristup kroz AWS SDK (PHP).
- Šabloni email-ova kao Laravel Notification klase.
- Bounce i complaint handling kroz SNS topic (produkcija).

### 11.4 Generalni principi za eksterne pozive
- **Timeout:** 5s default, 10s za eDnevnik.
- **Retry:** do 3 puta sa exponential backoff za 5xx i 429 greške.
- **Circuit breaker:** nakon 5 uzastopnih grešaka, servis se privremeno onemogućava (10 min).
- **Observability:** svi pozivi se loguju (latency, status, payload size).

### 11.5 File storage convention

**Driver:** `local` (privatan `storage/app/private/`) u dev-u, `s3` (privatan bucket) u produkciji. **Ne** koristimo `public` disk za osjetljive fajlove (ljekarske potvrde, fotografije maloljetnika).

| Tip fajla | Path | Naming | Visibility | Max veličina | Allowed MIME |
|---|---|---|---|---|---|
| Učenička fotografija | `students/{student_id}/photos/{uuid}.{ext}` | UUID v4 | private, signed URL | 5 MB | `image/jpeg`, `image/png`, `image/webp` |
| Ljekarska potvrda | `medical-certificates/{team_member_id}/{uuid}.{ext}` | UUID v4 | private, signed URL | 10 MB | `application/pdf`, `image/jpeg`, `image/png` |
| Saglasnost roditelja | `parental-consents/{student_id}/{uuid}.pdf` | UUID v4 | private, signed URL | 5 MB | `application/pdf` |
| Avatar profesora/admina | `users/{user_id}/avatar/{uuid}.{ext}` | UUID v4 | private, signed URL | 2 MB | `image/jpeg`, `image/png`, `image/webp` |
| Export podataka (UC AZLP) | `exports/{user_id}/{uuid}.json` | UUID v4 | private, signed URL, **TTL 24h** | n/a | `application/json` |
| Temp upload (auto-cleanup) | `tmp/{session_id}/{uuid}.{ext}` | UUID v4 | private | 10 MB | bilo koji whitelisted | 

**Signed URL TTL:** default 5 minuta za pregled fajla u UI. Generišu se per-request preko `Storage::temporaryUrl($path, now()->addMinutes(5))`.

**Pravila:**
- Original ime fajla **nikad** ne ulazi u path — uvijek UUID. Original ime se čuva u DB koloni (`original_filename`) za prikaz korisniku.
- Ekstenzija se validira po MIME-u, ne po extension-u u uploaded fajlu.
- Pre-upload virus scan (ClamAV ili AWS GuardDuty) — opciono za prvi rollout, obavezno za pilot.
- AZLP brisanje: kad se brišu PII učenika, **briše se i sav storage** (`Storage::deleteDirectory("students/{$id}")`).
- Versioning: S3 bucket ima versioning on; lifecycle pravilo briše stare verzije nakon 30 dana.

**Backup:** dnevni snapshot S3 (lifecycle), tjedna restore vježba u staging-u.

---

## 12. Korisnički interfejs

### 12.1 Principi dizajna
- **Mobile-first responsive** — profesori često koriste sistem sa telefona.
- **Role-based dashboard** — svaka uloga ima dedicirani dashboard.
- **Konzistentnost** — shadcn/ui komponente kroz cijelu aplikaciju.
- **Vidljiva validacija** — inline error poruke, OCR status indikatori (validna / istekla / nevalidna).
- **Pristupačnost** — semantički HTML, kontrasti po WCAG AA, navigacija tastaturom.
- **Otpornost na slabu konekciju** — autosave forme za prijavu ekipe, retry za upload-e potvrda.

### 12.2 Ključni ekrani (wireframe-i u izvornom dizajnu)
1. **Login** — `/login` (Fortify).
2. **Profesorski dashboard** — `/dashboard` (kad je `role=profesor`): pregled vlastitih ekipa, dugme "Nova prijava ekipe", predstojeća takmičenja.
3. **Forma za prijavu ekipe** — `/teams/create` (UC5): bira sport → dodaje članove → upload potvrda → potpis.
4. **Učenički profil** — `/students/{id}` (i `/profile` kad je `role=ucenik`): lični podaci, fotografija, istorija takmičenja, rezultati, medalje.
5. **Admin panel** — `/admin/*`: korisnici, škole, sportovi, takmičenja, rezultati, verifikacija.

### 12.3 Inertia + Wayfinder konvencije
- Frontend forme koriste `<Form>` ili `useForm` iz `@inertiajs/react`.
- URL-ovi se ne hardkoduju — koriste se Wayfinder funkcije: `import { teams } from '@/routes'` → `teams.create.url()`.
- Layout props za role-aware navigaciju kroz `useLayoutProps`.
- Deferred props za teške liste (rezultati, audit log) + skeleton-i.

---

## 13. Sigurnost i AZLP usklađenost

### 13.1 Autentifikacija i autorizacija
- **Fortify** — `/login`, `/register`, `/forgot-password`, `/email/verify`, `/user/two-factor-authentication` (opciono).
- **Role-based authorization** — Laravel Policy klase po entitetu (`TeamPolicy`, `StudentPolicy`, `ResultPolicy`).
- **Middleware** — `auth`, `verified`, custom `role:admin|profesor|ucenik`.

### 13.2 AZLP zahtjevi
| Zahtjev | Implementacija |
|---|---|
| Saglasnost roditelja prije obrade podataka maloljetnika | Boolean polje na Ucenik modelu + datum saglasnosti + dokument upload. |
| Pristup obrazovnim podacima maloljetnika kroz eDnevnik | Svaki pristup se loguje u audit log sa user_id, učenik, vrijeme, razlog. |
| Pravo na brisanje (po isteku školovanja) | Komanda `php artisan azlp:purge-graduates` — briše PII, čuva agregirane rezultate anonimizovane. |
| Pravo na uvid | Učenik (ili roditelj) može preuzeti svoje podatke kao JSON kroz `/profile/export`. |
| Audit log nepromjenljiv | Posebna tabela `audit_log` bez UPDATE i DELETE — samo INSERT. Append-only kroz policy. |

### 13.3 Audit log model
| Polje | Tip |
|---|---|
| `id` | uuid |
| `user_id` | nullable foreign key |
| `action` | string (npr. `team.created`, `student.verified`, `ednevnik.queried`) |
| `subject_type` + `subject_id` | polimorfna referenca |
| `payload` | json (sažetak izmjene, ne tajne) |
| `ip` + `user_agent` | string |
| `created_at` | timestamp |

### 13.4 Permission / Policy matrica

Tri role × ključni entiteti × CRUD akcije + ownership pravila. Implementacija kroz Laravel Policy klase (`Gate::define` ili `Policy` klase per model).

**Legend:**
- ✓ — dozvoljeno za sve instance entiteta
- **own** — dozvoljeno samo za vlastite/vezane instance (npr. profesor samo svoje ekipe, učenik samo svoj profil)
- **school** — dozvoljeno samo za instance u istoj školi
- — — zabranjeno (403)

| Entitet → Akcija ↓ | Guest | Student | Professor | Admin |
|---|:---:|:---:|:---:|:---:|
| **User: view** | — | **own** | **own** + school students | ✓ |
| **User: create** | ✓ (registracija) | — | — | ✓ |
| **User: update** | — | **own** | **own** | ✓ |
| **User: delete** | — | — | — | ✓ (sa AZLP procedurom) |
| **Student: view profile** | — | **own** | **school** | ✓ |
| **Student: update profile** | — | **own** (limitirano) | — | ✓ |
| **Student: verify (eDnevnik)** | — | — | — | ✓ |
| **School: view** | — | **own** | **own** | ✓ |
| **School: create/update/delete** | — | — | — | ✓ |
| **Sport: view** | — | ✓ | ✓ | ✓ |
| **Sport: create/update** | — | — | — | ✓ |
| **Sport: delete** | — | — | — | — *(samo deaktivacija)* |
| **Competition: view** | — | ✓ | ✓ | ✓ |
| **Competition: create/update/delete** | — | — | — | ✓ |
| **Team: view** | — | **member-of** | **own** + school teams | ✓ |
| **Team: create** | — | — | ✓ (sa preduslovom: verified profesor) | ✓ |
| **Team: update (dok je draft)** | — | — | **own** | ✓ |
| **Team: submit (draft → submitted)** | — | — | **own** | — *(samo profesor)* |
| **Team: approve (submitted → active)** | — | — | — | ✓ |
| **Team: reject** | — | — | — | ✓ |
| **Team: cancel** | — | — | **own** *(samo iz draft)* | ✓ |
| **Team: withdraw** | — | — | **own** *(active)* | ✓ |
| **TeamMember: add to draft team** | — | — | **own team** | ✓ |
| **TeamMember: remove from draft team** | — | — | **own team** | ✓ |
| **MedicalCertificate: upload** | — | — | **own team's member** | ✓ |
| **MedicalCertificate: view** | — | **own** | **own team's** | ✓ |
| **MedicalCertificate: download** | — | **own** | **own team's** | ✓ |
| **MedicalCertificate: manual approve (manual_review → valid)** | — | — | — | ✓ |
| **Result: view** | — | **own** + public competitions | **own teams** + public | ✓ |
| **Result: create/update** | — | — | — | ✓ |
| **AuditLog: view** | — | — | — | ✓ |
| **AuditLog: delete/update** | — | — | — | — *(immutable za sve, čak i admina)* |
| **Notification (own): mark as read** | — | **own** | **own** | **own** |
| **Profile export (AZLP)** | — | **own** | **own** | ✓ (admin za sve) |

**Implementacioni paterni:**
- Svaki entitet sa netrivijalnim pravilima ima Policy klasu (`TeamPolicy`, `StudentPolicy`, `MedicalCertificatePolicy`, `ResultPolicy`, `SchoolPolicy`).
- Form Request `authorize()` metoda delegira na Policy (`$this->user()->can('update', $this->team)`).
- Inertia stranice provjeravaju permissions u Controller-u prije render-a; UI sakriva dugmad za zabranjene akcije (ali server uvijek mora ponovno provjeriti).
- **Pravilo:** UI sakrivanje ≠ autorizacija. Server uvijek prolazi kroz Policy.
- Kontekstni dodaci uz role:
  - Profesor: `school_id` + `verified_at` (mora biti verified prije nego može kreirati ekipu)
  - Student: `school_id` + `verification_status` (limitirano šta može mijenjati ako je `mismatched`)
  - Admin: nema `school_id` veze, globalan

**Šta NIJE u matrici (za sljedeće faze):** sub-admin role (npr. "Regional Coordinator"), per-school admin, read-only auditor role.

---

## 14. Kriterijumi prihvata (Acceptance criteria)

**Da bi se UC smatrao "done", mora imati:**
- Pest feature test koji prati glavni tok + bar dva alternativna toka.
- Wayfinder generisane rute (`npm run wayfinder:generate` prošao bez tipa errora).
- Pint formatiran kod (`vendor/bin/pint --dirty --format agent`).
- TypeScript bez `any` u javnim signaturama React komponenti.
- UI ručno verifikovan na mobile širini (360px) i desktopu (1280px).
- Audit log zapis za svaku akciju koja mijenja stanje.
- Policy ili Form Request `authorize()` koji odbija pogrešnu rolu.

**System-wide:**
- Test coverage > 70% (Pest).
- Smoke test sa Pest Browser-om prolazi za sve ključne stranice (bez JS error-a u konzoli).
- `php artisan test --compact` zelena.
- `npm run build` prolazi bez upozorenja.

---

## 15. Pipeline / faze implementacije

| Faza | Sadržaj | Trajanje | Deliverable |
|---|---|---|---|
| **1. Setup** | Repo skelet (već postoji), CI workflow, env primjeri, seeded admin. | 1 nedjelja | Funkcionalan dev environment. |
| **2. Migracije i modeli** | Sve migracije iz Domain modela (sekcija 7), Eloquent modeli, factory-ji, seederi. | 1 nedjelja | Schema + factory + seed. |
| **3. Auth + Korisnici (UC1, UC2, UC7)** | Fortify konfiguracija, role-based middleware, registracija/login UI, admin CRUD korisnika i škola. | 1–2 nedjelje | Autentifikacija + admin user management. |
| **4. Sportovi i raspored (UC9)** | Admin CRUD sportova i takmičenja. Cache katalog. | 1 nedjelja | Katalog spreman za UC5. |
| **5. UC5 — Prijava ekipe** | `TeamRegistrationService`, `FakeOcrAdapter`, forma sa upload-om potvrda, potpis logika. | 3 nedjelje | Funkcionalna prijava ekipe (sa fake OCR-om). |
| **6. UC8 — Verifikacija eDnevnik** | `EDnevnikAdapter` interface, `FakeEDnevnikAdapter`, admin UI za verifikaciju. | 1–2 nedjelje | Verifikacija učenika kroz mock. |
| **7. UC10 — Rezultati i medalje** | Admin unos rezultata, distribucija medalja, ažuriranje profila. | 2 nedjelje | Kompletan ciklus takmičenja. |
| **8. UC3, UC4 — Dashboard-ovi** | Profesorski panel, učenički profil sa istorijom, admin panel sa filtrima. | 2 nedjelje | Sva tri korisnička UI-ja. |
| **9. Audit log + AZLP** | `AuditLogger`, append-only policy, `azlp:purge-graduates` komanda, `/profile/export`. | 1 nedjelja | AZLP usklađenost. |
| **10. Testovi + smoke** | Pest feature/unit/browser testovi, > 70% coverage, security audit, performance smoke. | 2 nedjelje | Zelena test suita, pass UAT. |
| **11. Pilot + rollout** | Pilot u 1–2 škole, korekcije, postepeni rollout. | 2–3 mjeseca | Sistem u produkciji. |

### 15.1 Kritične zavisnosti
- Sporazum sa Ministarstvom prosvjete za eDnevnik pristup — može blokirati prelaz sa `FakeEDnevnikAdapter` na pravog; mock omogućava razvoj bez sporazuma.
- AZLP saglasnost za obradu podataka maloljetnika — mora biti riješeno prije pilota.
- Pravna validnost digitalnih ljekarskih potvrda — usaglasiti sa Ministarstvom zdravlja prije produkcije.

### 15.2 Seed strategija

Cilj: nakon `php artisan migrate:fresh --seed` dev mora imati dovoljno realnih podataka da se može odmah testirati svaki UC bez ručnog kreiranja.

**Seederi i redoslijed:**

| # | Seeder | Kreira | Idempotentan? |
|---|---|---|---|
| 1 | `AdminUserSeeder` | 1× Admin korisnik iz `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). | da (`updateOrCreate`) |
| 2 | `SchoolSeeder` | 5–10 realnih CG škola (OŠ "Sutjeska" PG, OŠ "Štampar Makarije" PG, OŠ "Maksim Gorki" BD, OŠ "Vladimir Nazor" HN, OŠ "Anto Đedović" BB...). | da (po `code` koloni) |
| 3 | `SportSeeder` | 8–10 sportova: Fudbal (TEAM, 11+5), Košarka (TEAM, 5+5), Odbojka (TEAM, 6+6), Rukomet (TEAM, 7+5), Atletika (INDIVIDUAL), Plivanje (INDIVIDUAL), Stoni tenis (INDIVIDUAL), Šah (INDIVIDUAL), Karate (INDIVIDUAL), Stolni tenis dubl (TEAM, 2). | da (po `slug`) |
| 4 | `ProfessorSeeder` | 2–3 profesora po školi. Prvi u svakoj školi je `verified`, ostali nisu. | da (po `email`) |
| 5 | `StudentSeeder` | 10–20 učenika po školi (mix 1.–9. razreda), polovina `verified`, par `mismatched`, par `unverified`. | da (po `jmb`) |
| 6 | `CompetitionSeeder` | 5–8 takmičenja: 2 prošla (sa rezultatima), 3 aktivna (`active`, registracija otvorena), 3 u budućnosti. | da (po `slug` + `year`) |
| 7 | `TeamSeeder` | Za svako prošlo takmičenje: 4–6 ekipa, completed, sa rezultatima. Za aktivna: 2–3 draft/submitted ekipe. | da (po `team_uuid`) |
| 8 | `ResultSeeder` | Rezultati za sva completed takmičenja: medalje (zlato/srebro/bronza). | da |
| 9 | `AiDnevnikSeeder` | Postojeće 15+ sesija dnevnika (već u repo-u). | da (po `broj`) |

**`DatabaseSeeder` poziva seedere ovim redom** (FK zavisnosti).

**Env-driven default admin:**
```env
ADMIN_EMAIL=admin@savez.test
ADMIN_PASSWORD=Adm1n!Test
ADMIN_NAME="Sistemski Admin"
```
Ako `.env` nema vrijednosti, `AdminUserSeeder` koristi `admin@savez.test` / `password` i loguje upozorenje.

**Factories:**
- Sve factory klase u `database/factories/` koriste `Faker` sa `me_ME` lokalom (ako postoji) ili `sr_RS`.
- Custom Faker provider `CrnogorskiProvider` sa listama CG imena, prezimena, naselja, JMB generator.
- Realni JMB se generiše algoritmom (datum rođenja + region + redni broj + kontrolna cifra), ne random string.

**Testovi i seeding:**
- Pest feature testovi koriste `RefreshDatabase` trait (clean state po testu).
- **Ne pozivaju** seedere — koriste factories za precizno postavljanje state-a.
- Browser testovi (smoke) MOGU koristiti seedere kroz `$this->seed(DatabaseSeeder::class)` za realniji setup.

**Production seeding:**
- Samo `AdminUserSeeder` i `SportSeeder` (i AiDnevnikSeeder za predaju projekta).
- Ostali seederi su demo data i NE pokreću se u produkciji (`if (app()->isLocal())` check).

---

## 16. Otvorena pitanja

- **JMB validacija** — koristimo li algoritamsku validaciju kontrolne cifre crnogorskog JMB-a, ili samo regex format check?
- **Fotografija učenika** — obavezno polje pri registraciji ili opciono? Aspect ratio i max veličina?
- **Saglasnost roditelja** — digitalni dokument (PDF upload), checkbox sa IP+timestamp, ili kombinacija?
- **Audit log retencija** — koliko dugo čuvamo audit log poslije brisanja korisnikovih PII?
- **Dvofaktorska autentifikacija** — Fortify podržava 2FA; treba li nam za prvi pilot ili samo za admin nalog?
- **Multi-tenancy škola** — može li profesor biti vezan za više škola istovremeno (npr. predaje na dvije lokacije)?
- **Notifikacioni digest** — riješena osnovna matrica (sekcija 9.5), ali ostaje: imamo li dnevni email digest umjesto per-event email-a, i da li korisnik može preference (kasnije feature)?

---

## 17. Glossary (domain ↔ tech mapping)

Domain pojmovi (crnogorski, iz izvornih dokumenata) mapirani na engleski tehnički nazivnik (iz sekcije 10.4). Koristi se za prevod između UI/dokumentacije i koda.

### 17.1 Entiteti

| Crnogorski (domain) | Engleski (tabela) | Engleski (model) | Engleski (UI route) | Opis |
|---|---|---|---|---|
| Korisnik | `users` | `User` | `/users` | Apstraktna nadklasa za sve uloge. |
| Učenik | `students` | `Student` | `/students` | Aktivni učenik osnovne ili srednje škole. |
| Profesor (nastavnik) | `professors` | `Professor` | `/professors` | Profesor fizičkog vaspitanja, prijavljuje ekipe. |
| Administrator | `admins` *(ili `users` sa `role=admin`)* | `Admin` | `/admin/*` | Korisnik Sportskog saveza. |
| Škola | `schools` | `School` | `/schools` | Obrazovna ustanova. |
| Sport | `sports` | `Sport` | `/sports` | Definicija sportske discipline. |
| Tip sporta | `enum` | `SportType` | n/a | `team_sport`, `individual_sport`. |
| Takmičenje | `competitions` | `Competition` | `/competitions` | Konkretan događaj na kalendaru. |
| Ekipa | `teams` | `Team` | `/teams` | Prijava škole na takmičenje. |
| Član ekipe | `team_members` | `TeamMember` | `/teams/{team}/members` | Učenik u kontekstu konkretne ekipe. |
| Ljekarska potvrda | `medical_certificates` | `MedicalCertificate` | `/medical-certificates` | Medicinski dokument vezan za člana ekipe. |
| Rezultat | `results` | `Result` | `/results` | Plasman/medalja, polimorfan (Team ili TeamMember). |
| Audit log | `audit_log` | `AuditLogEntry` | n/a (interno) | Nepromjenljiv zapis svake akcije. |

### 17.2 Pojmovi i akronimi

| Pojam | Engleski / objašnjenje |
|---|---|
| AZLP | Agencija za zaštitu ličnih podataka (CG regulator). U kodu: prefix `azlp:` za artisan komande, sufiks `Azlp` za relevantne servise. |
| JMB | Jedinstveni Matični Broj (CG ekvivalent EMBG/JMBG). U kodu: kolona `jmb`, ne `personal_id`. |
| eDnevnik | Državni elektronski dnevnik (CG sistem za evidenciju učenika). U kodu: `EDnevnik` (dva velika slova). |
| OCR | Optical Character Recognition. U kodu: `Ocr` (PascalCase). |
| SVD | Software Vision Document (System Vision Document) — projektni dokument iz Faze 1. |
| Šifra škole | `school_code` (kolona u `schools` tabeli). Format: `OS-PG-001` za OŠ Podgorica br. 1, `SS-...` za srednje škole. |
| Razred | `grade` ili `class` — kolona u `students` tabeli, format `8-2` (8. razred, odjeljenje 2). |
| Saglasnost roditelja | `parental_consent` — boolean + dokument upload + datum potpisa. Obavezno za maloljetnike. |
| Plasman | `placement` ili `ranking` — int kolona u `results` tabeli. |
| Medalja | `medal_type` enum: `gold`, `silver`, `bronze`, `participation`. |
| Potpis profesora | `signature` u `teams` tabeli — string (puno ime), `signed_at` timestamp, `signature_ip` string. |

### 17.3 UI ↔ kod mapping (često korišteno)

| UI tekst (crnogorski) | Translation key | Engleski |
|---|---|---|
| "Prijavi ekipu" | `teams.register_button` | "Register team" |
| "Ljekarska potvrda istekla" | `medical_certificates.status.expired` | "Medical certificate expired" |
| "Učenik nije verifikovan" | `students.verification.unverified` | "Student not verified" |
| "Audit zapis" | `audit.entry` | "Audit log entry" |
| "Saglasnost roditelja" | `students.parental_consent.label` | "Parental consent" |
| "Pristupiti profilu" | `students.profile.access` | "Access profile" |

**Pravilo za nove pojmove:**
1. Tehnički naziv (tabela/model/kolona) — engleski.
2. UI tekst — crnogorski preko `lang/me/{namespace}.php`.
3. Domain mapping (ovaj glossary) — ažurira se zajedno sa novim entitetima.

---

## 18. Changelog

| Verzija | Datum | Izmjena |
|---|---|---|
| 1.0 | 2026-05-12 | Inicijalna konsolidacija SVD v2.1 + Analitika v3.1 + Dizajn v1.2. Odluke: spec lokacija `specs/`, Fortify umjesto Sanctum, Mock adapteri prvo za OCR/eDnevnik. |
| 1.1 | 2026-05-13 | Dopuna sa sekcijama: **7.4** State dijagrami (Team, MedicalCertificate, Student verifikacija), **9.4** Queue/Background jobs strategija, **9.5** Notification matrica, **10.4** Naming conventions (engleski tehnički + crnogorski UI), **11.5** File storage convention, **13.4** Permission/Policy matrica (3 role × svi entiteti × akcije), **15.2** Seed strategija (9 seedera, env-driven admin), **17** Glossary (domain ↔ tech mapping). Notifikacije pitanje iz sekcije 16 prebačeno u djelimično riješeno (matrica postoji, digest ostaje otvoreno). |