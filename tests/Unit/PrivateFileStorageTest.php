<?php

use App\Models\Student;
use App\Services\PrivateFileStorage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(fn () => Storage::fake('private'));

it('stores file with UUID-based path scoped to model', function () {
    $student = Student::factory()->create();
    $file = UploadedFile::fake()->image('avatar.jpg');

    $path = app(PrivateFileStorage::class)->storeFor($student, $file, 'photos');

    expect($path)->toStartWith("students/{$student->id}/photos/");
    expect($path)->toEndWith('.jpg');
    Storage::disk('private')->assertExists($path);
});

it('generates UUID v4 in the filename', function () {
    $student = Student::factory()->create();
    $file = UploadedFile::fake()->image('x.png');
    $path = app(PrivateFileStorage::class)->storeFor($student, $file, 'photos');

    expect($path)->toMatch('/[0-9a-f-]{36}\.png$/');
});

it('deleteFor removes all files for owner directory', function () {
    $student = Student::factory()->create();
    $storage = app(PrivateFileStorage::class);
    $storage->storeFor($student, UploadedFile::fake()->image('1.jpg'), 'photos');
    $storage->storeFor($student, UploadedFile::fake()->image('2.jpg'), 'photos');

    $storage->deleteFor($student);

    expect(Storage::disk('private')->allFiles("students/{$student->id}"))->toBeEmpty();
});

it('temporaryUrl returns signed URL containing path', function () {
    $student = Student::factory()->create();
    $path = app(PrivateFileStorage::class)->storeFor($student, UploadedFile::fake()->image('x.jpg'), 'photos');

    $url = app(PrivateFileStorage::class)->temporaryUrl($path, 5);
    expect($url)->toContain($path);
});
