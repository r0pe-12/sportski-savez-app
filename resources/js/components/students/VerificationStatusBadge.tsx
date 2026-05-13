type Status =
    | 'unverified'
    | 'pending'
    | 'verified'
    | 'mismatched'
    | 'failed'
    | string
    | null;

const map: Record<string, { label: string; className: string }> = {
    unverified: {
        label: 'Neverifikovan',
        className: 'bg-gray-100 text-gray-700',
    },
    pending: { label: 'Na čekanju', className: 'bg-amber-100 text-amber-800' },
    verified: {
        label: 'Verifikovan',
        className: 'bg-green-100 text-green-800',
    },
    mismatched: {
        label: 'Neslaganje podataka',
        className: 'bg-orange-100 text-orange-800',
    },
    failed: { label: 'Neuspjeh', className: 'bg-red-100 text-red-800' },
};

export function VerificationStatusBadge({ status }: { status: Status }) {
    const key = status ?? 'unverified';
    const entry = map[key] ?? map.unverified;

    return (
        <span
            className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${entry.className}`}
        >
            {entry.label}
        </span>
    );
}
