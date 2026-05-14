import { Head, Link, router } from '@inertiajs/react';
import { NativeSelect } from '@/components/ui/native-select';
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
    draft: { label: 'Skica', className: 'bg-zinc-100 text-zinc-800' },
    submitted: { label: 'Predata', className: 'bg-amber-100 text-amber-800' },
    active: { label: 'Aktivna', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Odbijena', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Otkazana', className: 'bg-zinc-100 text-zinc-800' },
    withdrawn: { label: 'Povučena', className: 'bg-zinc-100 text-zinc-800' },
    completed: { label: 'Završena', className: 'bg-blue-100 text-blue-800' },
};

const statusOrder = ['draft', 'submitted', 'active', 'rejected', 'cancelled', 'withdrawn', 'completed'];

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

    return (
        <AppLayout breadcrumbs={[{ title: 'Ekipe', href: '/admin/teams' }]}>
            <Head title="Ekipe (admin)" />
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Sve ekipe</h1>

                <div className="flex flex-wrap items-end gap-3 rounded border p-3">
                    <div className="flex flex-col">
                        <label className="text-muted-foreground mb-1 text-xs" htmlFor="filter-status">
                            Status
                        </label>
                        <NativeSelect
                            id="filter-status"
                            className="w-44"
                            value={filters.status ?? ''}
                            onChange={(e) =>
                                applyFilters({ status: e.target.value || null }, filters)
                            }
                        >
                            <option value="">Svi</option>
                            {statusOrder.map((s) => (
                                <option key={s} value={s}>
                                    {statusLabels[s]?.label ?? s}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>

                    <div className="flex flex-col">
                        <label
                            className="text-muted-foreground mb-1 text-xs"
                            htmlFor="filter-competition"
                        >
                            Takmičenje
                        </label>
                        <NativeSelect
                            id="filter-competition"
                            className="w-56"
                            value={filters.competition_id ?? ''}
                            onChange={(e) =>
                                applyFilters(
                                    {
                                        competition_id: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    },
                                    filters,
                                )
                            }
                        >
                            <option value="">Sva</option>
                            {competitions.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-muted-foreground mb-1 text-xs" htmlFor="filter-school">
                            Škola
                        </label>
                        <NativeSelect
                            id="filter-school"
                            className="w-56"
                            value={filters.school_id ?? ''}
                            onChange={(e) =>
                                applyFilters(
                                    { school_id: e.target.value ? Number(e.target.value) : null },
                                    filters,
                                )
                            }
                        >
                            <option value="">Sve</option>
                            {schools.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            applyFilters(
                                { status: isPendingFilter ? null : 'submitted' },
                                filters,
                            )
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            isPendingFilter
                                ? 'border-amber-400 bg-amber-100 text-amber-900'
                                : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        }`}
                    >
                        Čeka odobrenje
                    </button>
                </div>

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
                            {teams.data.map((t) => {
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
                            {teams.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-muted-foreground p-4 text-center"
                                    >
                                        Nema prijavljenih ekipa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {teams.last_page > 1 && (
                    <div className="flex items-center gap-2">
                        {teams.links.map((link, idx) => (
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
