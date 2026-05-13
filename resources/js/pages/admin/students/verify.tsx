import { Head, router } from '@inertiajs/react';
import { MismatchTable } from '@/components/students/mismatch-table';
import { VerificationStatusBadge } from '@/components/students/verification-status-badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

type Student = {
    id: number;
    name: string;
    jmb: string;
    grade: string;
    verification_status: string;
    school: { id: number; name: string; code: string } | null;
};

type Mismatches = Record<string, { local: string; remote: string }>;

export default function StudentVerify({
    student,
    lastMismatches,
}: {
    student: Student;
    lastMismatches?: Mismatches | null;
}) {
    const confirmAnd = (url: string, msg: string) => {
        if (confirm(msg)) {
            router.post(url);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Učenici', href: '/admin/students' },
                { title: student.name, href: `/admin/students/${student.id}/verify` },
            ]}
        >
            <Head title={`Verifikuj ${student.name}`} />
            <div className="max-w-2xl space-y-4 p-6">
                <h1 className="text-2xl font-semibold">{student.name}</h1>
                <div className="space-y-1 text-sm">
                    <p>
                        JMB: <span className="font-mono">{student.jmb}</span>
                    </p>
                    <p>Razred: {student.grade}</p>
                    <p>
                        Škola: {student.school?.name ?? '—'}
                        {student.school?.code ? ` (${student.school.code})` : ''}
                    </p>
                    <div className="pt-2">
                        <VerificationStatusBadge status={student.verification_status} />
                    </div>
                </div>

                {lastMismatches && Object.keys(lastMismatches).length > 0 && (
                    <section className="space-y-2">
                        <h3 className="font-medium">Razlike sa eDnevnik-om</h3>
                        <MismatchTable mismatches={lastMismatches} />
                    </section>
                )}

                <div className="flex gap-2 border-t pt-4">
                    {student.verification_status !== 'pending' && (
                        <Button onClick={() => router.post(`/admin/students/${student.id}/verify`)}>
                            Pokreni verifikaciju
                        </Button>
                    )}
                    {student.verification_status === 'mismatched' && (
                        <Button
                            variant="outline"
                            onClick={() =>
                                confirmAnd(
                                    `/admin/students/${student.id}/manual-approve`,
                                    'Manuelno potvrditi učenika uprkos razlikama?',
                                )
                            }
                        >
                            Manuelno potvrdi
                        </Button>
                    )}
                    {student.verification_status === 'verified' && (
                        <Button
                            variant="destructive"
                            onClick={() =>
                                confirmAnd(
                                    `/admin/students/${student.id}/reset-verification`,
                                    'Resetovati verifikaciju učenika?',
                                )
                            }
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
