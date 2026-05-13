<?php

namespace App\Enums;

enum TeamStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Active = 'active';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
    case Withdrawn = 'withdrawn';
    case Completed = 'completed';

    /** @return array<self> Dozvoljeni prelazi po spec 7.4.1 */
    public function nextStates(): array
    {
        return match ($this) {
            self::Draft => [self::Submitted, self::Cancelled],
            self::Submitted => [self::Active, self::Rejected, self::Cancelled],
            self::Active => [self::Completed, self::Withdrawn],
            default => [],
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Rejected, self::Cancelled, self::Withdrawn, self::Completed], true);
    }
}
