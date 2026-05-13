<?php

namespace App\Notifications;

use App\Models\Team;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeamApprovedNotification extends Notification
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
        $this->team->loadMissing('competition');

        return (new MailMessage)
            ->subject('Ekipa odobrena — '.$this->team->competition->name)
            ->line("Vaša prijava na {$this->team->competition->name} je odobrena.");
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        $this->team->loadMissing('competition');

        return [
            'team_id' => $this->team->id,
            'competition_name' => $this->team->competition->name,
            'message' => 'Vaša ekipa je odobrena.',
        ];
    }
}
