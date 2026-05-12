**DNEVNIK UPOTREBE AI ALATA**

U procesu izrade projekta iz predmeta ADIS

*Tema: Sistem školskog sporta Crne Gore*

Univerzitet Donja Gorica \| Predmet: Analiza i dizajn informacionih
sistema

*Verzija dokumenta: 1.3 (živi dokument --- update-uje se kontinuirano
kroz projekat)*

**1. Uvod**

**1.1 Svrha dnevnika**

Ovaj dnevnik dokumentuje upotrebu AI alata u procesu analize i izrade
projektne dokumentacije za informacioni sistem školskog sporta Crne
Gore. Svrha je transparentna evidencija svake sesije sa AI agentom:
cilja, glavnih instrukcija, generisanog outputa, mojih intervencija i
kritičkih odluka koje su u krajnjoj liniji moje, a ne AI-jeve.

Dnevnik je živi dokument --- update-uje se nakon svake značajne sesije.
Datum poslednjeg ažuriranja: 05.05.2026.

**1.2 Metodološki pristup upotrebi AI**

Kroz cijeli projekat AI alat tretiram kao kolaboratora-junior
konsultanta, ne kao orakulum. Konkretno:

- AI generiše prijedloge, ja ocjenjujem i biram. Output AI-ja gledam
  kritički --- provjeravam logiku, terminologiju i konzistentnost sa
  SVD-om i sa stvarnošću domena (sportski savezi u CG).

- AI ne donosi poslovne odluke. Sve odluke o scope-u (npr. da li su
  ljekarske potvrde u sistemu ili ne, da li se rezultate unosi admin ili
  profesor) donosim ja kroz strukturirana pitanja AI-ju.

- AI ne donosi modeling odluke bez moje provjere. Klasifikacije (npr.
  sport kao individualni vs timski) prepoznajem ja kao domenski
  poznavalac, AI to dokumentuje u standardnoj formi.

- Tehnološki stack je moj izbor --- Laravel 13 + PostgreSQL + Redis +
  Inertia.js + React je stack koji svakodnevno koristim na poslu, što mi
  omogućava da odbranim odluku na vježbama bez teorijskog šumlja.

- Output uvijek prolazi kroz moj review prije ulaska u zvanične
  dokumente.

**1.3 Korišteni alati**

  ------------------------------------------------------------------------
  **Alat**            **Verzija /    **Svrha upotrebe u projektu**
                      Model**        
  ------------------- -------------- -------------------------------------
  **Claude            Opus 4.7       Primarni alat. Korišten za: kritičan
  (Anthropic)**       (claude.ai     review SVD-a, strukturiranje
                      web)           analitičkih i dizajn artefakata,
                                     generisanje UML dijagrama u
                                     PlantUML-u, generisanje Word
                                     dokumenata kroz docx-js,
                                     brainstorming dodatnih
                                     funkcionalnosti, kritičko
                                     propitivanje moje arhitekture i
                                     scope-a, generisanje Design Class i
                                     Sequence dijagrama, HTML/CSS
                                     wireframe-a.

  **PlantUML**        v1.2020.02     Renderovanje UML dijagrama (UC,
                      (lokalna       Class, Activity, SSD, Component,
                      instalacija)   Package, Design Class, Sequence) iz
                                     tekstualnog source-a u PNG.

  **wkhtmltoimage**   0.12.x         Konverzija HTML+CSS wireframe-a u PNG
                                     za potrebe dokumentacije UI dizajna.
  ------------------------------------------------------------------------

**2. Evidencija sesija**

Svaka sesija predstavlja jedan smisleni blok rada sa AI alatom --- od
postavljanja cilja do prihvaćanja outputa kao dijela projekta.

**Faza 1 --- Analitička dokumentacija**

**Sesija 1 --- SVD review i preliminarna verzija**

  ----------------- -----------------------------------------------------
  **Sesija 1**      **Datum: 29.04.2026**

  **Cilj sesije**   Procjena da li je inicijalna verzija SVD dokumenta
                    tehnički i strukturno valjana za predaju na ADIS-u,
                    sa identifikacijom rupa.

  **Korišteni       Claude Opus 4.7
  alat**            

  **Glavne          Postavio sam SVD koji sam imao kao kostur, plus
  instrukcije /     tekstualnu ideju projekta, sa direktnim pitanjem:
  prompts**         \"Da li je ovo dobar SVD za ADIS\". Tražio sam
                    iskrenu kritiku, ne diplomatske odgovore.

  **Generisani      Claude je prepoznao šest konkretnih nedostataka:
  output            ljekarske potvrde spomenute ali ne adresirane,
  (sažetak)**       nedostaje capability za unos rezultata, nedostaje
                    upravljanje katalogom sportova, sport modelovan kao
                    trajni atribut učenika (greška), nedovoljno
                    tretiranje zaštite podataka maloljetnika i JMB-a,
                    fotografije spomenute ali ne adresirane.

  **Moje izmjene /  Pregledao sam svaku tačku i sve prihvatio. Modeling i
  odluke**          compliance tačke označio sam kao default-rješive po
                    standardnoj praksi; poslovne odluke donio sam
                    eksplicitno: ljekarske potvrde u scope, fotografije u
                    scope, rezultate unosi isključivo admin/Savez.

  **Finalni ishod** Generisana SVD v1.1 sa sedam novih capability-ja,
                    dopunjenim problem statementom, expanded scope-om i
                    ograničenjima vezanim za zaštitu podataka.
  ----------------- -----------------------------------------------------

