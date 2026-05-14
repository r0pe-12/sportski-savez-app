import { Check, ChevronDown, Search, X } from 'lucide-react';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type MultiSelectOption = {
    value: string;
    label: string;
    /** Sekundarna linija (npr. "razred + status"). */
    description?: string;
    /** Element ispred labela (avatar, ikona). */
    leading?: React.ReactNode;
    /** Element iza labela (npr. status badge). */
    trailing?: React.ReactNode;
    /** String po kojem se vrši pretraga. Ako nije zadat, koristi se `label`. */
    searchText?: string;
    disabled?: boolean;
};

type MultiSelectProps = {
    options: MultiSelectOption[];
    value: string[];
    onChange: (next: string[]) => void;
    id?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    /** Tekst kad nema rezultata pretrage. */
    emptyText?: string;
    /** Max broj selektovanih (npr. 5 članova ekipe). */
    max?: number;
    /** Da li prikazati chip-ove odabranih ispod trigera. Default: true. */
    showChips?: boolean;
    /** Klasa za trigger. */
    triggerClassName?: string;
    /** Klasa za popover panel. */
    panelClassName?: string;
    /** Klasa za root wrapper. */
    className?: string;
    disabled?: boolean;
    'aria-invalid'?: boolean | 'true' | 'false';
};

/**
 * MultiSelect — popover-based višestruki izbor sa pretragom i chip prikazom.
 *
 * Pattern:
 *   <MultiSelect
 *       options={students.map(s => ({ value: String(s.id), label: s.name, ... }))}
 *       value={selectedIds}
 *       onChange={setSelectedIds}
 *       placeholder="Odaberi učenike…"
 *       max={5}
 *   />
 *
 * - Klik na trigger → otvara panel sa search input + lista.
 * - Klik na opciju → toggle (check ikona ako je odabrana).
 * - Klik na chip ili Backspace u search → ukloni odabranog.
 * - Esc ili click izvan → zatvori panel.
 *
 * Bez vanjskih dependency-ja (nema cmdk) — koristi samo React + lucide.
 */
