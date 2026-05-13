import { usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import type { SharedData } from '@/types/auth';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { auth } = usePage<SharedData>().props;
    const role = auth?.user?.role;

    // Admin → sidebar; Professor/Student/guest → header (topbar)
    if (role === 'admin') {
        return (
            <AppSidebarLayout breadcrumbs={breadcrumbs}>
                {children}
            </AppSidebarLayout>
        );
    }

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>{children}</AppHeaderLayout>
    );
}
