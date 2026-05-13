<?php

namespace App\Policies;

use App\Models\Sport;
use App\Models\User;

class SportPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Sport $sport): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Sport $sport): bool
    {
        return $user->isAdmin();
    }

    /** spec 7.2: Sport nema delete — samo deactivate */
    public function delete(User $user, Sport $sport): bool
    {
        return false;
    }

    public function deactivate(User $user, Sport $sport): bool
    {
        return $user->isAdmin();
    }
}
