<?php

use App\Models\Professor;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

it('shares notification count to Inertia', function () {
    $prof = Professor::factory()->create();

    DatabaseNotification::create([
        'id' => (string) Str::uuid(),
        'type' => 'TestNotification',
        'notifiable_type' => $prof->getMorphClass(),
        'notifiable_id' => $prof->id,
        'data' => ['message' => 'test'],
    ]);

    $response = $this->actingAs($prof)->get('/dashboard');
    $page = $response->viewData('page');

    expect($page['props']['notifications']['unread_count'])->toBe(1);
});

it('marks notification as read endpoint', function () {
    $prof = Professor::factory()->create();
    $id = (string) Str::uuid();

    DatabaseNotification::create([
        'id' => $id,
        'type' => 'X',
        'notifiable_type' => $prof->getMorphClass(),
        'notifiable_id' => $prof->id,
        'data' => [],
    ]);

    $this->actingAs($prof)->post("/notifications/{$id}/read");

    $notification = DatabaseNotification::find($id);
    expect($notification->read_at)->not->toBeNull();
});
