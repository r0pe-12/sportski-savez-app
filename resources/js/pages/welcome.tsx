import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Award,
    CalendarDays,
    ClipboardCheck,
    GraduationCap,
    LayoutDashboard,
    LineChart,
    MapPin,
    Medal,
    Menu,
    School,
    ScanText,
    ShieldCheck,
    Trophy,
    UserCog,
    Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';
import schedule from '@/routes/schedule';
import type { SharedData } from '@/types';

type SportSummary = {
    id: number;
    slug: string;
    name: string;
    type: string;
};

type UpcomingCompetition = {
    id: number;
    slug: string;
    name: string;
    start_date: string | null;
    location: string | null;
    status: string;
    sport: { id: number; name: string; type: string } | null;
};

type LandingStats = {
    schools: number;
    team_members: number;
    teams: number;
    competitions: number;
    results: number;
    certificates: number;
};

type WelcomeProps = {
    canRegister?: boolean;
    sports: SportSummary[];
    upcoming_competitions: UpcomingCompetition[];
    stats: LandingStats;
};

const SPORT_ICON: Record<string, string> = {
    fudbal: '⚽',
    kosarka: '🏀',
    odbojka: '🏐',
    rukomet: '🤾',
    atletika: '🏃',
    plivanje: '🏊',
    'stoni-tenis': '🏓',
    sah: '♟',
    karate: '🥋',
};

const COMPETITION_STATUS_LABEL: Record<string, string> = {
    draft: 'Najavljeno',
    open_registration: 'Prijave otvorene',
    in_progress: 'U toku',
    completed: 'Završeno',
};

const COMPETITION_STATUS_TONE: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    open_registration: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    completed: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
};

function formatCount(n: number): string {
    return new Intl.NumberFormat('sr-Latn-ME').format(n);
}

function sportEmoji(slug: string): string {
    return SPORT_ICON[slug] ?? '🏅';
}

