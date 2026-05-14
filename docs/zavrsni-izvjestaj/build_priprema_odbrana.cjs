// Generates "Priprema-za-odbranu-projekta.docx" — comprehensive defense prep doc
// Run: node build_priprema_odbrana.js

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat,
  TabStopType, TabStopPosition, BorderStyle, WidthType, ShadingType,
  TableOfContents, HeadingLevel, PageNumber, PageBreak, PositionalTab,
  PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
} = require('docx');

const OUT = path.join(__dirname, 'Priprema-za-odbranu-projekta.docx');
const UML = path.join(__dirname, 'uml', 'render');
const SHOTS = path.join(__dirname, 'demo', 'screenshots');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

// ── Helpers ──────────────────────────────────────────────────────────────
const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 120, before: 0 },
  ...opts,
  children: Array.isArray(text) ? text : [new TextRun(text)],
});

const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  pageBreakBefore: true,
  children: [new TextRun({ text, bold: true, size: 36 })],
});

const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 160 },
  children: [new TextRun({ text, bold: true, size: 28 })],
});

const H3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 220, after: 120 },
  children: [new TextRun({ text, bold: true, size: 24 })],
});

const Bullet = (text, level = 0) => new Paragraph({
  numbering: { reference: "bullets", level },
  spacing: { after: 60 },
  children: typeof text === 'string' ? [new TextRun(text)] : text,
});

const Num = (text) => new Paragraph({
  numbering: { reference: "numbers", level: 0 },
  spacing: { after: 60 },
  children: typeof text === 'string' ? [new TextRun(text)] : text,
});

const Bold = (text) => new TextRun({ text, bold: true });
const Italic = (text) => new TextRun({ text, italics: true });
const Code = (text) => new TextRun({ text, font: "Consolas", size: 20 });
const T = (text) => new TextRun(text);

const Quote = (text) => new Paragraph({
  spacing: { before: 120, after: 120 },
  indent: { left: 360 },
  border: { left: { style: BorderStyle.SINGLE, size: 12, color: "5B9BD5", space: 8 } },
  children: [new TextRun({ text, italics: true, color: "404040" })],
});

const Img = (filename, opts = {}) => {
  const filepath = path.join(UML, filename);
  if (!fs.existsSync(filepath)) {
    return P(`[MISSING IMAGE: ${filename}]`);
  }
  const data = fs.readFileSync(filepath);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200 },
    children: [new ImageRun({
      type: "png",
      data,
      transformation: { width: opts.width || 550, height: opts.height || 380 },
      altText: { title: filename, description: filename, name: filename },
    })],
  });
};

const Shot = (filename, opts = {}) => {
  const filepath = path.join(SHOTS, filename);
  if (!fs.existsSync(filepath)) {
    return P(`[MISSING SCREENSHOT: ${filename}]`);
  }
  const data = fs.readFileSync(filepath);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 160 },
    children: [new ImageRun({
      type: "png",
      data,
      transformation: { width: opts.width || 500, height: opts.height || 300 },
      altText: { title: filename, description: filename, name: filename },
    })],
  });
};

const Caption = (text) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text, italics: true, size: 18, color: "606060" })],
});

// Table builder for Q&A — single column wide answers
const CELL = (children, opts = {}) => new TableCell({
  borders,
  width: { size: opts.width || 9360, type: WidthType.DXA },
  shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
  children: Array.isArray(children) ? children : [children],
});

const TwoCol = (left, right, leftW = 2400, rightW = 6960, leftFill) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [leftW, rightW],
  rows: [new TableRow({
    children: [
      CELL(left, { width: leftW, fill: leftFill }),
      CELL(right, { width: rightW }),
    ],
  })],
});

const QA = (q, short, detailed) => [
  new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({ text: "❓ ", size: 22 }),
      new TextRun({ text: q, bold: true, size: 24, color: "1F4E79" }),
    ],
  }),
  new Paragraph({
    spacing: { after: 80 },
    indent: { left: 200 },
    children: [
      new TextRun({ text: "Kratko: ", bold: true, color: "385723" }),
      new TextRun({ text: short }),
    ],
  }),
  new Paragraph({
    spacing: { after: 160 },
    indent: { left: 200 },
    children: [
      new TextRun({ text: "Detaljno: ", bold: true, color: "9C5700" }),
      new TextRun({ text: detailed }),
    ],
  }),
];

// ── Numbering config ─────────────────────────────────────────────────────
const numbering = {
  config: [
    {
      reference: "bullets",
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
      ],
    },
    {
      reference: "numbers",
      levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ],
    },
  ],
};

// ── Styles ───────────────────────────────────────────────────────────────
const styles = {
  default: {
    document: { run: { font: "Calibri", size: 22 } },
  },
  paragraphStyles: [
    {
      id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 36, bold: true, font: "Calibri", color: "1F4E79" },
      paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
    },
    {
      id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 28, bold: true, font: "Calibri", color: "2E75B6" },
      paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
    },
    {
      id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 24, bold: true, font: "Calibri", color: "404040" },
      paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 2 },
    },
  ],
};

// ──────────────────────────────────────────────────────────────────────────
// CONTENT
// ──────────────────────────────────────────────────────────────────────────

const cover = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 200 },
    children: [new TextRun({ text: "PRIPREMA ZA ODBRANU PROJEKTA", bold: true, size: 48, color: "1F4E79" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
    children: [new TextRun({ text: "Sistem školskog sporta Crne Gore", size: 36, color: "404040" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: "Sveobuhvatna Q&A i materijal za 15-minutnu odbranu", italics: true, size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 100 },
    children: [new TextRun({ text: "Predmet: Analiza i dizajn informacionih sistema (ADIS)", size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
    children: [new TextRun({ text: "Univerzitet Donja Gorica", size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
    children: [new TextRun({ text: "Autor: Petar Simonović", size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
    children: [new TextRun({ text: "Datum: 14. maj 2026", size: 22 })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── Sadržaj ──────────────────────────────────────────────────────────────
const toc = [
  new Paragraph({
    spacing: { after: 240 },
    children: [new TextRun({ text: "Sadržaj", bold: true, size: 36, color: "1F4E79" })],
  }),
  new TableOfContents("Sadržaj", { hyperlink: true, headingStyleRange: "1-3" }),
];

// ──────────────────────────────────────────────────────────────────────────
// FORMAT ISPITA
// ──────────────────────────────────────────────────────────────────────────
const formatIspita = [
  H1("0. Format ispita i strategija"),
  P("Ispit je odbrana projekta — 15 minuta po timu, raspodjela:"),
  Bullet([Bold("5 minuta prezentacija"), T(" demo verzije projekta — vodiš kontrolu, biraš šta ćeš pokazati.")]),
  Bullet([Bold("10 minuta profesorova pitanja"), T(" — kroz pitanja se mogu provući teorijska pitanja (UML, OOAD, V&V, SDLC, AZLP).")]),
  H2("Strategija prezentacije (5 min)"),
  Num([Bold("Problem (30s):"), T(" \"Sportski savez CG vodi školska takmičenja na papiru — gubici, sporo, nema audita maloljetnika.\"")]),
  Num([Bold("Rješenje (45s):"), T(" \"Web sistem sa 3 uloge + eDnevnik integracija. Profesor prijavljuje ekipe, Učenik gleda profil, Admin vodi raspored.\"")]),
  Num([Bold("Centralni UC5 demo uživo (1.5 min):"), T(" bira sport → dodaje učenike → upload potvrda → OCR validira → potpis → submit.")]),
  Num([Bold("Arhitektura (1 min):"), T(" Laravel monolit + Inertia + React 19. 4 sloja. Adapter pattern za eksterne servise.")]),
  Num([Bold("AZLP i audit log (45s):"), T(" \"Svaka write akcija ide u audit_log. Append-only — čak ni admin ne može da briše.\"")]),
  Num([Bold("Zatvori sa dnevnikom (30s):"), T(" \"21 sesija rada sa AI je evidentirana u tabeli ai_dnevnik_sesije — to je audit trag samog SDLC-a.\"")]),
  H2("Strategija za Q&A (10 min)"),
  Bullet("Ako pitanje znaš odlično — kreni od kratkog odgovora, pa proširi tek ako profesor traži više."),
  Bullet("Ako pitanje ne znaš tačno — počni od onoga što znaš (\"U principu, ovo je problem X kategorije...\") i navedi sopstveno razmišljanje."),
  Bullet("Nikad ne izmišljaj. Ako ne znaš — reci \"To nismo eksplicitno implementirali, ali pravilno rješenje bi bilo...\""),
  Bullet("Pominji konkretne fajlove iz koda (app/Services/TeamRegistrationService.php) — to pokazuje da znaš implementaciju, ne samo papir."),
  Bullet("Spec i meta-plan su tvoji glavni izvori istine — možeš ih otvoriti na sajtu ako profesor produbi."),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 1: VIZIJA I ANALIZA
// ──────────────────────────────────────────────────────────────────────────
const glava1 = [
  H1("1. Vizija i analiza sistema"),
  H2("1.1 Problem"),
  P("Sportski savez Crne Gore organizuje školska sportska takmičenja, ali se cjelokupan proces prijave i evidencije odvija na papiru. Posljedice:"),
  Bullet("Spor i nepouzdan ručni proces — gubici dokumenata, sporo provjeravanje ljekarskih potvrda."),
  Bullet("Nepostojanje centralne evidencije učesnika, rezultata i istorije takmičenja."),
  Bullet("Nedostatak tragova obrade osjetljivih podataka maloljetnika (AZLP rizik)."),
  H2("1.2 Rješenje"),
  P("Centralizovan web informacioni sistem sa tri uloge i jednim eksternim sistemom:"),
  Bullet([Bold("Profesor"), T(" — prijavljuje ekipu uz upload ljekarskih potvrda.")]),
  Bullet([Bold("Učenik"), T(" — pristupa svom profilu i istoriji takmičenja.")]),
  Bullet([Bold("Administrator (Savez)"), T(" — upravlja sistemom, rasporedom i unosi rezultate.")]),
  Bullet([Bold("eDnevnik (eksterni)"), T(" — verifikacija statusa učenika.")]),
  P("Sistem automatski OCR-uje ljekarske potvrde, vodi centralnu evidenciju i raspored takmičenja, šalje notifikacije i bilježi sve akcije u nepromjenljiv audit log radi AZLP usklađenosti."),
  H2("1.3 Stakeholderi"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Stakeholder")] })], { width: 3000, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Interes")] })], { width: 6360, fill: "D5E8F0" }),
      ]}),
      new TableRow({ children: [
        CELL([P("Sportski savez CG")], { width: 3000 }),
        CELL([P("Centralno upravljanje takmičenjima i evidencija školskog sporta.")], { width: 6360 }),
      ]}),
      new TableRow({ children: [
        CELL([P("Profesor")], { width: 3000 }),
        CELL([P("Brza i pouzdana prijava ekipa bez papirne administracije.")], { width: 6360 }),
      ]}),
      new TableRow({ children: [
        CELL([P("Učenik (i roditelj)")], { width: 3000 }),
        CELL([P("Tačan profil i transparentan uvid u obradu ličnih podataka.")], { width: 6360 }),
      ]}),
      new TableRow({ children: [
        CELL([P("AZLP (regulator)")], { width: 3000 }),
        CELL([P("Usklađenost sa Zakonom o zaštiti podataka maloljetnika.")], { width: 6360 }),
      ]}),
    ],
  }),
  H2("1.4 Obim sistema (scope)"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("U OBIMU ✓")] })], { width: 4680, fill: "D5F0DD" }),
        CELL([new Paragraph({ children: [Bold("VAN OBIMA ✗")] })], { width: 4680, fill: "F0D5D5" }),
      ]}),
      new TableRow({ children: [
        CELL([
          Bullet("Web aplikacija sa 3 uloge"),
          Bullet("Digitalna prijava ekipa + OCR potvrda"),
          Bullet("Profili učenika sa istorijom"),
          Bullet("Raspored + katalog sportova"),
          Bullet("Notifikacije i audit log"),
          Bullet("eDnevnik integracija (mock prvo)"),
          Bullet("AZLP usklađenost"),
        ], { width: 4680 }),
        CELL([
          Bullet("Mobilna aplikacija"),
          Bullet("Plaćanja kotizacija"),
          Bullet("Live streaming takmičenja"),
          Bullet("Pravna validacija medicinskog sadržaja"),
          Bullet("Sportski rezultati van škole"),
          Bullet("Bulk import učenika"),
          Bullet("API za treća lica"),
        ], { width: 4680 }),
      ]}),
    ],
  }),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 2: AKTERI I UC KATALOG
