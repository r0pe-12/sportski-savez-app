import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { SharedData } from '@/types/auth';

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Dashboard',
                    href: dashboard(),
                },
            ]}
        >
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-6">
                <h1 className="text-2xl font-semibold">
                    Dobrodošli, {user?.name ?? 'gost'}
                </h1>
                {user && (
                    <>
                        <p className="text-muted-foreground">
                            Uloga: {user.role}
                        </p>
                        {user.school && (
                            <p className="text-muted-foreground">
                                Škola: {user.school.name}
                            </p>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
