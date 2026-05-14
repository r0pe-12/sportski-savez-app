import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format-date';
import competitionsRoutes from '@/routes/competitions';
import teamsRoutes from '@/routes/teams';
import type { SharedData } from '@/types/auth';

type Team = {
    id: number;
    name: string;
    school: { name: string };
};

type Competition = {
    id: number;
    slug: string;
    name: string;
    start_date: string;
    end_date: string;
    location: string;
    status: string;
    year: number;
    sport: { name: string; type: string };
    teams: Team[];
};

type ProfessorTeam = {
    id: number;
    status: 'draft' | 'submitted' | 'active' | 'rejected' | 'cancelled' | 'withdrawn' | 'completed';
};

const STATUS_LABEL: Record<string, string> = {
    draft: 'Skica',
    open_registration: 'Prijave otvorene',
    in_progress: 'U toku',
    completed: 'Završeno',
};

const TEAM_STATUS_LABEL: Record<ProfessorTeam['status'], string> = {
    draft: 'skica',
    submitted: 'predata',
    active: 'odobrena',
    rejected: 'odbijena',
    cancelled: 'otkazana',
    withdrawn: 'povučena',
    completed: 'završena',
};

type Props = {
    competition: Competition;
    professorTeam: ProfessorTeam | null;
    canRegisterTeam: boolean;
    registerDisabledReason: string | null;
};

export default function CompetitionShow({
    competition,
    professorTeam,
    canRegisterTeam,
    registerDisabledReason,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const isProfessor = auth.user?.role === 'professor';

    const { post, processing } = useForm({});

    const submitRegistration = (e: React.FormEvent) => {
        e.preventDefault();
        post(competitionsRoutes.teams.store({ competition: competition.slug }).url);
    };

    const existingTeamHref =
        professorTeam !== null
            ? professorTeam.status === 'draft'
                ? teamsRoutes.edit({ team: professorTeam.id }).url
                : teamsRoutes.review({ team: professorTeam.id }).url
            : null;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Takmičenja', href: '/competitions' },
                { title: competition.name, href: `/competitions/${competition.slug}` },
            ]}
        >
            <Head title={competition.name} />
            <div className="max-w-3xl space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">{competition.name}</h1>
                    <p className="text-muted-foreground text-sm">
                        {competition.sport.name} · {competition.location} · godina {competition.year}
                    </p>
                </div>
                <p>
                    {formatDate(competition.start_date)} → {formatDate(competition.end_date)}
                </p>
                <p>Status: {STATUS_LABEL[competition.status] ?? competition.status}</p>

                {isProfessor && (
                    <ProfessorRegistrationCard
                        professorTeam={professorTeam}
                        canRegisterTeam={canRegisterTeam}
                        registerDisabledReason={registerDisabledReason}
                        existingTeamHref={existingTeamHref}
                        processing={processing}
                        onSubmit={submitRegistration}
                    />
                )}

                <h2 className="text-lg font-medium">Prijavljene ekipe</h2>
                {(competition.teams ?? []).length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nema prijavljenih ekipa.</p>
                ) : (
                    <ul className="list-disc pl-6 text-sm">
                        {(competition.teams ?? []).map((t) => (
                            <li key={t.id}>
                                {t.name} ({t.school.name})
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}

type CardProps = {
    professorTeam: ProfessorTeam | null;
    canRegisterTeam: boolean;
    registerDisabledReason: string | null;
    existingTeamHref: string | null;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
};

function ProfessorRegistrationCard({
    professorTeam,
    canRegisterTeam,
    registerDisabledReason,
    existingTeamHref,
    processing,
    onSubmit,
}: CardProps) {
    if (professorTeam !== null && existingTeamHref !== null) {
        return (
            <Card data-testid="professor-team-link">
                <CardHeader>
                    <CardTitle>Vaša prijavljena ekipa</CardTitle>
                    <CardDescription>
                        Status: <span className="font-medium">{TEAM_STATUS_LABEL[professorTeam.status]}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href={existingTeamHref}>
                            {professorTeam.status === 'draft' ? 'Nastavi popunjavanje' : 'Pregledaj prijavu'}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (canRegisterTeam) {
        return (
            <Card className="border-primary/40" data-testid="professor-register-cta">
                <CardHeader>
                    <CardTitle>Prijavi ekipu na ovo takmičenje</CardTitle>
                    <CardDescription>
                        Kreiramo draft prijavu za vašu školu — odmah ćete moći dodati članove.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Kreiranje…' : 'Prijavi ekipu na ovo takmičenje'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        );
    }

    if (registerDisabledReason !== null) {
        return (
            <Card data-testid="professor-register-disabled">
                <CardHeader>
                    <CardTitle>Prijava nije moguća</CardTitle>
                    <CardDescription>{registerDisabledReason}</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return null;
}
