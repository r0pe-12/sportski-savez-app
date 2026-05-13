<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy extends UserPolicy
{
    public function viewProfile(User $user, Student $student): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id === $student->id) {
            return true;
        }

        if ($user->isProfessor()) {
            return $user->school_id === $student->school_id;
        }

        return false;
    }

    public function updateLimited(User $user, Student $student): bool
    {
        return $user->id === $student->id || $user->isAdmin();
    }

    public function uploadPhoto(User $user, Student $student): bool
    {
        return $this->updateLimited($user, $student);
    }
}
