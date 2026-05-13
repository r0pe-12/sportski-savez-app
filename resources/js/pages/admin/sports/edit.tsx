import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Form, Head } from '@inertiajs/react';

type Sport = {
    id: number;
    slug: string;
    name: string;
    type: 'team_sport' | 'individual_sport';
    members_count: number;
    substitutes_count: number;
    rules_description: string | null;
};

export default function SportsEdit({ sport }: { sport: Sport }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sportovi', href: '/admin/sports' },
                { title: sport.name, href: `/admin/sports/${sport.id}/edit` },
            ]}
        >
            <Head title={`Uredi: ${sport.name}`} />
            <div className="max-w-xl p-6">
                <Form
                    action={`/admin/sports/${sport.id}`}
                    method="put"
                    className="flex flex-col gap-4"
                >
                    {({ errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Naziv</Label>
                                <Input id="name" name="name" defaultValue={sport.name} required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    pattern="[a-z0-9-]+"
                                    defaultValue={sport.slug}
                                    required
                                />
                                <InputError message={errors.slug} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tip</Label>
                                <select
                                    id="type"
                                    name="type"
                                    defaultValue={sport.type}
                                    className="h-9 rounded-md border bg-background px-3"
                                    required
                                >
                                    <option value="team_sport">Timski</option>
                                    <option value="individual_sport">Individualni</option>
                                </select>
                                <InputError message={errors.type} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="members_count">Broj članova</Label>
                                    <Input
                                        id="members_count"
                                        name="members_count"
                                        type="number"
                                        min={1}
                                        max={30}
                                        defaultValue={sport.members_count}
                                        required
                                    />
                                    <InputError message={errors.members_count} />
                                </div>
                                <div>
                                    <Label htmlFor="substitutes_count">Rezerve</Label>
                                    <Input
                                        id="substitutes_count"
                                        name="substitutes_count"
                                        type="number"
                                        min={0}
                                        max={30}
                                        defaultValue={sport.substitutes_count}
                                        required
                                    />
                                    <InputError message={errors.substitutes_count} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="rules_description">Pravila</Label>
                                <textarea
                                    id="rules_description"
                                    name="rules_description"
                                    rows={4}
                                    defaultValue={sport.rules_description ?? ''}
                                    className="rounded-md border bg-background px-3 py-2"
                                />
                                <InputError message={errors.rules_description} />
                            </div>
                            <Button type="submit">Sačuvaj</Button>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