// ──────────────────────────────────────────────────────────────────────────
const glava2 = [
  H1("2. Akteri i Use Case katalog"),
  H2("2.1 Akteri"),
  Bullet([Bold("Profesor"), T(" (primarni) — registracija ekipa, upravljanje sopstvenim profilom.")]),
  Bullet([Bold("Učenik"), T(" (primarni) — read-only pregled svog profila i istorije.")]),
  Bullet([Bold("Administrator"), T(" (primarni) — globalno upravljanje sistemom.")]),
  Bullet([Bold("eDnevnik"), T(" (eksterni sistem) — izvor verifikacije statusa učenika.")]),
  Bullet([Bold("Sistem (interni)"), T(" — nosilac automatskih akcija (OCR, audit log, notifikacije).")]),
  H2("2.2 Use Case katalog — 10 UC-ova"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [600, 2500, 1900, 4360],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("ID")] })], { width: 600, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Naziv")] })], { width: 2500, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Aktor")] })], { width: 1900, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Opis")] })], { width: 4360, fill: "D5E8F0" }),
      ]}),
      ...[
        ["UC1", "Registracija", "Profesor / Učenik", "Korisnik kreira nalog uz osnovne lične podatke i podatke o školi."],
        ["UC2", "Prijava na sistem", "Svi", "Autentifikacija kredencijalima; sistem bilježi audit zapis."],
        ["UC3", "Pregled profila i istorije", "Profesor / Učenik", "Pregled ličnih podataka, vođenih timova, takmičenja, rezultata, medalja."],
        ["UC4", "Pregled rasporeda", "Profesor / Učenik", "Read-only pristup centralnom kalendaru takmičenja."],
        ["UC5", "Prijava ekipe na takmičenje ⭐", "Profesor", "CENTRALNI UC. Profesor formira ekipu, dodaje učenike, uploaduje potvrde, potpisuje."],
        ["UC6", "OCR validacija potvrde", "Sistem (interni)", "Automatska ekstrakcija datuma i imena. <<include>> u UC5."],
        ["UC7", "Upravljanje korisnicima i školama", "Administrator", "CRUD nad nalozima i školama; verifikacija kroz eDnevnik."],
        ["UC8", "Verifikacija učenika (eDnevnik)", "Administrator", "Provjera statusa učenika kroz državni sistem. <<include>> u UC7."],
        ["UC9", "Upravljanje sportovima i rasporedom", "Administrator", "Katalog sportova (timski/individualni) i kalendar takmičenja."],
        ["UC10", "Unos rezultata", "Administrator", "Plasmani i medalje; razlikuje timske od individualnih sportova."],
      ].map(([id, naziv, aktor, opis]) => new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold(id)] })], { width: 600 }),
        CELL([P(naziv)], { width: 2500 }),
        CELL([P(aktor)], { width: 1900 }),
        CELL([P(opis)], { width: 4360 }),
      ]})),
    ],
  }),
  H2("2.3 Ključne UC veze"),
  P([Bold("UC5 <<include>> UC6:"), T(" svaki put kad profesor uploaduje ljekarsku potvrdu u UC5, OCR pipeline (UC6) se automatski pokreće. Include znači OBAVEZAN poziv.")]),
  P([Bold("UC7 <<include>> UC8:"), T(" admin pokreće eDnevnik verifikaciju iz konteksta upravljanja korisnicima.")]),
  P([Italic("Razlika od <<extend>>: extend je opcioni proširak (npr. UC \"Recover password\" extends UC2 Login). Include je obavezan poziv.")]),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 3: DOMAIN MODEL
// ──────────────────────────────────────────────────────────────────────────
const glava3 = [
  H1("3. Domain model (klasni dijagram)"),
  P("Domain model definiše entitete i njihove veze. U Laravelu su to Eloquent modeli u app/Models/."),
  Img("01-klasni-dijagram.png", { width: 600, height: 420 }),
  Caption("Slika 3.1: Klasni dijagram domena (generisan iz app/Models/)"),
  H2("3.1 Entiteti"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2600, 6760],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Entitet")] })], { width: 2600, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Opis")] })], { width: 6760, fill: "D5E8F0" }),
      ]}),
      ...[
        ["Korisnik (User)", "Apstraktna nadklasa — generalizacija za Profesora, Učenika, Administratora. Implementirano kao Single Table Inheritance (users + role enum)."],
        ["Profesor", "Korisnik koji prijavljuje ekipe. Pripada školi. Ima verified_at (može kreirati ekipe tek kad ga admin verifikuje)."],
        ["Učenik (Student)", "Korisnik sa profilom, fotografijom, istorijom. Ima verification_status iz eDnevnika."],
        ["Administrator", "Korisnik bez vezivanja za školu; globalna prava."],
        ["Škola (School)", "Obrazovna ustanova. Sadrži profesore i učenike. school_code = OS-PG-001 format."],
        ["Sport", "Naziv + tip (TIMSKI/INDIVIDUALNI) + pravila (broj članova). Tip je immutable!"],
        ["Takmičenje (Competition)", "Konkretan događaj — sport + datum + lokacija."],
        ["Ekipa (Team)", "Prijava na takmičenje. Veže Profesora + Takmičenje + Sport. Ima status (draft/submitted/active/...)."],
        ["Član ekipe (TeamMember)", "Asocijativna klasa između Učenika i Ekipe — ima sopstvenu ljekarsku potvrdu po prijavi."],
        ["Ljekarska potvrda (MedicalCertificate)", "Fajl + metapodaci (datum izdavanja, isteka, ime sa potvrde, OCR status)."],
        ["Rezultat (Result)", "Plasman/medalja. POLIMORFAN — vezuje se za Ekipu (timski) ILI za ČlanEkipe (individualni)."],
        ["Audit log entry", "Append-only zapis svake write akcije."],
      ].map(([entitet, opis]) => new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold(entitet)] })], { width: 2600 }),
        CELL([P(opis)], { width: 6760 }),
      ]})),
    ],
  }),
  H2("3.2 Ključne odluke u modelovanju"),
  H3("Single Table Inheritance (STI) za Korisnika"),
  P([Bold("Implementacija:"), T(" jedna tabela users + role enum kolona + nullable atributi specifični za rolu (npr. school_id samo za Profesora i Učenika).")]),
  P([Bold("Zašto STI a ne 3 zasebne tabele?"), T(" Fortify očekuje jednu users tabelu sa jednim email/password setom. Tri zasebne tabele bi tražile custom user provider za svaku rolu — komplikacija bez koristi.")]),
  H3("Asocijativna klasa TeamMember"),
  P([Bold("Pitanje:"), T(" Zašto TeamMember kao zasebna klasa, a ne direktna M:N veza Team-Student?")]),
  P([Bold("Odgovor:"), T(" Ljekarska potvrda nije svojstvo učenika — vezana je za konkretnu prijavu. Učenik može imati različite potvrde za različita takmičenja. Da je MedicalCertificate direktno na Student, kad učenik ažurira potvrdu, ne bismo znali za koju prijavu se odnosi. TeamMember rješava ovo — to je asocijativna klasa sa sopstvenim atributima.")]),
  H3("Polimorfna asocijacija — Result"),
  P([Bold("Rezultat"), T(" se vezuje za Team (timski sport) ILI TeamMember (individualni), nikad oba. U bazi: subject_type + subject_id kolone.")]),
  P([Bold("Primjer:"), T(" Atletika je individualni — medalja ide pojedincu (TeamMember). Košarka je timski — medalja ide ekipi (Team). Bez polimorfizma trebale bi dvije tabele.")]),
  H3("Soft delete za Sport"),
  P([Bold("Sport"), T(" se NIKAD ne briše fizički — samo deaktivira (deleted_at timestamp). Razlog: čuvanje integriteta istorijskih rezultata (rezultat iz 2024. za košarku mora ostati validan i kad košarka kao sport bude deaktivirana 2030.).")]),
  H2("3.3 Ključne relacije"),
  Bullet("Škola 1—N Korisnik (Profesor, Učenik)"),
  Bullet("Profesor 1—N Ekipa"),
  Bullet("Sport 1—N Takmičenje"),
  Bullet("Takmičenje 1—N Ekipa"),
  Bullet("Ekipa N—M Učenik kroz TeamMember (asocijativna klasa)"),
  Bullet("TeamMember 1—1 LjekarskaPotvrda"),
  Bullet("Rezultat morphs to (Ekipa | TeamMember)"),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 4: ARHITEKTURA
