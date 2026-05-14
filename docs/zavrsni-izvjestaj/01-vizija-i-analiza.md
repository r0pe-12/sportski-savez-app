# Vizija i analiza (integrisano izvještavanje 1+2.1)

> **Pokriva:** profesorov zahtjev 4 dio (a) — "sadrže viziju i artefakte vezane za Analizu"
> **Konsolidacija:** `docs/fajlovi/SVD_v2.1.md` + `docs/fajlovi/Projektna_analitika_v3.1.md` + `specs/001-sportski-savez.md` §1–§7

## 1. Problem i rješenje

(Konsolidovano iz SVD §1, dopunjeno spec §1.)

Sportski savez Crne Gore organizuje školska sportska takmičenja, ali se cijeli proces prijave i evidencije odvija na papiru. Ključni problemi:

- **Spor i nepouzdan ručni proces** — gubici dokumenata, sporo provjeravanje potvrda
- **Nepostojanje centralne evidencije** učesnika, rezultata i istorije takmičenja
- **Nedostatak tragova obrade osjetljivih podataka** maloljetnika (AZLP rizik)

**Rješenje:** centralizovan web informacioni sistem sa 3 uloge (Profesor, Učenik, Administrator Saveza), automatskim OCR-om ljekarskih potvrda, mock eDnevnik verifikacijom učenika i nepromjenljivim audit log-om.

## 2. Sistemske sposobnosti

(Citat iz SVD §2, nije se mijenjala u implementaciji.)

| Sposobnost | Opis |
|---|---|
| Digitalna prijava ekipa | Profesor formira ekipu, dodaje učenike, uploaduje potvrde |
| Validacija ljekarskih potvrda | Automatski OCR + ručna provjera za sumnjive slučajeve |
| eDnevnik verifikacija | Provjera učeničkog identiteta protiv eksternog registra |
| Centralni raspored | Read-only kalendar takmičenja za sve uloge |
| Rezultati i medalje | Admin unosi rezultate, student vidi medalje na profilu |
| Audit log | Nepromjenljiv zapis svih state izmjena za AZLP usklađenost |
| Notifikacije | Email + database notifikacije za state izmjene |

## 3. Stakeholderi

(Iz SVD §3 + spec §3.)

| Aktor | Uloga | Spec referenca |
|---|---|---|
| Profesor | Prijavljuje ekipe, uploaduje potvrde, potpisuje prijave | UC5 (centralni) |
| Učenik | Pristupa profilu i istoriji takmičenja | UC3 |
| Administrator Saveza | Upravlja sistemom, verifikuje učenike, unosi rezultate | UC6, UC7, UC8, UC10 |
| eDnevnik | Eksterni sistem za verifikaciju (mock u v1.0) | UC8 |

**Out-of-scope role** (meta-plan §9): sub-admin po školi, read-only auditor, parent role.

## 4. Use Case katalog

(Iz Projektna_analitika §2 + spec §5.)

**Use Case dijagram** (UML standard — akteri, sistemska granica, UC-ovi i njihove veze): vidi [`uml/00-use-case-dijagram.puml`](uml/00-use-case-dijagram.puml).

| ID | Naziv | Aktor | Status v1.0 |
|---|---|---|---|
| UC1 | Registracija | Profesor / Učenik | ✅ Implementirano |
| UC2 | Prijava na sistem (login) | Svi | ✅ Implementirano |
| UC3 | Pregled profila i istorije | Profesor / Učenik | ✅ Implementirano |
| UC4 | Pregled rasporeda | Profesor / Učenik (public) | ✅ Implementirano |
| UC5 | Prijava ekipe za takmičenje | Profesor | ✅ Implementirano (centralni UC) |
| UC6 | Upravljanje korisnicima i školama | Admin | ✅ Implementirano |
| UC7 | Audit log dashboard | Admin | ✅ Implementirano |
| UC8 | eDnevnik verifikacija učenika | Admin | ✅ Implementirano (mock adapter) |
| UC9 | Notifikacije | Sistem | ✅ Implementirano (email + DB) |
| UC10 | Unos rezultata + medalje | Admin | ✅ Implementirano |

