<?php

namespace App\Http\Controllers;

use App\Enums\MedicalCertificateStatus;
use App\Http\Requests\StoreMedicalCertificateRequest;
use App\Jobs\ValidateMedicalCertificateJob;
use App\Models\MedicalCertificate;
use App\Models\Team;
use App\Models\TeamMember;
use App\Services\AuditLogger;
use App\Services\MedicalCertificateStateMachine;
use App\Services\PrivateFileStorage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class MedicalCertificateController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private AuditLogger $audit,
        private PrivateFileStorage $storage,
        private MedicalCertificateStateMachine $stateMachine,
    ) {}

    public function store(StoreMedicalCertificateRequest $request, Team $team, TeamMember $member): RedirectResponse
    {
        if ($member->team_id !== $team->id) {
            abort(404);
        }

        // supersede stari ako postoji
        $existing = $member->medicalCertificate;
        if ($existing && $existing->status !== MedicalCertificateStatus::Superseded) {
            $this->stateMachine->markSuperseded($existing);
            $this->audit->log('certificate.superseded', $existing);
        }

        $path = $this->storage->storeFor($member, $request->file('file'), '');

        $cert = MedicalCertificate::create([
            'team_member_id' => $member->id,
            'original_filename' => $request->file('file')->getClientOriginalName(),
            'path' => $path,
            'status' => MedicalCertificateStatus::Pending,
        ]);

        $this->audit->log('certificate.uploaded', $cert);
        ValidateMedicalCertificateJob::dispatch($cert->id);

        return back();
    }

    public function show(MedicalCertificate $certificate): InertiaResponse
    {
        $this->authorize('view', $certificate);

        $certificate->load([
            'teamMember.student:id,name,email,jmb',
            'teamMember.team.competition.sport',
            'teamMember.team.school',
        ]);

        $signedUrl = $this->storage->temporaryUrl($certificate->path, 5);
        $extension = strtolower(pathinfo((string) $certificate->original_filename, PATHINFO_EXTENSION));
        $isImage = in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true);

        $this->audit->log('certificate.viewed', $certificate);

        $member = $certificate->teamMember;
        $student = $member?->student;
        $team = $member?->team;
        $competition = $team?->competition;
        $sport = $competition?->sport;
        $school = $team?->school;

        return Inertia::render('certificates/show', [
            'certificate' => [
                'id' => $certificate->id,
                'status' => $certificate->status->value,
                'original_filename' => $certificate->original_filename,
                'extracted_name' => $certificate->extracted_name,
                'ocr_confidence' => $certificate->ocr_confidence !== null
                    ? (float) $certificate->ocr_confidence
                    : null,
                'issued_at' => $certificate->issued_at?->toIso8601String(),
                'expires_at' => $certificate->expires_at?->toIso8601String(),
                'created_at' => $certificate->created_at?->toIso8601String(),
                'updated_at' => $certificate->updated_at?->toIso8601String(),
                'extension' => $extension,
                'is_image' => $isImage,
            ],
            'student' => $student ? [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'jmb' => $student->jmb,
            ] : null,
            'team' => $team ? [
                'id' => $team->id,
                'school' => $school ? [
                    'id' => $school->id,
                    'name' => $school->name,
                ] : null,
                'competition' => $competition ? [
                    'id' => $competition->id,
                    'name' => $competition->name,
                    'sport' => $sport ? [
                        'id' => $sport->id,
                        'name' => $sport->name,
                    ] : null,
                ] : null,
                'position' => $member->position,
            ] : null,
            'signedUrl' => $signedUrl,
            'permissions' => [
                'can_manual_approve' => request()->user()?->can('manualApprove', $certificate) ?? false,
                'can_reject' => request()->user()?->can('reject', $certificate) ?? false,
            ],
        ]);
    }

    public function destroy(Team $team, TeamMember $member): RedirectResponse
    {
        if ($member->team_id !== $team->id) {
            abort(404);
        }

        $cert = $member->medicalCertificate;
        if (! $cert) {
            return back();
        }

        $this->authorize('delete', $cert);

        $this->stateMachine->markSuperseded($cert);
        $this->audit->log('certificate.removed', $cert);

        return back();
    }

    public function manualApprove(MedicalCertificate $certificate): RedirectResponse
    {
        $this->authorize('manualApprove', $certificate);

        $this->stateMachine->markValid(
            $certificate,
            $certificate->expires_at ?? now()->addYear(),
            $certificate->extracted_name ?? 'Manuelno potvrđeno',
            (float) ($certificate->ocr_confidence ?? 1.0),
        );

        $this->audit->log('certificate.manual_approved', $certificate);

        return back();
    }
}
