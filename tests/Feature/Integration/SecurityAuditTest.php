<?php

use App\Models\Professor;
use App\Models\School;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/*
 * Basic security audit — XSS escape, role-based authorization, file upload MIME,
 * session invalidation, SQL injection attempt na search inputs.
 */

beforeEach(function () {
    $this->withoutVite();
});

it('XSS — school name with script tag escapes to HTML entity', function () {
    $admin = User::factory()->admin()->create();
    School::factory()->create([
        'code' => 'OS-XSS-001',
        'name' => '<script>alert("xss")</script>',
    ]);

    $response = $this->actingAs($admin)->get('/admin/schools');

    // Inertia JSON izlaz mora escape-ovati script tag (ne smije postojati raw <script>alert(...) u outputu).
    expect($response->getContent())->not->toContain('<script>alert("xss")</script>');
});

it('professor cannot access admin routes', function () {
    $prof = Professor::factory()->create();

    $protectedRoutes = [
        '/admin/users',
        '/admin/schools',
        '/admin/sports',
        '/admin/competitions',
        '/admin/audit-log',
        '/admin/teams',
        '/admin/students',
    ];

    foreach ($protectedRoutes as $url) {
        $this->actingAs($prof)->get($url)->assertForbidden();
    }
});

it('student cannot access admin routes', function () {
    $student = Student::factory()->create();

    $protectedRoutes = [
        '/admin/users',
        '/admin/schools',
        '/admin/audit-log',
    ];

    foreach ($protectedRoutes as $url) {
        $this->actingAs($student)->get($url)->assertForbidden();
    }
});

it('file upload rejects malicious MIME (.exe)', function () {
    Storage::fake('private');

    $prof = Professor::factory()->create();
    $team = Team::factory()->create(['professor_id' => $prof->id, 'school_id' => $prof->school_id]);
    $member = TeamMember::factory()->create(['team_id' => $team->id]);

    $file = UploadedFile::fake()->create('malware.exe', 100, 'application/x-msdownload');

    $this->actingAs($prof)
        ->post("/teams/{$team->id}/members/{$member->id}/certificate", ['file' => $file])
        ->assertSessionHasErrors('file');
});

it('file upload rejects oversized files (>10MB)', function () {
    Storage::fake('private');

    $prof = Professor::factory()->create();
    $team = Team::factory()->create(['professor_id' => $prof->id, 'school_id' => $prof->school_id]);
    $member = TeamMember::factory()->create(['team_id' => $team->id]);

    $file = UploadedFile::fake()->create('huge.pdf', 11000, 'application/pdf');

    $this->actingAs($prof)
        ->post("/teams/{$team->id}/members/{$member->id}/certificate", ['file' => $file])
        ->assertSessionHasErrors('file');
});

it('logout invalidates session', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user)->get('/admin/users')->assertOk();
    $this->post('/logout');

    // Nakon logout, ponovni pristup admin ruti se redirectuje na /login.
    $this->get('/admin/users')->assertRedirect('/login');
});

it('guest cannot access authenticated routes', function () {
    $protectedRoutes = [
        '/dashboard',
        '/teams',
        '/profile',
        '/admin/users',
        '/admin/audit-log',
    ];

    foreach ($protectedRoutes as $url) {
        $this->get($url)->assertRedirect();
    }
});

it('professor cannot view team from another professor', function () {
    $prof1 = Professor::factory()->create();
    $prof2 = Professor::factory()->create();
    $team = Team::factory()->create(['professor_id' => $prof1->id, 'school_id' => $prof1->school_id]);

    $this->actingAs($prof2)
        ->get("/teams/{$team->id}/edit")
        ->assertForbidden();
});

it('search input does not allow SQL injection on audit log', function () {
    $admin = User::factory()->admin()->create();

    // Pokušaj inekcije — kontrolleri koriste Eloquent / param bindings, pa bi se ovo trebalo
    // tretirati kao prost string. Test prolazi ako stranica vrati 200 i tabela još uvijek postoji.
    $payload = "'; DROP TABLE audit_log; --";
    $this->actingAs($admin)
        ->get('/admin/audit-log?action='.urlencode($payload))
        ->assertOk();

    // Tabela mora i dalje postojati.
    expect(Schema::hasTable('audit_log'))->toBeTrue();
});

it('student profile update cannot change role or school via mass assignment', function () {
    $student = Student::factory()->create(['phone' => '+382 67 000000']);
    $originalRole = $student->role;
    $originalSchool = $student->school_id;

    $this->actingAs($student)->patch('/profile', [
        'phone' => '+382 67 999999',
        'role' => 'admin',
        'school_id' => 99999,
    ])->assertRedirect();

    $fresh = $student->fresh();
    expect($fresh->role)->toBe($originalRole);
    expect($fresh->school_id)->toBe($originalSchool);
});
