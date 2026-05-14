<?php

namespace Database\Seeders;

use App\Enums\SportType;
use App\Models\Competition;
use App\Models\School;
use App\Models\Sport;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

/**
 * DEMO RESET — minimalni demo set za odbranu projekta.
 *
 * Briše: sve teams, team_members, medical_certificates, results, audit_log,
 *        notifications, jobs, failed_jobs, sessions.
 * Čuva: ai_dnevnik_sesije (NIKAD ne dirati!), schema, migrations.
 * Smanjuje: schools, sports, students, professors, competitions, admin.
 *
 * Demo set:
 *   - 1 Admin: admin@savez.test / password
 *   - 1 Škola: "OŠ Demo Škola" (DEMO-PG-001)
 *   - 1 Profesor: profesor@demo.test / password, verified
 *   - 1 Učenik: marko@demo.test / password, verified (Marko Marković)
 *   - 1 Sport: Stoni tenis (Individual)
 *   - 1 Takmičenje: "Demo Prvenstvo Stoni tenis 2027" u budućnosti
 */
class DemoResetSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('=== DEMO RESET START ===');
        $this->command->info('');

        // SAFETY CHECK — ai_dnevnik_sesije MORA postojati
        if (! Schema::hasTable('ai_dnevnik_sesije')) {
            $this->command->error('FATAL: ai_dnevnik_sesije tabela ne postoji! Abort.');

            return;
        }

        $dnevnikCount = DB::table('ai_dnevnik_sesije')->count();
        $this->command->info("Sačuvano ai_dnevnik_sesije zapisa: {$dnevnikCount}");

        // 1. Brisi vezne tabele (FK redoslijed)
        $this->command->info('');
        $this->command->info('[1/7] Brišem teams, members, certificates, results, audit, notifications...');

        $tablesToTruncate = [
            'results',
            'medical_certificates',
            'team_members',
            'teams',
            'audit_log',
            'notifications',
            'jobs',
            'failed_jobs',
            'sessions',
        ];

        foreach ($tablesToTruncate as $table) {
            if (Schema::hasTable($table)) {
                $count = DB::table($table)->count();
                DB::table($table)->delete();
                $this->command->info("  - {$table}: obrisano {$count} zapisa");
            }
        }

        // 2. Brisi sve korisnike osim admina
        $this->command->info('');
        $this->command->info('[2/7] Brišem sve korisnike osim admin@savez.test...');
        $deletedUsers = User::where('email', '!=', 'admin@savez.test')->forceDelete();
        $this->command->info("  - obrisano {$deletedUsers} korisnika");

        // 3. Brisi skole i takmicenja
        $this->command->info('');
        $this->command->info('[3/7] Brišem škole i takmičenja...');
        $delSchools = School::query()->forceDelete();
        $delComps = Competition::query()->forceDelete();
        $this->command->info("  - škole: {$delSchools}, takmičenja: {$delComps}");

        // 4. Brisi sve sportove osim Stoni tenis (zadrzati samo 1)
        $this->command->info('');
        $this->command->info('[4/7] Zadržavam samo Stoni tenis...');
        $delSports = Sport::where('slug', '!=', 'stoni-tenis')->forceDelete();
        $this->command->info("  - obrisano {$delSports} sportova");

        // 5. Reset admin password + osiguranje da je email_verified
        $this->command->info('');
        $this->command->info("[5/7] Resetujem admin password na 'password'...");
        $admin = User::where('email', 'admin@savez.test')->first();
        if (! $admin) {
            $this->command->info('  - Admin ne postoji, kreiram...');
            $admin = User::create([
                'name' => 'Sistemski Admin',
                'email' => 'admin@savez.test',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
        } else {
            $admin->forceFill([
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => 'admin',
            ])->save();
        }
        $this->command->info("  - admin@savez.test / password (ID {$admin->id})");

        // 6. Kreiraj demo skolu, profesora, ucenika
        $this->command->info('');
        $this->command->info('[6/7] Kreiram demo entitete...');

        $school = School::create([
            'code' => 'DEMO-PG-001',
            'name' => 'OŠ Demo Škola',
            'city' => 'Podgorica',
            'address' => 'Bulevar Demo 1',
            'phone' => '+382 20 000 000',
            'email' => 'kontakt@demo-skola.me',
        ]);
        $this->command->info("  - Škola: {$school->name} (code: {$school->code})");

        $professor = User::create([
            'name' => 'Petar Petrović',
            'email' => 'profesor@demo.test',
            'password' => Hash::make('password'),
            'role' => 'professor',
            'school_id' => $school->id,
            'email_verified_at' => now(),
            'verified_at' => now(),
            'jmb' => '0101985210001',
            'phone' => '+382 67 111 111',
        ]);
        $this->command->info("  - Profesor: profesor@demo.test / password (verified, JMB {$professor->jmb})");

        $student = User::create([
            'name' => 'Marko Marković',
            'email' => 'marko@demo.test',
            'password' => Hash::make('password'),
            'role' => 'student',
            'school_id' => $school->id,
            'email_verified_at' => now(),
            'jmb' => '0103010250001',
            'verification_status' => 'verified',
            'birth_date' => '2010-03-01',
            'grade' => '8-2',
            'parental_consent' => true,
            'parental_consent_at' => now(),
        ]);
        $this->command->info("  - Učenik: marko@demo.test / password (verified, JMB {$student->jmb})");

        // 7. Aktiviraj Stoni tenis + kreiraj takmicenje
        $this->command->info('');
        $this->command->info('[7/7] Kreiram demo takmičenje...');
        $sport = Sport::where('slug', 'stoni-tenis')->first();
        if (! $sport) {
            $sport = Sport::create([
                'slug' => 'stoni-tenis',
                'name' => 'Stoni tenis',
                'type' => SportType::Individual,
                'members_count' => 1,
                'substitutes_count' => 0,
            ]);
        }
        $this->command->info("  - Sport: {$sport->name} ({$sport->type->value})");

        $competition = Competition::create([
            'sport_id' => $sport->id,
            'slug' => 'demo-prvenstvo-stoni-tenis-2027',
            'name' => 'Demo Prvenstvo Stoni tenis 2027',
            'location' => 'Sportski centar Morača, Podgorica',
            'start_date' => now()->addMonths(2)->startOfDay()->toDateString(),
            'end_date' => now()->addMonths(2)->addDays(2)->startOfDay()->toDateString(),
            'status' => 'active',
            'year' => 2027,
        ]);
        $this->command->info("  - Takmičenje: {$competition->name} (start: {$competition->start_date})");

        $this->command->info('');
        $this->command->info('=== DEMO RESET DONE ===');
        $this->command->info('');
        $this->command->info("Konekcioni podaci (sve sifre = 'password'):");
        $this->command->info('  Admin:    admin@savez.test');
        $this->command->info('  Profesor: profesor@demo.test');
        $this->command->info('  Učenik:   marko@demo.test');
        $this->command->info('');
        $this->command->info('Ljekarska potvrda — naming konvencija FakeOcr:');
        $this->command->info('  marko_markovic_2027-12-31.pdf (ili .jpg, .png)');
        $this->command->info('  Datum u nazivu = datum isteka, mora biti u budućnosti.');
        $this->command->info('');
    }
}
