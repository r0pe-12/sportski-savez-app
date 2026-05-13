import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Member = {
    id: number;
    student: { id: number; name: string; grade: string; verification_status: string };
    medical_certificate: { id: number; status: string } | null;
};

const certBadge: Record<string, { label: string; color: string }> = {
    pending: { label: 'OCR u toku', color: 'bg-yellow-100 text-yellow-800' },
    valid: { label: 'Validna', color: 'bg-green-100 text-green-800' },
    expired: { label: 'Istekla', color: 'bg-red-100 text-red-800' },
    invalid: { label: 'Nevalidna', color: 'bg-red-100 text-red-800' },
    manual_review: { label: 'Ručna provjera', color: 'bg-purple-100 text-purple-800' },
};

export function TeamMembersList({
    teamId,
    members,
    canEdit,
}: {
    teamId: number;
    members: Member[];
    canEdit: boolean;
}) {
    const handleRemove = (memberId: number) => {
        if (!confirm('Ukloni člana?')) {
            return;
        }
        router.delete(`/teams/${teamId}/members/${memberId}`, { preserveScroll: true });
    };

    return (
        <div className="space-y-2">
            {members.map((m) => {
                const cert = m.medical_certificate;
                const badge = cert ? certBadge[cert.status] : null;
                return (
                    <div key={m.id} className="flex items-center justify-between rounded border p-3">
                        <div>
                            <p className="font-medium">{m.student.name}</p>
                            <p className="text-muted-foreground text-xs">{m.student.grade}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {badge ? (
                                <span className={`rounded px-2 py-0.5 text-xs ${badge.color}`}>{badge.label}</span>
                            ) : (
                                <span className="text-muted-foreground text-xs">Bez potvrde</span>
                            )}
                            {canEdit && (
                                <Button variant="ghost" size="sm" onClick={() => handleRemove(m.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                );
            })}
            {members.length === 0 && <p className="text-muted-foreground text-sm">Nema članova.</p>}
        </div>
    );
}
