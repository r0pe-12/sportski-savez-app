<?php

namespace App\Notifications;

use App\Models\Result;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ResultEnteredNotification extends Notification
{
    use Queueable;

    public function __construct(public Result $result) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'result_id' => $this->result->id,
            'placement' => $this->result->placement,
            'medal' => $this->result->medal_type->value,
            'message' => "Rezultat unesen: {$this->result->placement}. mjesto, medalja: {$this->result->medal_type->value}.",
        ];
    }
}