**Detaljan tok UC5 (centralni):** vidi sequence dijagram u [`uml/02-sequence-uc5.puml`](uml/02-sequence-uc5.puml) i spec §5.5.

## 4a. Fully dressed Use Case: UC5 — Prijava ekipe za takmičenje

> Format po Alistair Cockburn (RUP standard). Centralni UC sistema — orkestriše 7 entiteta i uključuje OCR pipeline (UC6).

**ID i naziv:** UC5 — Prijaviti ekipu za takmičenje

**Cilj u kontekstu:** Profesor digitalno prijavljuje ekipu svoje škole za konkretno sportsko takmičenje, sa potpunom evidencijom članova i ljekarskih potvrda.

**Obim (scope):** Sistem školskog sporta CG (web aplikacija)

**Nivo (level):** Korisnički cilj (User-goal level)

**Primarni aktor:** Profesor fizičkog vaspitanja

**Stakeholderi i interesi:**

| Stakeholder | Interes |
|---|---|
| Profesor | Brza prijava bez papirne administracije; vidljiv status validacije ljekarskih potvrda. |
| Učenik (i roditelj) | Tačno evidentiran u prijavi; potvrda saglasnosti vidljiva u audit logu. |
| Škola | Pravilo "jedna ekipa po školi po takmičenju" poštovano; sva prijava povezana sa školskim profilom. |
| Sportski savez CG (Admin) | Centralna evidencija učesnika i automatska validacija potvrda; mogućnost odobrenja/odbijanja prije takmičenja. |
| AZLP (regulator) | Svaki pristup podacima maloljetnika logovan u immutable audit log. |

**Preduslovi:**

1. Profesor je prijavljen u sistem (sesija aktivna).
2. Profesor je `verified` (admin ga je verifikovao kroz UC7).
3. Profesor je povezan sa konkretnom školom (`users.school_id IS NOT NULL`).
4. Sport postoji u katalogu (`sports.deleted_at IS NULL`).
5. Takmičenje postoji i registracija je otvorena (`competitions.status = 'open_registration'`).
6. Učenici koje profesor želi dodati postoje u sistemu i pripadaju istoj školi.
7. Škola nije već prijavila ekipu na ovo takmičenje (unique constraint `competition_id + school_id`).

**Postuslovi (success guarantee):**

1. Kreiran zapis `Team` sa statusom `submitted` (potpisano i predato adminu).
2. Kreirani `TeamMember` zapisi za svakog učenika.
3. Svaka `MedicalCertificate` ima status `valid` (OCR uspješno validirao datume i ime).
4. Fajlovi potvrda sigurno pohranjeni u `storage/app/private/medical-certificates/{member_id}/{uuid}.pdf`.
5. Audit log zapisi: `team.created`, `team_member.added` (xN), `certificate.uploaded` (xN), `certificate.ocr_completed` (xN), `team.submitted`.
6. Notifikacija (email + in-app) poslata profesoru i adminu škole.
7. Status ekipe vidljiv na `/teams` listi profesora i `/admin/teams` adminskom dashboardu.

**Postuslovi (minimal guarantee, ako tok ne završi uspješno):**

1. Ako profesor odustane prije submita: `Team.status = 'draft'` ostaje u bazi i može se nastaviti kasnije ili izbrisati.
2. Storage fajlovi privremeno učitanih potvrda ostaju do `Team.delete()` (Eloquent observer briše fajl).
3. Audit log zapisi za sve već urađene korake ostaju (append-only).

**Trigger:** Profesor klikne "Prijavi ekipu na ovo takmičenje" na stranici `/competitions/{slug}` (ili "Nova prijava ekipe" sa dashboard-a).

**Glavni tok (Main Success Scenario):**

