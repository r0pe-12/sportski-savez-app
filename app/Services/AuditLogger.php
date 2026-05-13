<?php

namespace App\Services;

use App\Models\AuditLogEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Stub AuditLogger za T1.2 — T1.3 isporučuje finalnu verziju sa dispatchom u queue,
 * batching i diff serializerom. Za sad upisuje sinhronno u audit_log.
 */
class AuditLogger
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function log(string $action, ?Model $subject = null, array $payload = []): void
    {
        AuditLogEntry::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'payload' => $payload,
            'ip' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'created_at' => now(),
        ]);
    }
}
