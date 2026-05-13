import { Form, Head, Link } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
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
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

export default function SportsCreate() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sportovi', href: '/admin/sports' },
                { title: 'Novi sport', href: '/admin/sports/create' },
            ]}
        >
            <Head title="Novi sport" />
            <FormCard
                title="Novi sport"
                description="Definiši sport sa pravilima učešća i brojem članova ekipe."
                icon={Trophy}
                backHref="/admin/sports"
                backLabel="Nazad na listu sportova"
                sidebar={
                    <div className="bg-muted/30 rounded-xl border p-4 text-sm">
                        <h3 className="mb-2 font-medium">Napomena</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            Sport je kategorija takmičenja. Posle kreiranja
                            postaje dostupan za pravljenje konkretnih takmičenja
                            (npr. „Mali fudbal — Podgorica 2026").
                        </p>
                        <ul className="text-muted-foreground mt-3 space-y-1 text-xs">
                            <li>
                                • <span className="font-medium">Timski:</span>{' '}
                                ekipa sa članovima
                            </li>
                            <li>
                                •{' '}
                                <span className="font-medium">
                                    Individualni:
                                </span>{' '}
                                pojedinačno učešće (npr. atletika)
                            </li>
                        </ul>
                    </div>
                }
            >
                <Form
                    action="/admin/sports"
                    method="post"
                    className="contents"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormCardBody>
                                <FormSection
                                    title="Osnovni podaci"
                                    description="Naziv vidljiv u svim listama. Slug je URL identifikator (samo mala slova, brojevi i crtice)."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="name">Naziv</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="npr. Mali fudbal"
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="slug">
                                                Slug (URL)
                                            </Label>
                                            <Input
                                                id="slug"
                                                name="slug"
                                                placeholder="mali-fudbal"
                                                pattern="[a-z0-9-]+"
                                                required
                                            />
                                            <InputError message={errors.slug} />
                                        </FormField>
                                    </FormGrid>
                                    <FormField>
                                        <Label htmlFor="type">Tip sporta</Label>
                                        <NativeSelect
                                            id="type"
                                            name="type"
                                            defaultValue="team_sport"
                                            required
                                        >
                                            <option value="team_sport">
                                                Timski sport
                                            </option>
                                            <option value="individual_sport">
                                                Individualni sport
                                            </option>
                                        </NativeSelect>
                                        <InputError message={errors.type} />
                                    </FormField>
                                </FormSection>

                                <FormSection
                                    title="Pravila ekipe"
                                    description="Koliko članova ulazi u prijavu i koliko rezervi je dozvoljeno."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="members_count">
                                                Broj članova
                                            </Label>
                                            <Input
                                                id="members_count"
                                                name="members_count"
                                                type="number"
                                                min={1}
                                                max={30}
                                                defaultValue={5}
                                                required
                                            />
                                            <FormHint>
                                                Aktivni igrači prijavljeni za
                                                takmičenje
                                            </FormHint>
                                            <InputError
                                                message={errors.members_count}
                                            />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="substitutes_count">
                                                Broj rezervi
                                            </Label>
                                            <Input
                                                id="substitutes_count"
                                                name="substitutes_count"
                                                type="number"
                                                min={0}
                                                max={30}
                                                defaultValue={0}
                                                required
                                            />
                                            <FormHint>
                                                0 ako sport nema rezerve
                                            </FormHint>
                                            <InputError
                                                message={
                                                    errors.substitutes_count
                                                }
                                            />
                                        </FormField>
                                    </FormGrid>
                                </FormSection>

                                <FormSection
                                    title="Pravila i napomene"
                                    description="Opciono — slobodan tekst koji se prikazuje profesorima pri prijavi ekipe."
                                >
                                    <FormField>
                                        <Label htmlFor="rules_description">
                                            Pravila (opciono)
                                        </Label>
                                        <Textarea
                                            id="rules_description"
                                            name="rules_description"
                                            rows={5}
                                            placeholder="npr. Trajanje 2 × 20 min. Klizeći start dozvoljen samo igračima starijim od 14 godina…"
                                        />
                                        <InputError
                                            message={errors.rules_description}
                                        />
                                    </FormField>
                                </FormSection>
                            </FormCardBody>

                            <FormCardFooter>
                                <Button
                                    asChild
                                    variant="ghost"
                                    type="button"
                                >
                                    <Link href="/admin/sports">Otkaži</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Čuvanje…' : 'Kreiraj sport'}
                                </Button>
                            </FormCardFooter>
                        </>
                    )}
                </Form>
            </FormCard>
        </AppLayout>
    );
}
