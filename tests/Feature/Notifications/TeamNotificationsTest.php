<?php

use App\Models\Team;
use App\Models\User;
use App\Notifications\TeamApprovedNotification;
use App\Notifications\TeamRejectedNotification;
use App\Notifications\TeamSubmittedNotification;
use Illuminate\Support\Facades\Notification;

it('TeamSubmittedNotification uses mail and database channels', function () {
    Notification::fake();

    $team = Team::factory()->create();
    $admin = User::factory()->admin()->create();

    $admin->notify(new TeamSubmittedNotification($team));

    Notification::assertSentTo($admin, TeamSubmittedNotification::class, function ($notification, $channels) {
        return in_array('mail', $channels) && in_array('database', $channels);
    });
});

it('TeamApprovedNotification payload contains competition name', function () {
    $team = Team::factory()->create();
    $notification = new TeamApprovedNotification($team);

    $data = $notification->toArray(new User);

    expect($data['team_id'])->toBe($team->id);
    expect($data['competition_name'])->toBe($team->competition->name);
    expect($data['message'])->toContain('odobrena');
});

it('TeamRejectedNotification payload includes reason', function () {
    $team = Team::factory()->create();
    $notification = new TeamRejectedNotification($team, 'Nedovoljno članova');

    $data = $notification->toArray(new User);

    expect($data['reason'])->toBe('Nedovoljno članova');
    expect($data['message'])->toContain('odbijena');
});

it('TeamSubmittedNotification mail message includes competition name', function () {
    $team = Team::factory()->create();
    $notification = new TeamSubmittedNotification($team);

    $mail = $notification->toMail(new User);

    expect($mail->subject)->toContain($team->competition->name);
});
