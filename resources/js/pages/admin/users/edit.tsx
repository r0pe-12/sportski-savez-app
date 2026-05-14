import { Form, Head, Link } from '@inertiajs/react';
import { UserCog } from 'lucide-react';
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
import { SelectField } from '@/components/ui/select-field';
import AppLayout from '@/layouts/app-layout';
import type { SchoolSummary } from '@/types/auth';

type School = { id: number; name: string; code: string };
type Role = { value: string; label: string };
type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    school: SchoolSummary | null;
    jmb?: string | null;
    grade?: string | null;
    birth_date?: string | null;
};

export default function UsersEdit({
    user,
    schools,
    roles,
}: {
    user: User;
    schools: School[];
    roles: Role[];
}) {
    const [role, setRole] = useState(user.role);
    const [schoolId, setSchoolId] = useState(
        user.school?.id ? String(user.school.id) : '',
    );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Korisnici', href: '/admin/users' },
                { title: user.name, href: `/admin/users/${user.id}/edit` },
            ]}
        >
            <Head title={`Uredi: ${user.name}`} />
            <FormCard
                title={`Uredi korisnika — ${user.name}`}
                description="Izmjeni ulogu, identitet i (za učenike) eDnevnik podatke."
                icon={UserCog}
                backHref="/admin/users"
                backLabel="Nazad na listu korisnika"
                sidebar={
                    <div className="bg-muted/30 rounded-xl border p-4 text-sm">
                        <h3 className="mb-2 font-medium">Trenutni podaci</h3>
                        <dl className="text-muted-foreground space-y-1 text-xs">
                            <div className="flex justify-between gap-2">
                                <dt>ID</dt>
                                <dd className="font-mono">#{user.id}</dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt>Email</dt>
                                <dd className="truncate font-mono">
                                    {user.email}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-2">
                                <dt>Uloga</dt>
                                <dd className="font-medium">
                                    {roles.find((r) => r.value === user.role)
                                        ?.label ?? user.role}
                                </dd>
                            </div>
                            {user.school && (
                                <div className="flex justify-between gap-2">
                                    <dt>Škola</dt>
                                    <dd className="truncate text-right">
                                        {user.school.name}
                                    </dd>
                                </div>
                            )}
                        </dl>
                        <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                            Promjena uloge može uticati na audit log i prava
                            pristupa. Lozinka se mijenja zasebno kroz „Postavke
                            sigurnosti".
                        </p>
                    </div>
                }
            >
                <Form
                    action={`/admin/users/${user.id}`}
                    method="put"
                    className="contents"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormCardBody>
                                <FormSection
                                    title="Tip naloga"
                                    description="Pažljivo — promjena uloge mijenja sve pristupe."
                                >
                                    <FormField>
                                        <SelectField
                                            id="role"
                                            name="role"
                                            label="Uloga"
                                            value={role}
                                            onChange={setRole}
                                            options={roles.map((r) => ({
                                                value: r.value,
                                                label: r.label,
                                            }))}
                                            required
                                            aria-invalid={errors.role ? true : undefined}
                                        />
                                        <InputError message={errors.role} />
                                    </FormField>
                                </FormSection>

                                <FormSection
                                    title="Identitet"
                                    description="Ime se prikazuje u svim listama. Email mora biti jedinstven."
                                >
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="name">
                                                Ime i prezime
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                defaultValue={user.name}
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                defaultValue={user.email}
                                                required
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </FormField>
                                    </FormGrid>
                                </FormSection>

                                {role !== 'admin' && (
                                    <FormSection
                                        title="Škola"
                                        description="Profesori vide samo učenike iz svoje škole."
                                    >
                                        <FormField>
                                            <SelectField
                                                id="school_id"
                                                name="school_id"
                                                label="Škola"
                                                placeholder="Odaberi školu…"
                                                value={schoolId}
                                                onChange={setSchoolId}
                                                options={schools.map((s) => ({
                                                    value: String(s.id),
                                                    label: s.name,
                                                    description: s.code,
                                                }))}
                                                required
                                                aria-invalid={errors.school_id ? true : undefined}
                                            />
                                            <InputError
                                                message={errors.school_id}
                                            />
                                        </FormField>
                                    </FormSection>
                                )}

                                {role === 'student' && (
                                    <FormSection
                                        title="Učenički podaci"
                                        description="Promjena JMB-a resetuje eDnevnik verifikaciju."
                                    >
                                        <FormGrid cols={2}>
                                            <FormField>
                                                <Label htmlFor="jmb">JMB</Label>
                                                <Input
                                                    id="jmb"
                                                    name="jmb"
                                                    defaultValue={
                                                        user.jmb ?? ''
                                                    }
                                                    pattern="\d{13}"
                                                    maxLength={13}
                                                />
                                                <FormHint>13 cifara</FormHint>
                                                <InputError
                                                    message={errors.jmb}
                                                />
                                            </FormField>
                                            <FormField>
                                                <Label htmlFor="grade">
                                                    Razred
                                                </Label>
                                                <Input
                                                    id="grade"
                                                    name="grade"
                                                    defaultValue={
                                                        user.grade ?? ''
                                                    }
                                                />
                                                <FormHint>npr. 8-2</FormHint>
                                                <InputError
                                                    message={errors.grade}
                                                />
                                            </FormField>
                                        </FormGrid>
                                        <FormField>
                                            <Label htmlFor="birth_date">
                                                Datum rođenja
                                            </Label>
                                            <Input
                                                id="birth_date"
                                                name="birth_date"
                                                type="date"
                                                defaultValue={
                                                    user.birth_date?.slice(
                                                        0,
                                                        10,
                                                    ) ?? ''
                                                }
                                            />
                                            <InputError
                                                message={errors.birth_date}
                                            />
                                        </FormField>
                                    </FormSection>
                                )}
                            </FormCardBody>

                            <FormCardFooter>
                                <Button
                                    asChild
                                    variant="ghost"
                                    type="button"
                                >
                                    <Link href="/admin/users">Otkaži</Link>
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
