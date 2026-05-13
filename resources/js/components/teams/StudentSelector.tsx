import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Student = { id: number; name: string; grade: string; verification_status: string };

export function StudentSelector({ teamId, students }: { teamId: number; students: Student[] }) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleAdd = () => {
        if (!selectedId) {
            return;
        }

        router.post(
            `/teams/${teamId}/members`,
            { student_id: selectedId },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedId(null),
            },
        );
    };

    if (students.length === 0) {
        return <p className="text-muted-foreground text-sm">Nema dostupnih učenika za dodavanje.</p>;
    }

    return (
        <div className="flex gap-2">
            <select
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                className="bg-background h-9 flex-1 rounded-md border px-3"
            >
                <option value="">— izaberi učenika —</option>
                {students.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name} ({s.grade})
                    </option>
                ))}
            </select>
            <Button onClick={handleAdd} disabled={!selectedId}>
                Dodaj
            </Button>
        </div>
    );
}