// ──────────────────────────────────────────────────────────────────────────
const glava4 = [
  H1("4. Arhitektura sistema"),
  H2("4.1 Slojevi (4-layer arhitektura)"),
  Img("04-component-dijagram.png", { width: 600, height: 400 }),
  Caption("Slika 4.1: Komponentni dijagram — 4 sloja arhitekture"),
  P("Laravel monolit sa 4 jasno razdvojena sloja:"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 6960],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Sloj")] })], { width: 2400, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Odgovornosti")] })], { width: 6960, fill: "D5E8F0" }),
      ]}),
      new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold("HTTP sloj")] })], { width: 2400 }),
        CELL([P("Controller-i (app/Http/Controllers/), Form Request klase, API Resource, Middleware. Odgovor na HTTP zahtjeve. Validacija ulaza.")], { width: 6960 }),
      ]}),
      new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold("Application sloj")] })], { width: 2400 }),
        CELL([P("Service klase (app/Services/). Sadrži biznis logiku — TeamRegistrationService, EDnevnikVerificationService, ResultEntryService, AuditLogger.")], { width: 6960 }),
      ]}),
      new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold("Domain sloj")] })], { width: 2400 }),
        CELL([P("Eloquent modeli (app/Models/), Enum-i, Value object-i, Policy klase. NEZAVISAN — ne smije zavisiti od Service-a ili Repository-ja.")], { width: 6960 }),
      ]}),
      new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold("Infrastructure sloj")] })], { width: 2400 }),
        CELL([P("Adapter klase za eksterne sisteme (app/Adapters/Ocr/, app/Adapters/EDnevnik/). Storage, queue, cache implementacije.")], { width: 6960 }),
      ]}),
    ],
  }),
  H3("Pravila slojevitosti"),
  Bullet([Bold("HTTP → Application:"), T(" Controller-i pozivaju Service-e, NE direktno modele ili adaptere.")]),
  Bullet([Bold("Application → Domain + Infrastructure:"), T(" Service-i koriste modele i adaptere.")]),
  Bullet([Bold("Domain je nezavisan:"), T(" modeli i value objekti ne smiju zavisiti od Service-a, Repository-ja ili Controller-a.")]),
  Bullet([Bold("Infrastructure → Domain:"), T(" Adapter-i koriste modele kao return type, ali nemaju biznis logiku.")]),
  H2("4.2 Paketi (Laravel struktura)"),
  Img("05-package-dijagram.png", { width: 580, height: 400 }),
  Caption("Slika 4.2: Paket dijagram — Laravel struktura projekta"),
  H2("4.3 Deployment dijagram"),
  Img("06-deployment-dijagram.png", { width: 600, height: 400 }),
  Caption("Slika 4.3: Deployment — Laravel Cloud (produkcija) + lokalni dev"),
  H2("4.4 Ključne arhitektonske odluke"),
  H3("Monolit umjesto microservisa"),
  P([Bold("Zašto:"), T(" broj korisnika nije veliki (par hiljada profesora + učenika). Microservisi imaju distributed transactions, service discovery, network failures — sve to bi povećalo bug surface bez koristi za ovaj scope.")]),
  P([Bold("Trade-off:"), T(" monolit je manje skalabilan horizontalno, ali queue worker-i (OCR, eDnevnik) daju vertikalnu skalabilnost koja je dovoljna.")]),
  H3("Inertia.js most umjesto čistog REST API + React SPA"),
  P([Bold("Zašto:"), T(" Inertia eliminiše duplikat (API resource klase + frontend types) i zadržava SPA UX. Server-side routing kroz Laravel rute, server-side validacija, ali React komponente za UI.")]),
  P([Bold("Korist:"), T(" nema potrebe za API tokenima (session auth radi), Wayfinder auto-generiše TS funkcije za rute — type safety bez ručnog održavanja.")]),
  H3("Adapter pattern za eksterne servise"),
  P([Bold("EDnevnikAdapter interface"), T(" → 2 implementacije: FakeEDnevnikAdapter (deterministic by JMB) i (kasnije) EDnevnikHttpAdapter.")]),
  P([Bold("OcrAdapter interface"), T(" → 2 implementacije: FakeOcrAdapter (file-name konvencija) i (kasnije) GoogleVisionAdapter.")]),
  P([Bold("Korist:"), T(" testovi koriste Fake (nema network call-a, deterministični su); produkcija HTTP. Switch iza feature flag-a (config('services.ocr.driver')) — bez ikakve promjene Service-a.")]),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 5: UC1-UC10 DETALJNO
