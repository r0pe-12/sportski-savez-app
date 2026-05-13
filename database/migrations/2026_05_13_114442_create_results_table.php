<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competition_id')->constrained()->restrictOnDelete();
            $table->morphs('subject');       // subject_type + subject_id
            $table->unsignedSmallInteger('placement');
            $table->string('medal_type'); // MedalType enum
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['competition_id', 'placement']);
            $table->unique(['competition_id', 'subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
