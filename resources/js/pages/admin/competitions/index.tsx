import { Head, Link, router } from '@inertiajs/react';
import { Award, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/ui/filter-bar';
import { SelectField  } from '@/components/ui/select-field';
import type {SelectFieldOption} from '@/components/ui/select-field';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format-date';
import { cn } from '@/lib/utils';

type CompetitionRow = {
    id: number;
    slug: string;
    name: string;
    start_date: string;
    end_date: string;
    location: string;
    status: string;
    year: number;
    sport: { id: number; name: string };
};

type SportOption = { id: number; name: string };

type Paginated = {
    data: CompetitionRow[];
    total: number;
    current_page: number;
    last_page: number;
};

type Filters = {
    status: string | null;
    sport_id: number | null;
    year: number | null;
};

const STATUS_META: Record<string, { label: string; className: string }> = {
    draft: {
        label: 'Skica',
        className: 'bg-muted text-muted-foreground',
    },
    open_registration: {
        label: 'Prijave otvorene',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
    in_progress: {
        label: 'U toku',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    },
    completed: {
        label: 'Završeno',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    },
};

function formatDateRange(start: string, end: string): string {
    const startFmt = formatDate(start);
    const endFmt = formatDate(end);

    if (startFmt === '' || endFmt === '') {
        return `${start} – ${end}`;
    }

    return `${startFmt} – ${endFmt}`;
}

function StatusBadge({ status }: { status: string }) {
    const meta = STATUS_META[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                meta.className,
            )}
        >
            {meta.label}
        </span>
    );
}

export default function CompetitionsIndex({
    competitions,
    sports,
    filters,
}: {
    competitions: Paginated;
    sports: SportOption[];
    filters: Filters;
}) {
    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

    // Filter values are driven directly by the server props — no local mirror state.
    const status = filters.status ?? '';
    const sportId = filters.sport_id ? String(filters.sport_id) : '';
    const year = filters.year ? String(filters.year) : '';

    const applyFilters = (next: { status?: string; sport_id?: string; year?: string }) => {
        const merged = {
            status: next.status ?? status,
            sport_id: next.sport_id ?? sportId,
            year: next.year ?? year,
        };
        router.get(
            '/admin/competitions',
            {
                status: merged.status || undefined,
                sport_id: merged.sport_id || undefined,
                year: merged.year || undefined,
            },
            { preserveScroll: true, preserveState: true },
        );
    };

    const resetFilters = () => {
        router.get('/admin/competitions', {}, { preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Obriši takmičenje?')) {
            router.delete(`/admin/competitions/${id}`);
        }
    };

    const safeData = competitions?.data ?? [];
    const total = competitions?.total ?? safeData.length;
    const hasActiveFilters = Boolean(status || sportId || year);

    const STATUS_OPTIONS: SelectFieldOption[] = [
        { value: 'draft', label: 'Skica' },
        { value: 'open_registration', label: 'Prijave otvorene' },
        { value: 'in_progress', label: 'U toku' },
        { value: 'completed', label: 'Završeno' },
    ];

    const sportOptions: SelectFieldOption[] = (sports ?? []).map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    const yearOptionsList: SelectFieldOption[] = (yearOptions ?? []).map((y) => ({
        value: String(y),
        label: String(y),
    }));

    return (
        <AppLayout breadcrumbs={[{ title: 'Takmičenja', href: '/admin/competitions' }]}>
            <Head title="Takmičenja" />
            <TooltipProvider>
                <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-semibold">Takmičenja</h1>
                            <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                                {total} {total === 1 ? 'takmičenje' : 'takmičenja'}
                            </span>
                        </div>
                        <Link href="/admin/competitions/create">
                            <Button>Novo takmičenje</Button>
                        </Link>
                    </div>

                    <FilterBar
                        hasActiveFilters={hasActiveFilters}
                        onReset={resetFilters}
                    >
                        <SelectField
                            label="Status"
                            placeholder="Svi statusi"
                            value={status}
                            onChange={(v) => applyFilters({ status: v })}
                            options={STATUS_OPTIONS}
                        />
                        <SelectField
                            label="Sport"
                            placeholder="Svi sportovi"
                            value={sportId}
                            onChange={(v) => applyFilters({ sport_id: v })}
                            options={sportOptions}
                        />
                        <SelectField
                            label="Godina"
                            placeholder="Sve godine"
                            value={year}
                            onChange={(v) => applyFilters({ year: v })}
                            options={yearOptionsList}
                        />
                    </FilterBar>

                    <div className="overflow-x-auto rounded border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="p-2 text-left">Naziv</th>
                                    <th className="p-2 text-left">Sport</th>
                                    <th className="p-2 text-left">Datum</th>
                                    <th className="p-2 text-left">Lokacija</th>
                                    <th className="p-2 text-left">Status</th>
                                    <th className="p-2 text-right">Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {safeData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-muted-foreground p-6 text-center">
                                            {hasActiveFilters
                                                ? 'Nema rezultata sa primijenjenim filterima.'
                                                : 'Nema takmičenja.'}
                                        </td>
                                    </tr>
                                ) : (
                                    safeData.map((c) => (
                                        <tr key={c.id} className="border-t">
                                            <td className="p-2 font-medium">{c.name}</td>
                                            <td className="p-2">{c.sport.name}</td>
                                            <td className="p-2 whitespace-nowrap">
                                                {formatDateRange(c.start_date, c.end_date)}
                                            </td>
                                            <td className="p-2">{c.location}</td>
                                            <td className="p-2">
                                                <StatusBadge status={c.status} />
                                            </td>
                                            <td className="p-2">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/admin/competitions/${c.id}/results`}
                                                                aria-label="Rezultati"
                                                            >
                                                                <Button variant="outline" size="icon" className="size-8">
                                                                    <Award className="size-4" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Rezultati</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/admin/competitions/${c.id}/edit`}
                                                                aria-label="Uredi"
                                                            >
                                                                <Button variant="outline" size="icon" className="size-8">
                                                                    <Pencil className="size-4" />
                                                                </Button>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Uredi</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                className="size-8"
                                                                onClick={() => handleDelete(c.id)}
                                                                aria-label="Obriši"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Obriši</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </TooltipProvider>
        </AppLayout>
    );
}
