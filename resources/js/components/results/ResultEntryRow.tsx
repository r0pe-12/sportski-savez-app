import { Input } from '@/components/ui/input';
import { SelectField  } from '@/components/ui/select-field';
import type {SelectFieldOption} from '@/components/ui/select-field';

const MEDAL_OPTIONS: SelectFieldOption[] = [
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
        <div className="grid grid-cols-12 items-center gap-3 rounded-md border bg-card p-3">
            <div className="col-span-12 text-sm font-medium sm:col-span-5">
                {label}
            </div>
            <div className="col-span-5 sm:col-span-3">
                <Input
                    type="number"
                    min={1}
                    placeholder="Mjesto"
                    className="h-10"
                    value={placement}
                    onChange={(e) =>
                        onChange(
                            e.target.value === '' ? '' : Number(e.target.value),
                            medal,
                        )
                    }
                />
            </div>
            <div className="col-span-7 sm:col-span-4">
                <SelectField
                    placeholder="Bez medalje"
                    value={medal}
                    onChange={(v) => onChange(placement, v)}
                    options={MEDAL_OPTIONS}
                />
            </div>
        </div>
    );
}
