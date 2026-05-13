<?php

use App\Models\School;

it('creates a school via factory', function () {
    $school = School::factory()->create();
    expect($school->id)->toBeInt();
    expect($school->code)->toMatch('/^OS-[A-Z]{2,3}-\d{3}$/');
});

it('school has soft delete', function () {
    $school = School::factory()->create();
    $school->delete();
    expect(School::find($school->id))->toBeNull();
    expect(School::withTrashed()->find($school->id))->not->toBeNull();
});
