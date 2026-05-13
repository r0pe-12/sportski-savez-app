import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { VerificationStatusBadge } from '@/components/students/verification-status-badge';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
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

const statusOptions: { value: string; label: string }[] = [
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

    return (
        <AppLayout breadcrumbs={[{ title: 'Učenici', href: '/admin/students' }]}>
            <Head title="Učenici" />
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Učenici</h1>

                <div className="flex flex-wrap items-end gap-3 rounded border p-3">
                    <div className="flex flex-col">
                        <label
                            className="text-muted-foreground mb-1 text-xs"
                            htmlFor="filter-search"
                        >
                            Pretraga (ime ili JMB)
                        </label>
                        <Input
                            id="filter-search"
                            type="search"
                            placeholder="npr. Marko ili 0101..."
                            className="w-64"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label
                            className="text-muted-foreground mb-1 text-xs"
                            htmlFor="filter-school"
                        >
                            Škola
                        </label>
                        <NativeSelect
                            id="filter-school"
                            className="w-56"
                            value={filters.school_id ?? ''}
                            onChange={(e) =>
                                applyFilters(
                                    {
                                        school_id: e.target.value ? Number(e.target.value) : null,
                                    },
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

                    <div className="flex flex-col">
                        <label
                            className="text-muted-foreground mb-1 text-xs"
                            htmlFor="filter-status"
                        >
                            Status verifikacije
                        </label>
                        <NativeSelect
                            id="filter-status"
                            className="w-56"
                            value={filters.status ?? ''}
                            onChange={(e) =>
                                applyFilters({ status: e.target.value || null }, filters)
                            }
                        >
                            <option value="">Svi</option>
                            {statusOptions.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </NativeSelect>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            applyFilters(
                                { status: isMismatchedFilter ? null : 'mismatched' },
                                filters,
                            )
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            isMismatchedFilter
                                ? 'border-red-400 bg-red-100 text-red-900'
                                : 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                        }`}
                    >
                        Mismatched
                    </button>
                </div>

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
                            {students.data.map((s) => (
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
                            {students.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-muted-foreground p-4 text-center"
                                    >
                                        Nema učenika za zadate filtere.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {students.last_page > 1 && (
                    <div className="flex items-center gap-2">
                        {students.links.map((link, idx) => (
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
