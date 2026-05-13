import { router } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

type Props = {
    teamId: number;
    memberId: number;
    onUploaded?: () => void;
};

export function UploadDropzone({ teamId, memberId, onUploaded }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            alert('Fajl ne smije biti veći od 10 MB.');

            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        router.post(`/teams/${teamId}/members/${memberId}/certificate`, data, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => {
                setUploading(false);
                onUploaded?.();
            },
        });
    };

    return (
        <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1 rounded border border-dashed px-3 py-1 text-xs hover:bg-muted disabled:opacity-60"
        >
            <Upload className="h-3 w-3" />
            {uploading ? 'Šaljem...' : 'Upload potvrde'}
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                        handleFile(file);
                    }
                }}
            />
        </button>
    );
}
