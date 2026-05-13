import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';

type CertificateStatus = 'pending' | 'valid' | 'expired' | 'invalid' | 'manual_review' | 'superseded';

type Member = {
    id: number;
    student: { name: string; grade: string };
    medical_certificate: { status: CertificateStatus } | null;
};

type Team = {
    id: number;
    status: string;
    competition: { name: string; sport: { name: string } };
    school: { name: string };
    professor: { name: string; email: string };
    members: Member[];
    signature: string | null;
    signed_at: string | null;
    rejection_reason?: string | null;
};

function CertificateBadge({ status }: { status: CertificateStatus }) {
    const colors: Record<CertificateStatus, string> = {
        valid: 'bg-green-100 text-green-800',
        pending: 'bg-amber-100 text-amber-800',
        expired: 'bg-red-100 text-red-800',
        invalid: 'bg-red-100 text-red-800',
        manual_review: 'bg-blue-100 text-blue-800',
        superseded: 'bg-zinc-100 text-zinc-800',
    };

    return (
        <span className={`rounded px-2 py-1 text-xs font-medium ${colors[status]}`}>
            {status}
        </span>
    );
}

export default function AdminTeamsShow({ team }: { team: Team }) {
    const [showRejectForm, setShowRejectForm] = useState(false);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Ekipe', href: '/admin/teams' },
                { title: team.competition.name, href: `/admin/teams/${team.id}` },
            ]}
        >
            <Head title={team.competition.name} />
            <div className="max-w-2xl space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold">{team.competition.name}</h1>
                    <p className="text-muted-foreground">
                        {team.school.name} · {team.competition.sport.name}
                    </p>
                    <p className="text-sm">
                        Profesor: {team.professor.name} ({team.professor.email})
                    </p>
                    <p className="text-sm">
                        Status: <strong>{team.status}</strong>
                    </p>
                    {team.signature && (
                        <p className="text-sm">
                            Potpis: {team.signature} ({team.signed_at})
                        </p>
                    )}
                    {team.rejection_reason && (
                        <p className="text-sm text-red-700">
                            Razlog odbijanja: {team.rejection_reason}
                        </p>
                    )}
                </div>

                <section>
                    <h3 className="mb-2 text-sm font-medium">Članovi ({team.members.length})</h3>
                    <ul className="space-y-2">
                        {team.members.map((m) => (
                            <li
                                key={m.id}
                                className="flex justify-between rounded border p-2"
                            >
                                <span>
                                    {m.student.name} ({m.student.grade})
                                </span>
                                {m.medical_certificate && (
                                    <CertificateBadge status={m.medical_certificate.status} />
                                )}
                            </li>
                        ))}
                    </ul>
                </section>

                {team.status === 'submitted' && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() =>
                                router.post(`/admin/teams/${team.id}/approve`)
                            }
                        >
                            Odobri
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setShowRejectForm(true)}
                        >
                            Odbij
                        </Button>
                    </div>
                )}

                {showRejectForm && (
                    <Form
                        action={`/admin/teams/${team.id}/reject`}
                        method="post"
                        className="space-y-2 rounded border p-3"
                    >
                        {({ errors, processing }) => (
                            <>
                                <Input
                                    name="reason"
                                    placeholder="Razlog odbijanja..."
                                    required
                                    minLength={5}
                                />
                                {errors.reason && (
                                    <p className="text-sm text-red-600">{errors.reason}</p>
                                )}
                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        Potvrdi odbijanje
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowRejectForm(false)}
                                    >
                                        Otkaži
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                )}
            </div>
        </AppLayout>
    );
}
