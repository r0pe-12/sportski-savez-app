<?php

namespace App\Services;

use App\Models\MedicalCertificate;
use App\Models\Student;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PrivateFileStorage
{
    private const DISK = 'private';

    /**
     * Sačuvaj fajl pod owner-specific directory-jem sa UUID v4 imenom.
     * Vraća relativni path unutar `private` disk-a.
     */
    public function storeFor(Model $owner, UploadedFile $file, string $purpose): string
    {
        $uuid = (string) Str::uuid();
        $ext = $file->getClientOriginalExtension() ?: 'bin';
        $directory = $this->directoryFor($owner, $purpose);

        Storage::disk(self::DISK)->putFileAs($directory, $file, "{$uuid}.{$ext}");

        return "{$directory}/{$uuid}.{$ext}";
    }

    /**
     * Vraća temporary signed URL (ili plain URL ako disk ne podržava signed).
     */
    public function temporaryUrl(string $path, int $minutes = 5): string
    {
        $disk = Storage::disk(self::DISK);

        try {
            return $disk->temporaryUrl($path, now()->addMinutes($minutes));
        } catch (\Throwable) {
            // Local disk u dev možda ne podržava temporaryUrl — pad na .url()
            return $disk->url($path);
        }
    }

    /**
     * Briše SVE fajlove za vlasnika (UC: brisanje učenika / certifikata).
     */
    public function deleteFor(Model $owner): void
    {
        $base = $this->ownerBaseDir($owner);
        if ($base) {
            Storage::disk(self::DISK)->deleteDirectory($base);
        }
    }

    private function directoryFor(Model $owner, string $purpose): string
    {
        $base = $this->ownerBaseDir($owner) ?? class_basename($owner).'/'.$owner->getKey();

        return "{$base}/{$purpose}";
    }

    private function ownerBaseDir(Model $owner): ?string
    {
        return match (true) {
            $owner instanceof Student => "students/{$owner->id}",
            $owner instanceof TeamMember => "medical-certificates/{$owner->id}",
            $owner instanceof MedicalCertificate => "medical-certificates/{$owner->team_member_id}",
            $owner instanceof User => "users/{$owner->id}",
            default => null,
        };
    }
}
