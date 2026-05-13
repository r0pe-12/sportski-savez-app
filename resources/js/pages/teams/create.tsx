import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { SportTypeBadge } from '@/components/sports/SportTypeBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

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
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selected = competitions.find((c) => c.id === selectedId);

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
                            <div className="grid gap-2">
                                <Label htmlFor="competition_id">Takmičenje</Label>
                                <select
                                    id="competition_id"
                                    name="competition_id"
                                    required
                                    value={selectedId ?? ''}
                                    onChange={(e) => setSelectedId(Number(e.target.value))}
                                    className="bg-background h-9 rounded-md border px-3"
                                >
                                    <option value="">— odaberi takmičenje —</option>
                                    {competitions.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} — {c.sport.name} ({c.start_date})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.competition_id} />
                            </div>

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
