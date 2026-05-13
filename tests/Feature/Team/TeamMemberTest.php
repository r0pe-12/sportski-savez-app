<?php

use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\Sport;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;

beforeEach(function () {
    $this->prof = Professor::factory()->create(['verified_at' => now()]);
    $this->sport = Sport::factory()->team(5, 3)->create(['slug' => 'kosarka-tm']);
    $this->competition = Competition::factory()->create([
        'sport_id' => $this->sport->id,
        'slug' => 'comp-tm',
    ]);
    $this->team = Team::factory()->create([
        'professor_id' => $this->prof->id,
        'school_id' => $this->prof->school_id,
        'competition_id' => $this->competition->id,
        'status' => TeamStatus::Draft,
    ]);
});

it('professor adds student from same school', function () {
    $student = Student::factory()->forSchool($this->prof->school)->create();

    $this->actingAs($this->prof)->post("/teams/{$this->team->id}/members", [
        'student_id' => $student->id,
    ])->assertRedirect();

    expect(TeamMember::where('team_id', $this->team->id)->where('student_id', $student->id)->exists())->toBeTrue();
});

it('cannot add student from different school', function () {
    $student = Student::factory()->create(); // different school

    $this->actingAs($this->prof)->post("/teams/{$this->team->id}/members", [
        'student_id' => $student->id,
    ])->assertSessionHasErrors('student_id');
});

it('cannot add same student twice', function () {
    $student = Student::factory()->forSchool($this->prof->school)->create();
    TeamMember::factory()->create(['team_id' => $this->team->id, 'student_id' => $student->id]);

    $this->actingAs($this->prof)->post("/teams/{$this->team->id}/members", [
        'student_id' => $student->id,
    ])->assertSessionHasErrors('student_id');
});

it('cannot exceed sport members_count + substitutes_count', function () {
    // sport: 5 + 3 = 8 max
    for ($i = 1; $i <= 8; $i++) {
        $s = Student::factory()->forSchool($this->prof->school)->create();
        TeamMember::factory()->create(['team_id' => $this->team->id, 'student_id' => $s->id]);
    }

    $student = Student::factory()->forSchool($this->prof->school)->create();
    $this->actingAs($this->prof)->post("/teams/{$this->team->id}/members", [
        'student_id' => $student->id,
    ])->assertSessionHasErrors('student_id');
});

it('professor removes team member', function () {
    $student = Student::factory()->forSchool($this->prof->school)->create();
    $member = TeamMember::factory()->create(['team_id' => $this->team->id, 'student_id' => $student->id]);

    $this->actingAs($this->prof)->delete("/teams/{$this->team->id}/members/{$member->id}")
        ->assertRedirect();

    expect(TeamMember::find($member->id))->toBeNull();
});
