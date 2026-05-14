import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { VerificationStatusBadge } from '@/components/students/verification-status-badge';
import { FilterBar, FilterBarChip } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { SelectField  } from '@/components/ui/select-field';
import type {SelectFieldOption} from '@/components/ui/select-field';
import AppLayout from '@/layouts/app-layout';

type Student = {
    id: number;
    name: string;
    jmb: string;
    grade: string;
    verification_status: string;
    school: { id: number; name: string; code: string } | null;
};

type PaginatedLink = { url: string | null; label: string; active: boolean };

type Page = {
    data: Student[];
    current_page: number;
    last_page: number;
    links: PaginatedLink[];
};

type SchoolOption = { id: number; name: string };

type Filters = {
    q: string | null;
    school_id: number | null;
    status: string | null;
};

type Props = {
    students: Page;
    schools: SchoolOption[];
    filters: Filters;
};

const STATUS_OPTIONS: SelectFieldOption[] = [
    { value: 'unverified', label: 'Neverifikovan' },
    { value: 'pending', label: 'U toku' },
    { value: 'verified', label: 'Verifikovan' },
    { value: 'mismatched', label: 'Razlika sa eDnevnik' },
    { value: 'failed', label: 'Greška' },
];

function applyFilters(next: Partial<Filters>, current: Filters) {
    const params: Record<string, string | number> = {};
    const q = next.q !== undefined ? next.q : current.q;
    const schoolId = next.school_id !== undefined ? next.school_id : current.school_id;
    const status = next.status !== undefined ? next.status : current.status;

    if (q) {
        params.q = q;
    }

    if (schoolId) {
        params.school_id = schoolId;
    }

    if (status) {
        params.status = status;
    }

    router.get(window.location.pathname, params, {
        preserveScroll: true,
        preserveState: true,
        replace: true,
    });
}

export default function StudentsAdminIndex({ students, schools, filters }: Props) {
    const [searchValue, setSearchValue] = useState(filters.q ?? '');
    const firstRender = useRef(true);
    const lastApplied = useRef(filters.q ?? '');

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const handle = setTimeout(() => {
            const trimmed = searchValue.trim();

            if (trimmed === lastApplied.current) {
                return;
            }

            lastApplied.current = trimmed;
            applyFilters({ q: trimmed || null }, filters);
        }, 300);

        return () => clearTimeout(handle);
    }, [searchValue, filters]);

    const isMismatchedFilter = filters.status === 'mismatched';
    const hasActiveFilters = Boolean(filters.q || filters.school_id || filters.status);

    const resetFilters = () => {
        setSearchValue('');
        lastApplied.current = '';
        router.get(window.location.pathname, {}, { preserveScroll: true, replace: true });
    };

    const schoolOptions: SelectFieldOption[] = (schools ?? []).map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    return (
        <AppLayout breadcrumbs={[{ title: 'Učenici', href: '/admin/students' }]}>
            <Head title="Učenici" />
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Učenici</h1>

                <FilterBar
                    hasActiveFilters={hasActiveFilters}
                    onReset={resetFilters}
                >
                    <div className="flex flex-col gap-1.5">
                        <label
                            className="text-foreground text-sm font-medium leading-none"
                            htmlFor="filter-search"
                        >
                            Pretraga
                        </label>
                        <div className="relative">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                id="filter-search"
                                type="search"
                                placeholder="Ime ili JMB…"
                                className="h-10 pl-9"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                    </div>

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

                    <SelectField
                        id="filter-status"
                        label="Status verifikacije"
                        placeholder="Svi statusi"
                        value={filters.status ?? ''}
                        onChange={(v) =>
                            applyFilters({ status: v || null }, filters)
                        }
                        options={STATUS_OPTIONS}
                    />

                    <FilterBarChip
                        active={isMismatchedFilter}
                        tone="red"
                        onClick={() =>
                            applyFilters(
                                { status: isMismatchedFilter ? null : 'mismatched' },
                                filters,
                            )
                        }
                    >
                        Mismatched
                    </FilterBarChip>
                </FilterBar>

                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left">Ime</th>
                                <th className="p-2 text-left">JMB</th>
                                <th className="p-2 text-left">Razred</th>
                                <th className="p-2 text-left">Škola</th>
                                <th className="p-2 text-left">Verifikacija</th>
                                <th className="p-2 text-left"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(students?.data ?? []).map((s) => (
                                <tr key={s.id} className="border-t">
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2 font-mono text-xs">{s.jmb}</td>
                                    <td className="p-2">{s.grade}</td>
                                    <td className="p-2">{s.school?.name ?? '—'}</td>
                                    <td className="p-2">
                                        <VerificationStatusBadge status={s.verification_status} />
                                    </td>
                                    <td className="p-2">
                                        <Link
                                            className="text-primary hover:underline"
                                            href={`/admin/students/${s.id}/verify`}
                                        >
                                            Detalji
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(students?.data ?? []).length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-muted-foreground p-4 text-center"
                                    >
                                        {hasActiveFilters
                                            ? 'Nema rezultata sa primijenjenim filterima.'
                                            : 'Nema učenika.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {(students?.last_page ?? 0) > 1 && (
                    <div className="flex items-center gap-2">
                        {(students?.links ?? []).map((link, idx) => (
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
