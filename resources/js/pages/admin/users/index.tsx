import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { SchoolSummary } from '@/types/auth';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    school: SchoolSummary | null;
    created_at: string;
};

type Page = {
    data: UserRow[];
    current_page: number;
    last_page: number;
};

export default function UsersIndex({ users }: { users: Page }) {
    const handleDelete = (id: number) => {
        if (confirm('Jeste li sigurni?')) {
            router.delete(`/admin/users/${id}`);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Korisnici', href: '/admin/users' }]}
        >
            <Head title="Korisnici" />
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Korisnici</h1>
                    <Link href="/admin/users/create">
                        <Button>Novi korisnik</Button>
                    </Link>
                </div>

                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left">Ime</th>
                                <th className="p-2 text-left">Email</th>
                                <th className="p-2 text-left">Uloga</th>
                                <th className="p-2 text-left">Škola</th>
                                <th className="p-2 text-left">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((u) => (
                                <tr key={u.id} className="border-t">
                                    <td className="p-2">{u.name}</td>
                                    <td className="p-2">{u.email}</td>
                                    <td className="p-2">{u.role}</td>
                                    <td className="p-2">{u.school?.name ?? '—'}</td>
                                    <td className="space-x-2 p-2">
                                        <Link href={`/admin/users/${u.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                Uredi
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(u.id)}
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
