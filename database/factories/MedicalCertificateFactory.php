<?php

namespace Database\Factories;

use App\Enums\MedicalCertificateStatus;
use App\Models\MedicalCertificate;
use App\Models\TeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<MedicalCertificate> */
class MedicalCertificateFactory extends Factory
{
    public function definition(): array
    {
        $issued = fake()->dateTimeBetween('-6 months', 'now');

        return [
            'team_member_id' => TeamMember::factory(),
            'original_filename' => fake()->word().'_potvrda.pdf',
            'path' => 'medical-certificates/'.(string) Str::uuid().'.pdf',
            'status' => MedicalCertificateStatus::Valid,
            'issued_at' => $issued,
            'expires_at' => (clone $issued)->modify('+1 year'),
            'extracted_name' => fake()->name(),
            'ocr_confidence' => 0.95,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => MedicalCertificateStatus::Pending]);
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'status' => MedicalCertificateStatus::Expired,
            'expires_at' => now()->subDays(30),
        ]);
    }

    public function invalid(): static
    {
        return $this->state(fn () => ['status' => MedicalCertificateStatus::Invalid]);
    }
}
