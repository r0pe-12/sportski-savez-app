<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_member_id')->constrained()->cascadeOnDelete();
            $table->string('original_filename');
            $table->string('path');
            $table->string('status')->default('pending'); // MedicalCertificateStatus enum
            $table->date('issued_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->string('extracted_name')->nullable();
            $table->decimal('ocr_confidence', 4, 3)->nullable(); // 0.000–1.000
            $table->text('ocr_raw_response')->nullable();
            $table->timestamps();

            $table->index(['team_member_id', 'status']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_certificates');
    }
};