1. Profesor otvori stranicu takmičenja `/competitions/{slug}` i klikne CTA dugme "Prijavi ekipu".
2. Sistem provjeri da profesor zadovoljava preduslove (verified, ima school_id, registracija otvorena, škola nije već prijavljena).
3. Sistem kreira `Team` zapis sa `status='draft'` i preusmjeri profesora na `/teams/{id}/edit`.
4. Sistem prikazuje formu sa: imenom takmičenja, sportom, dozvoljenim brojem članova (`sport.members_count + sport.substitutes_count`) i praznom listom članova.
5. Profesor klikne na MultiSelect "Dodaj učenika" i pretražuje učenike po imenu / razredu / JMB-u.
6. Sistem prikazuje samo `verified` (ili `unverified` sa upozorenjem) učenike iz iste škole, isključujući već dodate.
7. Profesor selektuje učenika i klikne "Dodaj (N)".
8. Sistem kreira `TeamMember` zapis i ažurira UI sa novim članom (chip "Bez potvrde", dugme "Upload potvrdu").
9. Profesor klikne "Upload potvrdu" na članovom redu i odabere PDF/JPG/PNG fajl ljekarske potvrde.
10. Sistem validira MIME tip i veličinu (max 10 MB), pohranjuje fajl u `storage/app/private/medical-certificates/{member_id}/{uuid}.{ext}`, kreira `MedicalCertificate` zapis sa `status='pending'`.
11. Sistem dispatch-uje `ValidateMedicalCertificateJob` u `ocr` queue (asinhrono, ne blokira UI).
12. UC6 — Queue worker procesira job: poziva `OcrAdapter::extract($path, $originalFilename)`, parsira datum isteka i ime, postavlja `MedicalCertificate.status` na `valid` / `expired` / `invalid` / `manual_review`.
13. Profesor osvježi stranicu (ili polling) — vidi novi status badge (npr. "Validna").
14. Koraci 5–13 se ponavljaju dok ekipa nema potreban broj članova (sport-specific: stoni tenis 1, košarka 5–10, atletika 1–N).
15. Profesor klikne "Pregled i potpis" → sistem preusmjeri na `/teams/{id}/review`.
16. Sistem prikazuje pregled prijave + form sa Input "Potpis" (placeholder = registrovano ime profesora).
17. Profesor unese svoje puno ime kao potpis (mora se podudarati sa `users.name`) i klikne "Potpiši i predaj".
18. Sistem validira potpis (string equality), provjerava da `allValid = members.every(m => cert.status === 'valid')`, da `inRange = members.length BETWEEN sport.members_count AND sport.members_count + sport.substitutes_count`.
19. Sistem postavi `Team.status = 'submitted'`, `Team.signature = potpis`, `Team.signed_at = now()`, `Team.signature_ip = request.ip`.
20. Sistem dispatch-uje `SendTeamSubmittedNotification` (email + database channel) profesoru i adminu škole.
21. Sistem preusmjeri profesora na `/teams` listu sa flash porukom "Ekipa predata na odobrenje".

**Alternativni tokovi (Extensions):**

