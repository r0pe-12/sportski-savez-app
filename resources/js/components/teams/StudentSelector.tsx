import { router } from '@inertiajs/react';
import { useState } from 'react';
import { VerificationStatusBadge } from '@/components/students/verification-status-badge';
import { Button } from '@/components/ui/button';
import { MultiSelect  } from '@/components/ui/multi-select';
import type {MultiSelectOption} from '@/components/ui/multi-select';

type Student = {
    id: number;
    name: string;
    grade: string;
    verification_status: string;
};

type Props = {
    teamId: number;
    students: Student[];
    /** Maks. broj učenika koji se mogu odjednom odabrati pre "Dodaj". */
    max?: number;
};

function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? '')
        .join('');
}

export function StudentSelector({ teamId, students, max }: Props) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    if (students.length === 0) {
        return (
            <p className="text-muted-foreground rounded-md border bg-muted/30 p-3 text-sm">
                Nema dostupnih učenika za dodavanje. Provjeri spisak učenika svoje
                škole na admin panelu.
            </p>
        );
    }

    const options: MultiSelectOption[] = students.map((s) => ({
        value: String(s.id),
        label: s.name,
        description: `Razred ${s.grade}`,
        searchText: `${s.name} ${s.grade}`,
        leading: (
            <span className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                {getInitials(s.name) || '?'}
            </span>
        ),
        trailing: <VerificationStatusBadge status={s.verification_status} />,
    }));

    const handleAdd = async () => {
        if (selectedIds.length === 0 || submitting) {
            return;
        }

        setSubmitting(true);

        // Backend prima jedan student_id po POST-u; šaljemo sekvencijalno.
        for (const id of selectedIds) {
            await new Promise<void>((resolve) => {
                router.post(
                    `/teams/${teamId}/members`,
                    { student_id: Number(id) },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onFinish: () => resolve(),
                    },
                );
            });
        }

        setSelectedIds([]);
        setSubmitting(false);
        // Posljednji POST već trigger-uje reload preko Inertia redirect-a.
    };

    return (
        <div className="space-y-3">
            <MultiSelect
                options={options}
                value={selectedIds}
                onChange={setSelectedIds}
                placeholder="Pretraži i odaberi učenike…"
                searchPlaceholder="Pretraga po imenu ili razredu…"
                emptyText="Nema učenika za pretragu."
                max={max}
            />
            <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-xs">
                    {selectedIds.length === 0
                        ? 'Odaberi jednog ili više učenika za dodavanje u ekipu.'
                        : `Spremno za dodavanje: ${selectedIds.length} ${selectedIds.length === 1 ? 'učenik' : 'učenika'}.`}
                </p>
                <Button
                    onClick={handleAdd}
                    disabled={selectedIds.length === 0 || submitting}
                >
                    {submitting
                        ? 'Dodavanje…'
                        : selectedIds.length > 1
                          ? `Dodaj (${selectedIds.length})`
                          : 'Dodaj'}
                </Button>
            </div>
        </div>
    );
}
