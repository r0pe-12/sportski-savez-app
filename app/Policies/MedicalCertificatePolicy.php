<?php

namespace App\Policies;

use App\Models\MedicalCertificate;
use App\Models\TeamMember;
use App\Models\User;

class MedicalCertificatePolicy
{
    public function view(User $user, MedicalCertificate $cert): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $member = $cert->teamMember;

        if ($user->isStudent()) {
            return $member->student_id === $user->id;
        }

        if ($user->isProfessor()) {
            return $member->team->professor_id === $user->id;
        }

        return false;
    }

    public function upload(User $user, TeamMember $member): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isProfessor() && $member->team->professor_id === $user->id;
    }

    public function delete(User $user, MedicalCertificate $cert): bool
    {
        return $this->view($user, $cert);
    }

    public function manualApprove(User $user, MedicalCertificate $cert): bool
    {
        return $user->isAdmin() && $cert->status->value === 'manual_review';
    }

    public function reject(User $user, MedicalCertificate $cert): bool
    {
        return $user->isAdmin()
            && in_array($cert->status->value, ['manual_review', 'pending'], true);
    }
}
