<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MedicalCertificateStatus;
use App\Http\Controllers\Controller;
use App\Models\MedicalCertificate;
use App\Models\School;
use App\Services\AuditLogger;
use App\Services\MedicalCertificateStateMachine;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private AuditLogger $audit,
        private MedicalCertificateStateMachine $stateMachine,
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        if ($status === '') {
            $status = MedicalCertificateStatus::ManualReview->value;
        }

        $schoolId = $request->integer('school_id');

        $certificates = MedicalCertificate::query()
            ->with([
                'teamMember.student:id,name,email',
                'teamMember.team.competition.sport',
                'teamMember.team.school',
            ])
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->when($schoolId, fn ($q, $v) => $q->whereHas(
                'teamMember.team',
                fn ($q2) => $q2->where('school_id', $v),
            ))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/certificates/index', [
            'certificates' => $certificates,
            'filters' => [
                'status' => $status,
                'school_id' => $schoolId ?: '',
            ],
            'schools' => School::select('id', 'name')->orderBy('name')->get(),
            'statuses' => collect(MedicalCertificateStatus::cases())
                ->map(fn ($s) => ['value' => $s->value, 'label' => $s->value])
                ->values(),
        ]);
    }

    public function reject(MedicalCertificate $certificate): RedirectResponse
    {
        $this->authorize('reject', $certificate);

        $this->stateMachine->markInvalid($certificate, 'Admin manualno odbio.');

        $this->audit->log('certificate.rejected', $certificate);

        return back()->with('flash', 'Sertifikat označen kao nevalidan.');
    }
}
