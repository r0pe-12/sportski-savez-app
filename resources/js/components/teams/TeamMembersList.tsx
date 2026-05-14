import { router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Eye,
    FileWarning,
    Loader2,
    Trash2,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type Member = {
    id: number;
    student: {
        id: number;
        name: string;
        grade: string;
        verification_status: string;
    };
    medical_certificate: { id: number; status: string } | null;
};

const certBadge: Record<
    string,
    {
        label: string;
        className: string;
        Icon: React.ComponentType<{ className?: string }>;
    }
> = {
    pending: {
        label: 'OCR u toku',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        Icon: Clock,
    },
    valid: {
        label: 'Validna',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        Icon: CheckCircle2,
    },
    expired: {
        label: 'Istekla',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        Icon: FileWarning,
    },
    invalid: {
        label: 'Nevalidna',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        Icon: AlertCircle,
    },
    manual_review: {
        label: 'Ručna provjera',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        Icon: Clock,
    },
};

type RowProps = {
    teamId: number;
    member: Member;
    canEdit: boolean;
};

function MemberRow({ teamId, member, canEdit }: RowProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const cert = member.medical_certificate;
    const badge = cert ? certBadge[cert.status] : null;
    const needsReplace =
        cert &&
        (cert.status === 'expired' ||
            cert.status === 'invalid' ||
            cert.status === 'manual_review');

    const triggerFileDialog = () => fileInputRef.current?.click();

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        setUploading(true);
        router.post(
            `/teams/${teamId}/members/${member.id}/certificate`,
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) => {
                    alert(
                        'Greška pri uploadu: ' +
                            Object.values(errors).join(', '),
                    );
                },
                onFinish: () => {
                    setUploading(false);

                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
            },
        );
    };

    const handleRemoveMember = () => {
        if (!confirm(`Ukloni ${member.student.name} iz ekipe?`)) {
return;
}

        router.delete(`/teams/${teamId}/members/${member.id}`, {
            preserveScroll: true,
        });
    };

    const handleRemoveCert = () => {
        if (!confirm('Ukloni potvrdu? Učenik će biti bez potvrde.')) {
return;
}

        router.delete(`/teams/${teamId}/members/${member.id}/certificate`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{member.student.name}</p>
                <p className="text-muted-foreground text-xs">
                    Razred {member.student.grade}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {badge ? (
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                        <badge.Icon className="size-3" />
                        {badge.label}
                    </span>
                ) : (
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                        <FileWarning className="size-3" />
                        Bez potvrde
                    </span>
                )}

                {canEdit && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={handleFile}
                        />

                        {cert && cert.status !== 'pending' && (
                            <a
                                href={`/certificates/${cert.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
                                title="Pogledaj potvrdu"
                            >
                                <Eye className="size-4" />
                            </a>
                        )}

                        <Button
                            type="button"
                            size="sm"
                            variant={!cert || needsReplace ? 'default' : 'outline'}
                            onClick={triggerFileDialog}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-1 size-3.5 animate-spin" />
                                    Upload…
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-1 size-3.5" />
                                    {cert ? 'Zamijeni' : 'Upload potvrdu'}
                                </>
                            )}
                        </Button>

                        {cert && cert.status !== 'pending' && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={handleRemoveCert}
                                title="Ukloni potvrdu"
                            >
                                <FileWarning className="size-4" />
                            </Button>
                        )}

                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={handleRemoveMember}
                            title="Ukloni iz ekipe"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export function TeamMembersList({
    teamId,
    members,
    canEdit,
}: {
    teamId: number;
    members: Member[];
    canEdit: boolean;
}) {
    const safeMembers = members ?? [];

    if (safeMembers.length === 0) {
        return (
            <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                Nema članova. Dodaj učenika ispod.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {safeMembers.map((m) => (
                <MemberRow
                    key={m.id}
                    teamId={teamId}
                    member={m}
                    canEdit={canEdit}
                />
            ))}
        </div>
    );
}
