import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building,
    Calendar,
    ClipboardList,
    FileCheck2,
    GraduationCap,
    ScrollText,
    Trophy,
    Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { SharedData } from '@/types/auth';

type AdminStats = {
    users: {
        total: number;
        admin: number;
        professor: number;
        student: number;
    };
    schools: number;
    sports: number;
    competitions: {
        total: number;
        open: number;
        in_progress: number;
        completed: number;
    };
    teams: {
        total: number;
        submitted: number;
        active: number;
        rejected: number;
    };
    students: {
        verified: number;
        pending: number;
        mismatched: number;
        unverified: number;
    };
    certificates: {
        valid: number;
        pending: number;
        manual_review: number;
        expired: number;
        invalid: number;
    };
};

type AdminPending = {
    submittedTeams: Array<{
        id: number;
        school: string | null;
        competition: string | null;
        professor: string | null;
        updated_at: string | null;
    }>;
    manualCertificates: Array<{
        id: number;
        student: string | null;
        team_id: number | null;
        filename: string | null;
        uploaded_at: string | null;
    }>;
    mismatchedStudents: Array<{
        id: number;
        name: string;
        jmb: string | null;
        school: string | null;
        updated_at: string | null;
    }>;
};

type AuditEntry = {
    id: string;
    action: string;
    user: string | null;
    subject_type: string | null;
    subject_id: string | number | null;
    created_at: string | null;
};

type DashboardPageProps = SharedData & {
    role?: 'admin' | 'professor' | 'student' | null;
    stats?: AdminStats;
    pending?: AdminPending;
    recentAudit?: AuditEntry[];
};

function StatCard({
    title,
    value,
    href,
    icon: Icon,
    hint,
}: {
    title: string;
    value: number | string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    hint?: string;
}) {
    return (
        <Link
            href={href}
            className="block rounded-xl border bg-card p-5 shadow-sm transition hover:border-foreground/20 hover:shadow"
        >
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                    {title}
                </span>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
            {hint && (
                <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
            )}
        </Link>
    );
}

