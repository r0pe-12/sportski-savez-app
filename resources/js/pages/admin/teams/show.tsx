import { Form, Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Eye,
    FileWarning,
    History,
    ShieldCheck,
    ShieldQuestion,
    Users2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { FormCard, FormCardBody } from '@/components/forms/form-card';
import { FormSection } from '@/components/forms/form-section';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/format-date';

type CertificateStatus =
    | 'pending'
    | 'valid'
    | 'expired'
    | 'invalid'
    | 'manual_review'
    | 'superseded';

type VerificationStatus =
    | 'unverified'
    | 'pending'
    | 'verified'
    | 'mismatched'
    | 'failed';

type TeamStatus =
    | 'draft'
    | 'submitted'
    | 'active'
    | 'rejected'
    | 'cancelled'
    | 'withdrawn'
    | 'completed';

type Member = {
    id: number;
    student: {
        id: number;
        name: string;
        grade: string | null;
        verification_status: VerificationStatus | null;
    };
    medical_certificate: { id: number; status: CertificateStatus } | null;
};

type Team = {
    id: number;
    status: TeamStatus;
    competition: {
        id: number;
        name: string;
        sport: { id: number; name: string; members_count: number };
    };
    school: { id: number; name: string };
    professor: { id: number; name: string; email: string };
    members: Member[];
    signature: string | null;
    signed_at: string | null;
    rejection_reason?: string | null;
};

type AuditEntry = {
    id: string;
    action: string;
    user: { id: number; name: string; role: string } | null;
    created_at: string;
    payload: Record<string, unknown> | null;
};

type CertificateSummary = {
    valid: number;
    manual_review: number;
    expired: number;
    invalid: number;
    pending: number;
    missing: number;
    total: number;
};

const teamStatusBadge: Record<
    TeamStatus,
    { label: string; className: string }
> = {
    draft: {
        label: 'Nacrt',
        className:
            'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    },
    submitted: {
        label: 'Poslata',
        className:
            'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    },
    active: {
        label: 'Aktivna',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    },
    rejected: {
        label: 'Odbijena',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    },
    cancelled: {
        label: 'Otkazana',
        className:
            'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    },
    withdrawn: {
        label: 'Povučena',
        className:
            'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    },
    completed: {
        label: 'Završena',
        className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    },
};

const certBadge: Record<
    CertificateStatus,
    {
        label: string;
        className: string;
        Icon: React.ComponentType<{ className?: string }>;
    }
> = {
    pending: {
        label: 'OCR u toku',
        className:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        Icon: Clock,
    },
    valid: {
        label: 'Validna',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        Icon: CheckCircle2,
    },
    expired: {
        label: 'Istekla',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        Icon: FileWarning,
    },
    invalid: {
        label: 'Nevalidna',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        Icon: AlertCircle,
    },
    manual_review: {
        label: 'Ručna provjera',
        className:
            'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        Icon: Clock,
    },
    superseded: {
        label: 'Zamijenjena',
        className:
            'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        Icon: FileWarning,
    },
};

const verificationBadge: Record<
    VerificationStatus,
    {
        label: string;
        className: string;
        Icon: React.ComponentType<{ className?: string }>;
    }
> = {
    verified: {
        label: 'eDnevnik OK',
        className:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        Icon: ShieldCheck,
    },
    pending: {
        label: 'Provjera u toku',
        className:
            'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
        Icon: Clock,
    },
    unverified: {
        label: 'Neprovjeren',
        className:
            'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
        Icon: ShieldQuestion,
    },
    mismatched: {
        label: 'Neslaganje',
        className:
            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        Icon: AlertCircle,
    },
    failed: {
        label: 'Greška',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        Icon: XCircle,
    },
};

function renderDateTime(iso: string | null): string {
    return formatDateTime(iso) || '—';
}

function CertificateSummaryPanel({ summary }: { summary: CertificateSummary }) {
    const rows: Array<{ key: keyof CertificateSummary; label: string; tone: string }> = [
        { key: 'valid', label: 'Validne', tone: 'text-green-700 dark:text-green-400' },
        {
            key: 'manual_review',
            label: 'Ručna provjera',
            tone: 'text-purple-700 dark:text-purple-400',
        },
        { key: 'pending', label: 'OCR u toku', tone: 'text-yellow-700 dark:text-yellow-400' },
        { key: 'expired', label: 'Istekle', tone: 'text-red-700 dark:text-red-400' },
        { key: 'invalid', label: 'Nevalidne', tone: 'text-red-700 dark:text-red-400' },
        { key: 'missing', label: 'Bez potvrde', tone: 'text-zinc-700 dark:text-zinc-300' },
    ];

    return (
        <div className="bg-muted/30 rounded-xl border p-4 text-sm">
            <h3 className="mb-2 font-medium">Potvrde po članu</h3>
            <dl className="space-y-1 text-xs">
                <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Ukupno članova</dt>
                    <dd className="font-medium">{summary.total}</dd>
                </div>
                {rows.map(({ key, label, tone }) => (
                    <div key={key} className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className={`font-medium ${tone}`}>{summary[key]}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function TeamMetaPanel({ team }: { team: Team }) {
    return (
        <div className="bg-muted/30 rounded-xl border p-4 text-sm">
            <h3 className="mb-2 font-medium">Detalji ekipe</h3>
            <dl className="text-muted-foreground space-y-1 text-xs">
                <div className="flex justify-between gap-2">
                    <dt>Sport</dt>
                    <dd className="text-foreground">{team.competition.sport.name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                    <dt>Veličina ekipe (min)</dt>
                    <dd className="text-foreground">
                        {team.competition.sport.members_count}
                    </dd>
                </div>
                <div className="flex justify-between gap-2">
                    <dt>Škola</dt>
                    <dd className="text-foreground">{team.school.name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                    <dt>Datum prijave</dt>
                    <dd className="text-foreground">
                        {renderDateTime(team.signed_at)}
                    </dd>
                </div>
                <div className="border-t pt-2">
                    <dt>Profesor</dt>
                    <dd className="text-foreground">{team.professor.name}</dd>
                    <dd className="text-muted-foreground">
                        {team.professor.email}
                    </dd>
                </div>
            </dl>
        </div>
    );
}

function MemberRow({ member }: { member: Member }) {
    const cert = member.medical_certificate;
    const certInfo = cert ? certBadge[cert.status] : null;
    const verification = member.student.verification_status;
    const verInfo = verification ? verificationBadge[verification] : null;

    return (
        <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{member.student.name}</p>
                {member.student.grade && (
                    <p className="text-muted-foreground text-xs">
                        Razred {member.student.grade}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {verInfo ? (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${verInfo.className}`}
                    >
                        <verInfo.Icon className="size-3" />
                        {verInfo.label}
                    </span>
                ) : null}

                {certInfo ? (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${certInfo.className}`}
                    >
                        <certInfo.Icon className="size-3" />
                        {certInfo.label}
                    </span>
                ) : (
                    <span className="text-muted-foreground inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800 dark:text-zinc-300">
                        <FileWarning className="size-3" />
                        Bez potvrde
                    </span>
                )}

                {cert && cert.status !== 'pending' && (
                    <a
                        href={`/certificates/${cert.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-md"
                        title="Pogledaj potvrdu"
                        aria-label={`Pogledaj potvrdu za ${member.student.name}`}
                    >
                        <Eye className="size-4" />
                    </a>
                )}
            </div>
        </div>
    );
}

function AuditHistoryList({ entries }: { entries: AuditEntry[] }) {
    const safeEntries = entries ?? [];

    if (safeEntries.length === 0) {
        return (
            <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
                Nema audit zapisa za ovu ekipu.
            </div>
        );
    }

    return (
        <ul className="space-y-2">
            {safeEntries.map((entry) => (
                <li
                    key={entry.id}
                    className="flex flex-col gap-1 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-center gap-2">
                        <History className="text-muted-foreground size-4" />
                        <span className="font-mono text-xs">{entry.action}</span>
                    </div>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                        <span>
                            {entry.user?.name ?? (
                                <span className="italic">— sistem —</span>
                            )}
                        </span>
                        <span>·</span>
                        <span>{renderDateTime(entry.created_at)}</span>
                    </div>
                </li>
            ))}
        </ul>
    );
}

type Props = {
    team: Team;
    recentAudit: AuditEntry[];
    certificateSummary: CertificateSummary;
};

export default function AdminTeamsShow({
    team,
    recentAudit,
    certificateSummary,
}: Props) {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const statusInfo = teamStatusBadge[team.status];

    const handleApprove = () => {
        if (
            !confirm(
                `Odobriti ekipu "${team.competition.name}" iz škole ${team.school.name}? Profesor će biti obaviješten.`,
            )
        ) {
            return;
        }

        router.post(`/admin/teams/${team.id}/approve`, undefined, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Ekipe', href: '/admin/teams' },
                {
                    title: team.competition.name,
                    href: `/admin/teams/${team.id}`,
                },
            ]}
        >
            <Head title={`Ekipa — ${team.competition.name}`} />
            <FormCard
                title={`Pregled ekipe — ${team.competition.name}`}
                description={`${team.school.name} · ${team.competition.sport.name} · prijavio ${team.professor.name}`}
                icon={Users2}
                backHref="/admin/teams"
                backLabel="Nazad na listu ekipa"
                sidebar={
                    <>
                        <div className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">
                                Status
                            </span>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
                            >
                                {statusInfo.label}
                            </span>
                        </div>
                        <TeamMetaPanel team={team} />
                        <CertificateSummaryPanel summary={certificateSummary} />
                    </>
                }
            >
                <FormCardBody>
                    {team.rejection_reason && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                            <p className="font-medium">Razlog odbijanja</p>
                            <p className="mt-1 text-xs leading-relaxed">
                                {team.rejection_reason}
                            </p>
                        </div>
                    )}

                    <FormSection
                        title={`Članovi (${(team.members ?? []).length})`}
                        description="Per-učenik status medicinske potvrde i eDnevnik provjere."
                    >
                        {(team.members ?? []).length === 0 ? (
                            <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                                Ekipa nema članova.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {(team.members ?? []).map((m) => (
                                    <MemberRow key={m.id} member={m} />
                                ))}
                            </div>
                        )}
                    </FormSection>

                    {team.status === 'submitted' && (
                        <FormSection
                            title="Akcije"
                            description="Odobri prijavu ili je odbij sa razlogom (profesor će biti obaviješten)."
                        >
                            {!showRejectForm ? (
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        onClick={handleApprove}
                                        data-testid="approve-button"
                                    >
                                        <CheckCircle2 className="mr-1 size-4" />
                                        Odobri prijavu
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => setShowRejectForm(true)}
                                        data-testid="reject-button"
                                    >
                                        <XCircle className="mr-1 size-4" />
                                        Odbij prijavu
                                    </Button>
                                </div>
                            ) : (
                                <Form
                                    action={`/admin/teams/${team.id}/reject`}
                                    method="post"
                                    className="space-y-3 rounded-lg border border-red-200 bg-red-50/40 p-4 dark:border-red-900/40 dark:bg-red-950/20"
                                    options={{ preserveScroll: true }}
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="reason">
                                                    Razlog odbijanja
                                                </Label>
                                                <Textarea
                                                    id="reason"
                                                    name="reason"
                                                    placeholder="Npr. Učenik X nema validnu medicinsku potvrdu."
                                                    minLength={5}
                                                    rows={4}
                                                    required
                                                />
                                                <p className="text-muted-foreground text-xs">
                                                    Najmanje 5 karaktera. Profesor će dobiti email sa
                                                    razlogom.
                                                </p>
                                                <InputError
                                                    message={errors.reason}
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    type="submit"
                                                    variant="destructive"
                                                    disabled={processing}
                                                    data-testid="reject-confirm-button"
                                                >
                                                    {processing
                                                        ? 'Slanje…'
                                                        : 'Potvrdi odbijanje'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setShowRejectForm(false)
                                                    }
                                                    disabled={processing}
                                                >
                                                    Otkaži
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            )}
                        </FormSection>
                    )}

                    <FormSection
                        title="Istorija (audit log)"
                        description="Posljednjih 10 događaja vezanih za ovu ekipu."
                    >
                        <AuditHistoryList entries={recentAudit} />
                    </FormSection>
                </FormCardBody>
            </FormCard>
        </AppLayout>
    );
}
