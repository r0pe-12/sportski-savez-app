import { Form, Head, Link } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import {
    FormCard,
    FormCardBody,
    FormCardFooter,
} from '@/components/forms/form-card';
import {
    FormField,
    FormGrid,
    FormSection,
} from '@/components/forms/form-section';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format-date';

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

const STATUS_LABELS: Record<string, string> = {
    draft: 'Skica',
    open_registration: 'Prijave otvorene',
    in_progress: 'U toku',
    completed: 'Završeno',
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
                {
                    title: competition.name,
                    href: `/admin/competitions/${competition.id}/edit`,
                },
            ]}
        >
            <Head title={`Uredi: ${competition.name}`} />
            <FormCard
                title={`Uredi takmičenje — ${competition.name}`}
                description="Izmjeni parametre takmičenja. Pažljivo sa statusom — postojeće prijave ostaju."
                icon={CalendarDays}
                backHref="/admin/competitions"
                backLabel="Nazad na listu takmičenja"
                sidebar={
                    <div className="bg-muted/30 rounded-xl border p-4 text-sm">
                        <h3 className="mb-2 font-medium">Trenutno stanje</h3>
                        <dl className="text-muted-foreground space-y-1 text-xs">
                            <div className="flex justify-between gap-2">
                                <dt>ID</dt>
                                <dd className="font-mono">#{competition.id}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt>Status</dt>
                                <dd className="font-medium">
                                    {STATUS_LABELS[competition.status] ??
                                        competition.status}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt>Sport</dt>
                                <dd>
                                    {
                                        sports.find(
                                            (s) => s.id === competition.sport_id,
                                        )?.name
                                    }
                                </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt>Period</dt>
                                <dd>
                                    {formatDate(competition.start_date)} ÷{' '}
                                    {formatDate(competition.end_date)}
                                </dd>
                            </div>
                        </dl>
                        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                            Status „Završeno" ne dozvoljava nove prijave i
                            otvara unos rezultata.
                        </p>
                    </div>
                }
            >
                <Form
                    action={`/admin/competitions/${competition.id}`}
                    method="put"
                    className="contents"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormCardBody>
                                <FormSection
                                    title="Osnovni podaci"
                                    description="Naziv i URL identifikator."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="name">Naziv</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                defaultValue={competition.name}
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="slug">Slug</Label>
                                            <Input
                                                id="slug"
                                                name="slug"
                                                pattern="[a-z0-9-]+"
                                                defaultValue={competition.slug}
                                                required
                                            />
                                            <InputError message={errors.slug} />
                                        </FormField>
                                    </FormGrid>
                                    <FormField>
                                        <Label htmlFor="sport_id">Sport</Label>
                                        <NativeSelect
                                            id="sport_id"
                                            name="sport_id"
                                            defaultValue={competition.sport_id}
                                            required
                                        >
                                            {sports.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError
                                            message={errors.sport_id}
                                        />
                                    </FormField>
                                </FormSection>

                                <FormSection
                                    title="Termin i lokacija"
                                    description="Kada i gdje se održava."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="start_date">
                                                Početak
                                            </Label>
                                            <Input
                                                id="start_date"
                                                name="start_date"
                                                type="date"
                                                defaultValue={
                                                    competition.start_date
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.start_date}
                                            />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="end_date">
                                                Kraj
                                            </Label>
                                            <Input
                                                id="end_date"
                                                name="end_date"
                                                type="date"
                                                defaultValue={
                                                    competition.end_date
                                                }
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
                                            defaultValue={competition.location}
                                            required
                                        />
                                        <InputError
                                            message={errors.location}
                                        />
                                    </FormField>
                                </FormSection>

                                <FormSection
                                    title="Status i godina"
                                    description="Status utiče na vidljivost i prijave."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="status">
                                                Status
                                            </Label>
                                            <NativeSelect
                                                id="status"
                                                name="status"
                                                defaultValue={competition.status}
                                                required
                                            >
                                                <option value="draft">
                                                    Skica
                                                </option>
                                                <option value="open_registration">
                                                    Prijave otvorene
                                                </option>
                                                <option value="in_progress">
                                                    U toku
                                                </option>
                                                <option value="completed">
                                                    Završeno
                                                </option>
                                            </NativeSelect>
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
                                                defaultValue={competition.year}
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
