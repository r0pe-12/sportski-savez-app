import { ResultEntryRow } from '@/components/results/ResultEntryRow';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

type Competition = { id: number; name: string; sport: { name: string; type: string } };

type TeamSubject = {
    id: number;
    school?: { name: string } | null;
};

type MemberSubject = {
    id: number;
    student?: { name: string } | null;
    team?: { school?: { name: string } | null } | null;
};

type Subject = TeamSubject & MemberSubject;

type Existing = Record<string, { placement: number; medal_type: string }>;

type Row = {
    subject_id: number;
    label: string;
    placement: number | '';
    medal_type: string;
};

type Props = {
    competition: Competition;
    subjects: Subject[];
    existing: Existing;
    subjectType: 'Team' | 'TeamMember';
};

export default function ResultsEnter({ competition, subjects, existing, subjectType }: Props) {
    const initial: Row[] = subjects.map((s) => {
        const key = `${subjectType === 'Team' ? 'App\\Models\\Team' : 'App\\Models\\TeamMember'}:${s.id}`;
        const ex = existing[key];
        const label = subjectType === 'Team'
            ? (s.school?.name ?? `#${s.id}`)
            : `${s.student?.name ?? 'Učenik'} (${s.team?.school?.name ?? '—'})`;

        return {
            subject_id: s.id,
            label,
            placement: (ex?.placement ?? '') as number | '',
            medal_type: ex?.medal_type ?? '',
        };
    });
    const [rows, setRows] = useState<Row[]>(initial);

    const handleSubmit = () => {
        const results = rows
            .filter((r) => r.placement !== '' && r.medal_type !== '')
            .map((r) => ({
                subject_type: subjectType,
                subject_id: r.subject_id,
                placement: r.placement,
                medal_type: r.medal_type,
            }));

        router.post(`/admin/competitions/${competition.id}/results`, { results });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Takmičenja', href: '/admin/competitions' },
                { title: competition.name, href: `/admin/competitions/${competition.id}/edit` },
                { title: 'Rezultati', href: `/admin/competitions/${competition.id}/results` },
            ]}
        >
            <Head title={`Rezultati — ${competition.name}`} />
            <div className="max-w-3xl space-y-4 p-6">
                <h1 className="text-2xl font-semibold">{competition.name}</h1>
                <p className="text-sm text-muted-foreground">
                    {competition.sport.name} ({competition.sport.type})
                </p>

                <div className="space-y-2">
                    {rows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nema ekipa/učesnika za unos rezultata.</p>
                    ) : (
                        rows.map((row, i) => (
                            <ResultEntryRow
                                key={row.subject_id}
                                label={row.label}
                                placement={row.placement}
                                medal={row.medal_type}
                                onChange={(p, m) =>
                                    setRows((prev) =>
                                        prev.map((r, idx) => (idx === i ? { ...r, placement: p, medal_type: m } : r))
                                    )
                                }
                            />
                        ))
                    )}
                </div>

                <Button onClick={handleSubmit} disabled={rows.length === 0}>
                    Sačuvaj rezultate
                </Button>
            </div>
        </AppLayout>
    );
}
