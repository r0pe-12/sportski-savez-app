<?php

namespace App\Policies;

use App\Enums\TeamStatus;
use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isProfessor() || $user->isStudent();
    }

    public function view(User $user, Team $team): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isProfessor()) {
            return $team->professor_id === $user->id
                || $team->school_id === $user->school_id;
        }

        if ($user->isStudent()) {
            return $team->members()->where('student_id', $user->id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin()
            || ($user->isProfessor() && $user->verified_at !== null);
    }

    public function update(User $user, Team $team): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isProfessor()
            && $team->professor_id === $user->id
            && $team->status === TeamStatus::Draft;
    }

    public function submit(User $user, Team $team): bool
    {
        return $user->isProfessor()
            && $team->professor_id === $user->id
            && $team->status === TeamStatus::Draft;
    }

    public function cancel(User $user, Team $team): bool
    {
        return $user->isProfessor()
            && $team->professor_id === $user->id
            && $team->status === TeamStatus::Draft;
    }

    public function addMember(User $user, Team $team): bool
    {
        return $this->update($user, $team);
    }

    public function removeMember(User $user, Team $team): bool
    {
        return $this->update($user, $team);
    }
}