// ──────────────────────────────────────────────────────────────────────────
const glava5 = [
  H1("5. Detaljan opis svih Use Case-ova"),
  P("Svaki UC opisan je sa: aktor, preduslovi, glavni tok, alternative i tehnička implementacija u kodu."),

  // UC1
  H2("UC1 — Registracija"),
  P([Bold("Aktor:"), T(" Profesor ili Učenik")]),
  P([Bold("Trigger:"), T(" Korisnik klikne \"Registracija\" na login stranici")]),
  P([Bold("Preduslovi:"), T(" Nije ulogovan")]),
  P([Bold("Postuslovi:"), T(" Kreiran User zapis sa role enum-om, email verification poslat")]),
  H3("Glavni tok"),
  Num("Korisnik popunjava formu: ime, prezime, email, password, role, school_id (ako Profesor/Učenik)"),
  Num("Sistem validira (jedinstvenost email-a, password policy, school existencija)"),
  Num("INSERT u users tabelu sa odgovarajućom role"),
  Num("Slanje email verifikacije (Fortify default)"),
  Num("Audit log: action = user.created"),
  P([Bold("Implementacija:"), T(" app/Actions/Fortify/CreateNewUser.php (Fortify custom action), config/fortify.php")]),

  // UC2
  H2("UC2 — Prijava na sistem"),
  P([Bold("Aktor:"), T(" Svi (Profesor, Učenik, Administrator)")]),
  P([Bold("Trigger:"), T(" Korisnik unosi email + password na /login")]),
  H3("Glavni tok"),
  Num("Korisnik unosi kredencijale"),
  Num("Fortify provjerava kroz default Laravel auth driver"),
  Num("Pri uspjehu: redirect na /dashboard (DashboardController detektuje role pa prikaže odgovarajući panel)"),
  Num("Audit log: action = auth.login_success / auth.login_failed"),
  H3("Alternative"),
  Bullet("Pogrešni kredencijali → throttle (Fortify limit), error poruka, audit log auth.login_failed"),
  Bullet("Email nije verifikovan → ne dozvoljava login (verified middleware)"),
  Bullet("2FA omogućena (opciono) → traži TOTP kod"),
  P([Bold("Implementacija:"), T(" Fortify rute (auto), DashboardController@index")]),

  // UC3
  H2("UC3 — Pregled profila i istorije"),
  P([Bold("Aktor:"), T(" Profesor ili Učenik")]),
  H3("Glavni tok (Učenik)"),
  Num("Učenik klikne \"Profil\" → GET /profile"),
  Num("StudentProfileController@showOwn vraća: lične podatke, fotografiju, listu ekipa, listu rezultata, medalje"),
  Num("Inertia render → React komponenta resources/js/pages/students/profile.tsx"),
  H3("Glavni tok (Profesor)"),
  Num("Profesor klikne na učenika iz svoje ekipe → GET /students/{student}"),
  Num("Policy provjera: učenik mora biti iz iste škole kao profesor"),
  Num("Prikaz profila sa scope-ovanim podacima (Profesor ne vidi sve)"),
  P([Bold("Implementacija:"), T(" StudentProfileController, StudentHistoryService (sastavlja istoriju iz Team + Result tabela)")]),

  // UC4
  H2("UC4 — Pregled rasporeda"),
  P([Bold("Aktor:"), T(" Svi (Profesor, Učenik, public)")]),
  H3("Glavni tok"),
  Num("Korisnik klikne \"Raspored\" → GET /schedule"),
  Num("ScheduleController@index dohvata Competition sa eager loadanim Sport-om"),
  Num("Filterovanje: aktivna takmičenja (registracija otvorena), prošla, predstojeća"),
  Num("Inertia render → React komponenta sa filter UI-jem"),
  P([Bold("Implementacija:"), T(" ScheduleController, Competition model")]),
  P([Italic("Napomena: raspored je read-only za sve role osim admina (UC9 mijenja).")]),

  // UC5 — CENTRALNI
  H2("UC5 ⭐ — Prijava ekipe na takmičenje (CENTRALNI UC)"),
  P([Bold("Aktor:"), T(" Profesor")]),
  P([Bold("Preduslovi:"), T(" Profesor je prijavljen i verifikovan; učenici registrovani; sport i takmičenje postoje.")]),
  P([Bold("Postuslovi:"), T(" Ekipa registrovana; potvrde pohranjene i validirane; notifikacija poslata.")]),
  Img("02-sequence-uc5.png", { width: 620, height: 440 }),
  Caption("Slika 5.1: Sekvencni dijagram UC5 — Prijava ekipe sa OCR pipeline-om"),
  H3("Glavni tok (8 koraka)"),
  Num("Profesor pristupa formi → GET /teams/create"),
  Num("Sistem prikazuje katalog sportova → profesor bira sport"),
  Num("Sistem prikazuje pravila sporta (tip: timski/individualni, broj članova)"),
  Num("Profesor dodaje učenika → POST /teams/{team}/members"),
  Num("Profesor uploaduje ljekarsku potvrdu → POST /teams/{team}/members/{member}/certificate"),
  Num("UC6 OCR pipeline: ValidateMedicalCertificateJob u queue → FakeOcrAdapter → status valid/expired/invalid"),
  Num("Koraci 4–6 ponavljaju se za svakog člana"),
  Num("Profesor potpisuje → POST /teams/{team}/submit (puno ime mora odgovarati registrovanom)"),
  H3("Alternative"),
  Bullet([Bold("5a — Potvrda istekla/nevalidna:"), T(" sistem signalizira; profesor uploaduje novu (state: superseded za staru)")]),
  Bullet([Bold("5b — OCR ne uspijeva:"), T(" status manual_review; admin manuelno odobrava")]),
  Bullet([Bold("7a — Potpis ne odgovara imenu:"), T(" odbija, traži ponovni unos")]),
  H3("Tehničke detalji"),
  P([Bold("Service:"), T(" app/Services/TeamRegistrationService.php — orkestrira transition draft → submitted")]),
  P([Bold("State preduslov:"), T(" svi članovi moraju imati medical_certificate.status = valid prije submit-a")]),
  P([Bold("Audit log:"), T(" team.created, team_member.added, certificate.uploaded, team.submitted")]),
  P([Bold("Notifikacija:"), T(" SendTeamSubmittedNotification (queue), Profesor + Admin")]),
  H3("Screenshots iz aplikacije"),
  Shot("uc5-01-teams-list.png"),
  Caption("Slika 5.2: Lista ekipa (profesorski dashboard)"),
  Shot("uc5-02-team-edit.png"),
  Caption("Slika 5.3: Forma za uređivanje ekipe — dodavanje članova"),
  Shot("uc5-03-cert-uploaded-pending.png"),
  Caption("Slika 5.4: Potvrda uploadovana, status pending (čeka OCR)"),
  Shot("uc5-04-after-ocr.png"),
  Caption("Slika 5.5: Nakon OCR-a — status valid + ekstrahovani datum isteka"),
  Shot("uc5-05-review-page.png"),
  Caption("Slika 5.6: Review stranica prije submit-a"),

  // UC6
  H2("UC6 — OCR validacija potvrde"),
  P([Bold("Aktor:"), T(" Sistem (interni) — <<include>> u UC5")]),
  P([Bold("Trigger:"), T(" Upload ljekarske potvrde u UC5 korak 5")]),
  H3("Glavni tok"),
  Num("ValidateMedicalCertificateJob dispatch-uje se u queue 'ocr'"),
  Num("Worker uzima job, poziva OcrAdapter::extract($filePath)"),
  Num("FakeOcrAdapter (dev) parsira datum iz file-name-a: ime_prezime_2026-12-31.pdf"),
  Num("Sistem poredi: datum isteka > danas? ime se poklapa sa učenikom?"),
  Num("Postavlja medical_certificate.status: valid / expired / invalid / manual_review"),
  Num("Notifikacija: cert-validated ili cert-invalid (queue)"),
  Num("Audit log: certificate.ocr_completed"),
  P([Bold("Implementacija:"), T(" app/Adapters/Ocr/, app/Services/MedicalCertificateStateMachine.php")]),
  P([Italic("Trade-off: Fake adapter je deterministički za demo. Produkcijski GoogleVisionAdapter ide iza feature flag-a.")]),

  // UC7
  H2("UC7 — Upravljanje korisnicima i školama"),
  P([Bold("Aktor:"), T(" Administrator")]),
  H3("CRUD nad korisnicima"),
  Num("Admin → /admin/users → lista svih korisnika sa filterima (role, škola, status)"),
  Num("Create: forma sa email, password, role, school_id"),
  Num("Update: izmjena podataka, role change (uz audit log)"),
  Num("Delete: soft delete + AZLP cleanup procedura"),
  H3("CRUD nad školama"),
  Num("Admin → /admin/schools → lista, create, edit, delete"),
  Num("School validacija: jedinstveni school_code (format OS-PG-001)"),
  P([Bold("Implementacija:"), T(" app/Http/Controllers/Admin/UserController.php, SchoolController.php")]),

  // UC8
  H2("UC8 — Verifikacija učenika kroz eDnevnik"),
  P([Bold("Aktor:"), T(" Administrator — <<include>> u UC7")]),
  Img("03-sequence-uc8.png", { width: 620, height: 440 }),
  Caption("Slika 5.7: Sekvencni dijagram UC8 — eDnevnik verifikacija"),
  H3("Glavni tok"),
  Num("Admin → /admin/students/{student}/verify (GET)"),
  Num("Admin klikne \"Pokreni verifikaciju\" → POST /admin/students/{student}/verify"),
  Num("EDnevnikVerificationService::verify($student) → EDnevnikAdapter::fetchByJmb($jmb)"),
  Num("FakeEDnevnikAdapter (dev) vraća deterministic objekat na osnovu JMB seed-a"),
  Num("Service poredi lokalne podatke sa eDnevnik odgovorom"),
  H3("Ishodi (3 stanja)"),
  Bullet([Bold("Match (svi podaci se poklapaju):"), T(" status = verified, audit log student.verified")]),
  Bullet([Bold("Mismatch (postoje razlike):"), T(" status = mismatched + lista razlika; admin manuelno odlučuje")]),
  Bullet([Bold("Failed (eDnevnik nedostupan ili učenik ne postoji):"), T(" status = failed, retry moguć")]),
  P([Bold("AZLP zahtjev:"), T(" svaki pristup eDnevniku se loguje (action = ednevnik.queried), čak i ako match-uje.")]),
  H3("Screenshots iz aplikacije"),
  Shot("uc8-01-students-list.png"),
  Caption("Slika 5.8: Admin lista učenika sa statusom verifikacije"),
  Shot("uc8-02-verify-page.png"),
  Caption("Slika 5.9: Stranica za pokretanje verifikacije"),
  Shot("uc8-04-after-queue.png"),
  Caption("Slika 5.10: Nakon obrade — status verified ili mismatched"),
  Shot("uc8-05-audit-log.png"),
  Caption("Slika 5.11: Audit log zapis nakon verifikacije"),

  // UC9
  H2("UC9 — Upravljanje sportovima i rasporedom"),
  P([Bold("Aktor:"), T(" Administrator")]),
  H3("CRUD nad sportovima"),
  Num("Admin → /admin/sports → lista, create, edit, deactivate"),
  Num("Sport ima: naziv, slug, type (TEAM/INDIVIDUAL), rules (min/max članova)"),
  Num("Sport NE BRIŠE se fizički — samo deaktivira (soft delete) zbog istorijskih rezultata"),
  H3("CRUD nad takmičenjima"),
  Num("Admin → /admin/competitions → lista, create, edit, delete"),
  Num("Competition: sport_id, datum, lokacija, slug"),
  Num("Validacija: datum mora biti u budućnosti ako se kreira novo"),
  P([Bold("Implementacija:"), T(" SportController, CompetitionController u app/Http/Controllers/Admin/")]),

  // UC10
  H2("UC10 — Unos rezultata"),
  P([Bold("Aktor:"), T(" Administrator")]),
  P([Bold("Trigger:"), T(" Takmičenje završeno, admin unosi konačne rezultate")]),
  H3("Glavni tok"),
  Num("Admin → /admin/competitions/{competition}/results"),
  Num("Sistem dohvata sve aktivne ekipe na tom takmičenju"),
  Num("Forma za unos plasmana po ekipi (timski) ili po članu (individualni)"),
  Num("Sistem detektuje tip sporta i prikazuje odgovarajuću formu"),
  Num("Submit → ResultEntryService kreira Result zapise sa polimorfnom asocijacijom"),
  Num("Sistem postavlja Team.status = completed"),
  Num("Notifikacija: SendResultEnteredNotification svim učesnicima"),
  Num("Audit log: result.created za svaki rezultat"),
  H3("Razlika timski vs individualni"),
  Bullet([Bold("Timski sport (košarka):"), T(" jedna medalja po ekipi → Result morphs to Team")]),
  Bullet([Bold("Individualni sport (atletika):"), T(" medalja po članu → Result morphs to TeamMember")]),
  P([Bold("Implementacija:"), T(" app/Services/ResultEntryService.php, ResultController u Admin/")]),
  H3("Screenshots iz aplikacije"),
  Shot("uc10-01-competitions-list.png"),
  Caption("Slika 5.12: Admin lista takmičenja"),
  Shot("uc10-02-results-form.png"),
  Caption("Slika 5.13: Forma za unos rezultata"),
  Shot("uc10-03-results-filled.png"),
  Caption("Slika 5.14: Popunjeni rezultati prije submita"),
  Shot("uc10-04-submitted.png"),
  Caption("Slika 5.15: Nakon unosa — rezultati javno vidljivi"),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 6: STATE DIJAGRAMI
// ──────────────────────────────────────────────────────────────────────────
const glava6 = [
  H1("6. State dijagrami"),
  P("Tri entiteta imaju netrivijalan lifecycle. Stanja se čuvaju u eksplicitnoj status koloni (string enum), NE kao bool flagovi."),
  P([Bold("Zašto explicit status a ne bool flagovi?"), T(" Bool flagovi (is_active, is_completed, is_cancelled) ne sprečavaju nemoguća stanja (is_active=true AND is_cancelled=true). Enum status garantuje da entitet ima TAČNO JEDNO stanje u svakom trenutku.")]),

  H2("6.1 Team (Ekipa) — registracija lifecycle"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1700, 4000, 3660],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Stanje")] })], { width: 1700, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Opis")] })], { width: 4000, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Dozvoljeni prelazi")] })], { width: 3660, fill: "D5E8F0" }),
      ]}),
      ...[
        ["draft", "Profesor počeo prijavu, ekipa nije potpisana", "submitted, cancelled"],
        ["submitted", "Potpisana, čeka da admin odobri", "active, rejected, cancelled"],
        ["active", "Odobrena za učešće na takmičenju", "completed, withdrawn"],
        ["rejected", "Admin odbio (npr. nevalidna škola)", "(terminalno)"],
        ["cancelled", "Profesor povukao prije submit-a", "(terminalno)"],
        ["withdrawn", "Ekipa se povukla sa aktivnog takmičenja", "(terminalno)"],
        ["completed", "Takmičenje završeno, rezultati uneseni", "(terminalno)"],
      ].map(([stanje, opis, prelazi]) => new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold(stanje)] })], { width: 1700 }),
        CELL([P(opis)], { width: 4000 }),
        CELL([P(prelazi)], { width: 3660 }),
      ]})),
    ],
  }),
  H3("Pravila prelaza"),
  Bullet([Bold("draft → submitted"), T(" zahtijeva: svi članovi imaju medical_certificate.status = valid + potpis profesora odgovara registrovanom imenu")]),
  Bullet([Bold("submitted → active"), T(" može samo Admin (Policy: TeamPolicy::approve)")]),
  Bullet([Bold("active → completed"), T(" automatski kad admin unese rezultate (UC10)")]),
  Bullet([Bold("Profesor"), T(" može: draft → submitted (submit), draft → cancelled (cancel), active → withdrawn (withdraw)")]),
  Bullet([Bold("Admin"), T(" može: submitted → active (approve), submitted → rejected (reject), bilo šta → cancelled (force)")]),

  H2("6.2 MedicalCertificate (LjekarskaPotvrda) — OCR validacija"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1700, 4000, 3660],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Stanje")] })], { width: 1700, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Opis")] })], { width: 4000, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Dozvoljeni prelazi")] })], { width: 3660, fill: "D5E8F0" }),
      ]}),
      ...[
        ["pending", "Tek uploadovana, queue job postavlja se za OCR", "valid, expired, invalid, manual_review"],
        ["valid", "OCR uspio, datum izdavanja u redu, ime se poklapa", "expired (po datumu), superseded"],
        ["expired", "Datum isteka prošao", "superseded"],
        ["invalid", "OCR uspio ali ime ili datumi ne odgovaraju", "superseded"],
        ["manual_review", "OCR neuspješan (loš sken), čeka admin pregled", "valid, invalid, superseded"],
        ["superseded", "Profesor uploadovao novu potvrdu koja zamjenjuje ovu", "(terminalno)"],
      ].map(([stanje, opis, prelazi]) => new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold(stanje)] })], { width: 1700 }),
        CELL([P(opis)], { width: 4000 }),
        CELL([P(prelazi)], { width: 3660 }),
      ]})),
    ],
  }),
  H3("Pravila prelaza"),
  Bullet([Bold("pending → valid/expired/invalid"), T(" postavlja OcrValidationJob (background queue)")]),
  Bullet([Bold("pending → manual_review"), T(" ako adapter vrati grešku ili confidence ispod praga")]),
  Bullet([Bold("Cron job"), T(" medical-certificates:expire jednom dnevno markira valid potvrde kao expired kad datum prođe")]),
  Bullet([Bold("Admin"), T(" može: manual_review → valid/invalid (POST /admin/certificates/{certificate}/manual-approve)")]),

  H2("6.3 Student (Učenik) — eDnevnik verifikacija"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1700, 4000, 3660],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Stanje")] })], { width: 1700, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Opis")] })], { width: 4000, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Dozvoljeni prelazi")] })], { width: 3660, fill: "D5E8F0" }),
      ]}),
      ...[
        ["unverified", "Tek registrovan, eDnevnik provjera nije pokrenuta", "pending, verified, mismatched"],
        ["pending", "Admin pokrenuo verifikaciju, čeka eDnevnik odgovor", "verified, mismatched, failed"],
        ["verified", "eDnevnik potvrdio podatke", "unverified (reset), pending (re-check)"],
        ["mismatched", "eDnevnik vratio podatke koji se ne poklapaju", "verified (admin manuelno), unverified"],
        ["failed", "eDnevnik nedostupan ili učenik ne postoji", "pending (retry), unverified"],
      ].map(([stanje, opis, prelazi]) => new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold(stanje)] })], { width: 1700 }),
        CELL([P(opis)], { width: 4000 }),
        CELL([P(prelazi)], { width: 3660 }),
      ]})),
    ],
  }),
  H3("Pravila"),
  Bullet([Bold("Učenik može učestvovati u ekipi"), T(" u stanjima verified, unverified, mismatched (UI upozorava ali ne blokira). U stanju pending ili failed — može, ali sa flag-om \"verifikacija u toku\".")]),
  Bullet([Bold("Audit log obavezan"), T(" za svaki prelaz u verified ili mismatched.")]),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 7: TEHNOLOŠKI STACK
