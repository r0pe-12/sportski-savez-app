<?php

namespace App\Notifications;

use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentMismatchedNotification extends Notification
{
    use Queueable;

    /**
     * @param  array<string, array{local: string, remote: string}>  $mismatches
     */
    public function __construct(public Student $student, public array $mismatches) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Mismatched učenik — {$this->student->name}")
            ->line("Učenik {$this->student->name} ima podatke koji se ne poklapaju sa eDnevnik-om:")
            ->line(json_encode($this->mismatches, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'student_id' => $this->student->id,
            'student_name' => $this->student->name,
            'mismatches' => $this->mismatches,
            'message' => 'eDnevnik podaci se ne poklapaju.',
        ];
    }
}
