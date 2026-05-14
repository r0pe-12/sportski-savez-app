import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { SportTypeBadge } from '@/components/sports/SportTypeBadge';
import { Button } from '@/components/ui/button';
import { SelectField  } from '@/components/ui/select-field';
import type {SelectFieldOption} from '@/components/ui/select-field';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format-date';

type Competition = {
    id: number;
    name: string;
    start_date: string;
    location: string;
    sport: {
        id: number;
        name: string;
        type: 'team_sport' | 'individual_sport';
        members_count: number;
        substitutes_count: number;
    };
};

export default function TeamsCreate({ competitions }: { competitions: Competition[] }) {
    const [selectedId, setSelectedId] = useState<string>('');
    const selected = competitions.find((c) => String(c.id) === selectedId);

    const competitionOptions: SelectFieldOption[] = competitions.map((c) => ({
        value: String(c.id),
        label: c.name,
        description: `${c.sport.name} · ${formatDate(c.start_date) || c.start_date}`,
    }));

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Moje ekipe', href: '/teams' },
                { title: 'Nova', href: '/teams/create' },
            ]}
        >
            <Head title="Nova prijava ekipe" />
            <div className="max-w-2xl space-y-6 p-6">
                <h1 className="text-2xl font-semibold">Nova prijava ekipe</h1>

                <Form action="/teams" method="post" className="space-y-4">
                    {({ errors, processing }) => (
                        <>
                            <SelectField
                                id="competition_id"
                                name="competition_id"
                                label="Takmičenje"
                                placeholder="Odaberi takmičenje…"
                                value={selectedId}
                                onChange={setSelectedId}
                                options={competitionOptions}
                                required
                                aria-invalid={errors.competition_id ? true : undefined}
                            />
                            <InputError message={errors.competition_id} />

                            {selected && (
                                <div className="bg-muted rounded border p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{selected.sport.name}</p>
                                            <p className="text-muted-foreground text-sm">
                                                {selected.sport.members_count} članova + {selected.sport.substitutes_count} rezervi
                                            </p>
                                        </div>
                                        <SportTypeBadge type={selected.sport.type} />
                                    </div>
                                </div>
                            )}

                            <Button type="submit" disabled={!selectedId || processing}>
                                Kreiraj draft
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}
