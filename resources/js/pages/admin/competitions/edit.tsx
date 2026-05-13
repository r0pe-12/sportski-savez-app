import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Form, Head } from '@inertiajs/react';

type SportOption = { id: number; name: string; type: string };

type Competition = {
    id: number;
    slug: string;
    name: string;
    sport_id: number;
    start_date: string;
    end_date: string;
    location: string;
    status: string;
    year: number;
};

export default function CompetitionsEdit({
    competition,
    sports,
}: {
    competition: Competition;
    sports: SportOption[];
}) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Takmičenja', href: '/admin/competitions' },
                { title: competition.name, href: `/admin/competitions/${competition.id}/edit` },
            ]}
        >
            <Head title={`Uredi: ${competition.name}`} />
            <div className="max-w-xl p-6">
                <Form
                    action={`/admin/competitions/${competition.id}`}
                    method="put"
                    className="flex flex-col gap-4"
                >
                    {({ errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Naziv</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={competition.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    pattern="[a-z0-9-]+"
                                    defaultValue={competition.slug}
                                    required
                                />
                                <InputError message={errors.slug} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sport_id">Sport</Label>
                                <select
                                    id="sport_id"
                                    name="sport_id"
                                    defaultValue={competition.sport_id}
                                    className="h-9 rounded-md border bg-background px-3"
                                    required
                                >
                                    {sports.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.sport_id} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="start_date">Početak</Label>
                                    <Input
                                        id="start_date"
                                        name="start_date"
                                        type="date"
                                        defaultValue={competition.start_date}
                                        required
                                    />
                                    <InputError message={errors.start_date} />
                                </div>
                                <div>
                                    <Label htmlFor="end_date">Kraj</Label>
                                    <Input
                                        id="end_date"
                                        name="end_date"
                                        type="date"
                                        defaultValue={competition.end_date}
                                        required
                                    />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Lokacija</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    defaultValue={competition.location}
                                    required
                                />
                                <InputError message={errors.location} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        name="status"
                                        defaultValue={competition.status}
                                        className="h-9 rounded-md border bg-background px-3"
                                        required
                                    >
                                        <option value="draft">Skica</option>
                                        <option value="open_registration">
                                            Prijave otvorene
                                        </option>
                                        <option value="in_progress">U toku</option>
                                        <option value="completed">Završeno</option>
                                    </select>
                                    <InputError message={errors.status} />
                                </div>
                                <div>
                                    <Label htmlFor="year">Godina</Label>
                                    <Input
                                        id="year"
                                        name="year"
                                        type="number"
                                        min={2024}
                                        max={2100}
                                        defaultValue={competition.year}
                                        required
                                    />
                                    <InputError message={errors.year} />
                                </div>
                            </div>
                            <Button type="submit">Sačuvaj</Button>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
