<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, User $target): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $target->id) {
            return true;
        }

        if ($user->isProfessor() && $target->isStudent()) {
            return $user->school_id === $target->school_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $target): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $target->id;
    }

    public function delete(User $user, User $target): bool
    {
        return $user->isAdmin() && $user->id !== $target->id;
    }

    public function verifyProfessor(User $user, User $target): bool
    {
        return $user->isAdmin() && $target->role === UserRole::Professor;
    }
}
