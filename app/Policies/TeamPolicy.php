<?php

namespace App\Policies;

use App\Enums\TeamStatus;
use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    /**
     * Admin može vidjeti sve. Profesor vidi samo svoje. Učenici ne vide listu.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isProfessor();
    }

    public function view(User $user, Team $team): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isProfessor() && $team->professor_id === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Samo profesor koji je vlasnik tima može potpisati i predati.
     */
    public function submit(User $user, Team $team): bool
    {
        return $user->isProfessor()
            && $team->professor_id === $user->id
            && $team->status === TeamStatus::Draft;
    }

    /**
     * Profesor može povući svoju draft ili submitted prijavu.
     */
    public function cancel(User $user, Team $team): bool
    {
        return $user->isProfessor()
            && $team->professor_id === $user->id
            && in_array($team->status, [TeamStatus::Draft, TeamStatus::Submitted], true);
    }
}
