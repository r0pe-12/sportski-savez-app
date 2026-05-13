import { router } from '@inertiajs/react';
import { Camera, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
    studentId: number;
    hasPhoto: boolean;
};

export function PhotoUpload({ studentId, hasPhoto }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            alert('Fotografija ne smije biti veća od 5 MB.');

            return;
        }

        const data = new FormData();
        data.append('photo', file);
        router.post(`/students/${studentId}/photo`, data, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleRemove = () => {
        if (!confirm('Da li želiš da ukloniš fotografiju?')) {
            return;
        }

        router.delete(`/students/${studentId}/photo`, { preserveScroll: true });
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                type="button"
                onClick={() => inputRef.current?.click()}
                variant="outline"
                size="sm"
            >
                <Camera className="mr-1 h-4 w-4" />
                {hasPhoto ? 'Promijeni fotografiju' : 'Postavi fotografiju'}
            </Button>
            {hasPhoto && (
                <Button
                    type="button"
                    onClick={handleRemove}
                    variant="ghost"
                    size="sm"
                >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Ukloni
                </Button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                        handleFile(file);
                    }

                    e.target.value = '';
                }}
            />
        </div>
    );
}
