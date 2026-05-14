import { Form, Head, Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
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
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectField  } from '@/components/ui/select-field';
import type {SelectFieldOption} from '@/components/ui/select-field';
import AppLayout from '@/layouts/app-layout';

type SportOption = { id: number; name: string; type: string };

const STATUS_OPTIONS: SelectFieldOption[] = [
    { value: 'draft', label: 'Skica' },
    { value: 'open_registration', label: 'Prijave otvorene' },
    { value: 'in_progress', label: 'U toku' },
    { value: 'completed', label: 'Završeno' },
];

export default function CompetitionsCreate({
    sports,
}: {
    sports: SportOption[];
}) {
    const [sportId, setSportId] = useState('');
    const [status, setStatus] = useState('draft');

    const sportOptions: SelectFieldOption[] = (sports ?? []).map((s) => ({
        value: String(s.id),
        label: s.name,
    }));

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Takmičenja', href: '/admin/competitions' },
                { title: 'Novo takmičenje', href: '/admin/competitions/create' },
            ]}
        >
            <Head title="Novo takmičenje" />
            <FormCard
                title="Novo takmičenje"
                description="Postavi novo takmičenje za neki od postojećih sportova."
                icon={CalendarDays}
                backHref="/admin/competitions"
                backLabel="Nazad na listu takmičenja"
                sidebar={
                    <div className="bg-muted/30 rounded-xl border p-4 text-sm">
                        <h3 className="mb-2 font-medium">Tok statusa</h3>
                        <ol className="text-muted-foreground space-y-1 text-xs">
                            <li>
                                1. <span className="font-medium">Skica</span> —
                                priprema, profesori ne vide
                            </li>
                            <li>
                                2.{' '}
                                <span className="font-medium">
                                    Prijave otvorene
                                </span>{' '}
                                — profesori mogu kreirati ekipe
                            </li>
                            <li>
                                3. <span className="font-medium">U toku</span> —
                                takmičenje se održava
                            </li>
                            <li>
                                4. <span className="font-medium">Završeno</span>{' '}
                                — admin upisuje rezultate i medalje
                            </li>
                        </ol>
                        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                            Status se može mijenjati kasnije. Prijave su moguće
                            samo u statusu „Prijave otvorene".
                        </p>
                    </div>
                }
            >
                <Form
                    action="/admin/competitions"
                    method="post"
                    className="contents"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormCardBody>
                                <FormSection
                                    title="Osnovni podaci"
                                    description="Naziv i URL identifikator takmičenja."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="name">Naziv</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="Mali fudbal — Podgorica 2026"
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
                                                placeholder="mali-fudbal-pg-2026"
                                                pattern="[a-z0-9-]+"
                                                required
                                            />
                                            <FormHint>
                                                mala slova, brojevi, crtice
                                            </FormHint>
                                            <InputError message={errors.slug} />
                                        </FormField>
                                    </FormGrid>
                                    <FormField>
                                        <SelectField
                                            id="sport_id"
                                            name="sport_id"
                                            label="Sport"
                                            placeholder="Odaberi sport…"
                                            value={sportId}
                                            onChange={setSportId}
                                            options={sportOptions}
                                            required
                                            aria-invalid={errors.sport_id ? true : undefined}
                                        />
                                        <InputError
                                            message={errors.sport_id}
                                        />
                                    </FormField>
                                </FormSection>

                                <FormSection
                                    title="Termin i lokacija"
                                    description="Kada se i gdje održava takmičenje."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="start_date">
                                                Datum početka
                                            </Label>
                                            <Input
                                                id="start_date"
                                                name="start_date"
                                                type="date"
                                                required
                                            />
                                            <InputError
                                                message={errors.start_date}
                                            />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="end_date">
                                                Datum kraja
                                            </Label>
                                            <Input
                                                id="end_date"
                                                name="end_date"
                                                type="date"
                                                required
                                            />
                                            <InputError
                                                message={errors.end_date}
                                            />
                                        </FormField>
                                    </FormGrid>
                                    <FormField>
                                        <Label htmlFor="location">
                                            Lokacija
                                        </Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            placeholder='npr. Sportska dvorana "Morača", Podgorica'
                                            required
                                        />
                                        <InputError
                                            message={errors.location}
                                        />
                                    </FormField>
                                </FormSection>

                                <FormSection
                                    title="Status i godina"
                                    description="Status određuje vidljivost. Godinu koristi statistika i istorija."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <SelectField
                                                id="status"
                                                name="status"
                                                label="Status"
                                                value={status}
                                                onChange={setStatus}
                                                options={STATUS_OPTIONS}
                                                hint='Profesori vide samo „Prijave otvorene"'
                                                required
                                                aria-invalid={errors.status ? true : undefined}
                                            />
                                            <InputError
                                                message={errors.status}
                                            />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="year">
                                                Školska godina
                                            </Label>
                                            <Input
                                                id="year"
                                                name="year"
                                                type="number"
                                                min={2024}
                                                max={2100}
                                                defaultValue={new Date().getFullYear()}
                                                required
                                            />
                                            <InputError message={errors.year} />
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
                                    <Link href="/admin/competitions">
                                        Otkaži
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Kreiranje…'
                                        : 'Kreiraj takmičenje'}
                                </Button>
                            </FormCardFooter>
                        </>
                    )}
                </Form>
            </FormCard>
        </AppLayout>
    );
}
