# Demo snimci

> **Pokriva:** profesorov zahtjev 4 dio (b-bis) — "snimak ekrana aplikacije u upotrebi za par UC-ova"

## Šta je u ovom direktorijumu

| Fajl | Sadržaj |
|---|---|
| [`uc5-prijava-ekipe.webm`](uc5-prijava-ekipe.webm) | Profesor login → /teams → otvara draft tim → vidi 10 članova → upload potvrde → review stranica |
| [`uc8-ednevnik-verifikacija.webm`](uc8-ednevnik-verifikacija.webm) | Admin login → /admin/students → verify page → audit log |
| [`uc10-rezultati-medalje.webm`](uc10-rezultati-medalje.webm) | Admin login → competitions → results form sa svim ekipama → public schedule |
| [`screenshots/`](screenshots/) | 24 PNG screenshot-a iz svakog koraka demoa |

Snimci su generisani **automatski preko Playwright-a** (Chromium headless, 1600×900). Skripta i fixture PDF-ovi su u [`../../../demos/`](../../../demos/).

**Format:** WebM (Playwright default). Plays in modern browsers natively, ili konvertuj u MP4 preko ffmpeg ako treba `.mp4` ekstenzija za predaju.

## Kako su snimani

```bash
# Pre-rekviziti
npm run build                                            # Vite assets
php artisan migrate && php artisan db:seed               # demo data
php artisan queue:work --queue=ocr,default &             # OCR worker (UC5)

# Run all 3 demos
python C:/Users/simon/.claude/plugins/cache/anthropic-agent-skills/document-skills/f458cee31a75/skills/webapp-testing/scripts/with_server.py \
  --server "php artisan serve --host=127.0.0.1 --port=8000" --port 8000 \
  -- python demos/run_demos.py
```

Skripta defanzivno hvata grešne selektore (screenshot na svaku grešku), pa demo poslovni tok može da se izvrši čak i kad UI nije 100% match-ovan sa očekivanjima.

## Ručno re-snimanje (ako treba bolji kvalitet)

## Alati