// ──────────────────────────────────────────────────────────────────────────
const glava7 = [
  H1("7. Tehnološki stack i ključne odluke"),
  H2("7.1 Stack"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 1200, 5760],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Tehnologija")] })], { width: 2400, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Verzija")] })], { width: 1200, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Uloga")] })], { width: 5760, fill: "D5E8F0" }),
      ]}),
      ...[
        ["Laravel", "13.x", "Backend framework — rute, controller-i, ORM (Eloquent), validacija, cache, queue."],
        ["PHP", "8.3+", "Runtime za Laravel."],
        ["Fortify", "1.x", "Autentifikacija (web, Inertia sesije). ZAMJENA za Sanctum iz dizajna."],
        ["Inertia.js", "3.x", "Adapter Laravel ↔ React."],
        ["@inertiajs/react", "3.x", "Inertia React client (Link, Form, useForm, useHttp)."],
        ["Wayfinder", "0.x", "Auto-generisane TypeScript funkcije za Laravel rute."],
        ["React", "19.x", "Frontend komponente."],
        ["Tailwind CSS", "4.x", "Utility-first CSS."],
        ["shadcn/ui", "—", "UI primitivi (forme, modali, tabele)."],
        ["Pest", "4.x", "Testovi (Feature, Unit, Browser)."],
        ["SQLite (dev)", "3.x", "DB za development."],
        ["Boost", "2.x", "MCP server za Laravel kontekst."],
      ].map(([tech, ver, uloga]) => new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold(tech)] })], { width: 2400 }),
        CELL([P(ver)], { width: 1200 }),
        CELL([P(uloga)], { width: 5760 }),
      ]})),
    ],
  }),

  H2("7.2 Skretanja od originalnog Projektnog dizajna v1.2"),
  P([Italic("Profesor može pitati: \"Zašto si odstupio od dizajna?\" — imaj odgovore spremne.")]),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2000, 2400, 4960],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Tema")] })], { width: 2000, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Dizajn → Implementacija")] })], { width: 2400, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Razlog")] })], { width: 4960, fill: "D5E8F0" }),
      ]}),
      new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold("Auth")] })], { width: 2000 }),
        CELL([P("Sanctum → Fortify")], { width: 2400 }),
        CELL([P("Sanctum je za API tokene (mobile, third-party). Inertia SPA koristi session — Fortify idealan.")], { width: 4960 }),
      ]}),
      new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold("DB (dev)")] })], { width: 2000 }),
        CELL([P("PostgreSQL → SQLite")], { width: 2400 }),
        CELL([P("Zero-config dev setup. Schema agnostično napisana — produkcija može biti Postgres.")], { width: 4960 }),
      ]}),
      new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold("Cache/queue (dev)")] })], { width: 2000 }),
        CELL([P("Redis → database driver")], { width: 2400 }),
        CELL([P("Default Laravel, vidljivo u jobs tabeli za debug. Redis u produkciji.")], { width: 4960 }),
      ]}),
      new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold("React")] })], { width: 2000 }),
        CELL([P("v18 → v19")], { width: 2400 }),
        CELL([P("Najnovija stabilna verzija već instalirana.")], { width: 4960 }),
      ]}),
      new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold("Tailwind")] })], { width: 2000 }),
        CELL([P("v3 → v4")], { width: 2400 }),
        CELL([P("Već instalirano.")], { width: 4960 }),
      ]}),
    ],
  }),

  H2("7.3 Background jobs / Queue strategija"),
  P([Bold("Pravilo:"), T(" sinhrono ostaje samo ono što korisnik mora vidjeti odmah u istom HTTP odgovoru. Sve eksterne pozive i tešku obradu bacamo u queue.")]),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3200, 1500, 1200, 3460],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Job")] })], { width: 3200, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Queue")] })], { width: 1500, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Tip")] })], { width: 1200, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Razlog")] })], { width: 3460, fill: "D5E8F0" }),
      ]}),
      ...[
        ["ValidateMedicalCertificateJob", "ocr", "async", "OCR poziv traje 2–10s."],
        ["VerifyStudentWithEDnevnikJob", "ednevnik", "async", "eDnevnik može biti spor (10s)."],
        ["SendTeamSubmittedNotification", "notifications", "async", "Email slanje, ne treba čekati."],
        ["ExpireMedicalCertificatesJob", "default", "scheduled (cron)", "Daily 02:00, markira expired."],
        ["AuditLogWrite", "—", "sinhrono", "Audit MORA biti zapisan prije commit-a transakcije."],
      ].map(([job, queue, tip, razlog]) => new TableRow({ children: [
        CELL([new Paragraph({ children: [Code(job)] })], { width: 3200 }),
        CELL([P(queue)], { width: 1500 }),
        CELL([P(tip)], { width: 1200 }),
        CELL([P(razlog)], { width: 3460 }),
      ]})),
    ],
  }),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 8: AZLP I AUDIT LOG
