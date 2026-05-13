<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Professor = 'professor';
    case Student = 'student';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Professor => 'Profesor',
            self::Student => 'Učenik',
        };
    }
}