| Tačka | Uslov | Alternativa |
|---|---|---|
| **2a** | Profesor nije verified | Sistem prikaže Card sa porukom "Vaš nalog još nije verifikovan od strane administratora" i ne otvori formu. Use case završava. |
| **2b** | Registracija takmičenja zatvorena (`status != 'open_registration'`) | Sistem prikaže poruku "Registracija za ovo takmičenje nije otvorena". Use case završava. |
| **2c** | Škola već prijavila ekipu na ovo takmičenje | Sistem otkrije postojeću ekipu i prikaže link "Tvoja prijavljena ekipa (status: ...)" → klik vodi na `/teams/{id}/edit` ili `/teams/{id}/review` zavisno od statusa. Use case se nastavlja na koraku 4. |
| **6a** | Profesor pretražuje učenika koji ne postoji ili nije iz njegove škole | MultiSelect prikaže "Nema rezultata." Profesor mora prvo registrovati učenika (van UC5). |
| **9a** | Fajl je veći od 10 MB | Frontend prikaže alert "Fajl ne smije biti veći od 10 MB." Upload se prekida. |
| **9b** | MIME tip nije PDF/JPG/PNG | Backend FormRequest odbija sa 422 greškom, prikazuje poruku "Dozvoljeni formati: PDF, JPG, PNG". |
| **12a** | OCR ekstrahovan datum isteka < danas | `MedicalCertificate.status = 'expired'`, korisnik vidi crveni badge "Istekla". Mora uploadovati novu validnu potvrdu (postojeća postaje `superseded`). |
| **12b** | OCR ekstrahovano ime ne odgovara `student.name` | `MedicalCertificate.status = 'invalid'`, korisnik vidi crveni badge "Nevažeća" sa razlogom. |
| **12c** | OCR adapter vraća `confidence < 0.5` (loš sken / nije čitljivo) | `MedicalCertificate.status = 'manual_review'`, korisnik vidi plavi badge "Ručna provjera"; admin mora manuelno odobriti kroz `/admin/certificates`. |
| **12d** | OCR adapter baca exception (npr. Google Vision API down) | Job ima 3× exponential backoff retry; ako svi propadnu, `MedicalCertificate.status = 'manual_review'`, admin notifikovan kroz `SendCertManualReviewNotification`. |
| **18a** | Potpis ne odgovara registrovanom imenu | Backend odbija sa 422 i porukom "Potpis se mora podudarati sa vašim registrovanim imenom". Profesor mora ponovo unijeti. |
| **18b** | Bar jedan član nema `cert.status = 'valid'` | "Potpiši i predaj" dugme NIJE prikazano (frontend canSubmit = false). Sistem prikazuje žuto upozorenje sa razlozima (npr. "Marko Marković — potvrda nije validna"). |
| **18c** | Broj članova izvan opsega sporta | Slično kao 18b — dugme sakriveno + upozorenje. Profesor mora dodati/ukloniti članove. |
| **20a** | Email slanje propadne (SES API down) | Email job retry-uje; in-app notifikacija (database channel) ostaje vidljiva u Bell ikoni. Korisnik nije vidno obavješten o email pad-u. |

**Specijalni zahtjevi (Non-functional):**

- **Pristupačnost:** forma navigabilna tastaturom (Tab + Enter); kontrast WCAG AA; svi inputi imaju `<label>`.
- **Mobile-first:** UI funkcionalan na 360px viewport (testirani profesor scenario).
- **Otpornost na slabu konekciju:** upload sa retry; autosave team membership-a nakon svake izmjene (preserveScroll Inertia pattern); nema "lost data" ako se prekine konekcija.
- **Performanse:** P95 latencija HTML render-a < 500ms za `/teams/{id}/edit` (eager loading members + certificates). OCR job ne blokira HTTP odgovor (async queue).
- **Sigurnost:** CSRF token na svim POST-ovima (Inertia automatski). Fajlovi nisu javno dostupni — pristup samo kroz signed URL TTL 5min.
- **AZLP:** svaki pristup ljekarskoj potvrdi (download/view) loguje `certificate.viewed` u audit log sa user_id, ip, user_agent.

**Tehnologija i podaci varijacije:**

- **OCR adapter:** `FakeOcrAdapter` (dev — file-name konvencija `ime_prezime_YYYY-MM-DD.pdf`) ili `GoogleVisionAdapter` (prod — `config('services.ocr.driver')` feature flag).
- **Storage disk:** `local` (dev — `storage/app/private/`) ili `s3` (prod — privatan bucket sa server-side encryption).
- **Email driver:** `log` (dev — `storage/logs/laravel.log`) ili `ses` (prod — AWS SES sa bounce/complaint handling kroz SNS).
- **Queue driver:** `database` (dev — `jobs` tabela) ili `redis` (prod — sa dedicated worker pool za `ocr` queue radi rate limit-a).

