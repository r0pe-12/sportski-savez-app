import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, FileCheck2 } from 'lucide-react';
import { useState } from 'react';
import { CertificateStatusBadge } from '@/components/medical-certificates/CertificateStatusBadge';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/ui/filter-bar';
import { SelectField  } from '@/components/ui/select-field';
import type {SelectFieldOption} from '@/components/ui/select-field';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format-date';

type School = { id: number; name: string };
type Sport = { id: number; name: string };
type Competition = { id: number; name: string; sport?: Sport };
type Team = { id: number; competition?: Competition | null; school?: School | null };
type Student = { id: number; name: string; email: string };
type TeamMember = {
    id: number;
    position?: string | null;
    student?: Student | null;
    team?: Team | null;
};
type Certificate = {
    id: number;
    status: string;
    original_filename: string;
    created_at: string;
    expires_at: string | null;
    extracted_name: string | null;
    ocr_confidence: number | string | null;
    team_member?: TeamMember | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };
type Paginated = {
    data: Certificate[];
    current_page: number;
    last_page: number;
    links: PaginationLink[];
};

type Filters = {
    status: string;
    school_id: number | '';
};

type StatusOption = { value: string; label: string };

type Props = {
    certificates: Paginated;
    filters: Filters;
    schools: School[];
    statuses: StatusOption[];
};

const statusLabelMap: Record<string, string> = {
    pending: 'OCR u toku',
    valid: 'Validna',
    expired: 'Istekla',
    invalid: 'Nevalidna',
    manual_review: 'Ručna provjera',
    superseded: 'Zamijenjena',
};

function renderDate(iso: string | null): string {
    return formatDate(iso) || '—';
}

export default function AdminCertificatesIndex({
    certificates,
    filters,
    schools,
    statuses,
}: Props) {
    const [local, setLocal] = useState<Filters>(filters);

    const apply = (next: Partial<Filters>) => {
        const merged = { ...local, ...next };
        setLocal(merged);
        router.get(
            '/admin/certificates',
            {
                status: merged.status,
                school_id: merged.school_id === '' ? undefined : merged.school_id,
            } as Record<string, unknown>,
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const handleApprove = (id: number) => {
        if (!window.confirm('Odobriti sertifikat manuelno?')) {
            return;
        }

        router.post(
            `/admin/certificates/${id}/manual-approve`,
            {},
            { preserveScroll: true },
        );
    };

    const handleReject = (id: number) => {
        if (!window.confirm('Označiti sertifikat kao nevalidan? Akcija se ne može poništiti.')) {
            return;
        }

        router.post(
            `/admin/certificates/${id}/reject`,
            {},
            { preserveScroll: true },
        );
    };

    const isEmpty = certificates.data.length === 0;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sertifikati', href: '/admin/certificates' },
            ]}
        >
            <Head title="Sertifikati — ručna provjera" />

            <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                    <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-lg">
                        <FileCheck2 className="size-6" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Sertifikati — ručna provjera
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Pregled ljekarskih uvjerenja koja čekaju manuelnu odluku administratora.
                        </p>
                    </div>
                </div>

                <FilterBar
                    hasActiveFilters={local.status !== 'all' || local.school_id !== ''}
                    onReset={() => apply({ status: 'all', school_id: '' })}
                >
                    <SelectField
                        label="Status"
                        placeholder="Svi statusi"
                        value={local.status === 'all' ? '' : local.status}
                        onChange={(v) => apply({ status: v || 'all' })}
                        options={
                            statuses.map((s) => ({
                                value: s.value,
                                label: statusLabelMap[s.value] ?? s.label,
                            })) as SelectFieldOption[]
                        }
                    />

                    <SelectField
                        label="Škola"
                        placeholder="Sve škole"
                        value={local.school_id === '' ? '' : String(local.school_id)}
                        onChange={(v) =>
                            apply({ school_id: v === '' ? '' : Number(v) })
                        }
                        options={schools.map((s) => ({
                            value: String(s.id),
                            label: s.name,
                        }))}
                    />
                </FilterBar>

                {isEmpty ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-12 text-center">
                        <div className="bg-green-100 text-green-700 flex size-12 items-center justify-center rounded-full">
                            <CheckCircle2 className="size-6" />
                        </div>
                        <p className="text-sm font-medium">
                            Nema sertifikata za ručnu provjeru.
                        </p>
                        <p className="text-muted-foreground text-xs">
                            Sve je čisto. Provjeri ponovo nakon novih prijava.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="p-3 text-left">Učenik</th>
                                    <th className="p-3 text-left">Tim / takmičenje</th>
                                    <th className="p-3 text-left">Škola</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Uploadovano</th>
                                    <th className="p-3 text-left">PDF</th>
                                    <th className="p-3 text-left">Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certificates.data.map((c) => {
                                    const member = c.team_member;
                                    const student = member?.student;
                                    const team = member?.team;
                                    const competition = team?.competition;
                                    const school = team?.school;
                                    const canDecide =
                                        c.status === 'manual_review' || c.status === 'pending';

                                    return (
                                        <tr key={c.id} className="border-t align-top">
                                            <td className="p-3">
                                                <div className="font-medium">
                                                    {student?.name ?? '—'}
                                                </div>
                                                {member?.position && (
                                                    <div className="text-muted-foreground text-xs">
                                                        {member.position}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    {competition?.name ?? '—'}
                                                </div>
                                                {competition?.sport?.name && (
                                                    <div className="text-muted-foreground text-xs">
                                                        {competition.sport.name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">{school?.name ?? '—'}</td>
                                            <td className="p-3">
                                                <CertificateStatusBadge status={c.status} />
                                            </td>
                                            <td className="p-3 text-xs">
                                                {renderDate(c.created_at)}
                                            </td>
                                            <td className="p-3">
                                                <Link
                                                    href={`/certificates/${c.id}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    Detalji
                                                </Link>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {c.status === 'manual_review' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(c.id)}
                                                        >
                                                            Odobri
                                                        </Button>
                                                    )}
                                                    {canDecide && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleReject(c.id)}
                                                        >
                                                            Odbij
                                                        </Button>
                                                    )}
                                                    {!canDecide && (
                                                        <span className="text-muted-foreground text-xs">
                                                            —
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!isEmpty && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {certificates.links.map((l, i) =>
                            l.url ? (
                                <Link
                                    key={i}
                                    href={l.url}
                                    className={`rounded border px-2 py-1 ${
                                        l.active ? 'bg-primary text-primary-foreground' : ''
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="text-muted-foreground px-2 py-1"
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                />
                            ),
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
