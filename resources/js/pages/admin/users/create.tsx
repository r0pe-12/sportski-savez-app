import { Form, Head, Link } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
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
import AppLayout from '@/layouts/app-layout';

type School = { id: number; name: string; code: string };
type Role = { value: string; label: string };

const ROLE_DESCRIPTIONS: Record<string, string> = {
    admin: 'Pun pristup — korisnici, škole, sportovi, takmičenja, rezultati, audit log.',
    professor: 'Prijavljuje ekipe i upload-uje medicinske potvrde za učenike svoje škole.',
    student: 'Pristup ličnom profilu, istoriji takmičenja i medalja.',
};

export default function UsersCreate({
    schools,
    roles,
}: {
    schools: School[];
    roles: Role[];
}) {
    const [role, setRole] = useState('professor');

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Korisnici', href: '/admin/users' },
                { title: 'Novi korisnik', href: '/admin/users/create' },
            ]}
        >
            <Head title="Novi korisnik" />
            <FormCard
                title="Novi korisnik"
                description="Kreiraj nalog za admina, profesora ili učenika. Profil i pristup zavise od izabrane uloge."
                icon={UserPlus}
                backHref="/admin/users"
                backLabel="Nazad na listu korisnika"
                sidebar={
                    <div className="bg-muted/30 rounded-xl border p-4 text-sm">
                        <h3 className="mb-2 font-medium">
                            Uloga: {roles.find((r) => r.value === role)?.label}
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            {ROLE_DESCRIPTIONS[role]}
                        </p>
                        <div className="text-muted-foreground mt-3 space-y-1 text-xs">
                            <p>
                                <span className="font-medium">Email:</span> mora
                                biti jedinstven u sistemu.
                            </p>
                            <p>
                                <span className="font-medium">Lozinka:</span> min
                                8 karaktera, korisnik može promijeniti posle
                                prvog login-a.
                            </p>
                            {role === 'student' && (
                                <p>
                                    <span className="font-medium">JMB:</span> 13
                                    cifara, koristi se za eDnevnik verifikaciju.
                                </p>
                            )}
                        </div>
                    </div>
                }
            >
                <Form
                    action="/admin/users"
                    method="post"
                    className="contents"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormCardBody>
                                <FormSection
                                    title="Tip naloga"
                                    description="Uloga određuje pristupna prava i koji su podaci obavezni."
                                >
                                    <FormField>
                                        <Label htmlFor="role">Uloga</Label>
                                        <NativeSelect
                                            id="role"
                                            name="role"
                                            value={role}
                                            onChange={(e) =>
                                                setRole(e.target.value)
                                            }
                                        >
                                            {roles.map((r) => (
                                                <option
                                                    key={r.value}
                                                    value={r.value}
                                                >
                                                    {r.label}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                        <InputError message={errors.role} />
                                    </FormField>
                                </FormSection>

                                <FormSection
                                    title="Identitet i pristup"
                                    description="Osnovni podaci za login."
                                >
                                    <FormField>
                                        <Label htmlFor="name">Ime i prezime</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="npr. Marko Marković"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </FormField>
                                    <FormGrid cols={2}>
                                        <FormField>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="ime.prezime@skola.me"
                                                required
                                            />
                                            <InputError message={errors.email} />
                                        </FormField>
                                        <FormField>
                                            <Label htmlFor="password">
                                                Lozinka
                                            </Label>
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                required
                                                minLength={8}
                                            />
                                            <FormHint>
                                                Min 8 karaktera
                                            </FormHint>
                                            <InputError
                                                message={errors.password}
                                            />
                                        </FormField>
                                    </FormGrid>
                                </FormSection>

                                {role !== 'admin' && (
                                    <FormSection
                                        title="Škola"
                                        description="Profesori prijavljuju samo svoje učenike. Učenici pripadaju ovoj školi."
                                    >
                                        <FormField>
                                            <Label htmlFor="school_id">
                                                Škola
                                            </Label>
                                            <NativeSelect
                                                id="school_id"
                                                name="school_id"
                                                required
                                                defaultValue=""
                                            >
                                                <option value="" disabled>
                                                    — odaberi školu —
                                                </option>
                                                {schools.map((s) => (
                                                    <option
                                                        key={s.id}
                                                        value={s.id}
                                                    >
                                                        {s.name}{' '}
                                                        <span className="text-muted-foreground">
                                                            ({s.code})
                                                        </span>
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                            <InputError
                                                message={errors.school_id}
                                            />
                                        </FormField>
                                    </FormSection>
                                )}

                                {role === 'student' && (
                                    <FormSection
                                        title="Učenički podaci"
                                        description="Koriste se za eDnevnik verifikaciju i prikaz na profilu."
                                    >
                                        <FormGrid cols={2}>
                                            <FormField>
                                                <Label htmlFor="jmb">
                                                    JMB
                                                </Label>
                                                <Input
                                                    id="jmb"
                                                    name="jmb"
                                                    pattern="\d{13}"
                                                    maxLength={13}
                                                    placeholder="0000000000001"
                                                    required
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
                                                    placeholder="npr. 8-2"
                                                    required
                                                />
                                                <FormHint>
                                                    Format: razred-odjeljenje
                                                </FormHint>
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
                                                required
                                            />
                                            <InputError
                                                message={errors.birth_date}
                                            />
                                        </FormField>
                                    </FormSection>
                                )}

                                {role === 'professor' && (
                                    <FormSection
                                        title="Verifikacija"
                                        description="Verifikovani profesori mogu odmah prijavljivati ekipe."
                                    >
                                        <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50">
                                            <input
                                                type="checkbox"
                                                name="verified_at_now"
                                                value="1"
                                                className="mt-0.5"
                                            />
                                            <div className="space-y-1 text-sm">
                                                <p className="font-medium">
                                                    Označi kao verified odmah
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    Bez ovoga, profesor mora
                                                    čekati admin verifikaciju
                                                    prije prijava.
                                                </p>
                                            </div>
                                        </label>
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
                                        ? 'Kreiranje…'
                                        : 'Kreiraj korisnika'}
                                </Button>
                            </FormCardFooter>
                        </>
                    )}
                </Form>
            </FormCard>
        </AppLayout>
    );
}