**Učestalost pojave (Frequency of occurrence):**

- Vrhunac: 50–200 prijava dnevno tokom sezone takmičenja (jesen i proljeće).
- Off-peak: 0–5 prijava dnevno.
- Procjena ukupnog godišnjeg volumena: 3000–5000 prijava ekipa.

**Različita pitanja (Miscellaneous / Open issues):**

- Multi-tenancy škola: trenutno profesor pripada jednoj školi. Otvoreno pitanje: može li jedan profesor prijaviti ekipe za više škola istovremeno (ako predaje u 2 lokacije)? Spec §16 — odloženo.
- Soft-delete `Team`: ako admin odbije ekipu (`status='rejected'`), da li se briše ili samo arhivira? Trenutno arhivira — vidljiva u admin viewu, sakrivena u profesorovom.
- Saglasnost roditelja: trenutno boolean polje na `Student` modelu. Otvoreno: PDF upload + IP timestamp workflow — odloženo za v2.

## 4b. Fully dressed Use Case: UC8 — eDnevnik verifikacija učenika

> Sekundarni složeni UC. Pokreće ga admin iz konteksta UC7 (`<<include>>` relacija). AZLP-kritičan: svaki pristup eDnevnik podacima loguje se.

**ID i naziv:** UC8 — Verifikovati učenika kroz eDnevnik

**Cilj u kontekstu:** Sportski savez (admin) provjerava da li je učenik validan i upisan u školu u kojoj se prijavljuje, kroz integraciju sa državnim sistemom eDnevnik.

**Obim (scope):** Sistem školskog sporta CG + eDnevnik (eksterni sistem)

**Nivo (level):** Korisnički cilj (User-goal level)

**Primarni aktor:** Administrator Sportskog saveza CG

**Sekundarni aktor:** eDnevnik (eksterni državni sistem)

**Stakeholderi i interesi:**

| Stakeholder | Interes |
|---|---|
| Admin | Pouzdana automatizovana provjera bez ručnog dopisivanja sa školama. |
| Učenik | Ne diskvalifikovan zbog kanjenja papirnih provjera; vidljiv status verifikacije u svom profilu. |
| Ministarstvo prosvjete (vlasnik eDnevnika) | Pristup obrazovnim podacima maloljetnika ograničen na opravdane slučajeve, sa potpunim audit tragom. |
| AZLP | Svaki upit eDnevniku loguje se (user_id, student_id, vrijeme, razlog). Maloljetnički podaci se ne kešuju lokalno. |

**Preduslovi:**

1. Admin je prijavljen.
2. Učenik (`Student`) postoji u sistemu sa JMB-om.
3. eDnevnik API (ili mock adapter) je dostupan.
4. Sporazum sa Ministarstvom prosvjete potpisan (u dev-u — mock adapter aktivan).

**Postuslovi (success guarantee):**

1. `Student.verification_status` ažuriran u jedno od: `verified`, `mismatched`, `pending`, `failed`.
2. Audit log zapis `student.verified` ili `student.mismatched` ili `ednevnik.queried` sa request/response sažetkom.
3. Notifikacija (database channel) adminu o ishodu.
4. Ako `mismatched`: lista razlika sačuvana u `Student.verification_mismatches` (JSON).

**Trigger:** Admin klikne "Pokreni verifikaciju" na stranici `/admin/students/{student}/verify`.

**Glavni tok (Main Success Scenario — grana "verified"):**

