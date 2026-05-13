<?php

namespace App\Models;

use App\Enums\TeamStatus;
use Database\Factories\TeamFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

class Team extends Model
{
    /** @use HasFactory<TeamFactory> */
    use HasFactory;

    protected $fillable = [
        'team_uuid', 'school_id', 'competition_id', 'professor_id',
        'status', 'signature', 'signed_at', 'signature_ip', 'rejection_reason',
    ];

    protected function casts(): array
    {
        return ['status' => TeamStatus::class, 'signed_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(function (Team $team): void {
            $team->team_uuid ??= (string) Str::uuid();
            $team->status ??= TeamStatus::Draft;
        });
    }

    /** @return BelongsTo<School, $this> */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /** @return BelongsTo<Competition, $this> */
    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    /** @return BelongsTo<User, $this> */
    public function professor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    /** @return HasMany<TeamMember, $this> */
    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    /** @return MorphMany<Result, $this> */
    public function results(): MorphMany
    {
        return $this->morphMany(Result::class, 'subject');
    }
}