- **OBS Studio** (preporučeno, https://obsproject.com/) ili **Loom** (https://loom.com)
- Browser zoom 100%, full-screen
- Razlučivost 1920×1080 ili veća
- Audio: bez (samo screencast) ili kratki voiceover na crnogorskom (opciono)

## Pre-snimanja setup

1. Pokreni aplikaciju lokalno: `composer run dev`
2. Otvori `/admin/users` u jednom tab-u, pripremi login kredencijale
3. Resetuj demo data ako je potrebno: `php artisan db:seed --class=DemoSeeder` (ako postoji)
4. Provjeri da `queue:work` radi u zasebnom prozoru (UC5 OCR ne radi bez worker-a)

## Snimak 1: UC5 — Prijava ekipe (~3 min)

**Fajl:** `uc5-prijava-ekipe.mp4`

### Koraci:

1. **Login (00:00–00:15)**
   - Otvori `/login`
   - Email: `profesor1@savez.test`, Lozinka: `Prof1!Test`
   - Pokazati dashboard kao profesor

2. **Nova prijava (00:15–00:30)**
   - Klik na `/teams` → "Nova prijava ekipe"
   - Pokazati formu sa side panel hint-ovima

3. **Izbor sporta i takmičenja (00:30–00:50)**
   - Sport: "Košarka"
   - Takmičenje: bilo koje otvoreno (npr. "Pilot turnir 2026")
   - Ime ekipe: "Gimnazija X košarka 2026"
   - Submit forma → ekipa kreirana sa Status=Draft

4. **Dodavanje učenika (00:50–01:30)**
   - Klik "Dodaj učenika" 5 puta
   - Za svakog: izaberi učenika iz dropdown-a (samo iz svoje škole)
   - Pokazati da broj članova (5) je u rasponu za košarku (members_count=5)

5. **Upload ljekarskih potvrda (01:30–02:15)**
   - Za svakog učenika: klik "Upload potvrde"
   - Izabrati PDF fajl iz `tests/Fixtures/medical_certs/valid_dr_petrović.pdf` (file-name određuje fake OCR)
   - Pokazati Status: Pending → (sačekati 2-3 sek) → Valid

6. **Submit ekipe (02:15–02:45)**
   - Klik "Submit ekipu"
   - Side panel pokazuje preview: "Sve potvrde validne, broj članova OK"
   - Kucnut puno ime profesora u potpis polje (mora se podudarati sa `name`)
   - Klik "Potpiši i prijavi"
   - Pokazati uspjeh: ekipa Status=Submitted, notifikacija u zvonu

7. **Audit log dokaz (02:45–03:00)**
   - Logout
   - Login kao `admin@savez.test`
   - Otvori `/admin/audit-log`
   - Pokazati zapis `team.submitted` sa ID-jem ekipe, signature, member_count

### Voiceover (opciono):

> "Profesor se prijavljuje sa svojim kredencijalima, kreira novu ekipu za Košarka takmičenje, dodaje 5 učenika iz svoje škole, uploaduje skenirane ljekarske potvrde koje su automatski OCR-ovane i validirane, i napokon potpisuje prijavu unosom svog punog imena. Sistem provjerava da potpis odgovara registrovanom imenu profesora i tek tada mijenja status ekipe na Submitted."

## Snimak 2: UC8 — eDnevnik verifikacija (~2 min)

**Fajl:** `uc8-ednevnik-verifikacija.mp4`

### Koraci:

1. **Login kao Admin (00:00–00:10)**
   - Email: `admin@savez.test`, Lozinka: `Adm1n!Test`

2. **Lista učenika (00:10–00:30)**
   - `/admin/students` → filter "Verification Status = Unverified"
   - Pokazati listu nepotvrđenih učenika sa kolonom Status

3. **Verifikacija scenario 1 — Verified (00:30–00:55)**
   - Izaberi učenika čiji JMB pravilno parsira (npr. iz seedera `John Doe`)
   - Klik "Verifikuj kroz eDnevnik"
   - Flash poruka: "Verifikacija pokrenuta"
   - Sačekati 2 sek, refresh
   - Status: Verified (zelena oznaka)

4. **Verifikacija scenario 2 — Mismatched (00:55–01:20)**
   - Izaberi učenika čiji JMB postoji ali ime ne odgovara
   - Klik "Verifikuj"
   - Refresh
   - Status: Mismatched
   - Otvori detalje učenika → pokazati polja koja se ne podudaraju (npr. razred different)

5. **Verifikacija scenario 3 — Unavailable (01:20–01:40)**
   - Izaberi učenika sa specifičnim test JMB-om koji baca `EDnevnikUnavailableException`
   - Status: Unavailable
   - Pokazati retry opciju

6. **Audit log dokaz (01:40–02:00)**
   - `/admin/audit-log` → filter `action=student.verified`
   - Pokazati 3 zapisa sa različitim payload-ima

### Voiceover (opciono):

> "Administrator inicira verifikaciju učenika protiv eDnevnik sistema Ministarstva prosvjete. Verifikacija je asinhrona — sistem stavlja job u queue, FakeEDnevnikAdapter deterministički vraća student podatke na osnovu JMB-a, a VerificationService poredi sa lokalnim podacima. Rezultat: Verified ako se sve podudara, Mismatched ako postoji konflikt, Unavailable ako eDnevnik servis ne odgovara. Sve tri grane završavaju u audit log-u."

## Snimak 3: UC10 — Rezultati + Medalje (~2 min)

**Fajl:** `uc10-rezultati-medalje.mp4`

### Koraci:

1. **Login kao Admin (00:00–00:15)**

2. **Unos rezultata (00:15–01:00)**
   - `/admin/competitions` → izaberi takmičenje sa statusom "Closed"
   - Klik "Rezultati"
   - Za svaku ekipu: unos place (1, 2, 3...) + medal (Gold / Silver / Bronze / nullable)
   - Pokazati Points kalkulaciju (auto-izračunato iz place)
   - Save

3. **Provjera kao Student (01:00–01:45)**
   - Logout, login kao učenik iz nagrađene ekipe
   - `/profile` → "Moja istorija takmičenja"
   - Pokazati medalju (zlatna ikona) + brojač "1 zlatna medalja"
   - Klik na takmičenje → pokazati cijelu ekipu + rezultate svih ekipa

4. **Notifikacija (01:45–02:00)**
   - Zvono ikona → "Vaša ekipa je osvojila Gold medalju u Pilot turnir 2026"

### Voiceover (opciono):

> "Administrator unosi konačne rezultate takmičenja nakon završetka. Svaka ekipa dobija place i opciono medalju. Učenici iz nagrađenih ekipa odmah vide medalju na svom profilu, kao i notifikaciju u sistemu."

## Snimanje + post-processing

### OBS Studio config:

- Source: Display Capture ili Window Capture (browser)
- Recording format: MP4 (H.264)
- Bitrate: 6000 kbps (1080p), 3000 kbps (720p)
- FPS: 30

### Loom alternativa:

- Snimaj direktno u browseru kroz Loom extension
- Trim u Loom-u (skratiti pauze)
- Export kao MP4

### Veličina fajlova

Ako MP4 prevelik za git commit (> 50 MB):
- Konvertuj u GIF: `ffmpeg -i input.mp4 -vf "fps=10,scale=1280:-1" output.gif`
- Ili upload na YouTube/Loom i link u README ovdje
- Ili koristi Git LFS za MP4 fajlove

## Linkovi na izvorne UC-ove

- UC5: spec §5.5 + [sequence dijagram](../uml/02-sequence-uc5.puml)
- UC8: spec §5.8 + [sequence dijagram](../uml/03-sequence-uc8.puml)
- UC10: spec §5.10
