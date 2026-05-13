<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\SchoolFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class School extends Model
{
    /** @use HasFactory<SchoolFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = ['code', 'name', 'city', 'address', 'phone', 'email'];

    /** @return HasMany<User, $this> */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** @return HasMany<User, $this> */
    public function professors(): HasMany
    {
        return $this->hasMany(User::class)->where('role', UserRole::Professor);
    }

    /** @return HasMany<User, $this> */
    public function students(): HasMany
    {
        return $this->hasMany(User::class)->where('role', UserRole::Student);
    }
}
