<?php

namespace App\Models;

use App\Enums\StudentVerificationStatus;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name', 'email', 'password', 'role', 'school_id', 'phone', 'verified_at',
    'jmb', 'grade', 'birth_date', 'verification_status',
    'parental_consent', 'parental_consent_at', 'photo_path',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => UserRole::class,
            'verification_status' => StudentVerificationStatus::class,
            'verified_at' => 'datetime',
            'parental_consent' => 'boolean',
            'parental_consent_at' => 'datetime',
            'birth_date' => 'date',
        ];
    }

    /** @return BelongsTo<School, $this> */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isProfessor(): bool
    {
        return $this->role === UserRole::Professor;
    }

    public function isStudent(): bool
    {
        return $this->role === UserRole::Student;
    }
}
