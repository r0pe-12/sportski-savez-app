import { AlertTriangle, Archive, Check, Clock, Eye, X  } from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

type StatusKey = 'pending' | 'valid' | 'expired' | 'invalid' | 'manual_review' | 'superseded';

const config: Record<StatusKey, { label: string; color: string; icon: LucideIcon }> = {
    pending: { label: 'OCR u toku', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    valid: { label: 'Validna', color: 'bg-green-100 text-green-800', icon: Check },
    expired: { label: 'Istekla', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    invalid: { label: 'Nevalidna', color: 'bg-red-100 text-red-800', icon: X },
    manual_review: { label: 'Ručna provjera', color: 'bg-purple-100 text-purple-800', icon: Eye },
    superseded: { label: 'Zamijenjena', color: 'bg-gray-100 text-gray-800', icon: Archive },
};

export function CertificateStatusBadge({ status }: { status: string }) {
    const key = (status in config ? status : 'pending') as StatusKey;
    const c = config[key];
    const Icon = c.icon;

    return (
        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${c.color}`}>
            <Icon className="h-3 w-3" /> {c.label}
        </span>
    );
}
