<?php

namespace App\Models;

use App\Enums\MedicalCertificateStatus;
use Database\Factories\MedicalCertificateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalCertificate extends Model
{
    /** @use HasFactory<MedicalCertificateFactory> */
    use HasFactory;

    protected $fillable = [
        'team_member_id', 'original_filename', 'path', 'status',
        'issued_at', 'expires_at', 'extracted_name', 'ocr_confidence', 'ocr_raw_response',
    ];

    protected function casts(): array
    {
        return [
            'status' => MedicalCertificateStatus::class,
            'issued_at' => 'date',
            'expires_at' => 'date',
            'ocr_confidence' => 'decimal:3',
        ];
    }

    /** @return BelongsTo<TeamMember, $this> */
    public function teamMember(): BelongsTo
    {
        return $this->belongsTo(TeamMember::class);
    }

    public function isValid(): bool
    {
        return $this->status === MedicalCertificateStatus::Valid;
    }
}
