import { Award } from 'lucide-react';

type Medals = {
    gold: number;
    silver: number;
    bronze: number;
    participation: number;
};

export function MedalShelf({ medals }: { medals: Medals }) {
    const items = [
        { key: 'gold', label: 'Zlatne', color: 'text-yellow-500' },
        { key: 'silver', label: 'Srebrne', color: 'text-gray-400' },
        { key: 'bronze', label: 'Bronzane', color: 'text-amber-700' },
        { key: 'participation', label: 'Učešća', color: 'text-blue-500' },
    ] as const;

    return (
        <div className="grid grid-cols-4 gap-3">
            {items.map((it) => (
                <div key={it.key} className="rounded border p-3 text-center">
                    <Award className={`mx-auto h-8 w-8 ${it.color}`} />
                    <p className="mt-1 text-2xl font-bold">{medals[it.key]}</p>
                    <p className="text-xs text-muted-foreground">{it.label}</p>
                </div>
            ))}
        </div>
    );
}
