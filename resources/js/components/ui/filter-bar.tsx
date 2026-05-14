import { Filter, X } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FilterBarProps = {
    children: React.ReactNode;
    /** Da li su trenutno aktivni neki filteri (kontroliše prikaz "Resetuj" dugmeta). */
    hasActiveFilters?: boolean;
    /** Callback za resetovanje svih filtera. */
    onReset?: () => void;
    /** Tekst za reset dugme. */
    resetLabel?: string;
    /** Akcije sa desne strane (npr. dugme "Resetuj" custom variantu, broj rezultata, itd.). */
    rightSlot?: React.ReactNode;
    className?: string;
};

/**
 * FilterBar — standardizovani kontejner za filter UI na admin/listing stranicama.
 *
 * Pattern:
 *   <FilterBar hasActiveFilters={...} onReset={...}>
 *     <SelectField ... />
 *     <SelectField ... />
 *     <Input type="search" ... />
 *   </FilterBar>
 *
 * - Konzistentan border, padding, gap.
 * - Filter ikona i (po potrebi) "Resetuj filtere" dugme automatski.
 * - Responsive: stack-uje se na mobile (1 kolona), širi na sm+ (auto grid).
 */
export function FilterBar({
    children,
    hasActiveFilters,
    onReset,
    resetLabel = 'Resetuj filtere',
    rightSlot,
    className,
}: FilterBarProps) {
    return (
        <div
            className={cn(
                'bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-xs',
                className,
            )}
        >
            <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                <Filter className="size-3.5" />
                <span>Filteri</span>
                {hasActiveFilters && onReset && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="ml-auto h-7 gap-1 px-2 text-xs normal-case"
                    >
                        <X className="size-3.5" />
                        {resetLabel}
                    </Button>
                )}
                {rightSlot && <div className="ml-auto">{rightSlot}</div>}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                {children}
            </div>
        </div>
    );
}

type FilterBarChipProps = {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    /** Boja kad je aktivan. Default: amber. */
    tone?: 'amber' | 'red' | 'green' | 'blue';
    className?: string;
};

const TONES: Record<NonNullable<FilterBarChipProps['tone']>, { active: string; inactive: string }> = {
    amber: {
        active: 'border-amber-400 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
        inactive:
            'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-900/40',
    },
    red: {
        active: 'border-red-400 bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100',
        inactive:
            'border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-900/40',
    },
    green: {
        active: 'border-green-400 bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100',
        inactive:
            'border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200 dark:hover:bg-green-900/40',
    },
    blue: {
        active: 'border-blue-400 bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100',
        inactive:
            'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200 dark:hover:bg-blue-900/40',
    },
};

/**
 * FilterBarChip — "quick filter" chip (npr. „Čeka odobrenje", „Mismatched").
 * Idu pored SelectField-ova u FilterBar slotu kao prečice.
 */
export function FilterBarChip({
    active,
    onClick,
    children,
    tone = 'amber',
    className,
}: FilterBarChipProps) {
    const palette = TONES[tone];

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex items-center self-end rounded-full border px-3 py-1.5 text-xs font-medium transition',
                active ? palette.active : palette.inactive,
                className,
            )}
        >
            {children}
        </button>
    );
}
