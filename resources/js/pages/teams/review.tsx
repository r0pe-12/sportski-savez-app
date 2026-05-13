import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { SharedData } from '@/types/auth';
import { Form, Head, Link, usePage } from '@inertiajs/react';

type CertificateStatus = 'pending' | 'valid' | 'expired' | 'invalid' | 'manual_review' | 'superseded';

type Member = {
    id: number;
    student: { name: string; grade: string };
    medical_certificate: { status: CertificateStatus } | null;
};

type Team = {
    id: number;
    status: string;
    competition: {
        name: string;
        sport: { name: string; members_count: number; substitutes_count: number };
    };
    school: { name: string };
    members: Member[];
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
    const labels: Record<CertificateStatus, string> = {
        valid: 'Validna',
        pending: 'Na obradi',
        expired: 'Istekla',
        invalid: 'Nevažeća',
        manual_review: 'Ručna provjera',
        superseded: 'Zamijenjena',
    };

    return (
        <span className={`rounded px-2 py-1 text-xs font-medium ${colors[status]}`}>
            {labels[status]}
        </span>
    );
}

export default function TeamsReview({ team }: { team: Team }) {
    const { auth } = usePage<SharedData>().props;
    const userName = auth?.user?.name ?? '';

    const allValid = team.members.every((m) => m.medical_certificate?.status === 'valid');
    const minMembers = team.competition.sport.members_count;
    const maxMembers = minMembers + team.competition.sport.substitutes_count;
    const inRange = team.members.length >= minMembers && team.members.length <= maxMembers;
    const canSubmit = allValid && inRange && team.status === 'draft';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Moje ekipe', href: '/teams' },
                { title: team.competition.name, href: `/teams/${team.id}/edit` },
                { title: 'Pregled', href: `/teams/${team.id}/review` },
            ]}
        >
            <Head title="Pregled i potpis" />
            <div className="max-w-2xl space-y-6 p-6">
                <h1 className="text-2xl font-semibold">Pregled prijave</h1>

                <section className="rounded border p-4">
                    <h2 className="font-medium">{team.competition.name}</h2>
                    <p className="text-muted-foreground text-sm">
                        {team.competition.sport.name} · {team.school.name}
                    </p>
                </section>

                <section>
                    <h3 className="mb-2 text-sm font-medium">Članovi ({team.members.length})</h3>
                    <ul className="space-y-2">
                        {team.members.map((m) => (
                            <li
                                key={m.id}
                                className="flex items-center justify-between rounded border p-3"
                            >
                                <div>
                                    <p>{m.student.name}</p>
                                    <p className="text-muted-foreground text-xs">{m.student.grade}</p>
                                </div>
                                {m.medical_certificate ? (
                                    <CertificateBadge status={m.medical_certificate.status} />
                                ) : (
                                    <span className="text-xs text-red-600">Bez potvrde</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>

                {!canSubmit && (
                    <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <p className="font-medium">Prijava ne može biti predata:</p>
                        <ul className="ml-5 list-disc">
                            {!allValid && <li>Svi članovi moraju imati validnu ljekarsku potvrdu.</li>}
                            {!inRange && (
                                <li>
                                    Broj članova ({team.members.length}) mora biti između {minMembers} i {maxMembers}.
                                </li>
                            )}
                            {team.status !== 'draft' && (
                                <li>Ekipa nije u draft stanju (trenutni status: {team.status}).</li>
                            )}
                        </ul>
                    </div>
                )}

                {canSubmit && (
                    <Form action={`/teams/${team.id}/submit`} method="post" className="space-y-4">
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="signature">
                                        Potpis (puno ime profesora: <strong>{userName}</strong>)
                                    </Label>
                                    <Input
                                        id="signature"
                                        name="signature"
                                        required
                                        placeholder={userName}
                                    />
                                    <InputError message={errors.signature} />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        Potpiši i predaj
                                    </Button>
                                    <Link href={`/teams/${team.id}/edit`}>
                                        <Button variant="outline" type="button">
                                            Nazad
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </Form>
                )}
            </div>
        </AppLayout>
    );
}
