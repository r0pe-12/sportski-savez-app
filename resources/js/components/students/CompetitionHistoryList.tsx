type HistoryEntry = {
    team_id: number;
    competition: { name: string; start_date: string | null; slug: string };
    sport: { name: string; type: string };
    team_status: string;
    result: { placement: number; medal_type: string } | null;
};

const medalIcon: Record<string, string> = {
    gold: 'Z',
    silver: 'S',
    bronze: 'B',
    participation: 'U',
};

const medalLabel: Record<string, string> = {
    gold: 'Zlato',
    silver: 'Srebro',
    bronze: 'Bronza',
    participation: 'Učešće',
};

const medalClass: Record<string, string> = {
    gold: 'bg-yellow-100 text-yellow-800',
    silver: 'bg-gray-100 text-gray-700',
    bronze: 'bg-amber-100 text-amber-800',
    participation: 'bg-blue-100 text-blue-800',
};

export function CompetitionHistoryList({
    history,
}: {
    history: HistoryEntry[];
}) {
    if (history.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">Još nema učešća.</p>
        );
    }

    return (
        <ul className="space-y-2">
            {history.map((h) => (
                <li
                    key={h.team_id}
                    className="flex items-center justify-between gap-3 rounded border p-3"
                >
                    <div>
                        <p className="font-medium">{h.competition.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {h.sport.name}
                            {h.competition.start_date
                                ? ` · ${h.competition.start_date}`
                                : ''}
                        </p>
                    </div>
                    {h.result ? (
                        <span
                            className={`inline-flex items-center gap-2 rounded px-2 py-1 text-sm font-medium ${
                                medalClass[h.result.medal_type] ??
                                medalClass.participation
                            }`}
                        >
                            <span className="font-bold">
                                {medalIcon[h.result.medal_type] ?? '?'}
                            </span>
                            <span>
                                {medalLabel[h.result.medal_type] ??
                                    h.result.medal_type}
                            </span>
                            <span className="text-xs">
                                · {h.result.placement}. mjesto
                            </span>
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            Bez rezultata
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}
