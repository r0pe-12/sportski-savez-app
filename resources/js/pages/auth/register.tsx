import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type School = { id: number; code: string; name: string; city: string };
type Role = 'professor' | 'student';

export default function Register({ schools }: { schools: School[] }) {
    const [role, setRole] = useState<Role>('professor');

    return (
        <>
            <Head title="Registracija" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="role">Uloga</Label>
                                <select
                                    id="role"
                                    name="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as Role)}
                                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                    required
                                >
                                    <option value="professor">Profesor</option>
                                    <option value="student">Učenik</option>
                                </select>
                                <InputError message={errors.role} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Puno ime i prezime</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email adresa</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="school_id">Škola</Label>
                                <select
                                    id="school_id"
                                    name="school_id"
                                    required
                                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                >
                                    <option value="">— odaberi školu —</option>
                                    {schools.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.city})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.school_id} />
                            </div>

                            {role === 'student' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="jmb">JMB (13 cifara)</Label>
                                        <Input
                                            id="jmb"
                                            name="jmb"
                                            type="text"
                                            pattern="\d{13}"
                                            maxLength={13}
                                            required
                                        />
                                        <InputError message={errors.jmb} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="grade">Razred (npr. 8-2)</Label>
                                        <Input id="grade" name="grade" type="text" required />
                                        <InputError message={errors.grade} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="birth_date">Datum rođenja</Label>
                                        <Input
                                            id="birth_date"
                                            name="birth_date"
                                            type="date"
                                            required
                                        />
                                        <InputError message={errors.birth_date} />
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Checkbox
                                            id="parental_consent"
                                            name="parental_consent"
                                            value="1"
                                            required
                                        />
                                        <Label
                                            htmlFor="parental_consent"
                                            className="text-sm"
                                        >
                                            Potvrđujem da imam saglasnost roditelja za obradu ličnih
                                            podataka.
                                        </Label>
                                    </div>
                                    <InputError message={errors.parental_consent} />
                                </>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="password">Lozinka</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Potvrda lozinke</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Registruj se
                            </Button>
                        </div>

                        <div className="text-muted-foreground text-center text-sm">
                            Imate nalog?{' '}
                            <TextLink href={login()}>Prijavite se</TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Kreiraj nalog',
    description: 'Unesite svoje podatke za registraciju.',
};
