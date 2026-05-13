import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Filters = {
    user_id?: number | '';
    action?: string;
    subject_type?: string;
    from?: string;
    to?: string;
};

type AuditUser = { id: number; name: string; email: string };

export function AuditLogFilters({ initial, users }: { initial: Filters; users: AuditUser[] }) {
    const [filters, setFilters] = useState<Filters>(initial);

    const apply = () => {
        router.get('/admin/audit-log', filters as Record<string, unknown>, { preserveScroll: true });
    };

    return (
        <div className="grid gap-2 rounded border p-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="grid gap-1">
                <label className="text-xs text-muted-foreground">Korisnik</label>
                <select
                    value={filters.user_id ?? ''}
                    onChange={(e) =>
                        setFilters({ ...filters, user_id: e.target.value ? Number(e.target.value) : '' })
                    }
                    className="h-9 rounded border bg-background px-2 text-sm"
                >
                    <option value="">Svi</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="grid gap-1">
                <label className="text-xs text-muted-foreground">Akcija (prefix)</label>
                <Input
                    value={filters.action ?? ''}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    placeholder="team, student..."
                />
            </div>
            <div className="grid gap-1">
                <label className="text-xs text-muted-foreground">Tip subjekta</label>
                <Input
                    value={filters.subject_type ?? ''}
                    onChange={(e) => setFilters({ ...filters, subject_type: e.target.value })}
                    placeholder="Team, Student..."
                />
            </div>
            <div className="grid gap-1">
                <label className="text-xs text-muted-foreground">Od</label>
                <Input
                    type="date"
                    value={filters.from ?? ''}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                />
            </div>
            <div className="grid gap-1">
                <label className="text-xs text-muted-foreground">Do</label>
                <Input
                    type="date"
                    value={filters.to ?? ''}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                />
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
                <Button onClick={apply}>Primijeni filtere</Button>
            </div>
        </div>
    );
}
