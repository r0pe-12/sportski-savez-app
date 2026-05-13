<?php

use App\Models\Professor;
use App\Models\School;

it('shares role and school on auth.user', function () {
    $school = School::factory()->create(['name' => 'OŠ Test']);
    $prof = Professor::factory()->forSchool($school)->create();

    $response = $this->actingAs($prof)->get('/dashboard');

    $response->assertInertia(function ($page) {
        $page->where('auth.user.role', 'professor')
            ->where('auth.user.school.name', 'OŠ Test')
            ->where('notifications.unread_count', 0);
    });
});