function formatRelativeDate(iso: string | null): string {
    if (!iso) {
        return '—';
    }

    try {
        return new Date(iso).toLocaleString('sr-Latn-ME', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

function EmptyState({
    icon: Icon,
    text,
}: {
    icon: ComponentType<{ className?: string }>;
    text: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <Icon className="h-8 w-8 opacity-40" />
            <span>{text}</span>
        </div>
    );
}

function AdminDashboard({
    stats,
    pending,
    recentAudit,
    userName,
}: {
    stats: AdminStats;
    pending: AdminPending;
    recentAudit: AuditEntry[];
    userName: string;
}) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold">
                    Dobrodošli, {userName}
                </h1>
                <p className="text-sm text-muted-foreground">
                    Pregled stanja sistema školskog sporta CG.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard
                    title="Korisnici"
                    value={stats.users.total}
                    href="/admin/users"
                    icon={Users}
                    hint={`${stats.users.professor} prof., ${stats.users.student} učen.`}
                />
                <StatCard
                    title="Škole"
                    value={stats.schools}
                    href="/admin/schools"
                    icon={Building}
                />
                <StatCard
                    title="Sportovi"
                    value={stats.sports}
                    href="/admin/sports"
                    icon={Trophy}
                />
                <StatCard
                    title="Takmičenja"
                    value={stats.competitions.total}
                    href="/admin/competitions"
                    icon={Calendar}
                    hint={`${stats.competitions.open} otvoreno, ${stats.competitions.in_progress} u toku`}
                />
                <StatCard
                    title="Ekipe (čekaju)"
                    value={stats.teams.submitted}
                    href="/admin/teams"
                    icon={ClipboardList}
                    hint={`${stats.teams.active} aktivnih`}
                />
                <StatCard
                    title="Potvrde (ručno)"
                    value={stats.certificates.manual_review}
                    href="/admin/certificates"
                    icon={FileCheck2}
                    hint={`${stats.certificates.valid} validnih`}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ClipboardList className="h-4 w-4" />
                            Ekipe čekaju odobrenje
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pending.submittedTeams.length === 0 ? (
                            <EmptyState
                                icon={ClipboardList}
                                text="Nema ekipa koje čekaju odobrenje."
                            />
                        ) : (
                            <ul className="divide-y">
                                {pending.submittedTeams.map((team) => (
                                    <li
                                        key={team.id}
                                        className="flex items-center justify-between py-2 text-sm"
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">
                                                {team.school ?? '—'} ·{' '}
                                                {team.competition ?? '—'}
                                            </div>
                                            <div className="truncate text-xs text-muted-foreground">
                                                Profesor:{' '}
                                                {team.professor ?? '—'} ·{' '}
                                                {formatRelativeDate(
                                                    team.updated_at,
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/admin/teams/${team.id}`}
                                            className="ml-3 shrink-0 text-xs font-medium text-primary hover:underline"
                                        >
                                            Pregledaj
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileCheck2 className="h-4 w-4" />
                            Potvrde — ručna provjera
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pending.manualCertificates.length === 0 ? (
                            <EmptyState
                                icon={FileCheck2}
                                text="Nema potvrda za ručnu provjeru."
                            />
                        ) : (
                            <ul className="divide-y">
                                {pending.manualCertificates.map((cert) => (
                                    <li
                                        key={cert.id}
                                        className="flex items-center justify-between py-2 text-sm"
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">
                                                {cert.student ?? '—'}
                                            </div>
                                            <div className="truncate text-xs text-muted-foreground">
                                                {cert.filename ?? '—'} ·{' '}
                                                {formatRelativeDate(
                                                    cert.uploaded_at,
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/admin/certificates`}
                                            className="ml-3 shrink-0 text-xs font-medium text-primary hover:underline"
                                        >
                                            Potvrdi
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <GraduationCap className="h-4 w-4" />
                        Učenici — neusklađena verifikacija
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pending.mismatchedStudents.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            text="Nema neusklađenih učenika."
                        />
                    ) : (
                        <ul className="divide-y">
                            {pending.mismatchedStudents.map((student) => (
                                <li
                                    key={student.id}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">
                                            {student.name}
                                        </div>
                                        <div className="truncate text-xs text-muted-foreground">
                                            {student.school ?? '—'} · JMB:{' '}
                                            {student.jmb ?? '—'}
                                        </div>
                                    </div>
                                    <Link
                                        href="/admin/students"
                                        className="ml-3 shrink-0 text-xs font-medium text-primary hover:underline"
                                    >
                                        Pregledaj
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                            <ScrollText className="h-4 w-4" />
                            Nedavne aktivnosti (audit log)
                        </span>
                        <Link
                            href="/admin/audit-log"
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            Vidi sve
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentAudit.length === 0 ? (
                        <EmptyState
                            icon={ScrollText}
                            text="Nema audit zapisa."
                        />
                    ) : (
                        <ul className="divide-y">
                            {recentAudit.map((entry) => (
                                <li
                                    key={entry.id}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">
                                            <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                                {entry.action}
                                            </code>
                                        </div>
                                        <div className="truncate text-xs text-muted-foreground">
                                            {entry.user ?? 'sistem'} ·{' '}
                                            {formatRelativeDate(
                                                entry.created_at,
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function Dashboard() {
    const page = usePage<DashboardPageProps>();
    const { auth, role, stats, pending, recentAudit } = page.props;
    const user = auth?.user;

    if (role === 'admin' && stats && pending && recentAudit) {
        return (
            <AppLayout
                breadcrumbs={[{ title: 'Dashboard', href: dashboard() }]}
            >
                <Head title="Dashboard" />
                <AdminDashboard
                    stats={stats}
                    pending={pending}
                    recentAudit={recentAudit}
                    userName={user?.name ?? 'admin'}
                />
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: dashboard() }]}>
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
