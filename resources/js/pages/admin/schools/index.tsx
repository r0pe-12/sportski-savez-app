import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

type SchoolRow = {
    id: number;
    code: string;
    name: string;
    city: string;
};

type Page = { data: SchoolRow[]; current_page: number; last_page: number };

export default function SchoolsIndex({ schools }: { schools: Page }) {
    const handleDelete = (id: number) => {
        if (confirm('Jeste li sigurni?')) {
            router.delete(`/admin/schools/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Škole', href: '/admin/schools' }]}>
            <Head title="Škole" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Škole</h1>
                    <Link href="/admin/schools/create">
                        <Button>Nova škola</Button>
                    </Link>
                </div>

                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left">Šifra</th>
                                <th className="p-2 text-left">Naziv</th>
                                <th className="p-2 text-left">Grad</th>
                                <th className="p-2 text-left">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.data.map((s) => (
                                <tr key={s.id} className="border-t">
                                    <td className="p-2">{s.code}</td>
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2">{s.city}</td>
                                    <td className="space-x-2 p-2">
                                        <Link
                                            href={`/admin/schools/${s.id}/edit`}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                            >
                                                Uredi
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(s.id)}
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
