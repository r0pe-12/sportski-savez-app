<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_dnevnik_sesije', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('broj')->unique();
            $table->string('naslov');
            $table->date('datum');
            $table->string('faza')->index();
            $table->text('cilj');
            $table->string('alat');
            $table->text('instrukcije');
            $table->text('output');
            $table->text('odluke');
            $table->text('ishod');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_dnevnik_sesije');
    }
};
