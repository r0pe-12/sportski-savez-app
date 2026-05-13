import { Head } from '@inertiajs/react';
import { SportCard } from '@/components/sports/SportCard';
import AppLayout from '@/layouts/app-layout';

type SportCardData = {
    id: number;
    slug: string;
    name: string;
    type: 'team_sport' | 'individual_sport';
    members_count: number;
    substitutes_count: number;
};

export default function SportsPublic({ sports }: { sports: SportCardData[] }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Sportovi', href: '/sports' }]}>
            <Head title="Sportovi" />
            <div className="space-y-4 p-6">
                <h1 className="text-2xl font-semibold">Katalog sportova</h1>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sports.map((s) => (
                        <SportCard key={s.id} sport={s} />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
