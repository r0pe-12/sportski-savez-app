<?php

namespace App\Notifications;

use App\Models\Team;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(public Team $team) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->team->loadMissing('competition', 'school');

        return (new MailMessage)
            ->subject('Nova prijava ekipe — '.$this->team->competition->name)
            ->line("Ekipa škole {$this->team->school->name} je prijavljena na takmičenje {$this->team->competition->name}.")
            ->line('Status: čeka odobrenje.');
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        $this->team->loadMissing('competition', 'school');

        return [
            'team_id' => $this->team->id,
            'competition_name' => $this->team->competition->name,
            'school_name' => $this->team->school->name,
            'message' => 'Ekipa je predata na takmičenje.',
        ];
    }
}
