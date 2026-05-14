import { Head } from '@inertiajs/react';
import { AuditPayloadViewer } from '@/components/audit/AuditPayloadViewer';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/format-date';

type Entry = {
    id: string;
    action: string;
    user: { name: string; email: string; role: string } | null;
    subject_type: string | null;
    subject_id: number | null;
    payload: Record<string, unknown> | null;
    ip: string | null;
    user_agent: string | null;
    created_at: string;
};

export default function AuditLogShow({ entry }: { entry: Entry }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Audit log', href: '/admin/audit-log' },
                { title: entry.action, href: `/admin/audit-log/${entry.id}` },
            ]}
        >
            <Head title={`Audit ${entry.action}`} />
            <div className="max-w-3xl space-y-4 p-6">
                <h1 className="font-mono text-2xl font-semibold">{entry.action}</h1>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground">Vrijeme</dt>
                        <dd>{formatDateTime(entry.created_at)}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Korisnik</dt>
                        <dd>{entry.user?.name ?? '— sistem —'}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Subjekt</dt>
                        <dd>{entry.subject_type ? `${entry.subject_type}#${entry.subject_id}` : '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">IP</dt>
                        <dd className="font-mono">{entry.ip ?? '—'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">User-agent</dt>
                        <dd className="break-all font-mono text-xs">{entry.user_agent ?? '—'}</dd>
                    </div>
                </dl>

                <section>
                    <h3 className="mb-1 font-medium">Payload</h3>
                    <AuditPayloadViewer payload={entry.payload} />
                </section>
            </div>
        </AppLayout>
    );
}
