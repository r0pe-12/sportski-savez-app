import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

type Team = {
    id: number;
    status: string;
    competition: { name: string; sport: { name: string } };
    school: { name: string };
    created_at: string;
};

type Page = { data: Team[] };

const statusLabel: Record<string, string> = {
    draft: 'Skica',
    submitted: 'Predato',
    active: 'Odobreno',
    rejected: 'Odbijeno',
    cancelled: 'Otkazano',
    withdrawn: 'Povučeno',
    completed: 'Završeno',
};

export default function TeamsIndex({ teams }: { teams: Page }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Moje ekipe', href: '/teams' }]}>
            <Head title="Moje ekipe" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Moje ekipe</h1>
                    <Link href="/teams/create">
                        <Button>Nova prijava ekipe</Button>
                    </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {teams.data.map((t) => (
                        <Link
                            key={t.id}
                            href={`/teams/${t.id}/edit`}
                            className="hover:bg-muted block rounded border p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-medium">{t.competition.name}</h3>
                                    <p className="text-muted-foreground text-sm">{t.competition.sport.name}</p>
                                </div>
                                <span className="bg-muted rounded px-2 py-0.5 text-xs">
                                    {statusLabel[t.status] ?? t.status}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
                {teams.data.length === 0 && (
                    <p className="text-muted-foreground">Još nema prijavljenih ekipa.</p>
                )}
            </div>
        </AppLayout>
    );
}
