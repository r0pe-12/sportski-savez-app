import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Form, Head } from '@inertiajs/react';

type SportOption = { id: number; name: string; type: string };

export default function CompetitionsCreate({ sports }: { sports: SportOption[] }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Takmičenja', href: '/admin/competitions' },
                { title: 'Novo', href: '/admin/competitions/create' },
            ]}
        >
            <Head title="Novo takmičenje" />
            <div className="max-w-xl p-6">
                <Form
                    action="/admin/competitions"
                    method="post"
                    className="flex flex-col gap-4"
                >
                    {({ errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Naziv</Label>
                                <Input id="name" name="name" required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug" name="slug" pattern="[a-z0-9-]+" required />
                                <InputError message={errors.slug} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sport_id">Sport</Label>
                                <select
                                    id="sport_id"
                                    name="sport_id"
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
                                        required
                                    />
                                    <InputError message={errors.start_date} />
                                </div>
                                <div>
                                    <Label htmlFor="end_date">Kraj</Label>
                                    <Input id="end_date" name="end_date" type="date" required />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Lokacija</Label>
                                <Input id="location" name="location" required />
                                <InputError message={errors.location} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        name="status"
                                        className="h-9 rounded-md border bg-background px-3"
                                        required
                                        defaultValue="draft"
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
                                        required
                                        defaultValue={new Date().getFullYear()}
                                    />
                                    <InputError message={errors.year} />
                                </div>
                            </div>
                            <Button type="submit">Kreiraj</Button>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
