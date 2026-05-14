import { X } from 'lucide-react';
import * as React from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type SelectFieldOption = {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
};

export type SelectFieldGroup = {
    label?: string;
    options: SelectFieldOption[];
};

type CommonProps = {
    id?: string;
    label?: string;
    /** Pomoćni tekst ispod polja. */
    hint?: string;
    /** Placeholder u trigeru kad ništa nije odabrano. */
    placeholder?: string;
    /** Da li dozvoliti "obriši izbor" X dugme u trigeru. Default: true u filter modu, false u form modu. */
    clearable?: boolean;
    /** Vidljivi tekst na clear X dugmetu (samo za screen reader). */
    clearLabel?: string;
    /** Šira/uža klasa za trigger. */
    triggerClassName?: string;
    /** Klasa za root wrapper (label + control). */
    className?: string;
    /** Veličina trigger-a. */
    size?: 'sm' | 'default';
    /** Da li je polje onemogućeno. */
    disabled?: boolean;
    /** Required atribut (vizualna oznaka). */
    required?: boolean;
    /** ARIA-invalid (za form greške). */
    'aria-invalid'?: boolean | 'true' | 'false';
};

type ValueProps = {
    value: string;
    onChange: (value: string) => void;
    name?: string;
};

type GroupedProps =
    | { options: SelectFieldOption[]; groups?: undefined }
    | { groups: SelectFieldGroup[]; options?: undefined };

export type SelectFieldProps = CommonProps & ValueProps & GroupedProps;

/**
 * SelectField — sistem-wide standardizovani dropdown.
 *
 * - Konzistentan look (h-10 trigger, full width, jasan focus ring, hover state).
 * - Opcioni "clear" X za brzo brisanje izbora (default ON kad nije required).
 * - Native form support kroz `name` (Radix Select pravi hidden input).
 * - Podržava i grupe (sportovi po tipu, statusi po kategoriji…).
 */
export function SelectField({
    id,
    label,
    hint,
    placeholder = 'Odaberi…',
    value,
    onChange,
    name,
    options,
    groups,
    clearable,
    clearLabel = 'Obriši izbor',
    triggerClassName,
    className,
    size,
    disabled,
    required,
    ...rest
}: SelectFieldProps) {
    // Default: clearable kad nije required (filteri), false kad jeste (forme).
    const showClear = (clearable ?? !required) && value !== '' && !disabled;

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onChange('');
    };

    const renderItems = () => {
        if (groups) {
            return groups.map((group, idx) => (
                <SelectGroup key={`group-${idx}-${group.label ?? 'unnamed'}`}>
                    {group.label && <SelectLabel>{group.label}</SelectLabel>}
                    {group.options.map((opt) => (
                        <SelectItem
                            key={opt.value}
                            value={opt.value}
                            disabled={opt.disabled}
                        >
                            <span className="flex flex-col">
                                <span>{opt.label}</span>
                                {opt.description && (
                                    <span className="text-muted-foreground text-xs">
                                        {opt.description}
                                    </span>
                                )}
                            </span>
                        </SelectItem>
                    ))}
                </SelectGroup>
            ));
        }

        return options?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                <span className="flex flex-col">
                    <span>{opt.label}</span>
                    {opt.description && (
                        <span className="text-muted-foreground text-xs">
                            {opt.description}
                        </span>
                    )}
                </span>
            </SelectItem>
        ));
    };

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            {label && (
                <label
                    htmlFor={id}
                    className="text-foreground text-sm font-medium leading-none"
                >
                    {label}
                    {required && <span className="text-destructive ml-0.5">*</span>}
                </label>
            )}
            <div className="relative">
                <Select
                    value={value || undefined}
                    onValueChange={onChange}
                    disabled={disabled}
                    name={name}
                    required={required}
                >
                    <SelectTrigger
                        id={id}
                        size={size}
                        aria-invalid={rest['aria-invalid']}
                        className={cn(
                            // Reserve room for clear button when visible.
                            showClear && 'pr-10',
                            triggerClassName,
                        )}
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>{renderItems()}</SelectContent>
                </Select>
                {showClear && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label={clearLabel}
                        className="text-muted-foreground hover:text-foreground hover:bg-accent absolute top-1/2 right-8 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm transition"
                        tabIndex={-1}
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </div>
            {hint && (
                <p className="text-muted-foreground text-xs leading-none">{hint}</p>
            )}
        </div>
    );
}
