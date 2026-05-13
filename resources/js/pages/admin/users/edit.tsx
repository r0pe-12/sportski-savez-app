import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Korisnici', href: '/admin/users' },
                { title: 'Uredi', href: `/admin/users/${user.id}/edit` },
            ]}
        >
            <Head title="Uredi korisnika" />
            <div className="max-w-xl space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Uredi korisnika</h1>
                <Form
                    action={`/admin/users/${user.id}`}
                    method="put"
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
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={user.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={user.email}
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                            {role !== 'admin' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="school_id">Škola</Label>
                                    <select
                                        id="school_id"
                                        name="school_id"
                                        defaultValue={user.school?.id ?? ''}
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
                                            defaultValue={user.jmb ?? ''}
                                            pattern="\d{13}"
                                            maxLength={13}
                                        />
                                        <InputError message={errors.jmb} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="grade">Razred</Label>
                                        <Input
                                            id="grade"
                                            name="grade"
                                            defaultValue={user.grade ?? ''}
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
                                            defaultValue={
                                                user.birth_date?.slice(0, 10) ??
                                                ''
                                            }
                                        />
                                        <InputError
                                            message={errors.birth_date}
                                        />
                                    </div>
                                </>
                            )}
                            <Button type="submit">Sačuvaj</Button>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
