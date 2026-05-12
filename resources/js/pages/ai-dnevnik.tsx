import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Sesija {
    id: number;
    broj: number;
    naslov: string;
    datum: string;
    faza: string;
    cilj: string;
    alat: string;
    instrukcije: string;
    output: string;
    odluke: string;
    ishod: string;
}

type FazeSaSesijama = Record<string, Sesija[]>;

const ALATI = [
    {
        naziv: 'Claude (Anthropic)',
        verzija: 'Opus 4.7 (claude.ai web)',
        svrha: 'Primarni alat. Kritičan review SVD-a, strukturiranje analitičkih i dizajn artefakata, generisanje UML dijagrama u PlantUML-u, generisanje Word dokumenata, brainstorming dodatnih funkcionalnosti, kritičko propitivanje arhitekture i scope-a, generisanje Design Class i Sequence dijagrama, HTML/CSS wireframe-a.',
    },
    {
        naziv: 'PlantUML',
        verzija: 'v1.2020.02 (lokalna)',
        svrha: 'Renderovanje UML dijagrama (UC, Class, Activity, SSD, Component, Package, Design Class, Sequence) iz tekstualnog source-a u PNG.',
    },
    {
        naziv: 'wkhtmltoimage',
        verzija: '0.12.x',
        svrha: 'Konverzija HTML+CSS wireframe-a u PNG za potrebe dokumentacije UI dizajna.',
    },
];

const POLJA: {
    kljuc: keyof Pick<Sesija, 'cilj' | 'alat' | 'instrukcije' | 'output' | 'odluke' | 'ishod'>;
    label: string;
}[] = [
    { kljuc: 'cilj', label: 'Cilj sesije' },
    { kljuc: 'alat', label: 'Korišteni alat' },
    { kljuc: 'instrukcije', label: 'Glavne instrukcije / prompts' },
    { kljuc: 'output', label: 'Generisani output (sažetak)' },
    { kljuc: 'odluke', label: 'Moje izmjene / odluke' },
    { kljuc: 'ishod', label: 'Finalni ishod' },
];

const VRSTE = [
    { id: 'uvod', label: 'Uvod' },
    { id: 'sesije', label: 'Sesije' },
    { id: 'refleksija', label: 'Refleksija' },
    { id: 'plan', label: 'Plan' },
] as const;

type VrstaId = (typeof VRSTE)[number]['id'];

