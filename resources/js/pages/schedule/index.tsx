import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { useState } from 'react';
import { CompetitionCard } from '@/components/competitions/CompetitionCard';
import { FilterBar } from '@/components/ui/filter-bar';
import { SelectField  } from '@/components/ui/select-field';
import type {SelectFieldOption} from '@/components/ui/select-field';
import AppLayout from '@/layouts/app-layout';

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

const STATUS_OPTIONS: SelectFieldOption[] = [
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
    const [sportId, setSportId] = useState<string>(
        filters.sport_id ? String(filters.sport_id) : '',
    );
    const [status, setStatus] = useState<string>(filters.status ?? '');
    const [touched, setTouched] = useState(false);

    // Auto-apply na izmjenu filtera (Inertia + React standard pattern).
    useEffect(() => {
        if (!touched) {
            return;
        }

        const handle = setTimeout(() => {
            router.get(
                '/schedule',
                {
                    sport_id: sportId || undefined,
                    status: status || undefined,
                },
                { preserveScroll: true, preserveState: true, replace: true },
            );
        }, 100);

        return () => clearTimeout(handle);
    }, [sportId, status, touched]);

    const hasActiveFilters = Boolean(sportId || status);

    const resetFilters = () => {
        setTouched(true);
        setSportId('');
        setStatus('');
    };

    const sportOptions: SelectFieldOption[] = (sports ?? []).map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    return (
        <AppLayout breadcrumbs={[{ title: 'Raspored', href: '/schedule' }]}>
            <Head title="Raspored takmičenja" />
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Raspored takmičenja</h1>

                <FilterBar
                    hasActiveFilters={hasActiveFilters}
                    onReset={resetFilters}
                >
                    <SelectField
                        label="Sport"
                        placeholder="Svi sportovi"
                        value={sportId}
                        onChange={(v) => {
                            setTouched(true);
                            setSportId(v);
                        }}
                        options={sportOptions}
                    />
                    <SelectField
                        label="Status"
                        placeholder="Svi statusi"
                        value={status}
                        onChange={(v) => {
                            setTouched(true);
                            setStatus(v);
                        }}
                        options={STATUS_OPTIONS}
                    />
                </FilterBar>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(competitions ?? []).map((c) => (
                        <CompetitionCard key={c.id} competition={c} />
                    ))}
                </div>
                {(competitions ?? []).length === 0 && (
                    <p className="text-muted-foreground">
                        {hasActiveFilters
                            ? 'Nema rezultata sa primijenjenim filterima.'
                            : 'Nema takmičenja.'}
                    </p>
                )}
            </div>
        </AppLayout>
    );
}
