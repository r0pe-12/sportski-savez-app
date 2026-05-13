import { Form, Head, Link } from '@inertiajs/react';
import { Building } from 'lucide-react';
import InputError from '@/components/input-error';
import {
    FormCard,
    FormCardBody,
    FormCardFooter,
} from '@/components/forms/form-card';
import {
    FormField,
    FormGrid,
    FormHint,
    FormSection,
} from '@/components/forms/form-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

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
                { title: school.name, href: `/admin/schools/${school.id}/edit` },
            ]}
        >
            <Head title={`Uredi: ${school.name}`} />
            <FormCard
                title={`Uredi školu — ${school.name}`}
                description="Izmjeni podatke škole. Promjena šifre utiče na buduće email konvencije profesora."
                icon={Building}
                backHref="/admin/schools"
                backLabel="Nazad na listu škola"
                sidebar={
                    <div className="bg-muted/30 rounded-xl border p-4 text-sm">
                        <h3 className="mb-2 font-medium">Trenutni podaci</h3>
                        <dl className="text-muted-foreground space-y-1 text-xs">
                            <div className="flex justify-between gap-2">
                                <dt>ID</dt>
                                <dd className="font-mono">#{school.id}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt>Šifra</dt>
                                <dd className="font-mono">{school.code}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt>Grad</dt>
                                <dd>{school.city}</dd>
                            </div>
                        </dl>
                        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                            Brisanje škole nije omogućeno — koristi soft
                            deactivate ako škola više ne učestvuje.
                        </p>
                    </div>
                }
            >
                <Form
                    action={`/admin/schools/${school.id}`}
                    method="put"
                    className="contents"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormCardBody>
                                <FormSection
                                    title="Identifikacija"
                                    description="Šifra mora ostati jedinstvena u sistemu."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="code">Šifra</Label>
                                            <Input
                                                id="code"
                                                name="code"
                                                defaultValue={school.code}
                                                required
                                            />
                                            <FormHint>
                                                Format: OS-{'<grad>'}-{'<broj>'}
                                            </FormHint>
                                            <InputError message={errors.code} />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="name">Naziv</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                defaultValue={school.name}
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </FormField>
                                    </FormGrid>
                                </FormSection>

                                <FormSection
                                    title="Lokacija"
                                    description="Adresa škole."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="city">Grad</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                defaultValue={school.city}
                                                required
                                            />
                                            <InputError message={errors.city} />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="address">
                                                Adresa
                                            </Label>
                                            <Input
                                                id="address"
                                                name="address"
                                                defaultValue={
                                                    school.address ?? ''
                                                }
                                            />
                                            <InputError
                                                message={errors.address}
                                            />
                                        </FormField>
                                    </FormGrid>
                                </FormSection>

                                <FormSection
                                    title="Kontakt"
                                    description="Opciono — koristi se u email notifikacijama."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="phone">
                                                Telefon
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                defaultValue={
                                                    school.phone ?? ''
                                                }
                                            />
                                            <InputError
                                                message={errors.phone}
                                            />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                defaultValue={
                                                    school.email ?? ''
                                                }
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </FormField>
                                    </FormGrid>
                                </FormSection>
                            </FormCardBody>

                            <FormCardFooter>
                                <Button
                                    asChild
                                    variant="ghost"
                                    type="button"
                                >
                                    <Link href="/admin/schools">Otkaži</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Čuvanje…'
                                        : 'Sačuvaj izmjene'}
                                </Button>
                            </FormCardFooter>
                        </>
                    )}
                </Form>
            </FormCard>
        </AppLayout>
    );
}
