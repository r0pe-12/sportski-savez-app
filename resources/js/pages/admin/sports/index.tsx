import { Head, Link, router } from '@inertiajs/react';
import { SportTypeBadge } from '@/components/sports/SportTypeBadge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

type SportRow = {
    id: number;
    slug: string;
    name: string;
    type: 'team_sport' | 'individual_sport';
    members_count: number;
    substitutes_count: number;
};

type Paginated = { data: SportRow[] };

export default function SportsIndex({ sports }: { sports: Paginated }) {
    const handleDeactivate = (id: number) => {
        if (confirm('Deaktiviraj sport? Možeš ga vratiti iz admin baze.')) {
            router.delete(`/admin/sports/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Sportovi', href: '/admin/sports' }]}>
            <Head title="Sportovi" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Sportovi</h1>
                    <Link href="/admin/sports/create">
                        <Button>Novi sport</Button>
                    </Link>
                </div>
                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left">Naziv</th>
                                <th className="p-2 text-left">Tip</th>
                                <th className="p-2 text-left">Članovi</th>
                                <th className="p-2 text-left">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sports.data.map((s) => (
                                <tr key={s.id} className="border-t">
                                    <td className="p-2 font-medium">{s.name}</td>
                                    <td className="p-2">
                                        <SportTypeBadge type={s.type} />
                                    </td>
                                    <td className="p-2">
                                        {s.members_count} + {s.substitutes_count}
                                    </td>
                                    <td className="space-x-2 p-2">
                                        <Link href={`/admin/sports/${s.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                Uredi
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeactivate(s.id)}
                                        >
                                            Deaktiviraj
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
