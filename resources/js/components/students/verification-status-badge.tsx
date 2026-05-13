import { AlertTriangle, Check, Clock, HelpCircle, X, type LucideIcon } from 'lucide-react';

type StatusConfig = { label: string; color: string; icon: LucideIcon };

const config: Record<string, StatusConfig> = {
    unverified: { label: 'Neverifikovan', color: 'bg-gray-100 text-gray-800', icon: HelpCircle },
    pending: { label: 'U toku', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    verified: { label: 'Verifikovan', color: 'bg-green-100 text-green-800', icon: Check },
    mismatched: { label: 'Razlika sa eDnevnik', color: 'bg-amber-100 text-amber-800', icon: AlertTriangle },
    failed: { label: 'Greška', color: 'bg-red-100 text-red-800', icon: X },
};

export function VerificationStatusBadge({ status }: { status: string }) {
    const c = config[status] ?? config.unverified;
    const Icon = c.icon;
    return (
        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${c.color}`}>
            <Icon className="h-3 w-3" /> {c.label}
        </span>
    );
}
