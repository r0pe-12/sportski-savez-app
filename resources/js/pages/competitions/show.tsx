import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format-date';

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

const STATUS_LABEL: Record<string, string> = {
    draft: 'Skica',
    open_registration: 'Prijave otvorene',
    in_progress: 'U toku',
    completed: 'Završeno',
};

export default function CompetitionShow({ competition }: { competition: Competition }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Takmičenja', href: '/competitions' },
                { title: competition.name, href: `/competitions/${competition.slug}` },
            ]}
        >
            <Head title={competition.name} />
            <div className="max-w-3xl space-y-4 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">{competition.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        {competition.sport.name} · {competition.location} · godina {competition.year}
                    </p>
                </div>
                <p>
                    {formatDate(competition.start_date)} → {formatDate(competition.end_date)}
                </p>
                <p>Status: {STATUS_LABEL[competition.status] ?? competition.status}</p>

                <h2 className="text-lg font-medium">Prijavljene ekipe</h2>
                {competition.teams.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nema prijavljenih ekipa.</p>
                ) : (
                    <ul className="list-disc pl-6 text-sm">
                        {competition.teams.map((t) => (
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
