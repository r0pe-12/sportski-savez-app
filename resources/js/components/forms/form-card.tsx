import { Link } from '@inertiajs/react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

type FormCardProps = {
    title: string;
    description?: string;
    icon?: LucideIcon;
    backHref?: string;
    backLabel?: string;
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    className?: string;
};

export function FormCard({
    title,
    description,
    icon: Icon,
    backHref,
    backLabel = 'Nazad',
    children,
    sidebar,
    className,
}: FormCardProps) {
    return (
        <div className={cn('mx-auto w-full max-w-5xl space-y-6 p-6', className)}>
            {backHref && (
                <Link
                    href={backHref}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    {backLabel}
                </Link>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                {Icon && (
                    <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-lg">
                        <Icon className="size-6" />
                    </div>
                )}
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground text-sm">{description}</p>
                    )}
                </div>
            </div>

            <div
                className={cn(
                    'grid gap-6',
                    sidebar ? 'lg:grid-cols-[1fr_320px]' : 'grid-cols-1',
                )}
            >
                <div className="bg-card rounded-xl border shadow-sm">
                    {children}
                </div>
                {sidebar && <aside className="space-y-4">{sidebar}</aside>}
            </div>
        </div>
    );
}

export function FormCardBody({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={cn('space-y-6 p-6', className)}>{children}</div>;
}

export function FormCardFooter({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'bg-muted/30 flex items-center justify-end gap-2 border-t px-6 py-4',
                className,
            )}
        >
            {children}
        </div>
    );
}
