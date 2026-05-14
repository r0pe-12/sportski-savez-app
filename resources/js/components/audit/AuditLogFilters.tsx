import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/ui/filter-bar';
import { Input } from '@/components/ui/input';
import { SelectField  } from '@/components/ui/select-field';
import type {SelectFieldOption} from '@/components/ui/select-field';

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
        router.get(
            '/admin/audit-log',
            filters as Record<string, unknown>,
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const reset = () => {
        const empty: Filters = {
            user_id: '',
            action: '',
            subject_type: '',
            from: '',
            to: '',
        };
        setFilters(empty);
        router.get('/admin/audit-log', {}, { preserveScroll: true, replace: true });
    };

    const hasActive = Boolean(
        filters.user_id || filters.action || filters.subject_type || filters.from || filters.to,
    );

    const userOptions: SelectFieldOption[] = users.map((u) => ({
        value: String(u.id),
        label: u.name,
        description: u.email,
    }));

    return (
        <FilterBar
            hasActiveFilters={hasActive}
            onReset={reset}
            rightSlot={
                <Button onClick={apply} size="sm">
                    Primijeni
                </Button>
            }
        >
            <SelectField
                label="Korisnik"
                placeholder="Svi korisnici"
                value={filters.user_id ? String(filters.user_id) : ''}
                onChange={(v) =>
                    setFilters({ ...filters, user_id: v ? Number(v) : '' })
                }
                options={userOptions}
            />

            <div className="flex flex-col gap-1.5">
                <label className="text-foreground text-sm font-medium leading-none">
                    Akcija (prefix)
                </label>
                <Input
                    className="h-10"
                    value={filters.action ?? ''}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    placeholder="team, student…"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            apply();
                        }
                    }}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-foreground text-sm font-medium leading-none">
                    Tip subjekta
                </label>
                <Input
                    className="h-10"
                    value={filters.subject_type ?? ''}
                    onChange={(e) =>
                        setFilters({ ...filters, subject_type: e.target.value })
                    }
                    placeholder="Team, Student…"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            apply();
                        }
                    }}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-foreground text-sm font-medium leading-none">
                    Od
                </label>
                <Input
                    type="date"
                    className="h-10"
                    value={filters.from ?? ''}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-foreground text-sm font-medium leading-none">
                    Do
                </label>
                <Input
                    type="date"
                    className="h-10"
                    value={filters.to ?? ''}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                />
            </div>
        </FilterBar>
    );
}