**Sesija 2 --- OCR i upravljanje rasporedom**

  ----------------- -----------------------------------------------------
  **Sesija 2**      **Datum: 29.04.2026**

  **Cilj sesije**   Dodavanje OCR validacije ljekarskih potvrda i
                    centralizovanog upravljanja rasporedom takmičenja u
                    SVD.

  **Korišteni       Claude Opus 4.7
  alat**            

  **Glavne          Tražio sam da OCR potvrda i kreiranje rasporeda budu
  instrukcije /     prebačeni iz OUT OF SCOPE u IN SCOPE, sa novom
  prompts**         logikom: admin pravi raspored, ostali ga vide
                    read-only.

  **Generisani      Claude je dodao Cap. 12 (OCR validacija) i Cap. 13
  output            (Upravljanje rasporedom), generisao 8. identifikovani
  (sažetak)**       problem da opravda novu capability. Predložio je da
                    \"pravna validacija sadržaja ljekarskih potvrda\"
                    ostane OUT OF SCOPE jer OCR ne čita medicinski
                    sadržaj.

  **Moje izmjene /  Prihvatio sam kompletan output. Posebno mi se
  odluke**          svidjelo Claude-ovo razgraničenje --- OCR otkriva
                    istekle/format-nevalidne ali ne medicinski sadržaj.

  **Finalni ishod** Generisana SVD v1.2.
  ----------------- -----------------------------------------------------

**Sesija 3 --- Notifikacije, audit log, tipovi sportova**

  ----------------- -----------------------------------------------------
  **Sesija 3**      **Datum: 29.04.2026**

  **Cilj sesije**   Pitanje Claude-u za dodatne korisne funkcionalnosti,
                    plus moja eksplicitna intervencija: razdvajanje
                    sportova na individualne i timske.

  **Korišteni       Claude Opus 4.7
  alat**            

  **Glavne          Zatraženo: \"Šta još fali?\". Birao sam:
  instrukcije /     notifikacioni sistem DA, audit log DA, bulk import
  prompts**         NE. Dodao sam svojom inicijativom: razdvajanje
                    sportova na individualne i timske, što Claude nije
                    pomenuo.

  **Generisani      Claude je kreirao Cap. 14 (notifikacioni sistem) i
  output            Cap. 15 (immutable audit log). Za sport tipove
  (sažetak)**       modifikovao Cap. 11, 3 i 10.

  **Moje izmjene /  Prihvatio sam, posebno cijenio detaljisanje da
  odluke**          \"obavezne sigurnosne notifikacije\" ne mogu biti
                    isključene i constraint da se tip sporta ne može
                    mijenjati nakon kreiranja.

  **Finalni ishod** Generisana SVD v1.3 --- finalna verzija SVD-a za prvu
                    fazu.
  ----------------- -----------------------------------------------------

**Sesija 4 --- Plan analitičke faze**

  ----------------- -----------------------------------------------------
  **Sesija 4**      **Datum: 29.04.2026**

  **Cilj sesije**   Plan dalje razrade i odluka o strukturi dokumenata,
                    alatima za dijagrame.

  **Korišteni       Claude Opus 4.7
  alat**            

  **Glavne          Pitanje: \"Da li sve analitičke artefakte staviti u
  instrukcije /     jedan dokument ili odvojiti?\".
  prompts**         

  **Generisani      Claude je preporučio podjelu na više dokumenata sa
  output            argumentom da je AI dnevnik proces a ne deliverable.
  (sažetak)**       Predložio tri opcije za dijagrame; Mermaid CLI
                    install nije uspio pa smo prebacili sve na PlantUML.

  **Moje izmjene /  Donio sam odluku: dva dokumenta (analitički + AI
  odluke**          dnevnik), SVD ostaje izolovan.

  **Finalni ishod** Plan rada usaglašen, krenuo sam u Fazu 1.
  ----------------- -----------------------------------------------------

