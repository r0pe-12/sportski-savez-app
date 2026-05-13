export function SportTypeBadge({ type }: { type: 'team_sport' | 'individual_sport' }) {
    const label = type === 'team_sport' ? 'Timski' : 'Individualni';
    const className =
        type === 'team_sport' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';

    return (
        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}
