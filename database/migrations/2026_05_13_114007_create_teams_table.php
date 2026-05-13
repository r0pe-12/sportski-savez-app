<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->uuid('team_uuid')->unique();
            $table->foreignId('school_id')->constrained()->restrictOnDelete();
            $table->foreignId('competition_id')->constrained()->restrictOnDelete();
            $table->foreignId('professor_id')->constrained('users')->restrictOnDelete();
            $table->string('status')->default('draft');     // TeamStatus enum
            $table->string('signature')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->ipAddress('signature_ip')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['competition_id', 'status']);
            $table->index('professor_id');
            $table->unique(['competition_id', 'school_id']); // jedna ekipa po školi po takmičenju
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
