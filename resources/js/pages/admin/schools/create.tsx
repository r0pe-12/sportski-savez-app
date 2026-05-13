import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SchoolsCreate() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Škole', href: '/admin/schools' },
                { title: 'Nova', href: '/admin/schools/create' },
            ]}
        >
            <Head title="Nova škola" />
            <div className="max-w-xl space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Nova škola</h1>
                <Form
                    action="/admin/schools"
                    method="post"
                    className="flex flex-col gap-4"
                >
                    {({ errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Šifra škole</Label>
                                <Input id="code" name="code" required />
                                <InputError message={errors.code} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Naziv</Label>
                                <Input id="name" name="name" required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="city">Grad</Label>
                                <Input id="city" name="city" required />
                                <InputError message={errors.city} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Adresa</Label>
                                <Input id="address" name="address" />
                                <InputError message={errors.address} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" name="phone" />
                                <InputError message={errors.phone} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" />
                                <InputError message={errors.email} />
                            </div>
                            <Button type="submit">Kreiraj</Button>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
