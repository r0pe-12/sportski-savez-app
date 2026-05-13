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
