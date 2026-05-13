<?php

namespace App\Models;

use App\Enums\MedalType;
use Database\Factories\ResultFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Result extends Model
{
    /** @use HasFactory<ResultFactory> */
    use HasFactory;

    protected $fillable = ['competition_id', 'subject_type', 'subject_id', 'placement', 'medal_type', 'notes'];

    protected function casts(): array
    {
        return ['medal_type' => MedalType::class];
    }

    /** @return BelongsTo<Competition, $this> */
    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    /** @return MorphTo<Model, $this> */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }
}
