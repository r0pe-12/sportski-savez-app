<?php

namespace App\Models;

use App\Enums\SportType;
use Database\Factories\SportFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sport extends Model
{
    /** @use HasFactory<SportFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = ['slug', 'name', 'type', 'members_count', 'substitutes_count', 'rules_description'];

    protected function casts(): array
    {
        return ['type' => SportType::class];
    }

    /** @return HasMany<Competition, $this> */
    public function competitions(): HasMany
    {
        return $this->hasMany(Competition::class);
    }
}
