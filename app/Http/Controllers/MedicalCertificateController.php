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
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;

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

    public function show(MedicalCertificate $certificate): SymfonyRedirectResponse
    {
        $this->authorize('view', $certificate);

        $url = $this->storage->temporaryUrl($certificate->path, 5);

        return redirect()->away($url);
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