1. Admin otvori stranicu `/admin/students/{student}/verify` iz konteksta admin liste učenika.
2. Sistem prikazuje trenutni status učenika + dugme "Pokreni verifikaciju".
3. Admin klikne dugme.
4. Sistem dispatch-uje `VerifyStudentWithEDnevnikJob` u `ednevnik` queue.
5. Queue worker poziva `EDnevnikAdapter::fetchByJmb($student->jmb)`.
6. eDnevnik API vraća JSON sa podacima: ime, prezime, datum rođenja, šifra škole, razred, status (`redovan`/`nezakazan`/`ispisan`).
7. `EDnevnikVerificationService` poredi lokalne podatke sa eDnevnik odgovorom.
8. Svi podaci se podudaraju → `Student.verification_status = 'verified'`, `Student.verified_at = now()`.
9. Audit log: `student.verified` sa hash-om eDnevnik response-a (ne čuva pun JSON zbog AZLP — samo SHA256).
10. Notifikacija adminu: "Učenik {ime} uspješno verifikovan kroz eDnevnik."

**Alternativni tokovi:**

| Tačka | Uslov | Alternativa |
|---|---|---|
| **7a** | Podaci se ne podudaraju (npr. ime u eDnevniku "Marko Marković", lokalno "Marko M.") | `Student.verification_status = 'mismatched'`. Sistem upisuje listu razlika u `Student.verification_mismatches`. Admin može manuelno potvrditi ili odbiti. Audit log: `student.mismatched`. |
| **7b** | eDnevnik vraća 404 (učenik ne postoji ili JMB nevažeći) | `Student.verification_status = 'failed'` sa razlogom "not_found". Admin obaviješten — moguće tipfeler u JMB-u ili učenik nije u eDnevniku. |
| **7c** | eDnevnik vraća 503 (privremeno nedostupan) | Job 3× exponential backoff retry. Ako svi propadnu: `Student.verification_status = 'failed'` sa razlogom "service_unavailable". Admin može pokušati ponovo kasnije. |
| **7d** | eDnevnik vraća 401 (nevažeći API ključ) | Job ne retry-uje. Critical error log + alert za DevOps. Admin vidi poruku "Konfiguracija eDnevnik integracije neispravna — kontaktirajte tehničku podršku." |
| **7e** | Rate limit prekoračen (429) | Job čeka prema `Retry-After` header-u i retry-uje. |

**Specijalni zahtjevi:**

- **AZLP kritično:** ni jedan eDnevnik response ne kešuje se lokalno. Samo SHA256 hash u audit logu (za reproducibilitet bez čuvanja PII).
- **Sigurnost:** API ključ čuva se u AWS Secrets Manager (prod) ili `.env` (dev), nikad u kodu.
- **Otpornost:** 5s timeout default, 10s za eDnevnik (državni sistem zna biti spor); circuit breaker nakon 5 uzastopnih grešaka.
- **Reproducibilitet:** mock adapter koristi deterministic odgovor po JMB-u (suma cifara JMB-a određuje "ishod") za predvidljivo testiranje.

**Tehnologija i podaci varijacije:**

- **eDnevnik adapter:** `FakeEDnevnikAdapter` (dev) ili `EDnevnikHttpAdapter` (prod, iza feature flag-a `config('services.ednevnik.driver')`).
- **Auth metoda:** API ključ u header (`X-API-Key`).
- **Format:** REST JSON.

**Učestalost pojave:** 1–5 verifikacija dnevno (admin obrađuje verifikacije batch-u kad se učenici masovno prijave za sezonu).

**Različita pitanja:**

- Sporazum sa Ministarstvom prosvjete: trenutno nepotpisan; produkcijski endpoint će biti definisan kad bude potpisan.
- Frequency-based re-verifikacija: trenutno verifikacija je one-shot. Otvoreno pitanje: treba li godišnje re-verifikovati (npr. krajem školske godine)? Spec §16 — odloženo.

---

## 5. Domain model

(Iz Projektna_analitika §3 + spec §7.)

Domain model je 11 entiteta + 7 enum-a + STI hijerarhija (User → Professor). Implementacija prati spec 1:1.

**Klasni dijagram:** vidi [`uml/01-klasni-dijagram.puml`](uml/01-klasni-dijagram.puml).

