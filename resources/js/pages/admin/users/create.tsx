import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type School = { id: number; name: string; code: string };
type Role = { value: string; label: string };

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
                { title: 'Novi', href: '/admin/users/create' },
            ]}
        >
            <Head title="Novi korisnik" />
            <div className="max-w-xl space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Novi korisnik</h1>
                <Form
                    action="/admin/users"
                    method="post"
                    className="flex flex-col gap-4"
                >
                    {({ errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label>Uloga</Label>
                                <select
                                    name="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                >
                                    {roles.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.role} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Ime</Label>
                                <Input id="name" name="name" required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Lozinka</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={8}
                                />
                                <InputError message={errors.password} />
                            </div>
                            {role !== 'admin' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="school_id">Škola</Label>
                                    <select
                                        id="school_id"
                                        name="school_id"
                                        className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                        required
                                    >
                                        <option value="">— odaberi —</option>
                                        {schools.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.school_id} />
                                </div>
                            )}
                            {role === 'student' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="jmb">JMB</Label>
                                        <Input
                                            id="jmb"
                                            name="jmb"
                                            pattern="\d{13}"
                                            maxLength={13}
                                            required
                                        />
                                        <InputError message={errors.jmb} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="grade">Razred</Label>
                                        <Input
                                            id="grade"
                                            name="grade"
                                            required
                                        />
                                        <InputError message={errors.grade} />
                                    </div>
                                    <div className="grid gap-2">
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
                                    </div>
                                </>
                            )}
                            {role === 'professor' && (
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="verified_at_now"
                                        value="1"
                                    />
                                    Označi kao verified profesor odmah
                                </label>
                            )}
                            <Button type="submit">Kreiraj</Button>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
