import { VerificationStatusBadge } from '@/components/students/VerificationStatusBadge';

type Student = {
    name: string;
    grade: string | null;
    verification_status: string | null;
    school: { name: string } | null;
    photo_url: string | null;
};

export function StudentHero({ student }: { student: Student }) {
    return (
        <div className="flex items-start gap-4 rounded border p-4">
            <div className="h-24 w-24 overflow-hidden rounded bg-muted">
                {student.photo_url ? (
                    <img
                        src={student.photo_url}
                        alt={`Fotografija ${student.name}`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground">
                        {student.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="flex-1">
                <h1 className="text-2xl font-semibold">{student.name}</h1>
                <p className="text-sm text-muted-foreground">
                    {student.school?.name ?? '—'}
                    {student.grade ? ` · ${student.grade}` : ''}
                </p>
                <div className="mt-2">
                    <VerificationStatusBadge
                        status={student.verification_status}
                    />
                </div>
            </div>
        </div>
    );
}
