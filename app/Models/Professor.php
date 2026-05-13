<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\ProfessorFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Professor extends User
{
    /** @use HasFactory<ProfessorFactory> */
    use HasFactory;

    protected $table = 'users';

    protected static string $factory = ProfessorFactory::class;

    protected static function booted(): void
    {
        static::addGlobalScope('professor', function (Builder $builder) {
            $builder->where('role', UserRole::Professor->value);
        });

        static::creating(function (Professor $professor): void {
            $professor->role = UserRole::Professor;
        });
    }
}
