<?php

namespace App\Policies;

use App\Models\AuditLogEntry;
use App\Models\User;

class AuditLogEntryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, AuditLogEntry $entry): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, AuditLogEntry $entry): bool
    {
        return false;
    }

    public function delete(User $user, AuditLogEntry $entry): bool
    {
        return false;
    }
}
