import { Form, Head, Link } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
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
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

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
            <FormCard
                title={`Uredi sport — ${sport.name}`}
                description="Izmjeni parametre sporta. Aktivna takmičenja neće biti pogođena."
                icon={Trophy}
                backHref="/admin/sports"
                backLabel="Nazad na listu sportova"
                sidebar={
                    <div className="bg-muted/30 rounded-xl border p-4 text-sm">
                        <h3 className="mb-2 font-medium">Pažnja</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            Promjena broja članova/rezervi važi samo za buduće
                            prijave. Već submitovane ekipe zadržavaju pravila iz
                            trenutka prijave.
                        </p>
                        <dl className="text-muted-foreground mt-3 space-y-1 text-xs">
                            <div className="flex justify-between">
                                <dt>ID</dt>
                                <dd className="font-mono">#{sport.id}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Slug</dt>
                                <dd className="font-mono">{sport.slug}</dd>
                            </div>
                        </dl>
                    </div>
                }
            >
                <Form
                    action={`/admin/sports/${sport.id}`}
                    method="put"
                    className="contents"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormCardBody>
                                <FormSection
                                    title="Osnovni podaci"
                                    description="Naziv vidljiv u listama, slug je URL identifikator (mala slova, brojevi, crtice)."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="name">Naziv</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                defaultValue={sport.name}
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
                                                pattern="[a-z0-9-]+"
                                                defaultValue={sport.slug}
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
                                            defaultValue={sport.type}
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
                                    description="Promjena važi samo za buduće prijave."
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
                                                defaultValue={
                                                    sport.members_count
                                                }
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
                                                defaultValue={
                                                    sport.substitutes_count
                                                }
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
                                    description="Slobodan tekst prikazan profesorima pri prijavi."
                                >
                                    <FormField>
                                        <Label htmlFor="rules_description">
                                            Pravila (opciono)
                                        </Label>
                                        <Textarea
                                            id="rules_description"
                                            name="rules_description"
                                            rows={5}
                                            defaultValue={
                                                sport.rules_description ?? ''
                                            }
                                            placeholder="npr. Trajanje 2 × 20 min…"
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
                                    {processing ? 'Čuvanje…' : 'Sačuvaj izmjene'}
                                </Button>
                            </FormCardFooter>
                        </>
                    )}
                </Form>
            </FormCard>
        </AppLayout>
    );
}
