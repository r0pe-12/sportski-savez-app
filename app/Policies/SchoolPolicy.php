<?php

namespace App\Policies;

use App\Models\School;
use App\Models\User;

class SchoolPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, School $school): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->school_id === $school->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, School $school): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, School $school): bool
    {
        return $user->isAdmin();
    }
}
