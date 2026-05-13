<?php

use App\Enums\TeamStatus;
use App\Jobs\ValidateMedicalCertificateJob;
use App\Models\AuditLogEntry;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\School;
use App\Models\Sport;
use App\Models\Student;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

/*
 * E2E Journey 1 — UC5 full flow.
 * Profesor: kreira draft → dodaje 3 člana → uploaduje 3 potvrde → procesira OCR queue → submit → admin approve.
 * Verifikuje audit log zapise za svaku state izmjenu.
 */

it('professor completes full UC5 flow end-to-end', function () {
    Storage::fake('private');
    Notification::fake();

    // Setup
    $school = School::factory()->create();
    $sport = Sport::factory()->team(3, 1)->create(['slug' => 'e2e-uc5-sport']);
    $comp = Competition::factory()->create([
        'sport_id' => $sport->id,
        'slug' => 'e2e-uc5-comp',
    ]);
    $prof = Professor::factory()->forSchool($school)->create([
        'verified_at' => now(),
        'name' => 'Test Profesor',
    ]);
    $students = Student::factory()->count(3)->forSchool($school)->create();
    $admin = User::factory()->admin()->create();

    // 1. Profesor login + kreira draft
    $this->actingAs($prof)
        ->post('/teams', ['competition_id' => $comp->id])
        ->assertRedirect();

    $team = Team::where('professor_id', $prof->id)->first();
    expect($team)->not->toBeNull();
    expect($team->status)->toBe(TeamStatus::Draft);

    // 2. Profesor dodaje 3 člana
    foreach ($students as $student) {
        $this->actingAs($prof)
            ->post("/teams/{$team->id}/members", ['student_id' => $student->id])
            ->assertSessionHasNoErrors();
    }
    expect($team->fresh()->members()->count())->toBe(3);

    // 3. Uploaduje 3 potvrde — fake OCR će validirati (filename: ime_prezime_YYYY-MM-DD.pdf)
    $names = [['petar', 'petrovic'], ['ana', 'anic'], ['marko', 'markovic']];
    foreach ($team->fresh()->members as $i => $member) {
        $filename = "{$names[$i][0]}_{$names[$i][1]}_2028-12-31.pdf";
        $file = UploadedFile::fake()->create($filename, 100, 'application/pdf');

        $this->actingAs($prof)
            ->post("/teams/{$team->id}/members/{$member->id}/certificate", ['file' => $file])
            ->assertRedirect();
    }

    // 4. Procesiraj OCR sinhrono
    foreach ($team->fresh()->members as $m) {
        $cert = $m->medicalCertificate;
        if ($cert) {
            ValidateMedicalCertificateJob::dispatchSync($cert->id);
        }
    }

    // 5. Submit
    $this->actingAs($prof)
        ->post("/teams/{$team->id}/submit", ['signature' => $prof->name])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($team->fresh()->status)->toBe(TeamStatus::Submitted);

    // 6. Logout, login admin, approve
    $this->post('/logout');
    $this->actingAs($admin)
        ->post("/admin/teams/{$team->id}/approve")
        ->assertRedirect();

    expect($team->fresh()->status)->toBe(TeamStatus::Active);

    // 7. Verifikacija audit log-a — mora postojati po jedan zapis za svaku ključnu state izmjenu.
    $auditCount = AuditLogEntry::query()
        ->whereIn('action', [
            'team.created',
            'team_member.added',
            'certificate.uploaded',
            'team.submitted',
            'team.approved',
        ])
        ->count();
    expect($auditCount)->toBeGreaterThanOrEqual(7);
});