**Sesija 5 --- UC dijagram + UC Briefs**

  ----------------- -----------------------------------------------------
  **Sesija 5**      **Datum: 29.04.2026**

  **Cilj sesije**   Generisanje inicijalne verzije UML Use Case dijagrama
                    i UC Briefs tabele.

  **Korišteni       Claude Opus 4.7 + PlantUML
  alat**            

  **Glavne          Zatražio sam UC dijagram u PlantUML-u i prateće UC
  instrukcije /     briefs po Cockburn formatu.
  prompts**         

  **Generisani      Claude je izveo 19 UC-ova mapirajući ih iz 15
  output            capability-ja, identifikovao četiri aktora, kreirao
  (sažetak)**       PlantUML source. UC4 označen kao centralni za
                    detaljnu razradu.

  **Moje izmjene /  Pregledao sam dijagram --- svi UC-ovi mapiraju na
  odluke**          jasne capability-je. Audit log \<\<include\>\>
                    namjerno nije crtan u dijagramu ali je dokumentovan u
                    tekstu.

  **Finalni ishod** Generisan dokument \"Projektna analitika v1.0\" sa
                    Fazom 1, plus dnevnik v1.0.
  ----------------- -----------------------------------------------------

**Sesija 6 --- Iteracija UC dijagrama**

  ----------------- -----------------------------------------------------
  **Sesija 6**      **Datum: 29.04.2026**

  **Cilj sesije**   Refaktor UC dijagrama da bude čitljiviji.

  **Korišteni       Claude Opus 4.7 + PlantUML
  alat**            

  **Glavne          Direktno: \"napravi ovaj dijagram boljim, da budu
  instrukcije /     fino povezane linije i da bude čitljiviji\".
  prompts**         

  **Generisani      Claude je probao dva variants --- drugi (sa shared
  output            UC-ovima u sredini) bio je gori jer je Admin dobio
  (sažetak)**       fan-out linija. Vratio se na prvi variant sa
                    bilateralnim postavljanjem aktora.

  **Moje izmjene /  Cijenim što je Claude transparentno priznao da druga
  odluke**          iteracija nije uspjela i automatski se vratio na
                    bolji prethodni variant.

  **Finalni ishod** Update-ovan dijagram, regenerisan PNG.
  ----------------- -----------------------------------------------------

**Sesija 7 --- Faze 2-5 analitike**

  ----------------- -----------------------------------------------------
  **Sesija 7**      **Datum: 29.04.2026**

  **Cilj sesije**   Generisanje preostalih analitičkih artefakata: Domain
                    Model, detaljni UC4 sa Activity i SSD, CRUD matrica,
                    Pipeline plan.

  **Korišteni       Claude Opus 4.7 + PlantUML
  alat**            

  **Glavne          Direktan zahtjev: \"napravi sve ostale dijagrame\" za
  instrukcije /     preostale faze.
  prompts**         

  **Generisani      Claude je generisao tri nova dijagrama u PlantUML-u:
  output            Domain Model, Activity dijagram za UC4, SSD za UC4.
  (sažetak)**       Plus tekstualni sadržaj: detaljan Cockburn opis UC4,
                    CRUD matrica 19×15, 8-fazni Pipeline plan.

  **Moje izmjene /  Pregledao sam Domain Model --- odluka da Rezultat ima
  odluke**          opcionalne veze i sa Ekipom (timski) i sa ČlanEkipe
                    (individualni) je čistija nego subclass-ovanje.
                    AuditLog kao standalone immutable je tačno modelovan.
                    CRUD matricu pregledao ćeliju po ćeliju.

  **Finalni ishod** Generisana \"Projektna analitika v2.0\" sa svim
                    fazama (1--5).
  ----------------- -----------------------------------------------------

**Faza 2 --- Skraćivanje, refaktor i projektni dizajn**

