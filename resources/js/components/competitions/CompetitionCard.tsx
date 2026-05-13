import { Link } from '@inertiajs/react';

type Competition = {
    id: number;
    slug: string;
    name: string;
    start_date: string;
    end_date: string;
    location: string;
    status: string;
    sport: { name: string; type: string };
};

export function CompetitionCard({ competition }: { competition: Competition }) {
    return (
        <Link
            href={`/competitions/${competition.slug}`}
            className="block rounded border p-4 hover:bg-muted"
        >
            <h3 className="font-medium">{competition.name}</h3>
            <p className="text-sm text-muted-foreground">
                {competition.sport.name} · {competition.location}
            </p>
            <p className="text-xs">
                {competition.start_date} → {competition.end_date}
            </p>
        </Link>
    );
}
