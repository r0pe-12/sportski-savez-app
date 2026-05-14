import { Head } from '@inertiajs/react';
import { CompetitionHistoryList } from '@/components/students/CompetitionHistoryList';
import { MedalShelf } from '@/components/students/MedalShelf';
import { StudentHero } from '@/components/students/StudentHero';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format-date';

type HistoryEntry = {
    team_id: number;
    competition: {
        id: number;
        slug: string;
        name: string;
        start_date: string | null;
    };
    sport: { name: string; type: string };
    team_status: string;
    result: { placement: number; medal_type: string } | null;
};

type Medals = {
    gold: number;
    silver: number;
    bronze: number;
    participation: number;
};

type StudentProp = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    jmb: string | null;
    grade: string | null;
    birth_date: string | null;
    verification_status: string | null;
    school: { id: number; name: string; code: string } | null;
    photo_url: string | null;
    history: HistoryEntry[];
    medals: Medals;
};

export default function StudentShow({ student }: { student: StudentProp }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Učenici', href: '/admin/users' },
                { title: student.name, href: `/students/${student.id}` },
            ]}
        >
            <Head title={student.name} />
            <div className="max-w-3xl space-y-6 p-6">
                <StudentHero student={student} />

                <section>
                    <h3 className="mb-2 text-lg font-medium">Medalje</h3>
                    <MedalShelf medals={student.medals} />
                </section>

                <section>
                    <h3 className="mb-2 text-lg font-medium">
                        Istorija takmičenja
                    </h3>
                    <CompetitionHistoryList history={student.history} />
                </section>

                <section className="space-y-1 rounded border p-4 text-sm">
                    <h3 className="mb-1 font-medium">Lični podaci</h3>
                    <p>
                        JMB:{' '}
                        <span className="font-mono">{student.jmb ?? '—'}</span>
                    </p>
                    <p>Datum rođenja: {formatDate(student.birth_date) || '—'}</p>
                    <p>Telefon: {student.phone ?? '—'}</p>
                    <p>Email: {student.email}</p>
                </section>
            </div>
        </AppLayout>
    );
}
