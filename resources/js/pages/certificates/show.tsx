import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Download,
    ExternalLink,
    FileText,
    GraduationCap,
    Image as ImageIcon,
    RefreshCw,
    User,
    XCircle,
} from 'lucide-react';
import { CertificateStatusBadge } from '@/components/medical-certificates/CertificateStatusBadge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/format-date';
import certificateAdminRoutes from '@/routes/admin/certificates';
import certificatesRoutes from '@/routes/certificates';

type Sport = { id: number; name: string };
type Competition = { id: number; name: string; sport: Sport | null };
type School = { id: number; name: string };
type Team = {
    id: number;
    school: School | null;
    competition: Competition | null;
    position: string | null;
};
type Student = {
    id: number;
    name: string;
    email: string | null;
    jmb: string | null;
};
type Certificate = {
    id: number;
    status: string;
    original_filename: string;
    extracted_name: string | null;
    ocr_confidence: number | null;
    issued_at: string | null;
    expires_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    extension: string;
    is_image: boolean;
};
type Permissions = {
    can_manual_approve: boolean;
    can_reject: boolean;
};

type Props = {
    certificate: Certificate;
    student: Student | null;
    team: Team | null;
    signedUrl: string;
    permissions: Permissions;
};

function renderDate(iso: string | null): string {
    return formatDate(iso) || '—';
}

function daysUntil(iso: string | null): number | null {
    if (!iso) {
        return null;
    }

    const expiry = new Date(iso);

    if (Number.isNaN(expiry.getTime())) {
        return null;
    }

    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;

    return Math.floor((expiry.getTime() - now.getTime()) / msPerDay);
}

function ExpiryAlert({ expiresAt }: { expiresAt: string | null }) {
    const days = daysUntil(expiresAt);

    if (days === null) {
        return null;
    }

    if (days < 0) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertTitle>Potvrda je istekla</AlertTitle>
                <AlertDescription>
                    Datum isteka je prošao prije {Math.abs(days)} dan(a). Neophodno je
                    podnijeti novu potvrdu.
                </AlertDescription>
            </Alert>
        );
    }

    if (days <= 30) {
        return (
            <Alert>
                <AlertTriangle className="size-4 text-yellow-600" />
                <AlertTitle>Potvrda ističe uskoro</AlertTitle>
                <AlertDescription>
                    Ističe za {days} dan(a). Preporučuje se da se već sada zatraži nova
                    potvrda.
                </AlertDescription>
            </Alert>
        );
    }

    return null;
}

function MetaRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-1 gap-0.5 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">
                {label}
            </span>
            <span className="text-sm break-words">{children}</span>
        </div>
    );
}

