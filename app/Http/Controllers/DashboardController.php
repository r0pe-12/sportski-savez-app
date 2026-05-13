<?php

namespace App\Http\Controllers;

use App\Enums\CompetitionStatus;
use App\Enums\MedicalCertificateStatus;
use App\Enums\StudentVerificationStatus;
use App\Enums\TeamStatus;
use App\Enums\UserRole;
use App\Models\AuditLogEntry;
use App\Models\Competition;
use App\Models\MedicalCertificate;
use App\Models\School;
use App\Models\Sport;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $role = $user?->role;

        if ($role === UserRole::Admin) {
            return Inertia::render('dashboard', [
                'role' => 'admin',
                'stats' => $this->adminStats(),
                'pending' => $this->adminPending(),
                'recentAudit' => $this->recentAudit(),
            ]);
        }

        // Profesor i učenik za sada dobijaju prazni dashboard payload —
        // out-of-scope za gap1 track (welcome screen ostaje).
        return Inertia::render('dashboard', [
            'role' => $role?->value,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function adminStats(): array
    {
        $usersByRole = User::query()
            ->selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role')
            ->all();

        $teamsByStatus = Team::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        $competitionsByStatus = Competition::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        $studentsByVerification = User::query()
            ->where('role', UserRole::Student->value)
            ->selectRaw('verification_status, COUNT(*) as count')
            ->groupBy('verification_status')
            ->pluck('count', 'verification_status')
            ->all();

        $certsByStatus = MedicalCertificate::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        return [
            'users' => [
                'total' => array_sum($usersByRole),
                'admin' => (int) ($usersByRole[UserRole::Admin->value] ?? 0),
                'professor' => (int) ($usersByRole[UserRole::Professor->value] ?? 0),
                'student' => (int) ($usersByRole[UserRole::Student->value] ?? 0),
            ],
            'schools' => School::query()->count(),
            'sports' => Sport::query()->count(),
            'competitions' => [
                'total' => array_sum($competitionsByStatus),
                'open' => (int) ($competitionsByStatus[CompetitionStatus::Open->value] ?? 0),
                'in_progress' => (int) ($competitionsByStatus[CompetitionStatus::InProgress->value] ?? 0),
                'completed' => (int) ($competitionsByStatus[CompetitionStatus::Completed->value] ?? 0),
            ],
            'teams' => [
                'total' => array_sum($teamsByStatus),
                'submitted' => (int) ($teamsByStatus[TeamStatus::Submitted->value] ?? 0),
                'active' => (int) ($teamsByStatus[TeamStatus::Active->value] ?? 0),
                'rejected' => (int) ($teamsByStatus[TeamStatus::Rejected->value] ?? 0),
            ],
            'students' => [
                'verified' => (int) ($studentsByVerification[StudentVerificationStatus::Verified->value] ?? 0),
                'pending' => (int) ($studentsByVerification[StudentVerificationStatus::Pending->value] ?? 0),
                'mismatched' => (int) ($studentsByVerification[StudentVerificationStatus::Mismatched->value] ?? 0),
                'unverified' => (int) ($studentsByVerification[StudentVerificationStatus::Unverified->value] ?? 0),
            ],
            'certificates' => [
                'valid' => (int) ($certsByStatus[MedicalCertificateStatus::Valid->value] ?? 0),
                'pending' => (int) ($certsByStatus[MedicalCertificateStatus::Pending->value] ?? 0),
                'manual_review' => (int) ($certsByStatus[MedicalCertificateStatus::ManualReview->value] ?? 0),
                'expired' => (int) ($certsByStatus[MedicalCertificateStatus::Expired->value] ?? 0),
                'invalid' => (int) ($certsByStatus[MedicalCertificateStatus::Invalid->value] ?? 0),
            ],
        ];
    }

    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function adminPending(): array
    {
        $submittedTeams = Team::query()
            ->where('status', TeamStatus::Submitted->value)
            ->with(['school:id,name', 'competition:id,name', 'professor:id,name'])
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get()
            ->map(fn (Team $team) => [
                'id' => $team->id,
                'school' => $team->school?->name,
                'competition' => $team->competition?->name,
                'professor' => $team->professor?->name,
                'updated_at' => $team->updated_at?->toIso8601String(),
            ])
            ->all();

        $manualCerts = MedicalCertificate::query()
            ->where('status', MedicalCertificateStatus::ManualReview->value)
            ->with(['teamMember.student:id,name', 'teamMember.team:id,school_id,competition_id'])
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get()
            ->map(fn (MedicalCertificate $cert) => [
                'id' => $cert->id,
                'student' => $cert->teamMember?->student?->name,
                'team_id' => $cert->teamMember?->team_id,
                'filename' => $cert->original_filename,
                'uploaded_at' => $cert->created_at?->toIso8601String(),
            ])
            ->all();

        $mismatchedStudents = User::query()
            ->where('role', UserRole::Student->value)
            ->where('verification_status', StudentVerificationStatus::Mismatched->value)
            ->with('school:id,name')
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get(['id', 'name', 'jmb', 'school_id', 'updated_at'])
            ->map(fn (User $student) => [
                'id' => $student->id,
                'name' => $student->name,
                'jmb' => $student->jmb,
                'school' => $student->school?->name,
                'updated_at' => $student->updated_at?->toIso8601String(),
            ])
            ->all();

        return [
            'submittedTeams' => $submittedTeams,
            'manualCertificates' => $manualCerts,
            'mismatchedStudents' => $mismatchedStudents,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentAudit(): array
    {
        return AuditLogEntry::query()
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (AuditLogEntry $entry) => [
                'id' => $entry->id,
                'action' => $entry->action,
                'user' => $entry->user?->name,
                'subject_type' => $entry->subject_type,
                'subject_id' => $entry->subject_id,
                'created_at' => $entry->created_at?->toIso8601String(),
            ])
            ->all();
    }
}
