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

export default function SchoolsCreate() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Škole', href: '/admin/schools' },
                { title: 'Nova škola', href: '/admin/schools/create' },
            ]}
        >
            <Head title="Nova škola" />
            <FormCard
                title="Nova škola"
                description="Dodaj školu u sistem. Posle ovoga je dostupna za registraciju profesora i učenika."
                icon={Building}
                backHref="/admin/schools"
                backLabel="Nazad na listu škola"
                sidebar={
                    <div className="bg-muted/30 rounded-xl border p-4 text-sm">
                        <h3 className="mb-2 font-medium">Konvencija šifre</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            Format: <code className="rounded bg-background px-1 py-0.5 font-mono text-[11px]">OS-{'<grad>'}-{'<broj>'}</code>
                            <br />
                            Primjeri: <code className="font-mono text-[11px]">OS-PG-001</code>, <code className="font-mono text-[11px]">OS-BD-002</code>
                        </p>
                        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                            Šifra mora biti jedinstvena i ne mijenja se kasnije
                            (koristi se u email konvenciji profesora).
                        </p>
                    </div>
                }
            >
                <Form
                    action="/admin/schools"
                    method="post"
                    className="contents"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormCardBody>
                                <FormSection
                                    title="Identifikacija"
                                    description="Šifra i naziv škole."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="code">
                                                Šifra škole
                                            </Label>
                                            <Input
                                                id="code"
                                                name="code"
                                                placeholder="OS-PG-003"
                                                required
                                            />
                                            <FormHint>
                                                Jedinstvena, npr. OS-PG-003
                                            </FormHint>
                                            <InputError message={errors.code} />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="name">
                                                Pun naziv
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder='OŠ "Sutjeska"'
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </FormField>
                                    </FormGrid>
                                </FormSection>

                                <FormSection
                                    title="Lokacija"
                                    description="Adresa škole — koristi se u rasporedu takmičenja."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="city">Grad</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                placeholder="Podgorica"
                                                required
                                            />
                                            <InputError message={errors.city} />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="address">
                                                Adresa (opciono)
                                            </Label>
                                            <Input
                                                id="address"
                                                name="address"
                                                placeholder="Ulica i broj"
                                            />
                                            <InputError
                                                message={errors.address}
                                            />
                                        </FormField>
                                    </FormGrid>
                                </FormSection>

                                <FormSection
                                    title="Kontakt"
                                    description="Opciono — koristi se za notifikacije i komunikaciju sa direkcijom."
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
                                                placeholder="+382 20 123 456"
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
                                                placeholder="info@skola.me"
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
                                        ? 'Kreiranje…'
                                        : 'Kreiraj školu'}
                                </Button>
                            </FormCardFooter>
                        </>
                    )}
                </Form>
            </FormCard>
        </AppLayout>
    );
}
