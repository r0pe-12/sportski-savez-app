<?php

use App\Models\Professor;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->withoutVite();
    Storage::fake('private');
});

it('student uploads own photo', function () {
    $student = Student::factory()->create();
    $file = UploadedFile::fake()->image('photo.jpg', 400, 400);

    $this->actingAs($student)
        ->post("/students/{$student->id}/photo", ['photo' => $file])
        ->assertRedirect();

    $fresh = $student->fresh();
    expect($fresh->photo_path)->not->toBeNull();
    Storage::disk('private')->assertExists($fresh->photo_path);
});

it('student cannot upload other student photo', function () {
    $a = Student::factory()->create();
    $b = Student::factory()->create();
    $file = UploadedFile::fake()->image('photo.jpg');

    $this->actingAs($a)
        ->post("/students/{$b->id}/photo", ['photo' => $file])
        ->assertForbidden();

    expect($b->fresh()->photo_path)->toBeNull();
});

it('professor cannot upload student photo of own school', function () {
    $prof = Professor::factory()->create();
    $student = Student::factory()->forSchool($prof->school)->create();
    $file = UploadedFile::fake()->image('photo.jpg');

    $this->actingAs($prof)
        ->post("/students/{$student->id}/photo", ['photo' => $file])
        ->assertForbidden();
});

it('admin can upload any student photo', function () {
    $admin = User::factory()->admin()->create();
    $student = Student::factory()->create();
    $file = UploadedFile::fake()->image('photo.jpg');

    $this->actingAs($admin)
        ->post("/students/{$student->id}/photo", ['photo' => $file])
        ->assertRedirect();

    expect($student->fresh()->photo_path)->not->toBeNull();
});

it('rejects non-image upload', function () {
    $student = Student::factory()->create();
    $file = UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf');

    $this->actingAs($student)
        ->post("/students/{$student->id}/photo", ['photo' => $file])
        ->assertSessionHasErrors('photo');
});

it('rejects oversize photo (> 5MB)', function () {
    $student = Student::factory()->create();
    $file = UploadedFile::fake()->image('big.jpg')->size(6000); // 6 MB

    $this->actingAs($student)
        ->post("/students/{$student->id}/photo", ['photo' => $file])
        ->assertSessionHasErrors('photo');
});

it('student removes own photo', function () {
    $student = Student::factory()->create(['photo_path' => 'students/1/photos/abc.jpg']);

    $this->actingAs($student)
        ->delete("/students/{$student->id}/photo")
        ->assertRedirect();

    expect($student->fresh()->photo_path)->toBeNull();
});

it('records audit log on photo upload', function () {
    $student = Student::factory()->create();
    $file = UploadedFile::fake()->image('photo.jpg');

    $this->actingAs($student)->post("/students/{$student->id}/photo", ['photo' => $file]);

    $this->assertDatabaseHas('audit_log', [
        'user_id' => $student->id,
        'action' => 'student.photo_uploaded',
    ]);
});

it('records audit log on photo removal', function () {
    $student = Student::factory()->create(['photo_path' => 'students/1/photos/abc.jpg']);

    $this->actingAs($student)->delete("/students/{$student->id}/photo");

    $this->assertDatabaseHas('audit_log', [
        'user_id' => $student->id,
        'action' => 'student.photo_removed',
    ]);
});
