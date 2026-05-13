<?php

namespace App\Services;

use App\Enums\MedicalCertificateStatus;
use App\Enums\TeamStatus;
use App\Enums\UserRole;
use App\Models\Team;
use App\Models\User;
use App\Notifications\TeamApprovedNotification;
use App\Notifications\TeamRejectedNotification;
use App\Notifications\TeamSubmittedNotification;
use App\Services\Exceptions\TeamSubmissionException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class TeamRegistrationService
{
    public function __construct(private AuditLogger $audit) {}

    public function submit(Team $team, string $signature, string $ip): Team
    {
        if ($team->status !== TeamStatus::Draft) {
            throw new TeamSubmissionException('Ekipa nije u draft stanju.');
        }

        $professor = $team->professor;

        if ($professor === null) {
            throw new TeamSubmissionException('Ekipa nema dodijeljenog profesora.');
        }

        if (trim($signature) !== trim((string) $professor->name)) {
            throw new TeamSubmissionException('Potpis ne odgovara registrovanom imenu profesora.');
        }

        $sport = $team->competition->sport;
        $minMembers = $sport->members_count;
        $maxMembers = $sport->members_count + $sport->substitutes_count;
        $memberCount = $team->members()->count();

        if ($memberCount < $minMembers || $memberCount > $maxMembers) {
            throw new TeamSubmissionException(
                "Neispravan broj članova: {$memberCount}. Sport zahtjeva {$minMembers}–{$maxMembers}."
            );
        }

        $invalidCerts = $team->members()
            ->whereDoesntHave(
                'medicalCertificate',
                fn ($q) => $q->where('status', MedicalCertificateStatus::Valid->value)
            )
            ->count();

        if ($invalidCerts > 0) {
            throw new TeamSubmissionException(
                "{$invalidCerts} članova nema validnu ljekarsku potvrdu."
            );
        }

        DB::transaction(function () use ($team, $signature, $ip): void {
            $team->update([
                'status' => TeamStatus::Submitted,
                'signature' => $signature,
                'signed_at' => now(),
                'signature_ip' => $ip,
            ]);
        });

        $this->audit->log('team.submitted', $team, [
            'signature' => $signature,
            'member_count' => $team->members()->count(),
        ]);

        // Notifikuj profesora (spec 9.5)
        Notification::send($professor, new TeamSubmittedNotification($team));

        // Notifikuj sve adminove (database kanal)
        $admins = User::where('role', UserRole::Admin->value)->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new TeamSubmittedNotification($team));
        }

        return $team->fresh();
    }

    public function approve(Team $team): Team
    {
        if ($team->status !== TeamStatus::Submitted) {
            throw new TeamSubmissionException('Samo submitted ekipe mogu biti odobrene.');
        }

        $team->update(['status' => TeamStatus::Active]);

        $this->audit->log('team.approved', $team);

        if ($team->professor !== null) {
            Notification::send($team->professor, new TeamApprovedNotification($team));
        }

        return $team->fresh();
    }

    public function reject(Team $team, string $reason): Team
    {
        if ($team->status !== TeamStatus::Submitted) {
            throw new TeamSubmissionException('Samo submitted ekipe mogu biti odbijene.');
        }

        $team->update([
            'status' => TeamStatus::Rejected,
            'rejection_reason' => $reason,
        ]);

        $this->audit->log('team.rejected', $team, ['reason' => $reason]);

        if ($team->professor !== null) {
            Notification::send($team->professor, new TeamRejectedNotification($team, $reason));
        }

        return $team->fresh();
    }
}
