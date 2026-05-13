<?php

namespace App\Models;

use App\Enums\StudentVerificationStatus;
use App\Enums\UserRole;
use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends User
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory;

    protected $table = 'users';

    protected static string $factory = StudentFactory::class;

    protected static function booted(): void
    {
        static::addGlobalScope('student', function (Builder $builder) {
            $builder->where('role', UserRole::Student->value);
        });

        static::creating(function (Student $student): void {
            $student->role = UserRole::Student;
            $student->verification_status ??= StudentVerificationStatus::Unverified;
        });
    }

    /** @return HasMany<TeamMember, $this> */
    public function teamMemberships(): HasMany
    {
        return $this->hasMany(TeamMember::class, 'student_id');
    }
}
