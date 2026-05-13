import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

type TeamRow = {
    id: number;
    status: string;
    competition: { name: string };
    school: { name: string };
    professor: { name: string };
};
type Paginated = { data: TeamRow[] };

const statusLabels: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-zinc-100 text-zinc-800' },
    submitted: { label: 'Predata', className: 'bg-amber-100 text-amber-800' },
    active: { label: 'Aktivna', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Odbijena', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Otkazana', className: 'bg-zinc-100 text-zinc-800' },
    withdrawn: { label: 'Povučena', className: 'bg-zinc-100 text-zinc-800' },
    completed: { label: 'Završena', className: 'bg-blue-100 text-blue-800' },
};

export default function AdminTeamsIndex({ teams }: { teams: Paginated }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Ekipe', href: '/admin/teams' }]}>
            <Head title="Ekipe (admin)" />
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Sve ekipe</h1>
                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left">Takmičenje</th>
                                <th className="p-2 text-left">Škola</th>
                                <th className="p-2 text-left">Profesor</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.data.map((t) => {
                                const meta = statusLabels[t.status] ?? {
                                    label: t.status,
                                    className: 'bg-zinc-100 text-zinc-800',
                                };

                                return (
                                    <tr key={t.id} className="border-t">
                                        <td className="p-2">{t.competition.name}</td>
                                        <td className="p-2">{t.school.name}</td>
                                        <td className="p-2">{t.professor.name}</td>
                                        <td className="p-2">
                                            <span
                                                className={`rounded px-2 py-1 text-xs font-medium ${meta.className}`}
                                            >
                                                {meta.label}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <Link
                                                className="text-primary hover:underline"
                                                href={`/admin/teams/${t.id}`}
                                            >
                                                Detalji
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {teams.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-muted-foreground p-4 text-center">
                                        Nema prijavljenih ekipa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