**Ključne relacije:**
- Škola 1 — * Učenik, * Profesor, * Ekipa
- Sport 1 — * Takmičenje
- Takmičenje 1 — * Ekipa, * Rezultat
- Ekipa 1 — * Član ekipe, 0..1 Rezultat
- Učenik 1 — * Ljekarska potvrda
- Korisnik 1 — * Audit log zapis

**Centralni atributi (selekcija):**
- `Student.jmb` — 13 cifara, JMB Crne Gore, koristi se za eDnevnik verifikaciju
- `MedicalCertificate.status` — enum `Pending → Valid → Expired` ili `Pending → Invalid`
- `Team.status` — enum `Draft → Submitted → Approved` ili `Draft → Submitted → Rejected`
- `Team.signature` — tekstualni potpis profesora; mora se podudarati sa `professor.name`

## 6. CRUD matrica

(Iz Projektna_analitika §4 + spec §13.)

| Entitet | Profesor | Učenik | Admin |
|---|---|---|---|
| Učenik (sopstvena škola) | R | R (samo svoj) | CRUD |
| Ekipa (sopstvena) | CRUD do Submit | R (samo svoja) | RU (approve/reject) |
| Ljekarska potvrda | CRU | R | RU |
| Takmičenje | R | R | CRUD |
| Sport | R | R | CRUD |
| Rezultat | R | R | CRUD |
| Audit log | - | - | R |
| Škola | R | R | CRUD |
| Korisnik | R (sopstveni) | R (sopstveni) | CRUD |

Detalje vidi u spec §13 (security + permissions).

## 7. AZLP usklađenost

(Iz SVD §4 + spec §13.)

- Sve obrade osjetljivih podataka (JMB, ljekarske potvrde) prolaze kroz audit log
- File storage je `private` (storage/app/private, dev) odnosno S3 sa SSE (prod)
- Encryption in transit (HTTPS only u prod)
- Right to be forgotten: van Phase 4 scope-a, polje `consent_given` postoji u učeničkom modelu

**Otvorena pitanja iz spec §16:**
- AZLP cleanup workflow (`purge-graduates`, `/profile/export`) — van Phase 4
- Saglasnost roditelja workflow — boolean polje postoji, full workflow van Phase 4
- Audit log retention — predloženo 5 godina, van scope-a

## Diff naspram originalnog izvještavanja

Šta se promijenilo u odnosu na SVD v2.1 i Projektna_analitika v3.1:

| Tema | Originalno | Implementirano | Razlog |
|---|---|---|---|
| UC8 eDnevnik | "Pravi HTTP poziv" | Fake adapter iza feature flag-a | Pravi adapter zahtjeva sporazum sa Ministarstvom prosvjete |
| OCR | "Google Vision" | FakeOcrAdapter (file-name konvencija) | Pravi Google Vision iza feature flag-a, košta novac za testiranje |
| Roditeljska saglasnost | Pomenuta kao funkcionalnost | Samo boolean polje | Van scope-a v1.0 (meta-plan §9) |
| Bulk import učenika | Spec §2 pominje | Nije implementirano | Van scope-a (meta-plan §9) |
| Sub-admin role po školi | Spomenuta moguća | Samo admin (cijeli Savez) | Van scope-a v1.0 (meta-plan §9) |
| Multi-tenancy škola | Spomenuta moguća | Single-tenant | Van scope-a v1.0 (meta-plan §9) |

## Reference

- [SVD v2.1 (original)](../fajlovi/SVD_v2.1.md)
- [Projektna analitika v3.1 (original)](../fajlovi/Projektna_analitika_v3.1.md)
- [Glavni spec §1–§7](../../specs/001-sportski-savez.md)
- [Klasni dijagram (UML)](uml/01-klasni-dijagram.puml)
- [Sequence UC5 (UML)](uml/02-sequence-uc5.puml)
- [Sljedeće poglavlje: Projekat (arhitektura + tehnologije)](02-projekat.md)
