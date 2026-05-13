<?php

use App\Jobs\ValidateMedicalCertificateJob;
use App\Models\MedicalCertificate;
use App\Models\Professor;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('private');
    Bus::fake();
    $this->prof = Professor::factory()->create();
    $this->team = Team::factory()->create(['professor_id' => $this->prof->id]);
    $this->member = TeamMember::factory()->create(['team_id' => $this->team->id]);
});

it('uploads valid PDF and dispatches OCR job', function () {
    $file = UploadedFile::fake()->create('petar_petrovic_2028-12-31.pdf', 500, 'application/pdf');

    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/members/{$this->member->id}/certificate", [
            'file' => $file,
        ])
        ->assertRedirect();

    $cert = MedicalCertificate::where('team_member_id', $this->member->id)->first();
    expect($cert)->not->toBeNull();
    expect($cert->status->value)->toBe('pending');
    expect($cert->original_filename)->toBe('petar_petrovic_2028-12-31.pdf');

    Bus::assertDispatched(ValidateMedicalCertificateJob::class);
});

it('rejects file over 10 MB', function () {
    $file = UploadedFile::fake()->create('x.pdf', 11000, 'application/pdf');

    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/members/{$this->member->id}/certificate", [
            'file' => $file,
        ])
        ->assertSessionHasErrors('file');
});

it('rejects non-allowed MIME', function () {
    $file = UploadedFile::fake()->create('x.exe', 100, 'application/octet-stream');

    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/members/{$this->member->id}/certificate", [
            'file' => $file,
        ])
        ->assertSessionHasErrors('file');
});

it('replacing certificate supersedes old', function () {
    $oldCert = MedicalCertificate::factory()->create(['team_member_id' => $this->member->id]);

    $file = UploadedFile::fake()->create('marko_markovic_2028-01-01.pdf', 500, 'application/pdf');
    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/members/{$this->member->id}/certificate", [
            'file' => $file,
        ])
        ->assertRedirect();

    expect($oldCert->fresh()->status->value)->toBe('superseded');
});

it('other professor cannot upload', function () {
    $other = Professor::factory()->create();
    $file = UploadedFile::fake()->create('x.pdf', 100, 'application/pdf');

    $this->actingAs($other)
        ->post("/teams/{$this->team->id}/members/{$this->member->id}/certificate", [
            'file' => $file,
        ])
        ->assertForbidden();
});

it('rejects 404 when member does not belong to team', function () {
    $otherTeam = Team::factory()->create(['professor_id' => $this->prof->id]);
    $otherMember = TeamMember::factory()->create(['team_id' => $otherTeam->id]);
    $file = UploadedFile::fake()->create('petar_petrovic_2028-12-31.pdf', 100, 'application/pdf');

    $this->actingAs($this->prof)
        ->post("/teams/{$this->team->id}/members/{$otherMember->id}/certificate", [
            'file' => $file,
        ])
        ->assertNotFound();
});
