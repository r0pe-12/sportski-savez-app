<?php

namespace Database\Seeders;

use App\Models\AiDnevnikSesija;
use Illuminate\Database\Seeder;

class AiDnevnikSeeder extends Seeder
{
    public function run(): void
    {
        $sesije = [
            [
                'broj' => 1,
                'naslov' => 'SVD review i preliminarna verzija',
                'datum' => '2026-04-29',
                'faza' => 'Faza 1 — Analitička dokumentacija',
                'cilj' => 'Procjena da li je inicijalna verzija SVD dokumenta tehnički i strukturno valjana za predaju na ADIS-u, sa identifikacijom rupa.',
                'alat' => 'Claude Opus 4.7',
                'instrukcije' => 'Postavio sam SVD koji sam imao kao kostur, plus tekstualnu ideju projekta, sa direktnim pitanjem: "Da li je ovo dobar SVD za ADIS". Tražio sam iskrenu kritiku, ne diplomatske odgovore.',
                'output' => 'Claude je prepoznao šest konkretnih nedostataka: ljekarske potvrde spomenute ali ne adresirane, nedostaje capability za unos rezultata, nedostaje upravljanje katalogom sportova, sport modelovan kao trajni atribut učenika (greška), nedovoljno tretiranje zaštite podataka maloljetnika i JMB-a, fotografije spomenute ali ne adresirane.',
                'odluke' => 'Pregledao sam svaku tačku i sve prihvatio. Modeling i compliance tačke označio sam kao default-rješive po standardnoj praksi; poslovne odluke donio sam eksplicitno: ljekarske potvrde u scope, fotografije u scope, rezultate unosi isključivo admin/Savez.',
                'ishod' => 'Generisana SVD v1.1 sa sedam novih capability-ja, dopunjenim problem statementom, expanded scope-om i ograničenjima vezanim za zaštitu podataka.',
            ],
            [
                'broj' => 2,
                'naslov' => 'OCR i upravljanje rasporedom',
                'datum' => '2026-04-29',
                'faza' => 'Faza 1 — Analitička dokumentacija',
                'cilj' => 'Dodavanje OCR validacije ljekarskih potvrda i centralizovanog upravljanja rasporedom takmičenja u SVD.',
                'alat' => 'Claude Opus 4.7',
                'instrukcije' => 'Tražio sam da OCR potvrda i kreiranje rasporeda budu prebačeni iz OUT OF SCOPE u IN SCOPE, sa novom logikom: admin pravi raspored, ostali ga vide read-only.',
                'output' => 'Claude je dodao Cap. 12 (OCR validacija) i Cap. 13 (Upravljanje rasporedom), generisao 8. identifikovani problem da opravda novu capability. Predložio je da "pravna validacija sadržaja ljekarskih potvrda" ostane OUT OF SCOPE jer OCR ne čita medicinski sadržaj.',
                'odluke' => 'Prihvatio sam kompletan output. Posebno mi se svidjelo Claude-ovo razgraničenje — OCR otkriva istekle/format-nevalidne ali ne medicinski sadržaj.',
                'ishod' => 'Generisana SVD v1.2.',
            ],
            [
                'broj' => 3,
                'naslov' => 'Notifikacije, audit log, tipovi sportova',
                'datum' => '2026-04-29',
                'faza' => 'Faza 1 — Analitička dokumentacija',
                'cilj' => 'Pitanje Claude-u za dodatne korisne funkcionalnosti, plus moja eksplicitna intervencija: razdvajanje sportova na individualne i timske.',
                'alat' => 'Claude Opus 4.7',
                'instrukcije' => 'Zatraženo: "Šta još fali?". Birao sam: notifikacioni sistem DA, audit log DA, bulk import NE. Dodao sam svojom inicijativom: razdvajanje sportova na individualne i timske, što Claude nije pomenuo.',
                'output' => 'Claude je kreirao Cap. 14 (notifikacioni sistem) i Cap. 15 (immutable audit log). Za sport tipove modifikovao Cap. 11, 3 i 10.',
                'odluke' => 'Prihvatio sam, posebno cijenio detaljisanje da "obavezne sigurnosne notifikacije" ne mogu biti isključene i constraint da se tip sporta ne može mijenjati nakon kreiranja.',
                'ishod' => 'Generisana SVD v1.3 — finalna verzija SVD-a za prvu fazu.',
            ],
            [
                'broj' => 4,
                'naslov' => 'Plan analitičke faze',
                'datum' => '2026-04-29',
                'faza' => 'Faza 1 — Analitička dokumentacija',
                'cilj' => 'Plan dalje razrade i odluka o strukturi dokumenata, alatima za dijagrame.',
                'alat' => 'Claude Opus 4.7',
                'instrukcije' => 'Pitanje: "Da li sve analitičke artefakte staviti u jedan dokument ili odvojiti?".',
                'output' => 'Claude je preporučio podjelu na više dokumenata sa argumentom da je AI dnevnik proces a ne deliverable. Predložio tri opcije za dijagrame; Mermaid CLI install nije uspio pa smo prebacili sve na PlantUML.',
                'odluke' => 'Donio sam odluku: dva dokumenta (analitički + AI dnevnik), SVD ostaje izolovan.',
                'ishod' => 'Plan rada usaglašen, krenuo sam u Fazu 1.',
            ],
            [
                'broj' => 5,
                'naslov' => 'UC dijagram + UC Briefs',
                'datum' => '2026-04-29',
                'faza' => 'Faza 1 — Analitička dokumentacija',
                'cilj' => 'Generisanje inicijalne verzije UML Use Case dijagrama i UC Briefs tabele.',
                'alat' => 'Claude Opus 4.7 + PlantUML',
                'instrukcije' => 'Zatražio sam UC dijagram u PlantUML-u i prateće UC briefs po Cockburn formatu.',
                'output' => 'Claude je izveo 19 UC-ova mapirajući ih iz 15 capability-ja, identifikovao četiri aktora, kreirao PlantUML source. UC4 označen kao centralni za detaljnu razradu.',
                'odluke' => 'Pregledao sam dijagram — svi UC-ovi mapiraju na jasne capability-je. Audit log <<include>> namjerno nije crtan u dijagramu ali je dokumentovan u tekstu.',
                'ishod' => 'Generisan dokument "Projektna analitika v1.0" sa Fazom 1, plus dnevnik v1.0.',
            ],
            [
                'broj' => 6,
                'naslov' => 'Iteracija UC dijagrama',
                'datum' => '2026-04-29',
                'faza' => 'Faza 1 — Analitička dokumentacija',
                'cilj' => 'Refaktor UC dijagrama da bude čitljiviji.',
                'alat' => 'Claude Opus 4.7 + PlantUML',
                'instrukcije' => 'Direktno: "napravi ovaj dijagram boljim, da budu fino povezane linije i da bude čitljiviji".',
                'output' => 'Claude je probao dva variants — drugi (sa shared UC-ovima u sredini) bio je gori jer je Admin dobio fan-out linija. Vratio se na prvi variant sa bilateralnim postavljanjem aktora.',
                'odluke' => 'Cijenim što je Claude transparentno priznao da druga iteracija nije uspjela i automatski se vratio na bolji prethodni variant.',
                'ishod' => 'Update-ovan dijagram, regenerisan PNG.',
            ],
            [
                'broj' => 7,
                'naslov' => 'Faze 2-5 analitike',
                'datum' => '2026-04-29',
                'faza' => 'Faza 1 — Analitička dokumentacija',
                'cilj' => 'Generisanje preostalih analitičkih artefakata: Domain Model, detaljni UC4 sa Activity i SSD, CRUD matrica, Pipeline plan.',
                'alat' => 'Claude Opus 4.7 + PlantUML',
                'instrukcije' => 'Direktan zahtjev: "napravi sve ostale dijagrame" za preostale faze.',
                'output' => 'Claude je generisao tri nova dijagrama u PlantUML-u: Domain Model, Activity dijagram za UC4, SSD za UC4. Plus tekstualni sadržaj: detaljan Cockburn opis UC4, CRUD matrica 19×15, 8-fazni Pipeline plan.',
                'odluke' => 'Pregledao sam Domain Model — odluka da Rezultat ima opcionalne veze i sa Ekipom (timski) i sa ČlanEkipe (individualni) je čistija nego subclass-ovanje. AuditLog kao standalone immutable je tačno modelovan. CRUD matricu pregledao ćeliju po ćeliju.',
                'ishod' => 'Generisana "Projektna analitika v2.0" sa svim fazama (1–5).',
            ],
            [
                'broj' => 8,
                'naslov' => 'Skraćivanje SVD-a i analitike',
                'datum' => '2026-04-30',
                'faza' => 'Faza 2 — Skraćivanje, refaktor i projektni dizajn',
                'cilj' => 'Refaktor postojećih dokumenata — skraćivanje, čišćenje i fokusiranje na ono što je suštinsko.',
                'alat' => 'Claude Opus 4.7',
                'instrukcije' => 'Direktno: "napravi opet dva dokumenta, ali da budu kratki, jasni, koncizni i precizni, SVD na jednoj strani opis problema i rješenje, jasan i kratak naslov". Naslov "Sistem školskog sporta Crne Gore" predložio Claude.',
                'output' => 'Claude je generisao SVD v2.0 sa 5 sekcija na 5 stranica i Projektnu analitiku v3.0 fokusiranu na dijagrame. Nakon mog feedback-a ("još kraće") generisana je SVD v2.1 sa 71 paragrafom umjesto 115 — izbačeni manje važni problemi, sposobnosti i stakeholderi.',
                'odluke' => 'Tražio sam dvije iteracije skraćivanja jer je prva varijanta još uvijek imala previše detalja. Cijenim što je Claude prepoznao da "manje je više" i drugu iteraciju izveo agresivnije.',
                'ishod' => 'SVD v2.1 i Projektna analitika v3.0 su skraćene verzije za predaju.',
            ],
            [
                'broj' => 9,
                'naslov' => 'Pojednostavljenje dijagrama',
                'datum' => '2026-04-30',
                'faza' => 'Faza 2 — Skraćivanje, refaktor i projektni dizajn',
                'cilj' => 'Skraćivanje samih dijagrama (ne teksta) da budu jasniji i lakši za tumačenje.',
                'alat' => 'Claude Opus 4.7 + PlantUML',
                'instrukcije' => 'Tražio sam: "skrati dijagrame, ne tekst — da budu jasniji".',
                'output' => 'Claude je smanjio UC dijagram sa 19 na 10 UC-ova (spojio registracije, izbacio notifikacije i admin utility-je), Domain Model sa 18 na 9 klasa (izbacio Region, Razred, Notifikaciju, AuditLog, sve enume osim TipSporta), Activity dijagram sa kompleksnog na linearan flow, SSD sa 8 sistemskih operacija na 4. CRUD matrica srezana na 10×8.',
                'odluke' => 'Cijenim što je Claude napravio principielan rez — izbacio je sve što nije kritično za razumijevanje. Razumno je što su Notifikacije i AuditLog izbačeni iz Domain Modela kao cross-cutting concerns, a Region/Razred kao atributi.',
                'ishod' => 'Generisana Projektna analitika v3.1 sa pojednostavljenim dijagramima.',
            ],
            [
                'broj' => 10,
                'naslov' => 'Faza 2: Projektni dizajn',
                'datum' => '2026-05-05',
                'faza' => 'Faza 2 — Skraćivanje, refaktor i projektni dizajn',
                'cilj' => 'Generisanje kompletnog Projektnog dizajna (Faza 2 projekta) sa svim deliverable-ima koje profesor traži: arhitektura, tehnologije, UI principi i wireframe-i, API interfejsi, Design Class + Sequence dijagrami za 1-2 UC-a, Component i Package dijagrami, pipeline plan.',
                'alat' => 'Claude Opus 4.7 + PlantUML (uključujući Salt za wireframe-e)',
                'instrukcije' => 'Postavio sam profesorovu poruku sa zahtjevima i rekao: "krećemo, pravi potpuno novi dokument i obavezno ažuriraj dnevnik upotrebe AI". Prethodno sam definisao stack (Laravel 13 monolit, PostgreSQL, Redis, Inertia.js + React) i izbor 1-2 UC-a za detaljnu razradu (UC5 Prijava ekipe + UC8 Verifikacija eDnevnik).',
                'output' => 'Claude je generisao 10 novih dijagrama: Component dijagram, Package dijagram, Design Class za UC5, Sequence za UC5, Design Class za UC8, Sequence za UC8, plus 4 wireframe-a u PlantUML Salt-u (login, profesorski panel, prijava ekipe, učenički profil). Document Projektni dizajn v1.0 sa 8 sekcija pokriva sve profesorove tačke. Dnevnik upotrebe AI ažuriran sa Sesijama 8-10.',
                'odluke' => 'Izbor UC8 (eDnevnik) za drugi detaljni UC bio je Claude-ov prijedlog koji sam prihvatio jer pokriva i tačku 4 (Design Class + Sequence) i tačku 3 (API prema okruženju) istim radom. Stack i hosting (AWS) sam ja izabrao. Package dijagram je trebao dvije iteracije — prva je bila zbrkana sa shorthand alias-ima koji su pravili duplikate u rendering-u, druga čista. Wireframe-i u Salt-u su low-fi po dizajnu što odgovara fazi projekta.',
                'ishod' => 'Generisan Projektni dizajn v1.0 (kompletna Faza 2 dokumentacija) i dnevnik AI v1.2.',
            ],
            [
                'broj' => 11,
                'naslov' => 'Refaktor wireframe-a i optimizacija dokumenta',
                'datum' => '2026-05-05',
                'faza' => 'Faza 2 — Skraćivanje, refaktor i projektni dizajn',
                'cilj' => 'Zamjena loših PlantUML Salt wireframe-a sa pravim HTML/CSS mockup-ima koji izgledaju profesionalno; smanjenje veličine dokumenta jer se prethodna verzija nije mogla učitati.',
                'alat' => 'Claude Opus 4.7 + wkhtmltoimage + PIL (Python)',
                'instrukcije' => 'Kratko i jasno: "ovi wireframes su sranje, napravi ovo bolje i dokument ne mogu da učitam".',
                'output' => 'Claude je odbacio PlantUML Salt pristup i napisao 4 HTML fajla sa pravim CSS-om (login, profesorski panel, forma za prijavu ekipe, učenički profil) — sa Tailwind-style aesthetikom, badge komponentama, real-istic podacima. Konverzija u PNG kroz wkhtmltoimage. Prva iteracija imala je problem jer wkhtmltoimage koristi stari WebKit koji ne podržava CSS Grid — Claude je prepoznao i prepisao sa flexbox-om. Diagrami su regenerisani sa nižim DPI (120 umjesto 180) da bi se smanjila veličina dokumenta sa 1.9 MB na 1 MB.',
                'odluke' => 'Dvije iteracije za profesor i učenik wireframes — prva sa CSS Grid (broken), druga sa flexbox (radi). Razmak između meta-podataka u učeniku trebao explicit margin umjesto flexbox gap (stari WebKit). Ostale wireframes (login, prijava) su radili prvi put. Cijenim što je Claude transparentno priznao da prvi pokušaj sa Salt-om nije bio dobar i prešao na sasvim drugi pristup.',
                'ishod' => 'Generisan Projektni dizajn v1.1 sa profesionalnim HTML wireframe-ima (1 MB ukupno), validacija prolazi.',
            ],
            [
                'broj' => 12,
                'naslov' => 'Uspostavljanje kontinuiranog AI dnevnika',
                'datum' => '2026-05-12',
                'faza' => 'Faza 3 — Kontinuirano dokumentovanje upotrebe AI',
                'cilj' => 'Uspostaviti automatski mehanizam upisa svakog narednog prompta i njegovog rezultata u oba formata dnevnika (Markdown i Word), kako bi dokumentacija upotrebe AI bila kontinuirana, a ne ad-hoc nakon završene faze.',
                'alat' => 'Claude Opus 4.7 (1M context) + document-skills:docx skill (Anthropic Agent Skills marketplace)',
                'instrukcije' => 'Nakon instalacije anthropic-agent-skills marketplace-a i document-skills plugin-a, postavio sam direktivu: "nakon svakog prompta moras upisivati sam prompt i rezultat prompta (sta smo njime dobili) u fajl docs/fajlovi/Dnevnik_AI_v1.3.docx i docs/fajlovi/Dnevnik_AI_v1.3.md koristeci se skillom".',
                'output' => 'Claude je prvo tražio pojašnjenje kroz dva pitanja: (1) format zapisa — nastavak po sesijama vs novi prompt-level format vs hibrid; (2) nivo detalja u polju "rezultat" — kratko vs detaljnije vs doslovno. Po mom izboru (nastavak sesija + detaljniji opis), Claude je: (a) sačuvao trajnu "feedback" memoriju sa pravilom logovanja i razlozima, kako bi buduće Claude sesije znale ovaj workflow bez ponovne instrukcije; (b) učitao document-skills:docx skill koji koristi unpack/edit/repack pristup preko Python skripti (pandoc za čitanje, pack.py sa auto-repair validacijom); (c) generisao Sesiju 12 u oba fajla paralelno; (d) postavio task-list za praćenje obje izmjene.',
                'odluke' => 'Eksplicitno sam tražio AskUserQuestion umjesto da pretpostavljam format — sesije 1–11 imaju strogu tabelarnu strukturu (Cilj/Alat/Instrukcije/Output/Odluke/Ishod) i nisam htio da Claude jednostrano odluči da je promijeni. Druga ključna odluka bila je da se .md fajl tretira kao primarni izvor istine (čitljiv u git diff-u, lako editabilan), a .docx kao izlaz za predaju (regeneriše se kroz docx workflow). Treća odluka: feedback memorija sadrži i "Why" i "How to apply" sekcije, tako da buduća sesija može pravilno procijeniti edge case-ove (npr. da li trivijalni "ok" prompt zahtijeva sesiju).',
                'ishod' => 'Dnevnik prelazi u Fazu 3 (kontinuirano dokumentovanje). Pravilo logovanja sačuvano u Claude memory store. Sesija 12 dokumentuje samu meta-instrukciju kao prvu primjenu novog workflow-a.',
            ],
        ];

        foreach ($sesije as $sesija) {
            AiDnevnikSesija::updateOrCreate(
                ['broj' => $sesija['broj']],
                $sesija
            );
        }
    }
}
