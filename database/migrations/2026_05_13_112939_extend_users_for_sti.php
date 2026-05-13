<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->after('email');
            $table->foreignId('school_id')->nullable()->after('role')->constrained()->nullOnDelete();
            $table->string('phone')->nullable()->after('school_id');
            $table->timestamp('verified_at')->nullable()->after('phone');

            // Student-specific fields (STI)
            $table->string('jmb', 13)->nullable()->unique()->after('verified_at');
            $table->string('grade', 10)->nullable()->after('jmb');
            $table->date('birth_date')->nullable()->after('grade');
            $table->string('verification_status')->nullable()->after('birth_date');
            $table->boolean('parental_consent')->default(false)->after('verification_status');
            $table->timestamp('parental_consent_at')->nullable()->after('parental_consent');
            $table->string('photo_path')->nullable()->after('parental_consent_at');

            $table->softDeletes();

            $table->index('role');
            $table->index('school_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['school_id']);
            $table->dropColumn([
                'role', 'school_id', 'phone', 'verified_at',
                'jmb', 'grade', 'birth_date', 'verification_status',
                'parental_consent', 'parental_consent_at', 'photo_path',
                'deleted_at',
            ]);
        });
    }
};