// ──────────────────────────────────────────────────────────────────────────
const glava8 = [
  H1("8. AZLP usklađenost i audit log"),
  H2("8.1 AZLP — šta je i zašto je važno"),
  P([Bold("AZLP"), T(" = Agencija za zaštitu ličnih podataka Crne Gore. Reguliše obradu ličnih podataka, posebno strogo za maloljetnike (učenike).")]),
  P([Bold("Naši mehanizmi za usklađenost:")]),
  Num([Bold("Saglasnost roditelja:"), T(" parental_consent boolean polje + datum + dokument upload (workflow odložen za sljedeću fazu).")]),
  Num([Bold("Pravo na uvid:"), T(" učenik može preuzeti svoje podatke kao JSON (/profile/export — odloženo).")]),
  Num([Bold("Pravo na brisanje:"), T(" azlp:purge-graduates komanda briše PII po isteku školovanja (odloženo).")]),
  Num([Bold("Audit log za svaki pristup podacima maloljetnika:"), T(" eDnevnik query, profile view od strane admina/profesora.")]),
  Num([Bold("Anonimizacija rezultata"), T(" nakon brisanja PII (medalje ostaju, ime se zamijeni hash-om).")]),
  H2("8.2 Audit log model"),
  P("Tabela audit_log čuva nepromjenljiv zapis svake write akcije."),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 6960],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Polje")] })], { width: 2400, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Tip i opis")] })], { width: 6960, fill: "D5E8F0" }),
      ]}),
      ...[
        ["id", "uuid — primary key"],
        ["user_id", "nullable foreign key na users (sistem može da loguje bez korisnika)"],
        ["action", "string — npr. team.created, student.verified, ednevnik.queried"],
        ["subject_type + subject_id", "polimorfna referenca na entitet (Team, Student, MedicalCertificate, ...)"],
        ["payload", "json — sažetak izmjene (ne sadrži tajne kao password-e)"],
        ["ip", "string — IP adresa korisnika"],
        ["user_agent", "string — browser user agent"],
        ["created_at", "timestamp — kada je akcija desila"],
      ].map(([polje, opis]) => new TableRow({ children: [
        CELL([new Paragraph({ children: [Code(polje)] })], { width: 2400 }),
        CELL([P(opis)], { width: 6960 }),
      ]})),
    ],
  }),
  H2("8.3 Zašto append-only?"),
  P([Bold("Pravilo:"), T(" Audit log se može samo INSERT-ovati, NIKAD UPDATE-ovati ili DELETE-ovati — čak ni administrator nema to pravo.")]),
  P([Bold("Implementacija:"), T(" AuditLogPolicy::update() i ::delete() uvijek vraćaju false. UPDATE i DELETE SQL operacije se ne izvršavaju.")]),
  P([Bold("Razlog:"), T(" Audit log je pravno dokazno sredstvo. Ako bi admin mogao da briše audit zapise, izgubio bi pravnu validnost — admin bi mogao da prikrije svoje akcije.")]),
  H2("8.4 Permission/Policy matrica — sažetak"),
  P("Detaljna matrica je u spec sekcija 13.4. Princip:"),
  Bullet([Bold("3 role × svaki entitet × CRUD akcije + ownership pravila")]),
  Bullet([Bold("Implementacija:"), T(" Laravel Policy klase per entitet (TeamPolicy, StudentPolicy, ResultPolicy, ...)")]),
  Bullet([Bold("FormRequest authorize()"), T(" delegira na Policy: $this->user()->can('update', $this->team)")]),
  Bullet([Bold("Middleware role:admin|profesor|ucenik"), T(" na route group nivou")]),
  Bullet([Bold("Pravilo:"), T(" UI sakrivanje ≠ autorizacija. Server uvijek mora ponovno provjeriti kroz Policy.")]),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 9: Q&A
