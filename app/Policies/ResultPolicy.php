<?php

namespace App\Policies;

use App\Models\Result;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;

class ResultPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Result $result): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $subject = $result->subject;

        if ($subject instanceof Team) {
            if ($user->isProfessor()) {
                return $subject->professor_id === $user->id || $subject->school_id === $user->school_id;
            }
            if ($user->isStudent()) {
                return $subject->members()->where('student_id', $user->id)->exists();
            }
        }

        if ($subject instanceof TeamMember) {
            if ($user->isStudent()) {
                return $subject->student_id === $user->id;
            }
            if ($user->isProfessor()) {
                return $subject->team->professor_id === $user->id || $subject->team->school_id === $user->school_id;
            }
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Result $result): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Result $result): bool
    {
        return $user->isAdmin();
    }
}
