import { Head, Link } from '@inertiajs/react';
import { AuditLogFilters } from '@/components/audit/AuditLogFilters';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/format-date';

type Entry = {
    id: string;
    action: string;
    user: { id: number; name: string; role: string } | null;
    subject_type: string | null;
    subject_id: number | null;
    ip: string | null;
    created_at: string;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

type Page = {
    data: Entry[];
    current_page: number;
    last_page: number;
    links: PaginationLink[];
};

type Filters = {
    user_id?: number | '';
    action?: string;
    subject_type?: string;
    from?: string;
    to?: string;
};

type AuditUser = { id: number; name: string; email: string };

type Props = {
    entries: Page;
    filters: Filters;
    users: AuditUser[];
};

export default function AuditLogIndex({ entries, filters, users }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Audit log', href: '/admin/audit-log' }]}>
            <Head title="Audit log" />
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Audit log</h1>

                <AuditLogFilters initial={filters} users={users} />

                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left">Vrijeme</th>
                                <th className="p-2 text-left">Korisnik</th>
                                <th className="p-2 text-left">Akcija</th>
                                <th className="p-2 text-left">Subjekt</th>
                                <th className="p-2 text-left">IP</th>
                                <th className="p-2 text-left"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-sm text-muted-foreground">
                                        Nema zapisa za odabrane filtere.
                                    </td>
                                </tr>
                            )}
                            {entries.data.map((e) => (
                                <tr key={e.id} className="border-t">
                                    <td className="p-2 text-xs">{formatDateTime(e.created_at)}</td>
                                    <td className="p-2">
                                        {e.user?.name ?? <span className="text-muted-foreground">— sistem —</span>}
                                    </td>
                                    <td className="p-2 font-mono text-xs">{e.action}</td>
                                    <td className="p-2 text-xs">
                                        {e.subject_type ? `${e.subject_type.split('\\').pop()}#${e.subject_id}` : '—'}
                                    </td>
                                    <td className="p-2 font-mono text-xs">{e.ip ?? '—'}</td>
                                    <td className="p-2">
                                        <Link className="text-primary" href={`/admin/audit-log/${e.id}`}>
                                            Detalji
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {entries.links.map((l, i) =>
                        l.url ? (
                            <Link
                                key={i}
                                href={l.url}
                                className={`rounded border px-2 py-1 ${l.active ? 'bg-primary text-primary-foreground' : ''}`}
                                dangerouslySetInnerHTML={{ __html: l.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="px-2 py-1 text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: l.label }}
                            />
                        ),
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
