import { Head } from '@inertiajs/react';
import { SportTypeBadge } from '@/components/sports/SportTypeBadge';
import AppLayout from '@/layouts/app-layout';

type Sport = {
    id: number;
    slug: string;
    name: string;
    type: 'team_sport' | 'individual_sport';
    members_count: number;
    substitutes_count: number;
    rules_description: string | null;
};

export default function SportShow({ sport }: { sport: Sport }) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sportovi', href: '/sports' },
                { title: sport.name, href: `/sports/${sport.slug}` },
            ]}
        >
            <Head title={sport.name} />
            <div className="max-w-2xl space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">{sport.name}</h1>
                    <SportTypeBadge type={sport.type} />
                </div>
                <p>
                    Članovi: {sport.members_count} (+ {sport.substitutes_count} rezerve)
                </p>
                {sport.rules_description && (
                    <p className="whitespace-pre-line">{sport.rules_description}</p>
                )}
            </div>
        </AppLayout>
    );
}