function formatDatum(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('sr-Latn-ME', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function slugFazu(faza: string): string {
    const broj = faza.match(/Faza (\d+)/)?.[1];
    return broj ? `faza-${broj}` : faza.toLowerCase().replace(/\s+/g, '-');
}

function parseHash(hash: string): { vrsta: VrstaId; faza?: string } {
    const clean = hash.replace(/^#/, '');
    if (!clean) return { vrsta: 'uvod' };
    const [vrstaPart, fazaPart] = clean.split('/');
    const vrsta = (VRSTE.find((v) => v.id === vrstaPart)?.id ?? 'uvod') as VrstaId;
    return { vrsta, faza: fazaPart };
}

export default function AiDnevnik({ fazeSaSesijama }: { fazeSaSesijama: FazeSaSesijama }) {
    const fazeKljucevi = Object.keys(fazeSaSesijama);
    const fazaSlugovi = fazeKljucevi.map((f) => ({ kljuc: f, slug: slugFazu(f) }));

    const [aktivnaVrsta, setAktivnaVrsta] = useState<VrstaId>('uvod');
    const [aktivnaFaza, setAktivnaFaza] = useState<string>(fazaSlugovi[0]?.slug ?? 'faza-1');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const sync = () => {
            const { vrsta, faza } = parseHash(window.location.hash);
            setAktivnaVrsta(vrsta);
            if (faza && fazaSlugovi.some((f) => f.slug === faza)) {
                setAktivnaFaza(faza);
            }
        };

        sync();
        window.addEventListener('hashchange', sync);
        return () => window.removeEventListener('hashchange', sync);
    }, [fazaSlugovi]);

    const updateHash = (vrsta: VrstaId, faza?: string) => {
        if (typeof window === 'undefined') return;
        const newHash = vrsta === 'sesije' && faza ? `#sesije/${faza}` : `#${vrsta}`;
        if (window.location.hash !== newHash) {
            history.replaceState(null, '', newHash);
        }
    };

    const handleVrstaChange = (vrsta: string) => {
        const v = vrsta as VrstaId;
        setAktivnaVrsta(v);
        updateHash(v, v === 'sesije' ? aktivnaFaza : undefined);
    };

    const handleFazaChange = (faza: string) => {
        setAktivnaFaza(faza);
        updateHash('sesije', faza);
    };

    const ukupanBrojSesija = fazeKljucevi.reduce((sum, faza) => sum + fazeSaSesijama[faza].length, 0);

    return (
        <>
            <Head title="AI Dnevnik — Sistem školskog sporta CG" />
            <main className="min-h-screen bg-background text-foreground">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
                    {/* Header */}
                    <header className="space-y-3 pb-6 border-b">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wider uppercase">
                            Univerzitet Donja Gorica · Predmet ADIS
                        </p>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                            Dnevnik upotrebe AI alata
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground">
                            U procesu izrade projekta <em>Sistem školskog sporta Crne Gore</em>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Badge variant="secondary" className="text-xs">{ukupanBrojSesija} sesija</Badge>
                            <Badge variant="secondary" className="text-xs">{fazeKljucevi.length} faze</Badge>
                            <Badge variant="outline" className="text-xs">Živi dokument</Badge>
                        </div>
                    </header>

                    {/* Glavni tabovi po vrsti */}
                    <Tabs value={aktivnaVrsta} onValueChange={handleVrstaChange} className="space-y-6">
                        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
                            <TabsList className="h-10 w-full sm:w-auto grid grid-cols-4 sm:inline-grid">
                                {VRSTE.map((v) => (
                                    <TabsTrigger key={v.id} value={v.id} className="text-xs sm:text-sm">
                                        {v.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* 1. Uvod */}
                        <TabsContent value="uvod" className="space-y-8">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold tracking-tight">1.1 Svrha dnevnika</h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    Ovaj dnevnik dokumentuje upotrebu AI alata u procesu analize i izrade projektne dokumentacije za
                                    informacioni sistem školskog sporta Crne Gore. Svrha je transparentna evidencija svake sesije sa
                                    AI agentom: cilja, glavnih instrukcija, generisanog outputa, mojih intervencija i kritičkih odluka
                                    koje su u krajnjoj liniji moje, a ne AI-jeve.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold tracking-tight">1.2 Metodološki pristup</h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    Kroz cijeli projekat AI alat tretiram kao kolaboratora–junior konsultanta, ne kao orakulum. AI
                                    generiše prijedloge, ja ocjenjujem i biram. AI ne donosi poslovne ni modeling odluke bez moje
                                    provjere. Tehnološki stack je moj izbor (Laravel 13 + PostgreSQL + Redis + Inertia.js + React) —
                                    stack koji svakodnevno koristim na poslu. Output uvijek prolazi kroz moj review prije ulaska u
                                    zvanične dokumente.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold tracking-tight">1.3 Korišteni alati</h2>
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Alat</th>
                                                <th className="px-4 py-3 font-semibold">Verzija / Model</th>
                                                <th className="px-4 py-3 font-semibold">Svrha upotrebe</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ALATI.map((alat) => (
                                                <tr key={alat.naziv} className="border-t">
                                                    <td className="px-4 py-3 font-medium align-top whitespace-nowrap">{alat.naziv}</td>
                                                    <td className="px-4 py-3 text-muted-foreground align-top whitespace-nowrap">{alat.verzija}</td>
                                                    <td className="px-4 py-3 text-muted-foreground align-top leading-relaxed">{alat.svrha}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </TabsContent>

                        {/* 2. Sesije */}
                        <TabsContent value="sesije" className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">2. Evidencija sesija</h2>
                                <p className="mt-2 text-muted-foreground">
                                    Svaka sesija predstavlja jedan smisleni blok rada sa AI alatom — od postavljanja cilja do
                                    prihvaćanja outputa kao dijela projekta. Sesije su grupisane po fazama projekta.
                                </p>
                            </div>

                            {/* Pod-tabovi po fazama */}
                            <Tabs value={aktivnaFaza} onValueChange={handleFazaChange} className="space-y-6">
                                <TabsList className="h-auto p-1 w-full sm:w-auto grid grid-cols-1 sm:inline-flex sm:flex-wrap gap-1">
                                    {fazaSlugovi.map(({ kljuc, slug }) => {
                                        const broj = kljuc.match(/Faza (\d+)/)?.[1] ?? '?';
                                        return (
                                            <TabsTrigger
                                                key={slug}
                                                value={slug}
                                                className="text-xs sm:text-sm gap-2 px-3 py-1.5"
                                            >
                                                <span className="font-semibold">Faza {broj}</span>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                                    {fazeSaSesijama[kljuc].length}
                                                </Badge>
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>

                                {fazaSlugovi.map(({ kljuc, slug }) => (
                                    <TabsContent key={slug} value={slug} className="space-y-4">
                                        <div className="rounded-lg border-l-4 border-primary bg-muted/30 px-4 py-2">
                                            <h3 className="text-base font-semibold">{kljuc}</h3>
                                        </div>
                                        {fazeSaSesijama[kljuc].map((sesija) => (
                                            <Card key={sesija.id} className="overflow-hidden">
                                                <CardHeader>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <Badge variant="default" className="text-sm font-semibold">
                                                            Sesija {sesija.broj}
                                                        </Badge>
                                                        <span className="text-sm text-muted-foreground">{formatDatum(sesija.datum)}</span>
                                                    </div>
                                                    <h4 className="text-lg font-semibold leading-tight pt-1">{sesija.naslov}</h4>
                                                </CardHeader>
                                                <CardContent className="space-y-4 pt-2">
                                                    {POLJA.map(({ kljuc: polje, label }) => (
                                                        <div key={polje} className="space-y-1">
                                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                {label}
                                                            </p>
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{sesija[polje]}</p>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </TabsContent>

                        {/* 3. Refleksija */}
                        <TabsContent value="refleksija" className="space-y-8">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold tracking-tight">3.1 Šta je AI doprinio</h2>
                                <ul className="list-disc space-y-2 pl-6 text-muted-foreground leading-relaxed">
                                    <li>Strukturna disciplina kroz cijeli projekat — Cockburn UC format, Larman OOAD pristup, standardna UML notacija.</li>
                                    <li>Otkrivanje skrivenih rupa u SVD-u (Sesija 1) — ljekarske potvrde, results entry workflow, sport kao trajni atribut.</li>
                                    <li>Brzo iteriranje na dijagramima — kad nešto nije čitljivo, regenerisanje sa novim layoutom je bilo brzo.</li>
                                    <li>Prijedlozi za dodatne funkcionalnosti i strukturne odluke — notifikacije, audit log, adapter pattern, package layering.</li>
                                    <li>Generisanje Design Class i Sequence dijagrama (Sesija 10) — najtežih artefakata u Fazi 2.</li>
                                    <li>Brza implementacija sistemskog refaktora (Sesija 13) — premještanje dnevnika u bazu sa public rutom u jednoj sesiji.</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold tracking-tight">3.2 Gdje sam ja bio kritički potreban</h2>
                                <ul className="list-disc space-y-2 pl-6 text-muted-foreground leading-relaxed">
                                    <li>Domenske odluke — scope ljekarskih potvrda, ko unosi rezultate, da li sport ima tipove.</li>
                                    <li>Razlikovanje individualnih i timskih sportova — moja inicijativa, AI to nije spomenuo spontano u Sesiji 3.</li>
                                    <li>Tehnološki stack — Laravel 13 + PostgreSQL + Redis + Inertia.js + React, izbor baziran na realnom iskustvu.</li>
                                    <li>Filtriranje feature creep-a — bulk import, mobilna aplikacija u prvoj fazi, microservices arhitektura sve odbio.</li>
                                    <li>Kritički pregled dijagrama i definisanje granica skraćivanja.</li>
                                    <li>Sedam strukturisanih odluka u Sesiji 13 prije nego što je AI dirao kod (source of truth, scope, UI prikaz).</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold tracking-tight">3.3 Limit AI-ja koje sam uočio</h2>
                                <ul className="list-disc space-y-2 pl-6 text-muted-foreground leading-relaxed">
                                    <li>AI nije čuo glas profesora ili stvarnih korisnika (profesori fizičkog vaspitanja u CG školama).</li>
                                    <li>AI dobro generiše ali teže proaktivno propituje — modeling greške je prepoznao tek kad sam tražio kritiku.</li>
                                    <li>AI često prvi put generiše previše — capability-i, UC-ovi, klase. Skraćivanje traži eksplicitnu instrukciju.</li>
                                    <li>Tooling ograničenja — Mermaid CLI nije mogao da se instalira, sve prebačeno na PlantUML.</li>
                                    <li>Wireframe-i u PlantUML Salt-u su limitirani — daju low-fi izgled.</li>
                                </ul>
                            </section>
                        </TabsContent>

                        {/* 4. Plan */}
                        <TabsContent value="plan" className="space-y-6">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold tracking-tight">4. Plan ažuriranja dnevnika</h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    Trenutno stanje: završene Faza 1 (analitička dokumentacija) i Faza 2 (projektni dizajn).
                                    Faza 3 uspostavlja kontinuirano dokumentovanje — nakon svakog značajnog rada sa AI alatom
                                    upisuje se nova sesija direktno u bazu i postaje vidljiva na ovoj stranici.
                                </p>
                                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                                    <p className="text-sm font-semibold">Workflow logovanja (od Sesije 13+)</p>
                                    <ol className="list-decimal space-y-1 pl-6 text-sm text-muted-foreground">
                                        <li>Claude izvrši rad u sesiji</li>
                                        <li>Upiše novu sesiju u bazu direktno (<code className="text-xs bg-background px-1.5 py-0.5 rounded">AiDnevnikSesija::create([...])</code>)</li>
                                        <li>Stranica se osvježava — nova sesija odmah vidljiva u Faza X tab-u</li>
                                        <li>(Kasnije) <code className="text-xs bg-background px-1.5 py-0.5 rounded">php artisan dnevnik:export</code> regeneriše .md i .docx za predaju</li>
                                    </ol>
                                </div>
                                <p className="text-sm text-muted-foreground italic">
                                    Format unosa za buduće sesije ostaje konzistentan: cilj, alat, instrukcije, output, moje
                                    izmjene/odluke, finalni ishod.
                                </p>
                            </section>
                        </TabsContent>
                    </Tabs>

                    <footer className="border-t pt-6 text-xs text-muted-foreground text-center">
                        Petar Simonović · ADIS 2025/26 · Generisano iz baze podataka aplikacije
                    </footer>
                </div>
            </main>
        </>
    );
}