// ──────────────────────────────────────────────────────────────────────────
const glava9 = [
  H1("9. Pitanja i odgovori (Q&A)"),
  P("Pitanja su grupisana po kategoriji. Svako pitanje ima kratak (1-2 rečenice za usmenu prezentaciju) i detaljan odgovor (za produbljivanje)."),

  H2("9.1 Vizija i analiza"),
  ...QA(
    "Koji su ključni stakeholderi i šta očekuju?",
    "Sportski savez CG (centralna evidencija), Profesori (brza prijava), Učenici/roditelji (transparentnost), AZLP regulator (usklađenost).",
    "Profesor je primarni aktor jer pokreće UC5 (centralni use case). Učenik je read-only — pregleda profil i istoriju. Admin ima globalna prava. eDnevnik je eksterni sistem, ne stakeholder."
  ),
  ...QA(
    "Šta su use case-ovi i koliko ih imate?",
    "10 UC-ova. Centralni je UC5 — Prijava ekipe na takmičenje.",
    "UC1 Registracija, UC2 Login, UC3 Profil, UC4 Raspored, UC5 Prijava ekipe (centralni), UC6 OCR validacija (<<include>> u UC5), UC7 Upravljanje korisnicima, UC8 eDnevnik verifikacija (<<include>> u UC7), UC9 Sportovi/raspored, UC10 Unos rezultata. UC5 je centralni jer dotiče 7 entiteta i uključuje OCR pipeline, validaciju, potpis i notifikaciju."
  ),
  ...QA(
    "Zašto je TeamMember zasebna klasa?",
    "Zato što ljekarska potvrda nije svojstvo učenika — vezana je za konkretnu prijavu.",
    "Učenik može imati različite potvrde za različita takmičenja. Da je MedicalCertificate direktno na Student, kad učenik ažurira potvrdu, ne bismo znali za koju prijavu. TeamMember je asocijativna klasa između Team i Student (M:N relacija) sa sopstvenim atributom MedicalCertificate."
  ),
  ...QA(
    "Šta je polimorfizam u modelu Result?",
    "Rezultat se vezuje za Team (timski) ILI TeamMember (individualni), nikad oba — subject_type + subject_id kolone.",
    "Atletika je individualni sport — medalja ide pojedincu. Košarka je timski — medalja ide ekipi. Bez polimorfizma bi nam trebale dvije tabele. Polimorfna asocijacija je elegantnije rješenje za jednu kolekciju rezultata koja može da pripada različitim tipovima vlasnika."
  ),

  H2("9.2 Arhitektura i dizajn"),
  ...QA(
    "Zašto Laravel monolit, a ne microservisi?",
    "Broj korisnika nije velik (par hiljada profesora + učenika); kompleksnost deployment-a microservisa nije opravdana.",
    "Microservisi imaju distributed transactions, service discovery, network failures — sve to bi povećalo bug surface bez koristi. Monolit + queue worker za OCR i eDnevnik daje dovoljnu skalabilnost. Trade-off: manje horizontalne skalabilnosti, ali vertikalna (queue worker scale) je dovoljna."
  ),
  ...QA(
    "Zašto Inertia.js, a ne čist React SPA + REST API?",
    "Inertia eliminiše duplikat (API resource klase + frontend types) i zadržava SPA UX.",
    "Server-side routing kroz Laravel rute, server-side validacija, ali React komponente za UI. Nema potrebe za API tokenima jer koristimo session auth (Fortify). Wayfinder auto-generiše TypeScript funkcije za rute, pa frontend pozove teams.create.url() umjesto hardkodovanog '/teams/create' — type safety bez ručnog održavanja."
  ),
  ...QA(
    "Zašto Fortify a ne Sanctum kao što je dizajn rekao?",
    "Sanctum je za API token auth (mobile, third-party). Inertia SPA koristi session — Fortify je idealan.",
    "Sanctum + Inertia bi značilo dupli stack (session za web, token za 'API'), a Inertia rute SU web rute. Spec sekcija 10.2 dokumentuje ovo skretanje i razlog. Fortify daje sve potrebne rute (login, register, password reset, 2FA, email verification) bez custom koda."
  ),
  ...QA(
    "Zašto SQLite za dev?",
    "Zero-config — clone repo, php artisan migrate, radi.",
    "Postgres bi tražio Docker setup ili lokalnu instalaciju. Schema je napisana agnostično pa produkcija može biti Postgres bez code changes. Trade-off: SQLite ima neke ograničavajuće SQL feature-e (concurrent writes), ali za dev to nije problem."
  ),
  ...QA(
    "Objasni 4-slojnu arhitekturu.",
    "HTTP (Controller, FormRequest) → Application (Service) → Domain (Model, Policy, Enum) + Infrastructure (Adapter, Storage).",
    "Controller-i pozivaju Service-e, ne direktno modele. Service-i koriste Adapter-e za eksterne pozive. Domain ne zna za Service — to je princip Dependency Inversion. Frontend (resources/js) komunicira sa Controller-ima kroz Inertia rute, bez direktnog pristupa Service-ima."
  ),
  ...QA(
    "Šta je Adapter pattern i zašto ga koristite?",
    "Apstrahuje eksterni servis iza interfejsa. EDnevnikAdapter interface ima 2 implementacije: FakeEDnevnikAdapter i EDnevnikHttpAdapter.",
    "Testovi koriste Fake (nema network call-a, deterministički), produkcija HTTP. Switch iza feature flag-a (config('services.ocr.driver')) kad sporazum sa Ministarstvom prosvjete bude potpisan. Service zavisi od INTERFACE-a (apstrakcija), ne od konkretne klase — to je Dependency Inversion princip (SOLID D)."
  ),
  ...QA(
    "Šta je Single Table Inheritance i zašto STI a ne zasebne tabele?",
    "Jedna users tabela + role enum kolona + nullable atributi specifični za rolu.",
    "Fortify očekuje jednu users tabelu sa jednim email/password setom. Tri zasebne tabele (professors, students, admins) bi tražile custom user provider za svaku rolu — komplikacija bez benefita. Trade-off: više nullable kolona u users (npr. school_id je null za admina), ali to je prihvatljivo."
  ),
  ...QA(
    "Zašto database driver za queue u dev-u?",
    "Zero-config — Laravel default. Posao se vidi u jobs tabeli što je dobro za debug.",
    "Redis traži dodatni servis. U produkciji ide Redis jer je brži i ne pravi load na DB."
  ),

  H2("9.3 Implementacija"),
  ...QA(
    "Pokaži kako UC5 (Prijava ekipe) teče end-to-end.",
    "8 koraka: bira sport → dodaje učenika → upload potvrda → OCR validira → ponavlja za sve → potpis → submit.",
    "GET /teams/create → POST /teams (kreira draft) → POST /teams/{team}/members → POST /teams/{team}/members/{member}/certificate (queue ValidateMedicalCertificateJob) → POST /teams/{team}/submit (provjerava: svi članovi imaju cert.status=valid + potpis odgovara imenu) → transition draft → submitted → notifikacija. Implementacija u app/Services/TeamRegistrationService.php."
  ),
  ...QA(
    "Pokaži UC8 (eDnevnik verifikacija).",
    "Admin pokreće verifikaciju → EDnevnikVerificationService poziva FakeEDnevnikAdapter → ishod verified/mismatched/failed → audit log.",
    "GET /admin/students/{student}/verify → admin klikne 'Pokreni verifikaciju' → POST /admin/students/{student}/verify → EDnevnikVerificationService::verify($student) → EDnevnikAdapter::fetchByJmb($jmb) → poredi lokalne podatke. Match → status verified. Mismatch → status mismatched + lista razlika, admin manuelno odlučuje. Failed → status failed, retry moguć. AZLP: svaki pristup eDnevniku se loguje."
  ),
  ...QA(
    "Šta je state dijagram i koje entitete imate?",
    "3 entiteta: Team (draft→submitted→active→completed), MedicalCertificate (pending→valid/expired/invalid), Student.verification_status (unverified→pending→verified/mismatched/failed).",
    "Implementacija: explicit status kolona (string enum), NE bool flagovi. Razlog: bool flagovi (is_active, is_completed) ne sprečavaju nemoguća stanja (is_active=true AND is_cancelled=true). Enum status garantuje TAČNO JEDNO stanje. State machine logika je u Service klasama (TeamRegistrationService, MedicalCertificateStateMachine)."
  ),
  ...QA(
    "Kako funkcioniše audit log?",
    "Tabela audit_log sa kolonama: id, user_id, action, subject_type+subject_id, payload, ip, user_agent, created_at. Append-only.",
    "Policy klasa odbija UPDATE i DELETE čak i adminu. Audit MORA biti zapisan prije commit-a transakcije (eager dispatch, sinhrono) — za razliku od email notifikacija koje idu u queue. Razlog za append-only: audit je pravno dokazno sredstvo. Ako bi admin mogao da briše, izgubilo bi se pravnu validnost."
  ),
  ...QA(
    "Kako funkcioniše file storage za ljekarske potvrde?",
    "local disk (storage/app/private/) u dev-u, S3 u produkciji. Nikad public disk. Path: medical-certificates/{team_member_id}/{uuid}.{ext}.",
    "UUID v4 u path-u, nikad original ime (original_filename je zasebna kolona). Validation: MIME type (PDF, JPEG, PNG), max 10MB. Pristup kroz signed URL sa TTL 5 minuta (Storage::temporaryUrl). AZLP brisanje: kad se briše Student, briše se i sav storage (Storage::deleteDirectory)."
  ),
  ...QA(
    "Kako role-based authorization radi?",
    "Laravel Policy klase per entitet (TeamPolicy, StudentPolicy, ...). FormRequest authorize() delegira na Policy. Middleware role:admin|profesor|ucenik.",
    "Pravilo: UI sakrivanje ≠ autorizacija. Server uvijek prolazi kroz Policy. Kontekstualna pravila: Profesor ima 'own teams' (samo svoje ekipe), 'school students' (samo iz svoje škole). Student ima 'own profile'. Admin ima sve. Detalji u spec sekcija 13.4."
  ),
  ...QA(
    "Šta su Wayfinder rute?",
    "Auto-generisane TypeScript funkcije za Laravel rute.",
    "Frontend pozove teams.store.url() umjesto '/teams'. Type safety: refactor route name → frontend lome se kompajl, ne runtime. Build: npm run build regeneriše resources/js/actions/ i resources/js/routes/. Korist: jedna tačka istine za URL-ove."
  ),

  H2("9.4 ADIS teorijska pitanja"),
  ...QA(
    "Koje vrste UML dijagrama postoje i koje ste koristili?",
    "Strukturni (klasni, paket, komponentni, deployment) i dijagrami ponašanja (use case, sekvencni, aktivnosti, state machine).",
    "Mi smo koristili: klasni (domain model), sekvencni (UC5, UC8), komponentni (4 sloja arhitekture), paket (Laravel struktura), deployment (Laravel Cloud), state (Team, MedicalCertificate, Student). To je 6 različitih tipova dijagrama — pokrivamo i strukturu i ponašanje."
  ),
  ...QA(
    "Šta je <<include>> veza u UC dijagramu?",
    "UC1 <<include>> UC2 znači da UC1 UVIJEK poziva UC2 (obavezno).",
    "Naš primjer: UC5 (Prijava ekipe) <<include>> UC6 (OCR validacija) — svaki put kad se uploaduje potvrda, OCR se pokreće. UC7 <<include>> UC8 — admin pokreće verifikaciju iz UC7 konteksta. Razlika od <<extend>>: extend je opcioni proširak (npr. UC 'Recover password' extends UC2 Login), include je obavezan poziv."
  ),
  ...QA(
    "Šta su SOLID principi i gdje ih vidimo u kodu?",
    "S Single Responsibility, O Open/Closed, L Liskov, I Interface Segregation, D Dependency Inversion.",
    "S: TeamRegistrationService samo registruje ekipu, ne radi OCR (to je OcrValidationService). O: EDnevnikAdapter interface — možeš dodati EDnevnikHttpAdapter bez mijenjanja Service-a. L: FakeEDnevnikAdapter i EDnevnikHttpAdapter su zamjenjivi u istoj poziciji. I: OcrAdapter ima samo OCR metode, ne sve image processing. D: Service zavisi od EDnevnikAdapter interface-a, ne od konkretne klase."
  ),
  ...QA(
    "Šta je AZLP i kako sistem usklađen?",
    "Agencija za zaštitu ličnih podataka CG. Reguliše obradu podataka, posebno maloljetnika.",
    "Naši mehanizmi: 1) Saglasnost roditelja (parental_consent), 2) Pravo na uvid (/profile/export), 3) Pravo na brisanje (azlp:purge-graduates), 4) Audit log za svaki pristup podacima maloljetnika (eDnevnik query, profile view), 5) Anonimizacija rezultata. Detalji u spec sekcija 13."
  ),
  ...QA(
    "Šta je V&V i kako ste je radili?",
    "V (Verifikacija): 'Da li smo dobro izgradili sistem?' — testovi. V (Validacija): 'Da li smo izgradili pravi sistem?' — usklađenost sa spec-om.",
    "Verifikacija: Pest feature testovi za svaki UC (glavni tok + 2 alt toka), Pest browser testovi (Playwright pod haubom), Pint code style. Validacija: Spec sekcija 14 (Acceptance criteria) — checklist pre-merge, demo scenari u meta-planu sekcija 10. AI u SDLC: ai_dnevnik_sesije tabela — 21 sesija evidentirana sa instrukcijama, output-om, odlukama, ishodom."
  ),
  ...QA(
    "Zašto mock adapteri umjesto pravog OCR-a?",
    "Pragmatika: Google Cloud Vision traži servisni nalog, billing, API ključ, GDPR ugovor — za demo je bespredmetno.",
    "Determinizam: FakeOcrAdapter čita datum iz file-name konvencije (ime_prezime_2026-12-31.pdf) — testovi su determinski, ne flaky. Switch: iza feature flag-a (config('services.ocr.driver')) — kad bude pravi nalog, samo se prebaci na GoogleVisionAdapter bez ikakve promjene Service-a. To je Adapter pattern u akciji."
  ),
  ...QA(
    "Šta je TDD i jeste li ga koristili?",
    "TDD = Test-Driven Development: Red-Green-Refactor. Napiši test (crveno) → minimalan kod da prođe (zeleno) → refactor.",
    "U projektu: Pest feature testovi za UC5 napisani prije TeamRegistrationService implementacije (per spec sekcija 14). Korist: svaki feature ima test, lakše refaktorisanje, manji rizik regresije."
  ),
  ...QA(
    "Šta bi bila sljedeća faza ako sistem ide u produkciju?",
    "Pravi adapteri, migracija na Postgres + S3 + Redis + SES, AZLP cleanup workflow, pilot u 1-2 škole.",
    "1) Pravi GoogleVisionAdapter, 2) Pravi EDnevnikHttpAdapter (kad sporazum sa Min. prosvjete), 3) SQLite → Postgres, 4) S3 storage, 5) AWS SES za email, 6) Redis za queue/cache, 7) AZLP cleanup workflow (purge-graduates, /profile/export), 8) Saglasnost roditelja workflow, 9) Pilot, korekcije, postepeni rollout."
  ),

  H2("9.5 Potencijalno teška pitanja"),
  ...QA(
    "Kako garantujete da niko ne može da fabrikuje rezultate?",
    "Svaki state prelaz i INSERT u results ide kroz Policy + AuditLogger. Audit log je append-only — čak ni admin ne može da ga izmijeni.",
    "Spec sekcija 13.3 i 13.4 detaljiše. Policy klase odbijaju neovlašćene izmjene. Audit zapis za svaku akciju (result.created, team.completed). Audit ostaje pravni dokaz."
  ),
  ...QA(
    "Šta ako pravi eDnevnik vrati drugačiji JSON od mock-a?",
    "EDnevnikAdapter interface garantuje isti return type (DTO). Promjena je lokalizovana u jednoj adapter klasi.",
    "Interface kontrakt: fetchByJmb(string $jmb): EDnevnikStudent. Pravi adapter parsira JSON u DTO. Service zavisi od interface-a, ne od JSON-a. Ako se eDnevnik API mijenja, mijenja se samo HTTP adapter — Service i ostatak koda ostaje isti."
  ),
  ...QA(
    "Šta ako profesor pošalje istu potvrdu za dva učenika?",
    "File hash check — MedicalCertificate može imati sha256 kolonu i unique constraint per team_member_id.",
    "Trenutno spec ne zahtijeva, ali pravilo je dokumentovano u state dijagramu (pending → manual_review za sumnjive slučajeve). Detekcija duplikata je u 'production readiness' checklist."
  ),
  ...QA(
    "Šta ako profesor ne odustaje od draft ekipe — gomilamo li smeće?",
    "Cron job teams:expire-drafts (slično ExpireMedicalCertificatesJob) automatski cancelled draft ekipe starije od X dana.",
    "Trenutno nije implementirano — to ide u 'production readiness' checklist. Default X = 30 dana. Profesor dobija notifikaciju prije expiry-ja."
  ),
  ...QA(
    "Što je trade-off STI nad polimorfizmom?",
    "STI: jedna tabela, jednostavan query, nullable kolone za rolu-specifične podatke. Polymorphic: čistije, ali joinovi skuplji, eager loading ne radi naturalno.",
    "Za naš scope (3 role, mali broj atributa specifičnih za rolu), STI je pragmatičan kompromis. Polymorphic pattern uvodi composite key na 'morph' kolone — generalniji ali sporiji. Spec sekcija 7.2 dokumentuje odluku."
  ),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 10: DEMO GUIDE
// ──────────────────────────────────────────────────────────────────────────
const glava10 = [
  H1("10. Demo guide — kako uživo pokazati"),
  H2("10.1 Priprema prije ulaska na ispit"),
  Num([Bold("Terminal:"), T(" otvori 2 taba — php artisan serve i npm run dev")]),
  Num([Bold("Browser:"), T(" otvori 2 prozora (regular + incognito), ulogovan kao admin u jednom, profesor u drugom")]),
  Num([Bold("Pripremi fajl"), T(" za upload — ime npr. petar_petrovic_2027-12-31.pdf (FakeOcr će ga validirati po naming konvenciji)")]),
  Num([Bold("Backup video:"), T(" docs/zavrsni-izvjestaj/demo/uc5-prijava-ekipe.webm je tu ako sistem otkaže uživo")]),
  Num([Bold("Otvori spec"), T(" u tab-u u browseru za referencu (specs/001-sportski-savez.md)")]),

  H2("10.2 Demo flow (po prioritetu)"),
  H3("Priroritet 1: UC5 — Prijava ekipe (najvažnije)"),
  Num("Login kao Profesor → /dashboard pokazuje listu ekipa"),
  Num("Klikni 'Nova prijava ekipe' → /teams/create"),
  Num("Bira sport (npr. Košarka — pokazi katalog)"),
  Num("Dodaj 2-3 učenika"),
  Num("Upload pripremljenu potvrdu (petar_petrovic_2027-12-31.pdf) → pokaži pending status → osvježi → pokaži valid status sa ekstrahovanim datumom"),
  Num("Potpiši (puno ime mora odgovarati registrovanom)"),
  Num("Submit → notifikacija poslana"),
  H3("Priroritet 2: UC8 — eDnevnik verifikacija"),
  Num("Switch na admin browser"),
  Num("/admin/students → klikni na učenika → 'Pokreni verifikaciju'"),
  Num("Pokaži queue processing"),
  Num("Status se mijenja u verified/mismatched"),
  Num("Otvori /admin/audit-log → pokaži zapis akcije ednevnik.queried"),
  H3("Priroritet 3: UC10 — Unos rezultata"),
  Num("Admin → /admin/competitions → izaberi prošlo takmičenje"),
  Num("Unos rezultata"),
  Num("Pokaži kako se Team.status mijenja u completed"),
  Num("Switch na učenika browser → /profile pokazuje novu medalju"),
  H3("Priroritet 4: AI dnevnik (zatvori sa ovim)"),
  Num("Otvori /ai-dnevnik u browseru"),
  Num("Pokaži 21 sesiju rada sa AI — sa instrukcijama, odlukama, ishodom"),
  Num("Pokloni se: 'Ovo je audit trag samog SDLC-a sa AI'"),

  H2("10.3 Ako nešto pukne uživo"),
  Bullet("Ne paniči. Reci: 'Ovo je demo, pusti me da pokažem snimak.'"),
  Bullet("Otvori docs/zavrsni-izvjestaj/demo/uc5-prijava-ekipe.webm"),
  Bullet("Komentariši dok ide snimak — to demonstrira da znaš šta se dešava ispod haube"),
  Bullet("Backup terminal: php artisan tinker --execute 'App\\Models\\Team::count()' da pokažeš da DB radi"),
];

// ──────────────────────────────────────────────────────────────────────────
// GLAVA 11: CHEAT SHEET
// ──────────────────────────────────────────────────────────────────────────
const glava11 = [
  H1("11. Cheat sheet — šta moraš znati napamet"),
  H2("11.1 Brojevi i nazivi"),
  Bullet([Bold("10 UC-ova"), T(" (UC1–UC10)")]),
  Bullet([Bold("4 sloja arhitekture"), T(" — HTTP → Application → Domain → Infrastructure")]),
  Bullet([Bold("3 state dijagrama"), T(" — Team, MedicalCertificate, Student.verification_status")]),
  Bullet([Bold("3 role"), T(" — Profesor, Učenik, Administrator")]),
  Bullet([Bold("1 eksterni sistem"), T(" — eDnevnik")]),
  Bullet([Bold("UC5"), T(" je centralni UC, <<include>>-uje UC6 (OCR)")]),
  Bullet([Bold("21 sesija"), T(" rada sa AI u tabeli ai_dnevnik_sesije")]),

  H2("11.2 Stack"),
  Bullet("Laravel 13 + PHP 8.3"),
  Bullet("Inertia.js v3 + React 19 + Tailwind 4"),
  Bullet("Fortify (ne Sanctum) za auth"),
  Bullet("SQLite (dev) / Postgres (prod)"),
  Bullet("Pest 4 za testove"),
  Bullet("Wayfinder za TypeScript rute"),

  H2("11.3 Najvažnije odluke i razlozi"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: [
      new TableRow({ tableHeader: true, children: [
        CELL([new Paragraph({ children: [Bold("Odluka")] })], { width: 3000, fill: "D5E8F0" }),
        CELL([new Paragraph({ children: [Bold("Razlog")] })], { width: 6360, fill: "D5E8F0" }),
      ]}),
      ...[
        ["Monolit ne microservisi", "Mali scope, kompleksnost nije opravdana"],
        ["Inertia ne čist React SPA", "Eliminiše duplikat (API resources + frontend types)"],
        ["Fortify ne Sanctum", "Inertia koristi session, ne API tokene"],
        ["STI za User", "Fortify očekuje jednu users tabelu"],
        ["TeamMember zasebna klasa", "Ljekarska potvrda je per-prijava, ne per-učenik"],
        ["Polimorfizam za Result", "Timski sport → Team; individualni → TeamMember"],
        ["Soft delete za Sport", "Čuvanje istorijskih rezultata"],
        ["Adapter pattern za eksterne", "Fake za demo, pravi iza feature flag-a"],
        ["Append-only audit log", "Pravna dokaznost — ni admin ne briše"],
        ["Explicit status enum ne bool", "Sprečava nemoguća stanja (active+cancelled)"],
      ].map(([odluka, razlog]) => new TableRow({ children: [
        CELL([new Paragraph({ children: [Bold(odluka)] })], { width: 3000 }),
        CELL([P(razlog)], { width: 6360 }),
      ]})),
    ],
  }),

  H2("11.4 Ključni fajlovi u kodu (referenca tokom Q&A)"),
  Bullet([Code("specs/001-sportski-savez.md"), T(" — spec v1.1 (single source of truth, 17 sekcija)")]),
  Bullet([Code("specs/000-paralelni-plan.md"), T(" — meta-plan v1.2 (14 track-ova, 4 phase)")]),
  Bullet([Code("app/Models/"), T(" — 12 Eloquent modela")]),
  Bullet([Code("app/Services/"), T(" — 7 service klasa (TeamRegistrationService, AuditLogger, ...)")]),
  Bullet([Code("app/Adapters/Ocr/"), T(" — OcrAdapter interface + FakeOcrAdapter")]),
  Bullet([Code("app/Adapters/EDnevnik/"), T(" — EDnevnikAdapter interface + FakeEDnevnikAdapter")]),
  Bullet([Code("database/migrations/"), T(" — 14 migracija")]),
  Bullet([Code("docs/zavrsni-izvjestaj/uml/"), T(" — 6 PlantUML dijagrama + render PNG")]),

  H2("11.5 Šta NE pričati ako te ne pitaju"),
  Bullet("Detalji Pest test sintakse"),
  Bullet("Specifični Laravel internals (osim ako profesor produbi)"),
  Bullet("React hooks rendering details"),
  Bullet("Tailwind utility class names"),
  Bullet("CI/CD pipeline (osim ako pita o deploymentu)"),
  P([Italic("Fokus je na arhitekturi, design odlukama, UC-ovima i V&V — ne na implementacionim sitnicama.")]),

  H2("11.6 Završna riječ"),
  Quote("Spec i meta-plan su tvoji glavni dokumenti. Sve detalje imaš tamo. Ovo je samo sažetak za brzu referencu."),
  Quote("Sretno na ispitu! 🍀"),
];

// ──────────────────────────────────────────────────────────────────────────
// FINALIZE DOC
// ──────────────────────────────────────────────────────────────────────────
const doc = new Document({
  styles,
  numbering,
  creator: "Petar Simonović",
  title: "Priprema za odbranu projekta - Sistem školskog sporta CG",
  description: "Sveobuhvatna priprema za 15-minutnu odbranu projekta na ADIS predmetu",
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // ~2cm
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "Priprema za odbranu — Sistem školskog sporta CG", size: 18, color: "808080" })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Strana ", size: 18, color: "808080" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" }),
          ],
        })],
      }),
    },
    children: [
      ...cover,
      ...toc,
      ...formatIspita,
      ...glava1,
      ...glava2,
      ...glava3,
      ...glava4,
      ...glava5,
      ...glava6,
      ...glava7,
      ...glava8,
      ...glava9,
      ...glava10,
      ...glava11,
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUT, buffer);
  console.log(`✅ Created: ${OUT}`);
  console.log(`   Size: ${(buffer.length / 1024).toFixed(1)} KB`);
});
