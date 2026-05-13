import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type School = {
    id: number;
    code: string;
    name: string;
    city: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
};

export default function SchoolsEdit({ school }: { school: School }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Škole', href: '/admin/schools' },
                { title: 'Uredi', href: `/admin/schools/${school.id}/edit` },
            ]}
        >
            <Head title="Uredi školu" />
            <div className="max-w-xl space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Uredi školu</h1>
                <Form
                    action={`/admin/schools/${school.id}`}
                    method="put"
                    className="flex flex-col gap-4"
                >
                    {({ errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Šifra škole</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    defaultValue={school.code}
                                    required
                                />
                                <InputError message={errors.code} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Naziv</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={school.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="city">Grad</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    defaultValue={school.city}
                                    required
                                />
                                <InputError message={errors.city} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Adresa</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={school.address ?? ''}
                                />
                                <InputError message={errors.address} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={school.phone ?? ''}
                                />
                                <InputError message={errors.phone} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={school.email ?? ''}
                                />
                                <InputError message={errors.email} />
                            </div>
                            <Button type="submit">Sačuvaj</Button>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
