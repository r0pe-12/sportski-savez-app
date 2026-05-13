import { Input } from '@/components/ui/input';

const medals = [
    { value: 'gold', label: 'Zlato' },
    { value: 'silver', label: 'Srebro' },
    { value: 'bronze', label: 'Bronza' },
    { value: 'participation', label: 'Učešće' },
];

type Props = {
    label: string;
    placement: number | '';
    medal: string;
    onChange: (placement: number | '', medal: string) => void;
};

export function ResultEntryRow({ label, placement, medal, onChange }: Props) {
    return (
        <div className="grid grid-cols-12 items-center gap-2 rounded border p-2">
            <div className="col-span-6 text-sm">{label}</div>
            <Input
                className="col-span-2"
                type="number"
                min={1}
                placeholder="Mjesto"
                value={placement}
                onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value), medal)}
            />
            <select
                className="col-span-4 h-9 rounded-md border bg-background px-3 text-sm"
                value={medal}
                onChange={(e) => onChange(placement, e.target.value)}
            >
                <option value="">— medalja —</option>
                {medals.map((m) => (
                    <option key={m.value} value={m.value}>
                        {m.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
