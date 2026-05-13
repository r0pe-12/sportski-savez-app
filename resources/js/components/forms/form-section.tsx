import * as React from 'react';
import { cn } from '@/lib/utils';

type FormSectionProps = {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
};

export function FormSection({
    title,
    description,
    children,
    className,
}: FormSectionProps) {
    return (
        <section className={cn('space-y-4', className)}>
            {(title || description) && (
                <header className="space-y-1 border-b pb-3">
                    {title && (
                        <h2 className="text-base font-medium">{title}</h2>
                    )}
                    {description && (
                        <p className="text-muted-foreground text-xs">
                            {description}
                        </p>
                    )}
                </header>
            )}
            <div className="space-y-4">{children}</div>
        </section>
    );
}

export function FormField({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={cn('grid gap-2', className)}>{children}</div>;
}

export function FormGrid({
    children,
    className,
    cols = 2,
}: {
    children: React.ReactNode;
    className?: string;
    cols?: 2 | 3;
}) {
    return (
        <div
            className={cn(
                'grid gap-4',
                cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function FormHint({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <p className={cn('text-muted-foreground text-xs', className)}>
            {children}
        </p>
    );
}
