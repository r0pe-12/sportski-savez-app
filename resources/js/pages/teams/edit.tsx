import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { StudentSelector } from '@/components/teams/StudentSelector';
import { TeamMembersList } from '@/components/teams/TeamMembersList';
import { Button } from '@/components/ui/button';

type TeamMember = {
    id: number;
    student: { id: number; name: string; grade: string; verification_status: string };
    medical_certificate: { id: number; status: string } | null;
};

type Team = {
    id: number;
    status: string;
    competition: {
        name: string;
        sport: { name: string; members_count: number; substitutes_count: number };
    };
    school: { name: string };
    members: TeamMember[];
};

type Student = { id: number; name: string; grade: string; verification_status: string };

export default function TeamsEdit({
    team,
    availableStudents,
}: {
    team: Team;
    availableStudents: Student[];
}) {
    const canEdit = team.status === 'draft';
    const maxMembers = team.competition.sport.members_count + team.competition.sport.substitutes_count;

    const handleCancel = () => {
        if (!confirm('Otkaži draft?')) {
            return;
        }
        router.delete(`/teams/${team.id}`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Moje ekipe', href: '/teams' },
                { title: team.competition.name, href: `/teams/${team.id}/edit` },
            ]}
        >
            <Head title={team.competition.name} />
            <div className="max-w-3xl space-y-6 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{team.competition.name}</h1>
                        <p className="text-muted-foreground">
                            {team.competition.sport.name} · {team.school.name}
                        </p>
                    </div>
                    <span className="bg-muted rounded px-2 py-1 text-xs">Status: {team.status}</span>
                </div>

                <section className="space-y-3">
                    <h2 className="text-lg font-medium">
                        Članovi ({team.members.length} / {maxMembers})
                    </h2>
                    <TeamMembersList teamId={team.id} members={team.members} canEdit={canEdit} />
                </section>

                {canEdit && team.members.length < maxMembers && (
                    <section className="space-y-2">
                        <h3 className="text-sm font-medium">Dodaj učenika</h3>
                        <StudentSelector teamId={team.id} students={availableStudents} />
                    </section>
                )}

                {canEdit && (
                    <div className="flex gap-2 border-t pt-4">
                        <Link href={`/teams/${team.id}/review`}>
                            <Button variant="default">Pregled i potpis</Button>
                        </Link>
                        <Button variant="destructive" onClick={handleCancel}>
                            Otkaži
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
