<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class AiDnevnikSesija extends Model
{
    protected $table = 'ai_dnevnik_sesije';

    protected $fillable = [
        'broj',
        'naslov',
        'datum',
        'faza',
        'cilj',
        'alat',
        'instrukcije',
        'output',
        'odluke',
        'ishod',
    ];

    protected $casts = [
        'datum' => 'date',
    ];

    public function scopeOrderedByBroj(Builder $query): Builder
    {
        return $query->orderBy('broj');
    }
}
