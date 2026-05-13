import { CompetitionCard } from '@/components/competitions/CompetitionCard';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

type Sport = { id: number; name: string; type: string };
type Competition = {
    id: number;
    slug: string;
    name: string;
    start_date: string;
    end_date: string;
    location: string;
    status: string;
    teams_count: number;
    sport: { id: number; name: string; type: string };
};

const statuses = [
    { value: '', label: 'Svi statusi' },
    { value: 'open_registration', label: 'Prijave otvorene' },
    { value: 'in_progress', label: 'U toku' },
    { value: 'completed', label: 'Završeno' },
];

export default function ScheduleIndex({
    competitions,
    sports,
    filters,
}: {
    competitions: Competition[];
    sports: Sport[];
    filters: { sport_id?: number | string; status?: string };
}) {
    const [sportId, setSportId] = useState<string>(filters.sport_id ? String(filters.sport_id) : '');
    const [status, setStatus] = useState<string>(filters.status ?? '');

    const applyFilters = () => {
        router.get(
            '/schedule',
            {
                sport_id: sportId || undefined,
                status: status || undefined,
            },
            { preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Raspored', href: '/schedule' }]}>
            <Head title="Raspored takmičenja" />
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Raspored takmičenja</h1>

                <div className="flex flex-wrap items-end gap-2 rounded border p-3">
                    <div className="grid gap-1">
                        <label className="text-muted-foreground text-xs">Sport</label>
                        <select
                            value={sportId}
                            onChange={(e) => setSportId(e.target.value)}
                            className="bg-background h-9 rounded-md border px-3 text-sm"
                        >
                            <option value="">Svi sportovi</option>
                            {sports.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-1">
                        <label className="text-muted-foreground text-xs">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-background h-9 rounded-md border px-3 text-sm"
                        >
                            {statuses.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button onClick={applyFilters}>Filtriraj</Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {competitions.map((c) => (
                        <CompetitionCard key={c.id} competition={c} />
                    ))}
                </div>
                {competitions.length === 0 && <p className="text-muted-foreground">Nema takmičenja za izabrane filtere.</p>}
            </div>
        </AppLayout>
    );
}
