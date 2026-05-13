<?php

use App\Models\MedicalCertificate;
use App\Models\Professor;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;

it('professor can upload cert for own team member', function () {
    $prof = Professor::factory()->create();
    $team = Team::factory()->create(['professor_id' => $prof->id]);
    $member = TeamMember::factory()->create(['team_id' => $team->id]);

    expect($prof->can('upload', $member))->toBeTrue();
});

it('professor cannot upload cert for other team member', function () {
    $other = Professor::factory()->create();
    $team = Team::factory()->create(['professor_id' => $other->id]);
    $member = TeamMember::factory()->create(['team_id' => $team->id]);

    $mine = Professor::factory()->create();
    expect($mine->can('upload', $member))->toBeFalse();
});

it('admin can manual approve manual_review certs', function () {
    $admin = User::factory()->admin()->create();
    $cert = MedicalCertificate::factory()->create(['status' => 'manual_review']);

    expect($admin->can('manualApprove', $cert))->toBeTrue();
});

it('non-admin cannot manual approve', function () {
    $prof = Professor::factory()->create();
    $cert = MedicalCertificate::factory()->create(['status' => 'manual_review']);
    expect($prof->can('manualApprove', $cert))->toBeFalse();
});

it('student can view own cert', function () {
    $student = Student::factory()->create();
    $member = TeamMember::factory()->create(['student_id' => $student->id]);
    $cert = MedicalCertificate::factory()->create(['team_member_id' => $member->id]);

    expect($student->can('view', $cert))->toBeTrue();
});