function OcrConfidenceBar({ value }: { value: number | null }) {
    if (value === null || value <= 0) {
        return <span className="text-muted-foreground text-sm">—</span>;
    }

    const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
    let barColor = 'bg-red-500';

    if (pct >= 80) {
        barColor = 'bg-green-500';
    } else if (pct >= 60) {
        barColor = 'bg-yellow-500';
    } else if (pct >= 40) {
        barColor = 'bg-orange-500';
    }

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{pct}%</span>
                <span className="text-muted-foreground">
                    {pct >= 80
                        ? 'visoka pouzdanost'
                        : pct >= 60
                          ? 'srednja pouzdanost'
                          : 'niska pouzdanost'}
                </span>
            </div>
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                    className={`h-full ${barColor} transition-all`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export default function CertificateShow({
    certificate,
    student,
    team,
    signedUrl,
    permissions,
}: Props) {
    const refreshPreview = () => {
        router.reload({ only: ['signedUrl'] });
    };

    const handleApprove = () => {
        if (!window.confirm('Odobriti sertifikat manuelno?')) {
            return;
        }

        router.post(
            certificateAdminRoutes.manualApprove.url({
                certificate: certificate.id,
            }),
            {},
            { preserveScroll: true },
        );
    };

    const handleReject = () => {
        if (
            !window.confirm(
                'Označiti sertifikat kao nevalidan? Akcija se ne može poništiti.',
            )
        ) {
            return;
        }

        router.post(
            certificateAdminRoutes.reject.url({ certificate: certificate.id }),
            {},
            { preserveScroll: true },
        );
    };

    const breadcrumbs = [
        { title: 'Sertifikati', href: '/admin/certificates' },
        {
            title: student?.name ?? `Sertifikat #${certificate.id}`,
            href: certificatesRoutes.show({ certificate: certificate.id }).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ljekarska potvrda — ${student?.name ?? `#${certificate.id}`}`} />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-lg">
                            <FileText className="size-6" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Ljekarska potvrda
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <CertificateStatusBadge status={certificate.status} />
                                {student?.name && (
                                    <span className="text-muted-foreground">
                                        · {student.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <ExpiryAlert expiresAt={certificate.expires_at} />

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Preview */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden py-0">
                            <CardHeader className="bg-muted/40 flex flex-row items-center justify-between gap-2 border-b px-4 py-3">
                                <div className="flex items-center gap-2">
                                    {certificate.is_image ? (
                                        <ImageIcon className="text-muted-foreground size-4" />
                                    ) : (
                                        <FileText className="text-muted-foreground size-4" />
                                    )}
                                    <CardTitle className="text-sm font-medium">
                                        {certificate.original_filename}
                                    </CardTitle>
                                    <Badge variant="outline" className="uppercase">
                                        {certificate.extension || '—'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={refreshPreview}
                                        title="Osvježi preview (regeneriše signed URL)"
                                    >
                                        <RefreshCw className="size-4" />
                                        <span className="hidden sm:inline">Osvježi</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {certificate.is_image ? (
                                    <div className="bg-muted/30 flex min-h-[600px] items-center justify-center p-4">
                                        <img
                                            src={signedUrl}
                                            alt={`Pregled potvrde ${certificate.original_filename}`}
                                            className="max-h-[800px] max-w-full rounded shadow-md"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-muted/30">
                                        <iframe
                                            src={signedUrl}
                                            title={`PDF pregled — ${certificate.original_filename}`}
                                            className="block min-h-[800px] w-full border-0"
                                            loading="lazy"
                                        >
                                            <p className="p-6 text-sm">
                                                Vaš pretraživač ne podržava inline PDF prikaz.{' '}
                                                <a
                                                    href={signedUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary underline"
                                                >
                                                    Otvori fajl u novom tabu
                                                </a>
                                                .
                                            </p>
                                        </iframe>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meta panel */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calendar className="size-4" />
                                    Informacije o potvrdi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <MetaRow label="Status">
                                    <CertificateStatusBadge status={certificate.status} />
                                </MetaRow>
                                <MetaRow label="Originalno ime fajla">
                                    <span className="font-mono text-xs break-all">
                                        {certificate.original_filename}
                                    </span>
                                </MetaRow>
                                <MetaRow label="Ekstrahovano ime (OCR)">
                                    {certificate.extracted_name ?? '—'}
                                </MetaRow>
                                <MetaRow label="Datum izdavanja">
                                    {renderDate(certificate.issued_at)}
                                </MetaRow>
                                <MetaRow label="Datum isteka">
                                    {renderDate(certificate.expires_at)}
                                </MetaRow>
                                <MetaRow label="Uploadovano">
                                    {renderDate(certificate.created_at)}
                                </MetaRow>
                                <MetaRow label="OCR pouzdanost">
                                    <OcrConfidenceBar value={certificate.ocr_confidence} />
                                </MetaRow>
                            </CardContent>
                        </Card>

                        {student && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="size-4" />
                                        Učenik
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <MetaRow label="Ime i prezime">{student.name}</MetaRow>
                                    {student.jmb && (
                                        <MetaRow label="JMB">
                                            <span className="font-mono text-xs">
                                                {student.jmb}
                                            </span>
                                        </MetaRow>
                                    )}
                                    {student.email && (
                                        <MetaRow label="Email">
                                            <span className="break-all">{student.email}</span>
                                        </MetaRow>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {team && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <GraduationCap className="size-4" />
                                        Tim i takmičenje
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {team.competition && (
                                        <MetaRow label="Takmičenje">
                                            {team.competition.name}
                                        </MetaRow>
                                    )}
                                    {team.competition?.sport && (
                                        <MetaRow label="Sport">
                                            {team.competition.sport.name}
                                        </MetaRow>
                                    )}
                                    {team.school && (
                                        <MetaRow label="Škola">{team.school.name}</MetaRow>
                                    )}
                                    {team.position && (
                                        <MetaRow label="Pozicija">{team.position}</MetaRow>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Akcije</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Button asChild variant="outline" className="justify-start">
                                    <a href={signedUrl} download={certificate.original_filename}>
                                        <Download className="size-4" />
                                        Preuzmi originalni fajl
                                    </a>
                                </Button>
                                <Button asChild variant="outline" className="justify-start">
                                    <a
                                        href={signedUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="size-4" />
                                        Otvori u novom tabu
                                    </a>
                                </Button>

                                {permissions.can_manual_approve && (
                                    <Button
                                        onClick={handleApprove}
                                        className="justify-start"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Manuelno odobri
                                    </Button>
                                )}

                                {permissions.can_reject && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleReject}
                                        className="justify-start"
                                    >
                                        <XCircle className="size-4" />
                                        Odbij kao nevalidnu
                                    </Button>
                                )}

                                <Button
                                    asChild
                                    variant="ghost"
                                    className="justify-start"
                                >
                                    <Link href="/admin/certificates">
                                        Nazad na listu
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
