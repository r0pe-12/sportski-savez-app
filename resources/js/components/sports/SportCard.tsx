import { Link } from '@inertiajs/react';
import { SportTypeBadge } from './SportTypeBadge';

type SportCardProps = {
    sport: {
        id: number;
        slug: string;
        name: string;
        type: 'team_sport' | 'individual_sport';
        members_count: number;
        substitutes_count: number;
    };
};

export function SportCard({ sport }: SportCardProps) {
    return (
        <Link
            href={`/sports/${sport.slug}`}
            className="block rounded border p-4 transition hover:bg-muted"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{sport.name}</h3>
                <SportTypeBadge type={sport.type} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
                {sport.members_count} članova
                {sport.substitutes_count > 0 && ` + ${sport.substitutes_count} rezerve`}
            </p>
        </Link>
    );
}