export function MultiSelect({
    options,
    value,
    onChange,
    id,
    placeholder = 'Odaberi…',
    searchPlaceholder = 'Pretraga…',
    emptyText = 'Nema rezultata.',
    max,
    showChips = true,
    triggerClassName,
    panelClassName,
    className,
    disabled,
    'aria-invalid': ariaInvalid,
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const safeOptions = options ?? [];
    const safeValue = value ?? [];
    const valueSet = useMemo(() => new Set(safeValue), [safeValue]);
    const selectedOptions = useMemo(
        () => safeOptions.filter((o) => valueSet.has(o.value)),
        [safeOptions, valueSet],
    );

    const normalizedQuery = query.trim().toLowerCase();
    const filteredOptions = useMemo(() => {
        if (!normalizedQuery) {
            return safeOptions;
        }

        return safeOptions.filter((o) => {
            const haystack = (o.searchText ?? o.label).toLowerCase();
            const descMatch = o.description?.toLowerCase().includes(normalizedQuery);

            return haystack.includes(normalizedQuery) || Boolean(descMatch);
        });
    }, [safeOptions, normalizedQuery]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setQuery('');
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                setQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    useEffect(() => {
        if (open) {
            // Focus search field on open.
            const t = setTimeout(() => inputRef.current?.focus(), 30);

            return () => clearTimeout(t);
        }
    }, [open]);

    const toggle = (val: string) => {
        if (valueSet.has(val)) {
            onChange(safeValue.filter((v) => v !== val));

            return;
        }

        if (typeof max === 'number' && safeValue.length >= max) {
            return;
        }

        onChange([...safeValue, val]);
    };

    const handleRemoveChip = (val: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(safeValue.filter((v) => v !== val));
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && query === '' && safeValue.length > 0) {
            // Remove last chip.
            onChange(safeValue.slice(0, -1));
        }
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    const limitReached = typeof max === 'number' && safeValue.length >= max;

    return (
        <div ref={wrapperRef} className={cn('relative', className)}>
            <button
                type="button"
                id={id}
                disabled={disabled}
                aria-invalid={ariaInvalid}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'border-input bg-background hover:bg-accent/40 flex min-h-10 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,background-color,box-shadow] outline-none',
                    'focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]',
                    'aria-invalid:border-destructive aria-invalid:ring-destructive/30 aria-invalid:ring-[3px]',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    open && 'border-ring ring-ring/40 ring-[3px]',
                    triggerClassName,
                )}
            >
                <div className="flex flex-1 flex-wrap items-center gap-1">
                    {safeValue.length === 0 && (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    {showChips &&
                        (selectedOptions ?? []).map((opt) => (
                            <span
                                key={opt.value}
                                className="bg-accent text-accent-foreground inline-flex max-w-[160px] items-center gap-1 rounded-md px-2 py-0.5 text-xs"
                            >
                                <span className="truncate">{opt.label}</span>
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={(e) => handleRemoveChip(opt.value, e)}
                                    className="hover:bg-foreground/10 -mr-1 flex size-4 shrink-0 items-center justify-center rounded-sm"
                                    aria-label={`Ukloni ${opt.label}`}
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))}
                    {!showChips && safeValue.length > 0 && (
                        <span>
                            {safeValue.length} odabrano{safeValue.length === 1 ? '' : 'h'}
                        </span>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {safeValue.length > 0 && !disabled && (
                        <span
                            role="button"
                            tabIndex={-1}
                            onClick={handleClearAll}
                            aria-label="Obriši sve"
                            className="text-muted-foreground hover:text-foreground hover:bg-accent flex size-5 items-center justify-center rounded-sm"
                        >
                            <X className="size-3.5" />
                        </span>
                    )}
                    <ChevronDown
                        className={cn(
                            'size-4 opacity-60 transition-transform',
                            open && 'rotate-180',
                        )}
                    />
                </div>
            </button>

            {open && (
                <div
                    className={cn(
                        'bg-popover text-popover-foreground absolute z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md',
                        panelClassName,
                    )}
                    role="listbox"
                >
                    <div className="border-b p-2">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder={searchPlaceholder}
                                className="bg-background w-full rounded-md border-0 py-1.5 pr-2 pl-8 text-sm outline-none focus:ring-0"
                            />
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1">
                        {(filteredOptions ?? []).length === 0 ? (
                            <p className="text-muted-foreground p-3 text-center text-xs">
                                {emptyText}
                            </p>
                        ) : (
                            (filteredOptions ?? []).map((opt) => {
                                const isSelected = valueSet.has(opt.value);
                                const isDisabled =
                                    opt.disabled || (limitReached && !isSelected);

                                return (
                                    <button
                                        type="button"
                                        key={opt.value}
                                        disabled={isDisabled}
                                        onClick={() => toggle(opt.value)}
                                        className={cn(
                                            'hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50',
                                            isSelected && 'bg-accent/40',
                                        )}
                                    >
                                        <span className="text-primary flex size-4 shrink-0 items-center justify-center">
                                            {isSelected && <Check className="size-4" />}
                                        </span>
                                        {opt.leading && (
                                            <span className="shrink-0">{opt.leading}</span>
                                        )}
                                        <span className="flex-1 min-w-0">
                                            <span className="block truncate">
                                                {opt.label}
                                            </span>
                                            {opt.description && (
                                                <span className="text-muted-foreground block truncate text-xs">
                                                    {opt.description}
                                                </span>
                                            )}
                                        </span>
                                        {opt.trailing && (
                                            <span className="shrink-0">
                                                {opt.trailing}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                    {typeof max === 'number' && (
                        <div className="text-muted-foreground border-t px-3 py-1.5 text-xs">
                            {safeValue.length} / {max} odabrano
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
