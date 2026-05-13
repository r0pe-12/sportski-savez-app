import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { CompetitionHistoryList } from '@/components/students/CompetitionHistoryList';
import { MedalShelf } from '@/components/students/MedalShelf';
import { PhotoUpload } from '@/components/students/PhotoUpload';
import { StudentHero } from '@/components/students/StudentHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

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

export default function StudentProfile({ student }: { student: StudentProp }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Moj profil', href: '/profile' }]}>
            <Head title="Moj profil" />
            <div className="max-w-3xl space-y-6 p-6">
                <StudentHero student={student} />

                <div>
                    <PhotoUpload
                        studentId={student.id}
                        hasPhoto={student.photo_url !== null}
                    />
                </div>

                <section>
                    <h2 className="mb-2 text-lg font-medium">Medalje</h2>
                    <MedalShelf medals={student.medals} />
                </section>

                <section>
                    <h2 className="mb-2 text-lg font-medium">
                        Istorija takmičenja
                    </h2>
                    <CompetitionHistoryList history={student.history} />
                </section>

                <section className="rounded border p-4">
                    <h3 className="mb-3 text-lg font-medium">
                        Lični podaci (uredi)
                    </h3>
                    <Form
                        action="/profile"
                        method="patch"
                        className="grid max-w-md gap-3"
                        options={{ preserveScroll: true }}
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-1">
                                    <Label htmlFor="phone">Telefon</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        defaultValue={student.phone ?? ''}
                                        placeholder="+382 67 ..."
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="grid gap-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={student.email}
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        Sačuvaj
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                    <p className="mt-3 text-xs text-muted-foreground">
                        JMB, razred i druge zaštićene podatke mijenja
                        administrator.
                    </p>
                </section>
            </div>
        </AppLayout>
    );
}