function slugifySport(name: string): string {
    return name
        .toLowerCase()
        .replace(/š/g, 's')
        .replace(/č/g, 'c')
        .replace(/ć/g, 'c')
        .replace(/ž/g, 'z')
        .replace(/đ/g, 'dj')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default function Welcome({
    canRegister = true,
    sports,
    upcoming_competitions,
    stats,
}: WelcomeProps) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = Boolean(auth?.user);

    const features = [
        {
            icon: ClipboardCheck,
            title: 'Digitalna prijava ekipa',
            description:
                'Profesori prijavljuju ekipe iz svoje škole u nekoliko klikova — bez papirologije i bez slanja mejlova.',
        },
        {
            icon: ScanText,
            title: 'OCR ljekarskih potvrda',
            description:
                'Automatska validacija ljekarskih potvrda prepoznaje JMB i datum izdavanja i vraća rezultat odmah.',
        },
        {
            icon: CalendarDays,
            title: 'Centralni raspored',
            description:
                'Jedinstveno mjesto za pregled svih predstojećih i održanih takmičenja po sportu i statusu.',
        },
        {
            icon: LineChart,
            title: 'Profili i istorija rezultata',
            description:
                'Svaki učenik ima profil sa istorijom nastupa, medaljama i ljekarskim potvrdama kroz godine.',
        },
    ] as const;

    const audiences = [
        {
            icon: UserCog,
            title: 'Profesori fizičkog',
            description:
                'Prijava ekipe, upload ljekarskih potvrda, praćenje statusa prijava i pregled rasporeda školskih takmičenja.',
            cta: { label: 'Prijavi se kao profesor', href: login.url() },
        },
        {
            icon: GraduationCap,
            title: 'Učenici',
            description:
                'Pregled ličnog profila, istorije nastupa, osvojenih medalja i predstojećih takmičenja na kojima učestvuješ.',
            cta: { label: 'Pristupi profilu', href: login.url() },
        },
        {
            icon: ShieldCheck,
            title: 'Administracija saveza',
            description:
                'Upravljanje katalogom sportova, takmičenjima, korisnicima i audit log pregled svih izmjena u sistemu.',
            cta: { label: 'Admin pristup', href: login.url() },
        },
    ] as const;

    const statCards = [
        { label: 'Registrovanih škola', value: stats.schools, icon: School },
        { label: 'Učesnika u ekipama', value: stats.team_members, icon: Users },
        { label: 'Organizovanih takmičenja', value: stats.competitions, icon: Trophy },
        { label: 'Evidentiranih rezultata', value: stats.results, icon: Medal },
    ] as const;

    return (
        <div className="min-h-screen bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
            <Head title="Sistem školskog sporta Crne Gore" />

            {/* Top bar */}
            <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span
                            aria-hidden
                            className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-red-600 via-amber-500 to-blue-700 text-white shadow-sm ring-1 ring-black/5"
                        >
                            <Trophy className="h-5 w-5" strokeWidth={2.25} />
                        </span>
                        <span className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold tracking-tight">Sportski savez CG</span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Sistem {'š'}kolskog sporta
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex dark:text-slate-300">
                        <a href="#funkcionalnosti" className="transition-colors hover:text-slate-900 dark:hover:text-white">
                            Funkcionalnosti
                        </a>
                        <a href="#sportovi" className="transition-colors hover:text-slate-900 dark:hover:text-white">
                            Sportovi
                        </a>
                        <a href="#takmicenja" className="transition-colors hover:text-slate-900 dark:hover:text-white">
                            Takmi{'č'}enja
                        </a>
                        <a href="#za-koga" className="transition-colors hover:text-slate-900 dark:hover:text-white">
                            Za koga je
                        </a>
                    </nav>

                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <Button asChild size="sm">
                                <Link href={dashboard.url()}>
                                    <LayoutDashboard className="h-4 w-4" />
                                    Kontrolna tabla
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                                    <Link href={login.url()}>Prijava</Link>
                                </Button>
                                {canRegister && (
                                    <Button asChild size="sm">
                                        <Link href={register.url()}>Registracija</Link>
                                    </Button>
                                )}
                                <Button asChild variant="outline" size="icon" className="sm:hidden" aria-label="Otvori meni">
                                    <a href="#funkcionalnosti">
                                        <Menu className="h-4 w-4" />
                                    </a>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="relative isolate overflow-hidden">
                    <div
                        aria-hidden
                        className="absolute inset-0 -z-10 bg-[radial-gradient(at_20%_15%,rgba(220,38,38,0.18),transparent_55%),radial-gradient(at_80%_30%,rgba(245,158,11,0.18),transparent_55%),radial-gradient(at_55%_85%,rgba(29,78,216,0.18),transparent_60%)] dark:bg-[radial-gradient(at_20%_15%,rgba(220,38,38,0.22),transparent_55%),radial-gradient(at_80%_30%,rgba(245,158,11,0.18),transparent_55%),radial-gradient(at_55%_85%,rgba(29,78,216,0.28),transparent_60%)]"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-white/40 to-transparent dark:from-slate-950/40"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-0 -z-10 [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:36px_36px] dark:[background-image:linear-gradient(to_right,rgba(248,250,252,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(248,250,252,0.04)_1px,transparent_1px)]"
                    />

                    <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:pt-24 lg:pb-28">
                        <div className="flex flex-col justify-center">
                            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold tracking-wide text-red-700 uppercase dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                                <Activity className="h-3.5 w-3.5" />
                                {'Š'}kolska sportska sezona 2026
                            </span>
                            <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                                Sistem {'š'}kolskog{' '}
                                <span className="bg-gradient-to-r from-red-600 via-amber-500 to-blue-700 bg-clip-text text-transparent">
                                    sporta Crne Gore
                                </span>
                            </h1>
                            <p className="mt-5 max-w-xl text-balance text-base text-slate-600 sm:text-lg dark:text-slate-300">
                                Digitalna platforma za organizaciju, prijavu i evidenciju {'š'}kolskih sportskih
                                takmi{'č'}enja osnovnih i srednjih {'š'}kola. Brza prijava ekipa, automatska
                                validacija ljekarskih potvrda i centralni raspored {'—'} sve na jednom mjestu.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-300">
                                    <Link href={isAuthenticated ? dashboard.url() : login.url()}>
                                        {isAuthenticated ? 'Idi na kontrolnu tablu' : 'Prijavi se'}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <a href="#funkcionalnosti">Saznaj vi{'š'}e</a>
                                </Button>
                            </div>

                            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6 text-left dark:border-slate-800">
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Sportova</dt>
                                    <dd className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatCount(sports.length)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Ekipa</dt>
                                    <dd className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatCount(stats.teams)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{'Š'}kola</dt>
                                    <dd className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatCount(stats.schools)}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Hero visual card */}
                        <div className="relative flex items-center justify-center">
                            <div className="relative w-full max-w-md">
                                <div
                                    aria-hidden
                                    className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-red-500/20 via-amber-400/20 to-blue-600/20 blur-2xl"
                                />
                                <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                            <Award className="h-4 w-4 text-amber-500" />
                                            Najnovije takmi{'č'}enje
                                        </div>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                                            Aktivno
                                        </span>
                                    </div>

                                    {upcoming_competitions[0] ? (
                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    {upcoming_competitions[0].sport?.name ?? 'Sport'}
                                                </p>
                                                <p className="mt-0.5 text-lg font-semibold leading-tight text-slate-900 dark:text-white">
                                                    {upcoming_competitions[0].name}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800/60">
                                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                        Datum
                                                    </p>
                                                    <p className="font-semibold text-slate-900 dark:text-white">
                                                        {formatDate(upcoming_competitions[0].start_date)}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800/60">
                                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                        Lokacija
                                                    </p>
                                                    <p className="font-semibold text-slate-900 dark:text-white">
                                                        {upcoming_competitions[0].location ?? '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                            Trenutno nema najavljenih takmi{'č'}enja.
                                        </p>
                                    )}

                                    <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                        {sports.slice(0, 6).map((sport) => (
                                            <div
                                                key={sport.id}
                                                className="flex flex-col items-center gap-1 rounded-lg bg-slate-50 px-2 py-2 text-center text-xs font-medium text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                                                title={sport.name}
                                            >
                                                <span className="text-base" aria-hidden>
                                                    {sportEmoji(sport.slug)}
                                                </span>
                                                <span className="truncate">{sport.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section
                    id="funkcionalnosti"
                    className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-xs font-semibold tracking-wide text-red-600 uppercase dark:text-red-400">
                                Funkcionalnosti
                            </span>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Sve {'š'}to vam treba za organizaciju {'š'}kolskog sporta
                            </h2>
                            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
                                Od prijave ekipe do potvrde ljekarskog uvjerenja {'—'} sve klju{'č'}ne korake
                                digitalizovali smo u jedan tok.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => (
                                <article
                                    key={feature.title}
                                    className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-red-50 to-amber-50 text-red-600 ring-1 ring-red-100 dark:from-red-950/40 dark:to-amber-950/30 dark:text-red-300 dark:ring-red-900/50">
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        {feature.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sports catalog */}
                <section id="sportovi" className="border-t border-slate-200 py-20 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <span className="text-xs font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-400">
                                    Katalog sportova
                                </span>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                    Sportovi u sistemu
                                </h2>
                                <p className="mt-3 max-w-xl text-base text-slate-600 dark:text-slate-300">
                                    Timski i individualni sportovi sa propisanim sastavom ekipe i pravilima
                                    takmi{'č'}enja.
                                </p>
                            </div>
                            <Button asChild variant="outline">
                                <Link href={schedule.index.url()}>
                                    Vidi sva takmi{'č'}enja
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {sports.map((sport) => (
                                <li
                                    key={sport.id}
                                    className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-700"
                                >
                                    <span className="text-3xl" aria-hidden>
                                        {sportEmoji(sport.slug)}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {sport.name}
                                    </span>
                                    <span
                                        className={cn(
                                            'rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                                            sport.type === 'team_sport'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
                                        )}
                                    >
                                        {sport.type === 'team_sport' ? 'Timski' : 'Individualni'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Upcoming competitions */}
                <section
                    id="takmicenja"
                    className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <span className="text-xs font-semibold tracking-wide text-amber-600 uppercase dark:text-amber-400">
                                    Raspored
                                </span>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                    Naredna takmi{'č'}enja
                                </h2>
                                <p className="mt-3 max-w-xl text-base text-slate-600 dark:text-slate-300">
                                    Sljede{'ć'}i doga{'đ'}aji u {'š'}kolskom kalendaru {'—'} prijave
                                    su otvorene za navedene termine.
                                </p>
                            </div>
                            <Button asChild variant="outline">
                                <Link href={schedule.index.url()}>
                                    Cio raspored
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {upcoming_competitions.length === 0 && (
                                <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                    Trenutno nema najavljenih takmi{'č'}enja. Provjerite kasnije ili pogledajte
                                    cio raspored.
                                </div>
                            )}
                            {upcoming_competitions.map((competition) => (
                                <article
                                    key={competition.id}
                                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                            <span aria-hidden className="text-base">
                                                {competition.sport
                                                    ? sportEmoji(slugifySport(competition.sport.name))
                                                    : '🏅'}
                                            </span>
                                            {competition.sport?.name ?? 'Sport'}
                                        </div>
                                        <span
                                            className={cn(
                                                'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                                                COMPETITION_STATUS_TONE[competition.status] ?? COMPETITION_STATUS_TONE.draft,
                                            )}
                                        >
                                            {COMPETITION_STATUS_LABEL[competition.status] ?? competition.status}
                                        </span>
                                    </div>
                                    <h3 className="mt-3 text-lg font-semibold leading-tight text-slate-900 dark:text-white">
                                        {competition.name}
                                    </h3>
                                    <dl className="mt-4 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <CalendarDays className="h-4 w-4 text-slate-400" />
                                            <dt className="sr-only">Datum po{'č'}etka</dt>
                                            <dd>{formatDate(competition.start_date)}</dd>
                                        </div>
                                        {competition.location && (
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                                <dt className="sr-only">Lokacija</dt>
                                                <dd>{competition.location}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="border-t border-slate-200 py-20 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-xs font-semibold tracking-wide text-emerald-700 uppercase dark:text-emerald-400">
                                Sistem u brojkama
                            </span>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Live podaci iz baze
                            </h2>
                            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                                Brojevi se osvje{'ž'}avaju iz produkcione baze {'—'} prikaz odra{'ž'}ava
                                trenutno stanje sistema.
                            </p>
                        </div>

                        <dl className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                            {statCards.map((card) => (
                                <div
                                    key={card.label}
                                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex items-center justify-between">
                                        <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                            {card.label}
                                        </dt>
                                        <card.icon className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <dd className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                        {formatCount(card.value)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                {/* Audience */}
                <section
                    id="za-koga"
                    className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <span className="text-xs font-semibold tracking-wide text-blue-700 uppercase dark:text-blue-400">
                                Za koga je sistem
                            </span>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                Jedna platforma, tri uloge
                            </h2>
                            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                                Svaka uloga ima jasno definisana prava pristupa i sopstveni tok rada.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-5 md:grid-cols-3">
                            {audiences.map((audience) => (
                                <article
                                    key={audience.title}
                                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 ring-1 ring-blue-100 dark:from-blue-950/40 dark:to-cyan-950/30 dark:text-blue-300 dark:ring-blue-900/50">
                                        <audience.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                        {audience.title}
                                    </h3>
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        {audience.description}
                                    </p>
                                    <Link
                                        href={audience.cta.href}
                                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        {audience.cta.label}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="border-t border-slate-200 py-20 dark:border-slate-800">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-blue-800 p-10 text-white shadow-xl lg:p-14">
                            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                                <div className="max-w-xl">
                                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                        Spremni da prijavite ekipu?
                                    </h2>
                                    <p className="mt-3 text-base text-red-50/90">
                                        Pristupite sistemu, prijavite ekipu i pratite status validacije ljekarskih
                                        potvrda u realnom vremenu.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="secondary"
                                        className="bg-white text-slate-900 hover:bg-slate-100"
                                    >
                                        <Link href={isAuthenticated ? dashboard.url() : login.url()}>
                                            {isAuthenticated ? 'Idi na kontrolnu tablu' : 'Prijavi se'}
                                        </Link>
                                    </Button>
                                    {!isAuthenticated && canRegister && (
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                            className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                                        >
                                            <Link href={register.url()}>Registracija profesora</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-10 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5">
                                <span
                                    aria-hidden
                                    className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-red-600 via-amber-500 to-blue-700 text-white shadow-sm ring-1 ring-black/5"
                                >
                                    <Trophy className="h-5 w-5" strokeWidth={2.25} />
                                </span>
                                <div className="leading-tight">
                                    <p className="text-sm font-semibold">Sportski savez Crne Gore</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Sistem {'š'}kolskog sporta
                                    </p>
                                </div>
                            </div>
                            <p className="mt-4 max-w-md text-sm text-slate-600 dark:text-slate-400">
                                Centralna digitalna platforma za organizaciju {'š'}kolskih sportskih
                                takmi{'č'}enja osnovnih i srednjih {'š'}kola Crne Gore.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold tracking-wide text-slate-900 uppercase dark:text-white">
                                Sistem
                            </h3>
                            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li>
                                    <Link href={login.url()} className="hover:text-slate-900 dark:hover:text-white">
                                        Prijava
                                    </Link>
                                </li>
                                {canRegister && (
                                    <li>
                                        <Link
                                            href={register.url()}
                                            className="hover:text-slate-900 dark:hover:text-white"
                                        >
                                            Registracija
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <Link
                                        href={schedule.index.url()}
                                        className="hover:text-slate-900 dark:hover:text-white"
                                    >
                                        Raspored takmi{'č'}enja
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/ai-dnevnik" className="hover:text-slate-900 dark:hover:text-white">
                                        AI dnevnik (ADIS)
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold tracking-wide text-slate-900 uppercase dark:text-white">
                                Informacije
                            </h3>
                            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li>O nama</li>
                                <li>Kontakt</li>
                                <li>AZLP {'—'} za{'š'}tita podataka</li>
                                <li>Pravila kori{'š'}{'ć'}enja</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center dark:border-slate-800 dark:text-slate-400">
                        <p>{'©'} {new Date().getFullYear()} Sportski savez Crne Gore. Sva prava zadr{'ž'}ana.</p>
                        <p>Akademski projekat {'—'} ADIS, Univerzitet Donja Gorica</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