**Sesija 8 --- Skraćivanje SVD-a i analitike**

  ----------------- -----------------------------------------------------
  **Sesija 8**      **Datum: 30.04.2026**

  **Cilj sesije**   Refaktor postojećih dokumenata --- skraćivanje,
                    čišćenje i fokusiranje na ono što je suštinsko.

  **Korišteni       Claude Opus 4.7
  alat**            

  **Glavne          Direktno: \"napravi opet dva dokumenta, ali da budu
  instrukcije /     kratki, jasni, koncizni i precizni, SVD na jednoj
  prompts**         strani opis problema i rješenje, jasan i kratak
                    naslov\". Naslov \"Sistem školskog sporta Crne Gore\"
                    predložio Claude.

  **Generisani      Claude je generisao SVD v2.0 sa 5 sekcija na 5
  output            stranica i Projektnu analitiku v3.0 fokusiranu na
  (sažetak)**       dijagrame. Nakon mog feedback-a (\"još kraće\")
                    generisana je SVD v2.1 sa 71 paragrafom umjesto 115
                    --- izbačeni manje važni problemi, sposobnosti i
                    stakeholderi.

  **Moje izmjene /  Tražio sam dvije iteracije skraćivanja jer je prva
  odluke**          varijanta još uvijek imala previše detalja. Cijenim
                    što je Claude prepoznao da \"manje je više\" i drugu
                    iteraciju izveo agresivnije.

  **Finalni ishod** SVD v2.1 i Projektna analitika v3.0 su skraćene
                    verzije za predaju.
  ----------------- -----------------------------------------------------

**Sesija 9 --- Pojednostavljenje dijagrama**

  ----------------- -----------------------------------------------------
  **Sesija 9**      **Datum: 30.04.2026**

  **Cilj sesije**   Skraćivanje samih dijagrama (ne teksta) da budu
                    jasniji i lakši za tumačenje.

  **Korišteni       Claude Opus 4.7 + PlantUML
  alat**            

  **Glavne          Tražio sam: \"skrati dijagrame, ne tekst --- da budu
  instrukcije /     jasniji\".
  prompts**         

  **Generisani      Claude je smanjio UC dijagram sa 19 na 10 UC-ova
  output            (spojio registracije, izbacio notifikacije i admin
  (sažetak)**       utility-je), Domain Model sa 18 na 9 klasa (izbacio
                    Region, Razred, Notifikaciju, AuditLog, sve enume
                    osim TipSporta), Activity dijagram sa kompleksnog na
                    linearan flow, SSD sa 8 sistemskih operacija na 4.
                    CRUD matrica srezana na 10×8.

  **Moje izmjene /  Cijenim što je Claude napravio principielan rez ---
  odluke**          izbacio je sve što nije kritično za razumijevanje.
                    Razumno je što su Notifikacije i AuditLog izbačeni iz
                    Domain Modela kao cross-cutting concerns, a
                    Region/Razred kao atributi.

  **Finalni ishod** Generisana Projektna analitika v3.1 sa
                    pojednostavljenim dijagramima.
  ----------------- -----------------------------------------------------

**Sesija 10 --- Faza 2: Projektni dizajn**

  ----------------- -----------------------------------------------------
  **Sesija 10**     **Datum: 05.05.2026**

  **Cilj sesije**   Generisanje kompletnog Projektnog dizajna (Faza 2
                    projekta) sa svim deliverable-ima koje profesor
                    traži: arhitektura, tehnologije, UI principi i
                    wireframe-i, API interfejsi, Design Class + Sequence
                    dijagrami za 1-2 UC-a, Component i Package dijagrami,
                    pipeline plan.

  **Korišteni       Claude Opus 4.7 + PlantUML (uključujući Salt za
  alat**            wireframe-e)

  **Glavne          Postavio sam profesorovu poruku sa zahtjevima i
  instrukcije /     rekao: \"krećemo, pravi potpuno novi dokument i
  prompts**         obavezno ažuriraj dnevnik upotrebe AI\". Prethodno
                    sam definisao stack (Laravel 13 monolit, PostgreSQL,
                    Redis, Inertia.js + React) i izbor 1-2 UC-a za
                    detaljnu razradu (UC5 Prijava ekipe + UC8
                    Verifikacija eDnevnik).

  **Generisani      Claude je generisao 10 novih dijagrama: Component
  output            dijagram, Package dijagram, Design Class za UC5,
  (sažetak)**       Sequence za UC5, Design Class za UC8, Sequence za
                    UC8, plus 4 wireframe-a u PlantUML Salt-u (login,
                    profesorski panel, prijava ekipe, učenički profil).
                    Document Projektni dizajn v1.0 sa 8 sekcija pokriva
                    sve profesorove tačke. Dnevnik upotrebe AI ažuriran
                    sa Sesijama 8-10.

  **Moje izmjene /  Izbor UC8 (eDnevnik) za drugi detaljni UC bio je
  odluke**          Claude-ov prijedlog koji sam prihvatio jer pokriva i
                    tačku 4 (Design Class + Sequence) i tačku 3 (API
                    prema okruženju) istim radom. Stack i hosting (AWS)
                    sam ja izabrao. Package dijagram je trebao dvije
                    iteracije --- prva je bila zbrkana sa shorthand
                    alias-ima koji su pravili duplikate u rendering-u,
                    druga čista. Wireframe-i u Salt-u su low-fi po
                    dizajnu što odgovara fazi projekta.

  **Finalni ishod** Generisan Projektni dizajn v1.0 (kompletna Faza 2
                    dokumentacija) i dnevnik AI v1.2.
  ----------------- -----------------------------------------------------

**Sesija 11 --- Refaktor wireframe-a i optimizacija dokumenta**

  ----------------- -----------------------------------------------------
  **Sesija 11**     **Datum: 05.05.2026**

  **Cilj sesije**   Zamjena loših PlantUML Salt wireframe-a sa pravim
                    HTML/CSS mockup-ima koji izgledaju profesionalno;
                    smanjenje veličine dokumenta jer se prethodna verzija
                    nije mogla učitati.

  **Korišteni       Claude Opus 4.7 + wkhtmltoimage + PIL (Python)
  alat**            

  **Glavne          Kratko i jasno: \"ovi wireframes su sranje, napravi
  instrukcije /     ovo bolje i dokument ne mogu da učitam\".
  prompts**         

  **Generisani      Claude je odbacio PlantUML Salt pristup i napisao 4
  output            HTML fajla sa pravim CSS-om (login, profesorski
  (sažetak)**       panel, forma za prijavu ekipe, učenički profil) ---
                    sa Tailwind-style aesthetikom, badge komponentama,
                    real-istic podacima. Konverzija u PNG kroz
                    wkhtmltoimage. Prva iteracija imala je problem jer
                    wkhtmltoimage koristi stari WebKit koji ne podržava
                    CSS Grid --- Claude je prepoznao i prepisao sa
                    flexbox-om. Diagrami su regenerisani sa nižim DPI
                    (120 umjesto 180) da bi se smanjila veličina
                    dokumenta sa 1.9 MB na 1 MB.

  **Moje izmjene /  Dvije iteracije za profesor i učenik wireframes ---
  odluke**          prva sa CSS Grid (broken), druga sa flexbox (radi).
                    Razmak između meta-podataka u učeniku trebao explicit
                    margin umjesto flexbox gap (stari WebKit). Ostale
                    wireframes (login, prijava) su radili prvi put.
                    Cijenim što je Claude transparentno priznao da prvi
                    pokušaj sa Salt-om nije bio dobar i prešao na sasvim
                    drugi pristup.

  **Finalni ishod** Generisan Projektni dizajn v1.1 sa profesionalnim
                    HTML wireframe-ima (1 MB ukupno), validacija prolazi.
  ----------------- -----------------------------------------------------

**Faza 3 --- Kontinuirano dokumentovanje upotrebe AI**

**Sesija 12 --- Uspostavljanje kontinuiranog AI dnevnika**

  ----------------- -----------------------------------------------------
  **Sesija 12**     **Datum: 12.05.2026**

  **Cilj sesije**   Uspostaviti automatski mehanizam upisa svakog narednog
                    prompta i njegovog rezultata u oba formata dnevnika
                    (Markdown i Word), kako bi dokumentacija upotrebe AI
                    bila kontinuirana, a ne ad-hoc nakon završene faze.

  **Korišteni       Claude Opus 4.7 (1M context) + document-skills:docx
  alat**            skill (Anthropic Agent Skills marketplace)

  **Glavne          Nakon instalacije anthropic-agent-skills marketplace-a
  instrukcije /     i document-skills plugin-a, postavio sam direktivu:
  prompts**         \"nakon svakog prompta moras upisivati sam prompt i
                    rezultat prompta (sta smo njime dobili) u fajl
                    docs/fajlovi/Dnevnik_AI_v1.3.docx i
                    docs/fajlovi/Dnevnik_AI_v1.3.md koristeci se
                    skillom\".

  **Generisani      Claude je prvo tražio pojašnjenje kroz dva pitanja:
  output            (1) format zapisa --- nastavak po sesijama vs novi
  (sažetak)**       prompt-level format vs hibrid; (2) nivo detalja u polju
                    \"rezultat\" --- kratko vs detaljnije vs doslovno. Po
                    mom izboru (nastavak sesija + detaljniji opis),
                    Claude je: (a) sačuvao trajnu \"feedback\" memoriju
                    sa pravilom logovanja i razlozima, kako bi buduće
                    Claude sesije znale ovaj workflow bez ponovne
                    instrukcije; (b) učitao document-skills:docx skill koji
                    koristi unpack/edit/repack pristup preko Python skripti
                    (pandoc za čitanje, pack.py sa auto-repair
                    validacijom); (c) generisao Sesiju 12 u oba fajla
                    paralelno; (d) postavio task-list za praćenje obje
                    izmjene.

  **Moje izmjene /  Eksplicitno sam tražio AskUserQuestion umjesto da
  odluke**          pretpostavljam format --- sesije 1-11 imaju strogu
                    tabelarnu strukturu (Cilj/Alat/Instrukcije/Output/
                    Odluke/Ishod) i nisam htio da Claude jednostrano
                    odluči da je promijeni. Druga ključna odluka bila je
                    da se .md fajl tretira kao primarni izvor istine
                    (čitljiv u git diff-u, lako editabilan), a .docx kao
                    izlaz za predaju (regeneriše se kroz docx workflow).
                    Treća odluka: feedback memorija sadrži i \"Why\" i
                    \"How to apply\" sekcije, tako da buduća sesija može
                    pravilno procijeniti edge case-ove (npr. da li
                    trivijalni \"ok\" prompt zahtijeva sesiju).

  **Finalni ishod** Dnevnik prelazi u Fazu 3 (kontinuirano
                    dokumentovanje). Pravilo logovanja sačuvano u
                    Claude memory store. Sesija 12 dokumentuje samu
                    meta-instrukciju kao prvu primjenu novog workflow-a.
  ----------------- -----------------------------------------------------

**Sesija 13 --- Brainstorming i implementacija /ai-dnevnik public rute**

  ----------------- -----------------------------------------------------
  **Sesija 13**     **Datum: 12.05.2026**

  **Cilj sesije**   Premjestiti sadržaj AI dnevnika iz .md/.docx fajlova u
                    SQLite bazu i izložiti ga preko javne Inertia React
                    rute /ai-dnevnik. Cilj: jedinstveni izvor istine,
                    transparentnost prema profesoru bez slanja fajlova,
                    kraj manuelnog .md/.docx drift-a.

  **Korišteni       Claude Opus 4.7 (1M context) + superpowers:brainstorming
  alat**            skill + Laravel 13 + Inertia.js v3 + React 19 + Pest 4
                    + Wayfinder + shadcn/ui

  **Glavne          Direktan zahtjev: \"mozemo li ovaj dio za dnevnik
  instrukcije /     smjestiti u neku tabelu u bazi i da se to dinamicno
  prompts**         prikazuje na ruti /ai-dnevnik koja ce biti public ovo
                    moramo brainstormovati\".

  **Generisani      Claude je aktivirao superpowers:brainstorming i
  output            superpowers:writing-plans workflow. Kroz 4
  (sažetak)**       strukturisana AskUserQuestion pitanja (source of truth,
                    mehanizam unosa, UI prikaz, scope sadržaja) doneseno
                    je 7 ključnih odluka. Implementacija obuhvatila: (1)
                    migraciju `ai_dnevnik_sesije` sa 9 kolona; (2)
                    `AiDnevnikSesija` model sa `scopeOrderedByBroj`; (3)
                    `AiDnevnikController@show` sa `groupBy('faza')`; (4)
                    public rutu bez auth middleware-a; (5) `AiDnevnikSeeder`
                    sa `updateOrCreate` idempotentnošću za sve 12
                    postojećih sesija; (6) Wayfinder generisanje tipova;
                    (7) Inertia React stranicu `resources/js/pages/
                    ai-dnevnik.tsx` sa Card timeline-om grupisanim po
                    fazama plus hardcoded Uvod/Refleksija/Plan sekcije;
                    (8) Pest feature test sa 4 testa (route 200, count=12,
                    Inertia komponenta + group count, idempotentnost
                    seedera) --- svi pass; (9) Pint formatiranje; (10)
                    browser smoke test (curl 200 + verifikacija payload-a,
                    3 faze prisutne).

  **Moje izmjene /  Sedam odluka iz brainstorminga: (1) baza = master,
  odluke**          .md/.docx postaju eksport (YAGNI sad); (2) Claude piše
                    direktno preko tinker-a --- nema admin UI; (3) Card
                    timeline grupisan po fazama umjesto vjerne tabelarne
                    kopije .docx-a; (4) cijeli dnevnik na ruti (Uvod/
                    Refleksija hardcoded u TSX-u jer se rijetko mijenjaju);
                    (5) bez linka sa welcome.tsx (samo direktan URL);
                    (6) export komanda kasnije; (7) spec u docs/superpowers/
                    specs/. Tehničke odluke: `updateOrCreate` u seederu za
                    idempotentnost (umjesto truncate), `RefreshDatabase` u
                    Pest testu (zato je `seed()` potreban u svakom testu),
                    `groupBy` na Collection-u (Eloquent groupBy ne može
                    direktno raditi po stringu jer JOIN-uje).

  **Finalni ishod** Generisan novi dio sistema: 8 novih fajlova + 2
                    edit-a. `/ai-dnevnik` ruta vraća 200 sa 13 sesija u 3
                    faze. Pest test 4/4 pass. Plan fajl i spec u
                    `docs/superpowers/specs/2026-05-12-ai-dnevnik-design.md`
                    služe kao trajna dokumentacija dizajna. Od ove sesije
                    dalje, svaka buduća sesija će biti upisana DIREKTNO u
                    bazu (uz redundantno održavanje .md/.docx do prve
                    `php artisan dnevnik:export` komande). Sesija 13 je
                    prva sesija upisana u bazu direktno, bez seedera.
  ----------------- -----------------------------------------------------

**Sesija 14 --- Tabovi po vrsti sadržaja i pod-tabovi po fazama**

  ----------------- -----------------------------------------------------
  **Sesija 14**     **Datum: 12.05.2026**

  **Cilj sesije**   Refaktor /ai-dnevnik stranice --- sav sadržaj više
                    nije na jednoj dugačkoj stranici nego organizovan po
                    vrsti (Uvod/Sesije/Refleksija/Plan) sa pod-tabovima za
                    faze unutar Sesije. Interaktivno, deljivo preko URL
                    hash-a.

  **Korišteni       Claude Opus 4.7 + superpowers:brainstorming + shadcn
  alat**            Tabs (@radix-ui/react-tabs) + Inertia React

  **Glavne          Direktan zahtjev: \"ajde malo ovo moramo unaprijediti,
  instrukcije /     tacno da bude odvojene po vrsti i po fazama i da se ne
  prompts**         prikazuje sve na jednoj strani nego da to bude
                    interaktivno\".

  **Generisani      Kroz 2 AskUserQuestion pitanja Claude je nabrojao 3
  output            interpretacije \"po vrsti\" (4 sekcije / samo faze /
  (sažetak)**       po polju sesije) i 4 obrasca interakcije (tabovi /
                    sidebar / multi-route / accordion). Odabrane su 4
                    vrste sekcija (Uvod/Sesije/Refleksija/Plan) plus glavni
                    tabovi + pod-tabovi za faze. Implementacija: (1)
                    instalacija `@radix-ui/react-tabs` (npx shadcn neuspio
                    bez pnpm-a, pa direktna NPM instalacija primitive-a);
                    (2) ručno napisana komponenta
                    `resources/js/components/ui/tabs.tsx` u shadcn
                    new-york stilu (4 export-a:
                    Tabs/TabsList/TabsTrigger/TabsContent); (3) refaktor
                    `ai-dnevnik.tsx` --- uklonjen veliki vertikalni layout,
                    zamijenjen sa `<Tabs>` root-om koji ima 4 glavna taba;
                    za \"Sesije\" tab --- ugniježdeni `<Tabs>` sa
                    pod-tabovima za svaku fazu, svaki sa badge brojačem
                    sesija; (4) URL hash sync preko `useEffect` +
                    `hashchange` listener-a --- `#uvod`, `#sesije/faza-1`,
                    `#refleksija`, `#plan`; (5) sticky top tab bar sa
                    backdrop blur efektom za fiksiranu navigaciju pri
                    scroll-u; (6) responzivnost --- grid-cols-4 na mobilu
                    za glavne tabove, grid-cols-1 za pod-tabove (vertikalno
                    na mobile, horizontalno na desktop); (7) header
                    poboljšan sa Badge-evima (X sesija, Y faze, Živi
                    dokument).

  **Moje izmjene /  Tri ključne tehničke odluke: (1) URL hash umjesto novih
  odluke**          Inertia ruta --- manje promjena u backendu, deljivi
                    linkovi rade, browser back/forward radi automatski
                    preko native hashchange-a, ne treba zasebne controller
                    akcije; (2) sticky tab bar --- bez njega, kad korisnik
                    scroll-uje kroz dugačku Sesiju, mora se vraćati na vrh
                    da promijeni fazu; sa sticky-jem navigacija je uvijek
                    vidljiva; (3) ugniježdeni Tabs umjesto jedne dimenzije
                    --- mogao sam staviti 6 paralelnih tabova
                    (Uvod/Faza1/Faza2/Faza3/Refleksija/Plan), ali
                    ugniježdena struktura pravilnije odražava semantiku:
                    Sesije su jedna \"vrsta\", a faze su atribut sesija.
                    Implementaciono cijenim što je shadcn Tabs minimalna
                    komponenta (60 linija) --- nije bilo potrebe za teškim
                    libraryjem.

  **Finalni ishod** Generisan novi UI sa 4 glavna taba + 3 pod-taba za
                    faze. Sticky header sa backdrop blur. URL deljiv (npr.
                    `http://localhost:8000/ai-dnevnik#sesije/faza-2`
                    otvara stranicu odmah na fazi 2). Mobile-friendly.
                    Pest test 4/4 i dalje pass. Build prošao (vite 4.22s).
                    Bundle ai-dnevnik chunk je veći (sa 12.78kB na ~15kB)
                    ali zanemarivo.
  ----------------- -----------------------------------------------------

**3. Refleksija o upotrebi AI**

**3.1 Šta je AI doprinio**

- Strukturna disciplina kroz cijeli projekat --- Cockburn UC format,
  Larman OOAD pristup, standardna UML notacija. Ovo bi mi inače oduzelo
  dosta vremena za istraživanje formata.

- Otkrivanje skrivenih rupa u SVD-u (Sesija 1) --- ljekarske potvrde,
  results entry workflow, sport kao trajni atribut su Claude-ovi nalazi
  koje sam ja morao da prepoznam..

- Brzo iteriranje na dijagramima --- kad nešto nije čitljivo,
  regenerisanje sa novim layoutom je bilo brzo (Sesija 6, 9). Ručno
  redaktovanje PlantUML source-a oduzelo bi mi mnogo više vremena.

- Prijedlozi za dodatne funkcionalnosti i strukturne odluke ---
  notifikacije, audit log, adapter pattern za eksterne servise, package
  layering pravila.

- Generisanje Design Class i Sequence dijagrama (Sesija 10) --- najtežih
  artefakata u Fazi 2. Detalji metoda i atributa klasa, struktura petlji
  u sequence dijagramu, sve to brzo i u standardnoj formi.

**3.2 Gdje sam ja bio kritički potreban**

- Domenske odluke --- scope ljekarskih potvrda, ko unosi rezultate, da
  li sport ima tipove. Sve poslovne odluke koje AI ne može da donese bez
  konteksta domena.

- Razlikovanje individualnih i timskih sportova --- moja inicijativa, AI
  to nije spomenuo spontano u Sesiji 3.

- Tehnološki stack --- Laravel 13 + PostgreSQL + Redis + Inertia.js +
  React je moj izbor baziran na realnom iskustvu sa tih alata. Mogu ovo
  da odbranim na vježbama bez pretvaranja.

- Filtriranje feature creep-a --- bulk import učenika, mobilna
  aplikacija u prvoj fazi, microservices arhitektura --- sve sam odbio
  jer bi prošle fazi neopravdano.

- Kritički pregled dijagrama --- npr. Package dijagram je u prvoj
  iteraciji bio neuredan, morao sam tražiti čišćenje.

- Definisanje granica skraćivanja --- Sesija 8 je trebala dvije
  iteracije jer je Claude u prvoj zadržao previše detalja. Ja sam morao
  reći \"još kraće\" da se postigne nivo koji odgovara akademskoj
  predaji.

**3.3 Limit AI-ja koje sam uočio**

- AI nije čuo glas profesora ili stvarnih korisnika. Profesori fizičkog
  vaspitanja u CG školama su realni stakeholder čija očekivanja AI ne
  zna direktno.

- AI dobro generiše ali teže proaktivno propituje. Modeling greške
  (sport kao atribut učenika) AI je prepoznao tek kad sam tražio
  kritiku.

- AI često prvi put generiše previše --- bilo da su to capability-i u
  SVD-u (15 inicijalno), UC-ovi (19), klase u Domain Modelu (18).
  Skraćivanje je uvijek tražilo eksplicitnu instrukciju.

- Tooling ograničenja --- Mermaid CLI nije mogao da se instalira u
  radnoj okolini, što je zahtijevalo brzu odluku da se sve prebaci na
  PlantUML.

- Wireframe-i u PlantUML Salt-u su limitirani --- daju low-fi izgled što
  jeste u redu za ovu fazu, ali za UI design fazu treba kvalitetniji
  alat (Figma, Excalidraw).

**4. Plan ažuriranja dnevnika**

Trenutno stanje: završene Faza 1 (analitička dokumentacija) i Faza 2
(projektni dizajn). Sledeće faze po pipeline planu iz Projektnog dizajna
v1.0 --- implementacija sistema u 10 koraka.

Potencijalne buduće sesije, ako projekat ide u implementaciju:

- Sesija 11+ --- Setup Laravel projekta i CI/CD pipeline-a

- Sesija 12+ --- Pisanje Eloquent migracija i modela na osnovu Domain
  Modela

- Sesija 13+ --- Implementacija UC5 (Prijava ekipe) --- Service,
  Controller, Form Request, Inertia React stranice

- Sesija 14+ --- OCR integracija sa Google Cloud Vision API-jem

- Sesija 15+ --- eDnevnik integracija (mock prvo, pravi adapter kad
  sporazum bude potpisan)

*Format unosa za buduće sesije ostaje konzistentan: cilj, alat,
instrukcije, output, moje izmjene/odluke, finalni ishod.*

*--- Kraj dnevnika za Faze 1 i 2 ---*
