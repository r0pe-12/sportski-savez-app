import { VerificationStatusBadge } from '@/components/students/verification-status-badge';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

type Student = {
    id: number;
    name: string;
    jmb: string;
    grade: string;
    verification_status: string;
    school: { id: number; name: string; code: string } | null;
};

type Page = {
    data: Student[];
    current_page: number;
    last_page: number;
};

export default function StudentsAdminIndex({ students }: { students: Page }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Učenici', href: '/admin/students' }]}>
            <Head title="Učenici" />
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Učenici</h1>
                <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-2 text-left">Ime</th>
                                <th className="p-2 text-left">JMB</th>
                                <th className="p-2 text-left">Razred</th>
                                <th className="p-2 text-left">Škola</th>
                                <th className="p-2 text-left">Verifikacija</th>
                                <th className="p-2 text-left"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.data.map((s) => (
                                <tr key={s.id} className="border-t">
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2 font-mono text-xs">{s.jmb}</td>
                                    <td className="p-2">{s.grade}</td>
                                    <td className="p-2">{s.school?.name ?? '—'}</td>
                                    <td className="p-2">
                                        <VerificationStatusBadge status={s.verification_status} />
                                    </td>
                                    <td className="p-2">
                                        <Link className="text-primary" href={`/admin/students/${s.id}/verify`}>
                                            Detalji
                                        </Link>
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
