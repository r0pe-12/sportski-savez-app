import { Head, Link, router } from '@inertiajs/react';
import { FilterBar, FilterBarChip } from '@/components/ui/filter-bar';
import { SelectField  } from '@/components/ui/select-field';
import type {SelectFieldOption} from '@/components/ui/select-field';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format-date';

type TeamRow = {
    id: number;
    status: string;
    signed_at: string | null;
    competition: { id: number; name: string };
    school: { id: number; name: string };
    professor: { id: number; name: string };
};

type PaginatedLink = { url: string | null; label: string; active: boolean };

type Paginated = {
    data: TeamRow[];
    current_page: number;
    last_page: number;
    links: PaginatedLink[];
};

type Option = { id: number; name: string };

type Filters = {
    status: string | null;
    competition_id: number | null;
    school_id: number | null;
};

type Props = {
    teams: Paginated;
    competitions: Option[];
    schools: Option[];
    filters: Filters;
};

const statusLabels: Record<string, { label: string; className: string }> = {
    draft: { label: 'Skica', className: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200' },
    submitted: { label: 'Predata', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
    active: { label: 'Aktivna', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
    rejected: { label: 'Odbijena', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
    cancelled: { label: 'Otkazana', className: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200' },
    withdrawn: { label: 'Povučena', className: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200' },
    completed: { label: 'Završena', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
};

const statusOrder = ['draft', 'submitted', 'active', 'rejected', 'cancelled', 'withdrawn', 'completed'];

const STATUS_OPTIONS: SelectFieldOption[] = statusOrder.map((s) => ({
    value: s,
    label: statusLabels[s]?.label ?? s,
}));

function renderDate(value: string | null): string {
    return formatDate(value) || '—';
}

function applyFilters(next: Partial<Filters>, current: Filters) {
    const merged: Record<string, string | number> = {};
    const status = next.status !== undefined ? next.status : current.status;
    const competitionId =
        next.competition_id !== undefined ? next.competition_id : current.competition_id;
    const schoolId = next.school_id !== undefined ? next.school_id : current.school_id;

    if (status) {
        merged.status = status;
    }

    if (competitionId) {
        merged.competition_id = competitionId;
    }

    if (schoolId) {
        merged.school_id = schoolId;
    }

    router.get(window.location.pathname, merged, {
        preserveScroll: true,
        preserveState: true,
        replace: true,
    });
}

export default function AdminTeamsIndex({ teams, competitions, schools, filters }: Props) {
    const isPendingFilter = filters.status === 'submitted';
    const hasActiveFilters = Boolean(filters.status || filters.competition_id || filters.school_id);

    const resetFilters = () => {
        router.get(window.location.pathname, {}, { preserveScroll: true, replace: true });
    };

    const competitionOptions: SelectFieldOption[] = (competitions ?? []).map((c) => ({
        value: String(c.id),
        label: c.name,
    }));

    const schoolOptions: SelectFieldOption[] = (schools ?? []).map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    return (
        <AppLayout breadcrumbs={[{ title: 'Ekipe', href: '/admin/teams' }]}>
            <Head title="Ekipe (admin)" />
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Sve ekipe</h1>

                <FilterBar
                    hasActiveFilters={hasActiveFilters}
                    onReset={resetFilters}
                >
                    <SelectField
                        id="filter-status"
                        label="Status"
                        placeholder="Svi statusi"
                        value={filters.status ?? ''}
                        onChange={(v) => applyFilters({ status: v || null }, filters)}
                        options={STATUS_OPTIONS}
                    />

                    <SelectField
                        id="filter-competition"
                        label="Takmičenje"
                        placeholder="Sva takmičenja"
                        value={filters.competition_id ? String(filters.competition_id) : ''}
                        onChange={(v) =>
                            applyFilters(
                                { competition_id: v ? Number(v) : null },
                                filters,
                            )
                        }
                        options={competitionOptions}
                    />

                    <SelectField
                        id="filter-school"
                        label="Škola"
                        placeholder="Sve škole"
                        value={filters.school_id ? String(filters.school_id) : ''}
                        onChange={(v) =>
                            applyFilters(
                                { school_id: v ? Number(v) : null },
                                filters,
                            )
                        }
                        options={schoolOptions}
                    />

                    <FilterBarChip
                        active={isPendingFilter}
                        tone="amber"
                        onClick={() =>
                            applyFilters(
                                { status: isPendingFilter ? null : 'submitted' },
                                filters,
                            )
                        }
                    >
                        Čeka odobrenje
                    </FilterBarChip>
                </FilterBar>

                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left">Takmičenje</th>
                                <th className="p-2 text-left">Škola</th>
                                <th className="p-2 text-left">Profesor</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Predato</th>
                                <th className="p-2 text-left">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(teams?.data ?? []).map((t) => {
                                const meta = statusLabels[t.status] ?? {
                                    label: t.status,
                                    className: 'bg-zinc-100 text-zinc-800',
                                };

                                return (
                                    <tr key={t.id} className="border-t">
                                        <td className="p-2">{t.competition.name}</td>
                                        <td className="p-2">{t.school.name}</td>
                                        <td className="p-2">{t.professor.name}</td>
                                        <td className="p-2">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${meta.className}`}
                                            >
                                                {meta.label}
                                            </span>
                                        </td>
                                        <td className="p-2">{renderDate(t.signed_at)}</td>
                                        <td className="p-2">
                                            <Link
                                                className="text-primary hover:underline"
                                                href={`/admin/teams/${t.id}`}
                                            >
                                                Detalji
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {(teams?.data ?? []).length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-muted-foreground p-4 text-center"
                                    >
                                        {hasActiveFilters
                                            ? 'Nema rezultata sa primijenjenim filterima.'
                                            : 'Nema prijavljenih ekipa.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {(teams?.last_page ?? 0) > 1 && (
                    <div className="flex items-center gap-2">
                        {(teams?.links ?? []).map((link, idx) => (
                            <button
                                key={`${link.label}-${idx}`}
                                type="button"
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) {
                                        router.get(
                                            link.url,
                                            {},
                                            { preserveScroll: true, preserveState: true },
                                        );
                                    }
                                }}
                                className={`rounded border px-3 py-1 text-xs ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background hover:bg-muted'
                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
