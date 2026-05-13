import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

type CompetitionRow = {
    id: number;
    slug: string;
    name: string;
    start_date: string;
    end_date: string;
    location: string;
    status: string;
    year: number;
    sport: { name: string };
};

type Paginated = { data: CompetitionRow[] };

const STATUS_LABEL: Record<string, string> = {
    draft: 'Skica',
    open_registration: 'Prijave otvorene',
    in_progress: 'U toku',
    completed: 'Završeno',
};

export default function CompetitionsIndex({ competitions }: { competitions: Paginated }) {
    const handleDelete = (id: number) => {
        if (confirm('Obriši takmičenje?')) {
            router.delete(`/admin/competitions/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Takmičenja', href: '/admin/competitions' }]}>
            <Head title="Takmičenja" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Takmičenja</h1>
                    <Link href="/admin/competitions/create">
                        <Button>Novo takmičenje</Button>
                    </Link>
                </div>
                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left">Naziv</th>
                                <th className="p-2 text-left">Sport</th>
                                <th className="p-2 text-left">Datum</th>
                                <th className="p-2 text-left">Lokacija</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {competitions.data.map((c) => (
                                <tr key={c.id} className="border-t">
                                    <td className="p-2 font-medium">{c.name}</td>
                                    <td className="p-2">{c.sport.name}</td>
                                    <td className="p-2">
                                        {c.start_date} → {c.end_date}
                                    </td>
                                    <td className="p-2">{c.location}</td>
                                    <td className="p-2">{STATUS_LABEL[c.status] ?? c.status}</td>
                                    <td className="space-x-2 p-2">
                                        <Link href={`/admin/competitions/${c.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                Uredi
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(c.id)}
                                        >
                                            Obriši
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
