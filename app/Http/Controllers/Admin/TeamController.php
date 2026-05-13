<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MedicalCertificateStatus;
use App\Enums\TeamStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectTeamRequest;
use App\Models\AuditLogEntry;
use App\Models\Competition;
use App\Models\School;
use App\Models\Team;
use App\Services\Exceptions\TeamSubmissionException;
use App\Services\TeamRegistrationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function __construct(private TeamRegistrationService $service) {}

    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString() ?: null;
        $competitionId = $request->integer('competition_id') ?: null;
        $schoolId = $request->integer('school_id') ?: null;

        $query = Team::with(['competition.sport', 'school', 'professor'])
            ->orderByDesc('created_at');

        if ($status !== null && TeamStatus::tryFrom($status) !== null) {
            $query->where('status', $status);
        }

        if ($competitionId !== null) {
            $query->where('competition_id', $competitionId);
        }

        if ($schoolId !== null) {
            $query->where('school_id', $schoolId);
        }

        $teams = $query->paginate(25)->withQueryString();

        return Inertia::render('admin/teams/index', [
            'teams' => $teams,
            'competitions' => Competition::orderBy('name')->get(['id', 'name']),
            'schools' => School::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'status' => $status,
                'competition_id' => $competitionId,
                'school_id' => $schoolId,
            ],
        ]);
    }

    public function show(Team $team): Response
    {
        $team->load([
            'competition.sport',
            'school',
            'professor',
            'members.student',
            'members.medicalCertificate',
        ]);

        $recentAudit = AuditLogEntry::with('user:id,name,role')
            ->where('subject_type', $team->getMorphClass())
            ->where('subject_id', $team->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'user_id', 'action', 'subject_type', 'subject_id', 'payload', 'created_at']);

        $certificateSummary = $this->summarizeCertificates($team);

        return Inertia::render('admin/teams/show', [
            'team' => $team,
            'recentAudit' => $recentAudit,
            'certificateSummary' => $certificateSummary,
        ]);
    }

    /**
     * @return array{valid: int, manual_review: int, expired: int, invalid: int, pending: int, missing: int, total: int}
     */
    private function summarizeCertificates(Team $team): array
    {
        $summary = [
            'valid' => 0,
            'manual_review' => 0,
            'expired' => 0,
            'invalid' => 0,
            'pending' => 0,
            'missing' => 0,
            'total' => $team->members->count(),
        ];

        foreach ($team->members as $member) {
            $cert = $member->medicalCertificate;

            if ($cert === null) {
                $summary['missing']++;

                continue;
            }

            match ($cert->status) {
                MedicalCertificateStatus::Valid => $summary['valid']++,
                MedicalCertificateStatus::ManualReview => $summary['manual_review']++,
                MedicalCertificateStatus::Expired => $summary['expired']++,
                MedicalCertificateStatus::Invalid => $summary['invalid']++,
                MedicalCertificateStatus::Pending => $summary['pending']++,
                default => null,
            };
        }

        return $summary;
    }

    public function approve(Team $team): RedirectResponse
    {
        try {
            $this->service->approve($team);
        } catch (TeamSubmissionException $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return back()->with('flash', 'Ekipa odobrena.');
    }

    public function reject(RejectTeamRequest $request, Team $team): RedirectResponse
    {
        try {
            $this->service->reject($team, $request->validated('reason'));
        } catch (TeamSubmissionException $e) {
            return back()->withErrors(['general' => $e->getMessage()]);
        }

        return back()->with('flash', 'Ekipa odbijena.');
    }
}
