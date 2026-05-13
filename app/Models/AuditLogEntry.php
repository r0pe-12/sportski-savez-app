<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLogEntry extends Model
{
    use HasUuids;

    protected $table = 'audit_log';

    public $timestamps = false; // samo created_at, koji se ručno postavlja

    protected $fillable = ['user_id', 'action', 'subject_type', 'subject_id', 'payload', 'ip', 'user_agent', 'created_at'];

    protected function casts(): array
    {
        return ['payload' => 'array', 'created_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return MorphTo<Model, $this> */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    // Immutability — Policy je primarni mehanizam, ali ovdje sprečavamo update preko save()
    protected static function booted(): void
    {
        static::updating(function (): bool {
            throw new \LogicException('AuditLogEntry is append-only. Updates are forbidden.');
        });

        static::deleting(function (): bool {
            throw new \LogicException('AuditLogEntry is append-only. Deletes are forbidden.');
        });
    }
}
