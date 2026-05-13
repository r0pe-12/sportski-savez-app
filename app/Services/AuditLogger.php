<?php

namespace App\Services;

use App\Models\AuditLogEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    /**
     * Log an action to the audit trail.
     *
     * @param  array<string, mixed>  $payload
     */
    public function log(string $action, ?Model $subject = null, array $payload = []): AuditLogEntry
    {
        return AuditLogEntry::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'payload' => $payload,
            'ip' => Request::ip(),
            'user_agent' => substr((string) Request::userAgent(), 0, 255),
            'created_at' => now(),
        ]);
    }
}
