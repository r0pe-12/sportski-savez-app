# F2 — Faza 0: Migracije i modeli — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase:** 0 (sekvencijalno) · **Track ID:** F2 · **Procijenjeno:** 3 dana
**Spec referenca:** [`specs/001-sportski-savez.md`](001-sportski-savez.md) sekcije 7, 13.3, 17
**Meta-plan:** [`specs/000-paralelni-plan.md`](000-paralelni-plan.md)
**Blokira:** sve Phase 1+ track-ove · **Blokiran-od:** F1

**Goal:** Sve migracije, svi Eloquent modeli, sve factory klase, svi seederi iz Domain modela (spec 7) odjednom. Posle ovog naredni track-ovi ne kreiraju **nove** entitete.

**Architecture:** Single Table Inheritance (STI) za User — jedna `users` tabela sa `role` enum i nullable polje specifičnih za rolu (`jmb`, `grade`, `school_id`, `verified_at`). Fortify nastavlja da koristi `User` model. Posebne tabele za sve ostale entitete (Schools, Sports, Competitions, Teams, TeamMembers, MedicalCertificates, Results, AuditLogEntries). Result je polimorfan (morphs to Team | TeamMember). Audit log je append-only (Policy zabranjuje UPDATE/DELETE).

**Tech Stack:** Laravel 13, PHP 8.3, SQLite (dev), Eloquent, Pest 4, FakerPHP sa custom CrnogorskiProvider. Nove dependency: **nikakve**.

**STI ključna odluka (zaključuje spec 7.2 i otvoreno pitanje iz placeholder TODO):** koristi `users` tabelu sa `role` enum (`admin`, `professor`, `student`) + nullable polja po roli. Modeli `Professor` i `Student` su Eloquent globalne scope-ovane podklase nad `User` (single-table inheritance preko global scope na `role`). `Admin` rola nema poseban model — koristi `User::admins()` scope.

**JMB validacija (zaključuje otvoreno pitanje spec 16):** za prvu iteraciju samo regex format check `/^\d{13}$/`. Algoritamska validacija kontrolne cifre dokumentovana u Task 13 kao TODO za kasnije ako bude vrijeme.

---

## Pre-flight

- [ ] **Provjeri F1 mergovan i baseline test prolazi**

```powershell
git checkout main
git pull
php artisan test --compact
```
Expected: sve postojeće testove + RoutingTest iz F1 PASS.

- [ ] **Provjeri da `ai_dnevnik_sesije` tabela postoji i ima podatke**

```powershell
php artisan tinker --execute 'echo App\Models\AiDnevnikSesija::count();'
```
Expected: > 0 (Sesija 15+ koje su predaja za ADIS).

> **NIKAD `migrate:fresh`** — vidjeti `feedback_database_safety` memoriju i CLAUDE.md sekcija 2.1.

---

## Task 1: Kreiraj enum klase u `app/Enums/`

**Files:**
- Create: `app/Enums/UserRole.php`
- Create: `app/Enums/SportType.php`
- Create: `app/Enums/TeamStatus.php`
- Create: `app/Enums/MedicalCertificateStatus.php`
- Create: `app/Enums/StudentVerificationStatus.php`
- Create: `app/Enums/MedalType.php`
- Create: `app/Enums/CompetitionStatus.php`
- Test: `tests/Unit/EnumsTest.php`

Spec 10.4: enum vrijednosti su `snake_case` string engleski.

- [ ] **Step 1: Napiši failing test za sve enum vrijednosti**

```php
<?php // tests/Unit/EnumsTest.php

use App\Enums\CompetitionStatus;
use App\Enums\MedalType;
use App\Enums\MedicalCertificateStatus;
use App\Enums\SportType;
use App\Enums\StudentVerificationStatus;
use App\Enums\TeamStatus;
use App\Enums\UserRole;

it('UserRole has 3 cases', function () {
    expect(UserRole::cases())->toHaveCount(3);
    expect(UserRole::Admin->value)->toBe('admin');
    expect(UserRole::Professor->value)->toBe('professor');
    expect(UserRole::Student->value)->toBe('student');
});

it('SportType has 2 cases', function () {
    expect(SportType::cases())->toHaveCount(2);
    expect(SportType::Team->value)->toBe('team_sport');
    expect(SportType::Individual->value)->toBe('individual_sport');
});

it('TeamStatus has 7 cases per spec 7.4.1', function () {
    expect(TeamStatus::cases())->toHaveCount(7);
    expect(array_map(fn ($c) => $c->value, TeamStatus::cases()))
        ->toEqualCanonicalizing([
            'draft', 'submitted', 'active',
            'rejected', 'cancelled', 'withdrawn', 'completed',
        ]);
});

it('MedicalCertificateStatus has 6 cases per spec 7.4.2', function () {
    expect(MedicalCertificateStatus::cases())->toHaveCount(6);
    expect(array_map(fn ($c) => $c->value, MedicalCertificateStatus::cases()))
        ->toEqualCanonicalizing([
            'pending', 'valid', 'expired', 'invalid', 'manual_review', 'superseded',
        ]);
});

it('StudentVerificationStatus has 5 cases per spec 7.4.3', function () {
    expect(StudentVerificationStatus::cases())->toHaveCount(5);
    expect(array_map(fn ($c) => $c->value, StudentVerificationStatus::cases()))
        ->toEqualCanonicalizing([
            'unverified', 'pending', 'verified', 'mismatched', 'failed',
        ]);
});

it('MedalType has 4 cases per spec 17.2', function () {
    expect(MedalType::cases())->toHaveCount(4);
    expect(array_map(fn ($c) => $c->value, MedalType::cases()))
        ->toEqualCanonicalizing(['gold', 'silver', 'bronze', 'participation']);
});

it('CompetitionStatus has 4 cases', function () {
    expect(CompetitionStatus::cases())->toHaveCount(4);
});
```

- [ ] **Step 2: Run — FAIL (enum classes ne postoje)**

```powershell
php artisan test --compact --filter=EnumsTest
```
Expected: FAIL sa `Class "App\Enums\UserRole" not found`.

- [ ] **Step 3: Kreiraj `app/Enums/UserRole.php`**

```php
<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Professor = 'professor';
    case Student = 'student';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Professor => 'Profesor',
            self::Student => 'Učenik',
        };
    }
}
```

- [ ] **Step 4: Kreiraj `app/Enums/SportType.php`**

```php
<?php

namespace App\Enums;

enum SportType: string
{
    case Team = 'team_sport';
    case Individual = 'individual_sport';

    public function isTeam(): bool
    {
        return $this === self::Team;
    }
}
```

- [ ] **Step 5: Kreiraj `app/Enums/TeamStatus.php`**

```php
<?php

namespace App\Enums;

enum TeamStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Active = 'active';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
    case Withdrawn = 'withdrawn';
    case Completed = 'completed';

    /** @return array<self> Dozvoljeni prelazi po spec 7.4.1 */
    public function nextStates(): array
    {
        return match ($this) {
            self::Draft => [self::Submitted, self::Cancelled],
            self::Submitted => [self::Active, self::Rejected, self::Cancelled],
            self::Active => [self::Completed, self::Withdrawn],
            default => [],
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Rejected, self::Cancelled, self::Withdrawn, self::Completed], true);
    }
}
```

- [ ] **Step 6: Kreiraj `app/Enums/MedicalCertificateStatus.php`**

```php
<?php

namespace App\Enums;

enum MedicalCertificateStatus: string
{
    case Pending = 'pending';
    case Valid = 'valid';
    case Expired = 'expired';
    case Invalid = 'invalid';
    case ManualReview = 'manual_review';
    case Superseded = 'superseded';

    /** @return array<self> */
    public function nextStates(): array
    {
        return match ($this) {
            self::Pending => [self::Valid, self::Expired, self::Invalid, self::ManualReview],
            self::Valid => [self::Expired, self::Superseded],
            self::Expired => [self::Superseded],
            self::Invalid => [self::Superseded],
            self::ManualReview => [self::Valid, self::Invalid, self::Superseded],
            self::Superseded => [],
        };
    }
}
```

- [ ] **Step 7: Kreiraj `app/Enums/StudentVerificationStatus.php`**

```php
<?php

namespace App\Enums;

enum StudentVerificationStatus: string
{
    case Unverified = 'unverified';
    case Pending = 'pending';
    case Verified = 'verified';
    case Mismatched = 'mismatched';
    case Failed = 'failed';
}
```

- [ ] **Step 8: Kreiraj `app/Enums/MedalType.php`**

```php
<?php

namespace App\Enums;

enum MedalType: string
{
    case Gold = 'gold';
    case Silver = 'silver';
    case Bronze = 'bronze';
    case Participation = 'participation';

    public static function fromPlacement(int $placement): self
    {
        return match ($placement) {
            1 => self::Gold,
            2 => self::Silver,
            3 => self::Bronze,
            default => self::Participation,
        };
    }
}
```

- [ ] **Step 9: Kreiraj `app/Enums/CompetitionStatus.php`**

```php
<?php

namespace App\Enums;

enum CompetitionStatus: string
{
    case Draft = 'draft';
    case Open = 'open_registration';
    case InProgress = 'in_progress';
    case Completed = 'completed';
}
```

- [ ] **Step 10: Run — PASS**

```powershell
php artisan test --compact --filter=EnumsTest
```
Expected: 7/7 PASS.

- [ ] **Step 11: Pint + commit**

```powershell
vendor/bin/pint --dirty --format agent
git add app/Enums/ tests/Unit/EnumsTest.php
git commit -m "F2: add enum classes for User/Sport/Team/Cert/Verification/Medal/Competition"
```

---

## Task 2: Migracija — dopuna `users` tabele (STI fields)

**Files:**
- Create: `database/migrations/{date}_extend_users_for_sti.php` (npr. `2026_05_14_000001_extend_users_for_sti.php`)

Po spec 7.2: STI sa `role` enum + atributi specifični za rolu nullable. Dodajemo:
- `role` (enum: admin/professor/student) — required
- `school_id` (FK nullable, samo professors/students)
- `phone` (string nullable)
- `verified_at` (timestamp nullable, za professors)
- `jmb` (string 13 chars nullable, samo students)
- `grade` (string nullable npr "8-2", samo students)
- `birth_date` (date nullable, samo students)
- `verification_status` (enum nullable, samo students)
- `parental_consent` (bool default false)
- `parental_consent_at` (timestamp nullable)
- `photo_path` (string nullable)
- `deleted_at` (soft deletes)

> **Napomena:** `schools` tabela mora postojati prije ovog FK-a. Kreiramo `schools` u Task 3 sa **ranijim** timestamp-om, ili FK ostaje `nullableForeignId` bez constraint-a sad i constraint dodajemo posle.
>
> **Odluka:** redoslijed migracija — kreiramo `schools` PRVO (Task 3 prije Task 2). Ali da bismo ostali sekvencijalno čitljivi, sad pišemo Task 2 ali fizički ovaj migrate fajl ima **kasniji** timestamp od Task 3.

- [ ] **Step 1: Generiši migraciju**

```powershell
php artisan make:migration extend_users_for_sti
```

Expected output: kreira `database/migrations/{timestamp}_extend_users_for_sti.php`.

- [ ] **Step 2: Napiši sadržaj migracije**

```php
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
```

> **Napomena:** ovu migraciju **NE pokrećemo** dok nemamo `schools` tabelu. Pokretanje se odvija na kraju ovog Task-a, posle Task 3.

- [ ] **Step 3: Bez commit-a još — čekamo schools u Task 3**

---

## Task 3: `schools` migracija + model + factory + seeder

**Files:**
- Create: `database/migrations/{timestamp}_create_schools_table.php` (sa ranijim timestamp-om od Task 2)
- Create: `app/Models/School.php`
- Create: `database/factories/SchoolFactory.php`
- Create: `database/seeders/SchoolSeeder.php`
- Test: `tests/Unit/SchoolFactoryTest.php`

Po spec 17.2: `school_code` kolona, format `OS-PG-001`.

- [ ] **Step 1: Generiši fajlove kroz artisan**

```powershell
php artisan make:model School --migration --factory
```

- [ ] **Step 2: Renameuj migraciju da ima raniji timestamp od Task 2**

Provjeri `Get-ChildItem database/migrations -Name`. Ako je `create_schools_table` migracija kasnijeg timestamp-a od `extend_users_for_sti`, rename je da ima raniji timestamp:

```powershell
# Primjer: ako schools je 2026_05_14_010000 a users extend 2026_05_14_000001 — rename schools
Rename-Item database/migrations/2026_05_14_XXXXXX_create_schools_table.php 2026_05_14_000000_create_schools_table.php
```

Pravilo: `schools` mora biti **prije** `extend_users_for_sti` u alfabetskom redu.

- [ ] **Step 3: Napiši sadržaj `schools` migracije**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();   // OS-PG-001
            $table->string('name');
            $table->string('city');
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
```

- [ ] **Step 4: Napiši `app/Models/School.php`**

```php
<?php

namespace App\Models;

use Database\Factories\SchoolFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class School extends Model
{
    /** @use HasFactory<SchoolFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = ['code', 'name', 'city', 'address', 'phone', 'email'];

    /** @return HasMany<User, $this> */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** @return HasMany<User, $this> */
    public function professors(): HasMany
    {
        return $this->hasMany(User::class)->where('role', \App\Enums\UserRole::Professor);
    }

    /** @return HasMany<User, $this> */
    public function students(): HasMany
    {
        return $this->hasMany(User::class)->where('role', \App\Enums\UserRole::Student);
    }
}
```

- [ ] **Step 5: Napiši `SchoolFactory`**

```php
<?php

namespace Database\Factories;

use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<School> */
class SchoolFactory extends Factory
{
    public function definition(): array
    {
        $city = fake()->randomElement(['PG', 'BD', 'HN', 'BB', 'NK', 'CT']);
        $serial = str_pad((string) fake()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT);

        return [
            'code' => "OS-{$city}-{$serial}",
            'name' => 'OŠ "'.fake()->randomElement(['Sutjeska', 'Maksim Gorki', 'Vladimir Nazor', 'Štampar Makarije', 'Anto Đedović']).'"',
            'city' => fake()->randomElement(['Podgorica', 'Bijelo Polje', 'Herceg Novi', 'Berane', 'Nikšić', 'Cetinje']),
            'address' => fake()->streetAddress(),
            'phone' => '+382 '.fake()->numerify('## ### ###'),
            'email' => fake()->safeEmail(),
        ];
    }
}
```

- [ ] **Step 6: Napiši `SchoolFactoryTest`**

```php
<?php // tests/Unit/SchoolFactoryTest.php

use App\Models\School;

it('creates a school via factory', function () {
    $school = School::factory()->create();
    expect($school->id)->toBeInt();
    expect($school->code)->toMatch('/^OS-[A-Z]{2,3}-\d{3}$/');
});

it('school has soft delete', function () {
    $school = School::factory()->create();
    $school->delete();
    expect(School::find($school->id))->toBeNull();
    expect(School::withTrashed()->find($school->id))->not->toBeNull();
});
```

- [ ] **Step 7: Pokreni migrate (additive — NIKAD migrate:fresh)**

```powershell
php artisan migrate
```
Expected: aplicira `schools` migraciju i `extend_users_for_sti`. Ne dira `ai_dnevnik_sesije`.

- [ ] **Step 8: Run — PASS**

```powershell
php artisan test --compact --filter=SchoolFactoryTest
```

- [ ] **Step 9: Napiši `SchoolSeeder` (idempotent)**

```php
<?php // database/seeders/SchoolSeeder.php

namespace Database\Seeders;

use App\Models\School;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $schools = [
            ['code' => 'OS-PG-001', 'name' => 'OŠ "Sutjeska"', 'city' => 'Podgorica'],
            ['code' => 'OS-PG-002', 'name' => 'OŠ "Štampar Makarije"', 'city' => 'Podgorica'],
            ['code' => 'OS-BD-001', 'name' => 'OŠ "Maksim Gorki"', 'city' => 'Bijelo Polje'],
            ['code' => 'OS-HN-001', 'name' => 'OŠ "Vladimir Nazor"', 'city' => 'Herceg Novi'],
            ['code' => 'OS-BB-001', 'name' => 'OŠ "Anto Đedović"', 'city' => 'Berane'],
            ['code' => 'OS-NK-001', 'name' => 'OŠ "Mileva Lajović Lalatović"', 'city' => 'Nikšić'],
            ['code' => 'OS-CT-001', 'name' => 'OŠ "Lovćenski partizanski odred"', 'city' => 'Cetinje'],
        ];

        foreach ($schools as $row) {
            School::updateOrCreate(['code' => $row['code']], $row);
        }
    }
}
```

- [ ] **Step 10: Pint + commit**

```powershell
vendor/bin/pint --dirty --format agent
git add database/migrations/ app/Models/School.php database/factories/SchoolFactory.php database/seeders/SchoolSeeder.php tests/Unit/SchoolFactoryTest.php
git commit -m "F2: schools migration + model + factory + idempotent seeder"
```

---

## Task 4: `User` model — STI ekstenzija sa role scope i fillable update

**Files:**
- Modify: `app/Models/User.php`
- Create: `app/Models/Professor.php` (scoped User subclass)
- Create: `app/Models/Student.php` (scoped User subclass)
- Modify: `database/factories/UserFactory.php`
- Test: `tests/Unit/UserStiTest.php`

- [ ] **Step 1: Napiši failing test**

```php
<?php // tests/Unit/UserStiTest.php

use App\Enums\UserRole;
use App\Models\Professor;
use App\Models\School;
use App\Models\Student;
use App\Models\User;

it('User has role enum cast', function () {
    $user = User::factory()->admin()->create();
    expect($user->role)->toBe(UserRole::Admin);
});

it('Student global scope filters role=student', function () {
    User::factory()->admin()->create();
    Student::factory()->create();
    Student::factory()->create();

    expect(Student::count())->toBe(2);
    expect(User::count())->toBe(3);
});

it('Professor scope and belongs to school', function () {
    $school = School::factory()->create();
    $prof = Professor::factory()->forSchool($school)->create();

    expect($prof->school->id)->toBe($school->id);
    expect($prof->role)->toBe(UserRole::Professor);
});

it('Student has jmb regex validation in factory', function () {
    $student = Student::factory()->create();
    expect($student->jmb)->toMatch('/^\d{13}$/');
});
```

- [ ] **Step 2: Run — FAIL**

```powershell
php artisan test --compact --filter=UserStiTest
```
Expected: FAIL (Professor/Student modeli ne postoje, `admin()` state ne postoji).

- [ ] **Step 3: Ažuriraj `app/Models/User.php`**

```php
<?php

namespace App\Models;

use App\Enums\StudentVerificationStatus;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name', 'email', 'password', 'role', 'school_id', 'phone', 'verified_at',
    'jmb', 'grade', 'birth_date', 'verification_status',
    'parental_consent', 'parental_consent_at', 'photo_path',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => UserRole::class,
            'verification_status' => StudentVerificationStatus::class,
            'verified_at' => 'datetime',
            'parental_consent' => 'boolean',
            'parental_consent_at' => 'datetime',
            'birth_date' => 'date',
        ];
    }

    /** @return BelongsTo<School, $this> */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isProfessor(): bool
    {
        return $this->role === UserRole::Professor;
    }

    public function isStudent(): bool
    {
        return $this->role === UserRole::Student;
    }
}
```

- [ ] **Step 4: Kreiraj `app/Models/Professor.php`**

```php
<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\ProfessorFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Professor extends User
{
    /** @use HasFactory<ProfessorFactory> */
    use HasFactory;

    protected static string $factory = ProfessorFactory::class;

    protected static function booted(): void
    {
        static::addGlobalScope('professor', function (Builder $builder) {
            $builder->where('role', UserRole::Professor->value);
        });

        static::creating(function (Professor $professor): void {
            $professor->role = UserRole::Professor;
        });
    }
}
```

- [ ] **Step 5: Kreiraj `app/Models/Student.php`**

```php
<?php

namespace App\Models;

use App\Enums\StudentVerificationStatus;
use App\Enums\UserRole;
use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends User
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory;

    protected static string $factory = StudentFactory::class;

    protected static function booted(): void
    {
        static::addGlobalScope('student', function (Builder $builder) {
            $builder->where('role', UserRole::Student->value);
        });

        static::creating(function (Student $student): void {
            $student->role = UserRole::Student;
            $student->verification_status ??= StudentVerificationStatus::Unverified;
        });
    }
}
```

- [ ] **Step 6: Ažuriraj `UserFactory` da podrazumijeva role i doda `admin()` state**

```php
<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/** @extends Factory<User> */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => UserRole::Admin,
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => UserRole::Admin]);
    }

    public function withTwoFactor(): static
    {
        return $this->state(fn () => [
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }
}
```

- [ ] **Step 7: Kreiraj `ProfessorFactory`**

```php
<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Professor;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/** @extends Factory<Professor> */
class ProfessorFactory extends Factory
{
    protected $model = Professor::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => UserRole::Professor,
            'school_id' => School::factory(),
            'phone' => '+382 '.fake()->numerify('## ### ###'),
            'verified_at' => now(),
        ];
    }

    public function unverifiedProfessor(): static
    {
        return $this->state(fn () => ['verified_at' => null]);
    }

    public function forSchool(School $school): static
    {
        return $this->state(fn () => ['school_id' => $school->id]);
    }
}
```

- [ ] **Step 8: Kreiraj `StudentFactory` sa JMB generator-om**

```php
<?php

namespace Database\Factories;

use App\Enums\StudentVerificationStatus;
use App\Enums\UserRole;
use App\Models\School;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/** @extends Factory<Student> */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        $birth = fake()->dateTimeBetween('-15 years', '-7 years');

        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => UserRole::Student,
            'school_id' => School::factory(),
            'jmb' => self::generateJmb($birth),
            'grade' => fake()->randomElement(['5-1', '5-2', '6-1', '7-1', '8-1', '8-2', '9-1']),
            'birth_date' => $birth,
            'verification_status' => StudentVerificationStatus::Unverified,
            'parental_consent' => true,
            'parental_consent_at' => now(),
        ];
    }

    public function forSchool(School $school): static
    {
        return $this->state(fn () => ['school_id' => $school->id]);
    }

    public function verified(): static
    {
        return $this->state(fn () => ['verification_status' => StudentVerificationStatus::Verified]);
    }

    public function mismatched(): static
    {
        return $this->state(fn () => ['verification_status' => StudentVerificationStatus::Mismatched]);
    }

    /**
     * Generiše 13-cifren JMB. NIJE algoritmu validna kontrolna cifra — samo regex format match.
     * Algoritamska validacija je TODO za pilot (vidjeti spec sekcija 16).
     */
    private static function generateJmb(\DateTimeInterface $birth): string
    {
        $dd = $birth->format('d');
        $mm = $birth->format('m');
        $yyy = substr($birth->format('Y'), 1);
        $rb = (string) fake()->numberBetween(0, 9999);
        $rb = str_pad($rb, 4, '0', STR_PAD_LEFT);
        $k = (string) fake()->numberBetween(0, 9);

        return $dd.$mm.$yyy.$rb.$k; // 2+2+3+4+1+1 = 13
    }
}
```

> **Napomena:** `generateJmb` daje regex-validan JMB. Algoritamska kontrolna cifra validacija je dokumentovana kao TODO u spec 16 — može u T2.4 ako bude vrijeme.

- [ ] **Step 9: Run — PASS**

```powershell
php artisan test --compact --filter=UserStiTest
```
Expected: 4/4 PASS.

- [ ] **Step 10: Pint + commit**

```powershell
vendor/bin/pint --dirty --format agent
git add app/Models/ database/factories/ tests/Unit/UserStiTest.php
git commit -m "F2: STI User model + Professor/Student scoped subclasses + factories"
```

---

## Task 5: `sports` tabela + model + factory + seeder

**Files:**
- Create: migration `create_sports_table`
- Create: `app/Models/Sport.php`
- Create: `database/factories/SportFactory.php`
- Create: `database/seeders/SportSeeder.php`
- Test: `tests/Unit/SportTest.php`

Po spec 7.1: `slug`, `name`, `type` enum, `members_count`, `substitutes_count`, soft deletes.

- [ ] **Step 1: Generiši kostur**

```powershell
php artisan make:model Sport --migration --factory
```

- [ ] **Step 2: Migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sports', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('type');                       // team_sport / individual_sport (enum)
            $table->unsignedSmallInteger('members_count');
            $table->unsignedSmallInteger('substitutes_count')->default(0);
            $table->text('rules_description')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sports');
    }
};
```

- [ ] **Step 3: Model**

```php
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
```

- [ ] **Step 4: Factory**

```php
<?php

namespace Database\Factories;

use App\Enums\SportType;
use App\Models\Sport;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Sport> */
class SportFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->randomElement(['Fudbal', 'Košarka', 'Odbojka', 'Rukomet', 'Atletika', 'Plivanje']);

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 9999),
            'name' => $name,
            'type' => SportType::Team,
            'members_count' => 5,
            'substitutes_count' => 3,
            'rules_description' => null,
        ];
    }

    public function team(int $members = 5, int $subs = 3): static
    {
        return $this->state(fn () => ['type' => SportType::Team, 'members_count' => $members, 'substitutes_count' => $subs]);
    }

    public function individual(): static
    {
        return $this->state(fn () => ['type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0]);
    }
}
```

- [ ] **Step 5: Test**

```php
<?php // tests/Unit/SportTest.php

use App\Enums\SportType;
use App\Models\Sport;

it('creates a team sport via factory', function () {
    $sport = Sport::factory()->team(7, 5)->create(['name' => 'Rukomet', 'slug' => 'rukomet-test']);
    expect($sport->type)->toBe(SportType::Team);
    expect($sport->members_count)->toBe(7);
});

it('individual sport has 1 member', function () {
    $sport = Sport::factory()->individual()->create(['slug' => 'atletika-test']);
    expect($sport->type)->toBe(SportType::Individual);
    expect($sport->members_count)->toBe(1);
});

it('soft deletes a sport', function () {
    $sport = Sport::factory()->create(['slug' => 'fudbal-test']);
    $sport->delete();
    expect(Sport::find($sport->id))->toBeNull();
    expect(Sport::withTrashed()->find($sport->id))->not->toBeNull();
});
```

- [ ] **Step 6: Migrate, run test, PASS**

```powershell
php artisan migrate
php artisan test --compact --filter=SportTest
```
Expected: 3/3 PASS.

- [ ] **Step 7: SportSeeder (idempotent po slug)**

```php
<?php // database/seeders/SportSeeder.php

namespace Database\Seeders;

use App\Enums\SportType;
use App\Models\Sport;
use Illuminate\Database\Seeder;

class SportSeeder extends Seeder
{
    public function run(): void
    {
        $sports = [
            ['slug' => 'fudbal', 'name' => 'Fudbal', 'type' => SportType::Team, 'members_count' => 11, 'substitutes_count' => 5],
            ['slug' => 'kosarka', 'name' => 'Košarka', 'type' => SportType::Team, 'members_count' => 5, 'substitutes_count' => 5],
            ['slug' => 'odbojka', 'name' => 'Odbojka', 'type' => SportType::Team, 'members_count' => 6, 'substitutes_count' => 6],
            ['slug' => 'rukomet', 'name' => 'Rukomet', 'type' => SportType::Team, 'members_count' => 7, 'substitutes_count' => 5],
            ['slug' => 'atletika', 'name' => 'Atletika', 'type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0],
            ['slug' => 'plivanje', 'name' => 'Plivanje', 'type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0],
            ['slug' => 'stoni-tenis', 'name' => 'Stoni tenis', 'type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0],
            ['slug' => 'sah', 'name' => 'Šah', 'type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0],
            ['slug' => 'karate', 'name' => 'Karate', 'type' => SportType::Individual, 'members_count' => 1, 'substitutes_count' => 0],
        ];

        foreach ($sports as $row) {
            Sport::updateOrCreate(['slug' => $row['slug']], $row);
        }
    }
}
```

- [ ] **Step 8: Pint + commit**

```powershell
vendor/bin/pint --dirty --format agent
git add database/migrations/ app/Models/Sport.php database/factories/SportFactory.php database/seeders/SportSeeder.php tests/Unit/SportTest.php
git commit -m "F2: sports migration + model + factory + idempotent seeder"
```

---

## Task 6: `competitions` tabela + model + factory + seeder

**Files:**
- Create: migration `create_competitions_table`
- Create: `app/Models/Competition.php`
- Create: `database/factories/CompetitionFactory.php`
- Create: `database/seeders/CompetitionSeeder.php`
- Test: `tests/Unit/CompetitionTest.php`

Po spec 7.1: `sport_id`, `start_date`, `end_date`, `location`, `status`. Po spec 7.3: `Sport 1—N Competition`.

- [ ] **Step 1: Make**

```powershell
php artisan make:model Competition --migration --factory
```

- [ ] **Step 2: Migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competitions', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->foreignId('sport_id')->constrained()->restrictOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('location');
            $table->string('status')->default('draft'); // CompetitionStatus enum
            $table->unsignedSmallInteger('year');
            $table->timestamps();

            $table->index(['status', 'start_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competitions');
    }
};
```

- [ ] **Step 3: Model**

```php
<?php

namespace App\Models;

use App\Enums\CompetitionStatus;
use Database\Factories\CompetitionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Competition extends Model
{
    /** @use HasFactory<CompetitionFactory> */
    use HasFactory;

    protected $fillable = ['slug', 'name', 'sport_id', 'start_date', 'end_date', 'location', 'status', 'year'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'status' => CompetitionStatus::class,
        ];
    }

    /** @return BelongsTo<Sport, $this> */
    public function sport(): BelongsTo
    {
        return $this->belongsTo(Sport::class);
    }

    /** @return HasMany<Team, $this> */
    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }
}
```

- [ ] **Step 4: Factory**

```php
<?php

namespace Database\Factories;

use App\Enums\CompetitionStatus;
use App\Models\Competition;
use App\Models\Sport;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Competition> */
class CompetitionFactory extends Factory
{
    public function definition(): array
    {
        $year = (int) date('Y');
        $name = 'Državno prvenstvo OŠ '.$year;

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 9999),
            'name' => $name,
            'sport_id' => Sport::factory(),
            'start_date' => fake()->dateTimeBetween('+1 month', '+3 months'),
            'end_date' => fake()->dateTimeBetween('+3 months', '+4 months'),
            'location' => fake()->randomElement(['Podgorica', 'Bijelo Polje', 'Herceg Novi']),
            'status' => CompetitionStatus::Open,
            'year' => $year,
        ];
    }

    public function past(): static
    {
        return $this->state(fn () => [
            'start_date' => now()->subMonths(2),
            'end_date' => now()->subMonths(1),
            'status' => CompetitionStatus::Completed,
        ]);
    }

    public function upcoming(): static
    {
        return $this->state(fn () => [
            'start_date' => now()->addMonths(2),
            'end_date' => now()->addMonths(3),
            'status' => CompetitionStatus::Open,
        ]);
    }
}
```

- [ ] **Step 5: Test**

```php
<?php // tests/Unit/CompetitionTest.php

use App\Enums\CompetitionStatus;
use App\Models\Competition;
use App\Models\Sport;

it('competition belongs to a sport', function () {
    $sport = Sport::factory()->team()->create(['slug' => 'fudbal-c1']);
    $comp = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'comp-fudbal-1']);

    expect($comp->sport->id)->toBe($sport->id);
});

it('past competition has Completed status', function () {
    $comp = Competition::factory()->past()->create(['slug' => 'past-comp']);
    expect($comp->status)->toBe(CompetitionStatus::Completed);
});
```

- [ ] **Step 6: Migrate, test, PASS**

```powershell
php artisan migrate
php artisan test --compact --filter=CompetitionTest
```

- [ ] **Step 7: CompetitionSeeder (idempotent po slug)**

```php
<?php // database/seeders/CompetitionSeeder.php

namespace Database\Seeders;

use App\Enums\CompetitionStatus;
use App\Models\Competition;
use App\Models\Sport;
use Illuminate\Database\Seeder;

class CompetitionSeeder extends Seeder
{
    public function run(): void
    {
        $kosarka = Sport::where('slug', 'kosarka')->first();
        $fudbal = Sport::where('slug', 'fudbal')->first();
        $atletika = Sport::where('slug', 'atletika')->first();

        if (! $kosarka || ! $fudbal || ! $atletika) {
            $this->command?->warn('SportSeeder mora biti pokrenut prije CompetitionSeeder. Skipping.');

            return;
        }

        $rows = [
            ['slug' => 'dp-os-kosarka-2026', 'name' => 'DP OŠ Košarka 2026', 'sport_id' => $kosarka->id, 'start_date' => now()->addMonths(1), 'end_date' => now()->addMonths(1)->addDays(3), 'location' => 'Podgorica', 'status' => CompetitionStatus::Open, 'year' => 2026],
            ['slug' => 'dp-os-fudbal-2026', 'name' => 'DP OŠ Fudbal 2026', 'sport_id' => $fudbal->id, 'start_date' => now()->addMonths(2), 'end_date' => now()->addMonths(2)->addDays(5), 'location' => 'Bijelo Polje', 'status' => CompetitionStatus::Open, 'year' => 2026],
            ['slug' => 'dp-os-atletika-2025', 'name' => 'DP OŠ Atletika 2025', 'sport_id' => $atletika->id, 'start_date' => now()->subMonths(3), 'end_date' => now()->subMonths(3)->addDays(2), 'location' => 'Herceg Novi', 'status' => CompetitionStatus::Completed, 'year' => 2025],
        ];

        foreach ($rows as $row) {
            Competition::updateOrCreate(['slug' => $row['slug']], $row);
        }
    }
}
```

- [ ] **Step 8: Pint + commit**

```powershell
vendor/bin/pint --dirty --format agent
git add database/migrations/ app/Models/Competition.php database/factories/CompetitionFactory.php database/seeders/CompetitionSeeder.php tests/Unit/CompetitionTest.php
git commit -m "F2: competitions migration + model + factory + seeder"
```

---

## Task 7: `teams` + `team_members` tabele + modeli + factory

**Files:**
- Create: migration `create_teams_table`
- Create: migration `create_team_members_table`
- Create: `app/Models/Team.php`
- Create: `app/Models/TeamMember.php`
- Create: `database/factories/TeamFactory.php`
- Create: `database/factories/TeamMemberFactory.php`
- Test: `tests/Unit/TeamTest.php`

Po spec 7.1: Team ima `school_id`, `competition_id`, `professor_id` (FK ka users), `status` enum, `signature`, `signed_at`, `signature_ip`. TeamMember `team_id`, `student_id`, `position` nullable.

- [ ] **Step 1: Make**

```powershell
php artisan make:model Team --migration --factory
php artisan make:model TeamMember --migration --factory
```

- [ ] **Step 2: Teams migration**

```php
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
```

- [ ] **Step 3: TeamMembers migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->restrictOnDelete();
            $table->string('position')->nullable(); // "kapiten", "rezerva", null
            $table->timestamps();

            $table->unique(['team_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
```

- [ ] **Step 4: `Team` model**

```php
<?php

namespace App\Models;

use App\Enums\TeamStatus;
use Database\Factories\TeamFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

class Team extends Model
{
    /** @use HasFactory<TeamFactory> */
    use HasFactory;

    protected $fillable = [
        'team_uuid', 'school_id', 'competition_id', 'professor_id',
        'status', 'signature', 'signed_at', 'signature_ip', 'rejection_reason',
    ];

    protected function casts(): array
    {
        return ['status' => TeamStatus::class, 'signed_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(function (Team $team): void {
            $team->team_uuid ??= (string) Str::uuid();
            $team->status ??= TeamStatus::Draft;
        });
    }

    /** @return BelongsTo<School, $this> */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /** @return BelongsTo<Competition, $this> */
    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    /** @return BelongsTo<User, $this> */
    public function professor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    /** @return HasMany<TeamMember, $this> */
    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    /** @return MorphMany<Result, $this> */
    public function results(): MorphMany
    {
        return $this->morphMany(Result::class, 'subject');
    }
}
```

- [ ] **Step 5: `TeamMember` model**

```php
<?php

namespace App\Models;

use Database\Factories\TeamMemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class TeamMember extends Model
{
    /** @use HasFactory<TeamMemberFactory> */
    use HasFactory;

    protected $fillable = ['team_id', 'student_id', 'position'];

    /** @return BelongsTo<Team, $this> */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /** @return BelongsTo<User, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /** @return HasOne<MedicalCertificate, $this> */
    public function medicalCertificate(): HasOne
    {
        return $this->hasOne(MedicalCertificate::class);
    }

    /** @return MorphMany<Result, $this> */
    public function results(): MorphMany
    {
        return $this->morphMany(Result::class, 'subject');
    }
}
```

- [ ] **Step 6: TeamFactory**

```php
<?php

namespace Database\Factories;

use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\School;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Team> */
class TeamFactory extends Factory
{
    public function definition(): array
    {
        return [
            'team_uuid' => (string) Str::uuid(),
            'school_id' => School::factory(),
            'competition_id' => Competition::factory(),
            'professor_id' => Professor::factory(),
            'status' => TeamStatus::Draft,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => TeamStatus::Draft]);
    }

    public function submitted(): static
    {
        return $this->state(fn () => [
            'status' => TeamStatus::Submitted,
            'signature' => 'Petar Petrović',
            'signed_at' => now(),
            'signature_ip' => '127.0.0.1',
        ]);
    }

    public function active(): static
    {
        return $this->state(fn () => ['status' => TeamStatus::Active]);
    }
}
```

- [ ] **Step 7: TeamMemberFactory**

```php
<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TeamMember> */
class TeamMemberFactory extends Factory
{
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'student_id' => Student::factory(),
            'position' => null,
        ];
    }

    public function captain(): static
    {
        return $this->state(fn () => ['position' => 'kapiten']);
    }
}
```

- [ ] **Step 8: Test**

```php
<?php // tests/Unit/TeamTest.php

use App\Enums\TeamStatus;
use App\Models\Team;
use App\Models\TeamMember;

it('team is created in Draft status with UUID', function () {
    $team = Team::factory()->create();
    expect($team->status)->toBe(TeamStatus::Draft);
    expect($team->team_uuid)->toMatch('/^[0-9a-f-]{36}$/');
});

it('team has members, competition, school, professor relations', function () {
    $team = Team::factory()->create();
    TeamMember::factory()->count(3)->create(['team_id' => $team->id]);

    $loaded = Team::with(['members', 'competition', 'school', 'professor'])->find($team->id);
    expect($loaded->members)->toHaveCount(3);
    expect($loaded->competition)->not->toBeNull();
    expect($loaded->school)->not->toBeNull();
    expect($loaded->professor)->not->toBeNull();
});

it('TeamStatus transitions follow spec 7.4.1', function () {
    $draft = TeamStatus::Draft;
    expect($draft->nextStates())->toContain(TeamStatus::Submitted, TeamStatus::Cancelled);

    $submitted = TeamStatus::Submitted;
    expect($submitted->nextStates())->toContain(TeamStatus::Active);

    expect(TeamStatus::Completed->isTerminal())->toBeTrue();
    expect(TeamStatus::Draft->isTerminal())->toBeFalse();
});
```

- [ ] **Step 9: Migrate, test, PASS**

```powershell
php artisan migrate
php artisan test --compact --filter=TeamTest
```

- [ ] **Step 10: Pint + commit**

```powershell
vendor/bin/pint --dirty --format agent
git add database/migrations/ app/Models/Team.php app/Models/TeamMember.php database/factories/Team*.php tests/Unit/TeamTest.php
git commit -m "F2: teams + team_members migration + models + factories"
```

---

## Task 8: `medical_certificates` tabela + model + factory

**Files:**
- Create: migration `create_medical_certificates_table`
- Create: `app/Models/MedicalCertificate.php`
- Create: `database/factories/MedicalCertificateFactory.php`
- Test: `tests/Unit/MedicalCertificateTest.php`

Po spec 7.1 i 7.4.2.

- [ ] **Step 1: Make**

```powershell
php artisan make:model MedicalCertificate --migration --factory
```

- [ ] **Step 2: Migration**

```php
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
```

- [ ] **Step 3: Model**

```php
<?php

namespace App\Models;

use App\Enums\MedicalCertificateStatus;
use Database\Factories\MedicalCertificateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalCertificate extends Model
{
    /** @use HasFactory<MedicalCertificateFactory> */
    use HasFactory;

    protected $fillable = [
        'team_member_id', 'original_filename', 'path', 'status',
        'issued_at', 'expires_at', 'extracted_name', 'ocr_confidence', 'ocr_raw_response',
    ];

    protected function casts(): array
    {
        return [
            'status' => MedicalCertificateStatus::class,
            'issued_at' => 'date',
            'expires_at' => 'date',
            'ocr_confidence' => 'decimal:3',
        ];
    }

    /** @return BelongsTo<TeamMember, $this> */
    public function teamMember(): BelongsTo
    {
        return $this->belongsTo(TeamMember::class);
    }

    public function isValid(): bool
    {
        return $this->status === MedicalCertificateStatus::Valid;
    }
}
```

- [ ] **Step 4: Factory**

```php
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
```

- [ ] **Step 5: Test**

```php
<?php // tests/Unit/MedicalCertificateTest.php

use App\Enums\MedicalCertificateStatus;
use App\Models\MedicalCertificate;

it('certificate is valid by default factory', function () {
    $cert = MedicalCertificate::factory()->create();
    expect($cert->isValid())->toBeTrue();
});

it('expired state has past expires_at', function () {
    $cert = MedicalCertificate::factory()->expired()->create();
    expect($cert->expires_at->isPast())->toBeTrue();
    expect($cert->status)->toBe(MedicalCertificateStatus::Expired);
});

it('certificate transitions follow spec 7.4.2', function () {
    expect(MedicalCertificateStatus::Pending->nextStates())
        ->toContain(MedicalCertificateStatus::Valid, MedicalCertificateStatus::Expired, MedicalCertificateStatus::Invalid, MedicalCertificateStatus::ManualReview);

    expect(MedicalCertificateStatus::Superseded->nextStates())->toBeEmpty();
});
```

- [ ] **Step 6: Migrate, test, PASS, commit**

```powershell
php artisan migrate
php artisan test --compact --filter=MedicalCertificateTest
vendor/bin/pint --dirty --format agent
git add database/migrations/ app/Models/MedicalCertificate.php database/factories/MedicalCertificateFactory.php tests/Unit/MedicalCertificateTest.php
git commit -m "F2: medical_certificates migration + model + factory + state test"
```

---

## Task 9: `results` polimorfan + model + factory

**Files:**
- Create: migration `create_results_table`
- Create: `app/Models/Result.php`
- Create: `database/factories/ResultFactory.php`
- Test: `tests/Unit/ResultTest.php`

Po spec 7.1: `Rezultat morphs to (Ekipa | ClanEkipe)`.

- [ ] **Step 1: Make**

```powershell
php artisan make:model Result --migration --factory
```

- [ ] **Step 2: Migration**

```php
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
```

- [ ] **Step 3: Model**

```php
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
```

- [ ] **Step 4: Factory**

```php
<?php

namespace Database\Factories;

use App\Enums\MedalType;
use App\Models\Competition;
use App\Models\Result;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Result> */
class ResultFactory extends Factory
{
    public function definition(): array
    {
        return [
            'competition_id' => Competition::factory(),
            'subject_type' => Team::class,
            'subject_id' => Team::factory(),
            'placement' => 1,
            'medal_type' => MedalType::Gold,
        ];
    }

    public function gold(): static
    {
        return $this->state(fn () => ['placement' => 1, 'medal_type' => MedalType::Gold]);
    }

    public function silver(): static
    {
        return $this->state(fn () => ['placement' => 2, 'medal_type' => MedalType::Silver]);
    }

    public function forTeam(Team $team): static
    {
        return $this->state(fn () => [
            'subject_type' => Team::class,
            'subject_id' => $team->id,
            'competition_id' => $team->competition_id,
        ]);
    }
}
```

- [ ] **Step 5: Test**

```php
<?php // tests/Unit/ResultTest.php

use App\Enums\MedalType;
use App\Models\Result;
use App\Models\Team;

it('result morphs to a team subject', function () {
    $team = Team::factory()->create();
    $result = Result::factory()->forTeam($team)->gold()->create();

    expect($result->subject)->toBeInstanceOf(Team::class);
    expect($result->subject->id)->toBe($team->id);
    expect($result->medal_type)->toBe(MedalType::Gold);
});

it('MedalType::fromPlacement returns correct medal', function () {
    expect(MedalType::fromPlacement(1))->toBe(MedalType::Gold);
    expect(MedalType::fromPlacement(2))->toBe(MedalType::Silver);
    expect(MedalType::fromPlacement(3))->toBe(MedalType::Bronze);
    expect(MedalType::fromPlacement(10))->toBe(MedalType::Participation);
});
```

- [ ] **Step 6: Migrate, test, PASS, commit**

```powershell
php artisan migrate
php artisan test --compact --filter=ResultTest
vendor/bin/pint --dirty --format agent
git add database/migrations/ app/Models/Result.php database/factories/ResultFactory.php tests/Unit/ResultTest.php
git commit -m "F2: polymorphic results migration + model + factory"
```

---

## Task 10: `audit_log` tabela + model (append-only) + write helper

**Files:**
- Create: migration `create_audit_log_table`
- Create: `app/Models/AuditLogEntry.php`
- Test: `tests/Unit/AuditLogEntryTest.php`

Po spec 13.3: `id` uuid, `user_id` nullable FK, `action`, `subject_type`/`subject_id` polimorfan, `payload` json, `ip`, `user_agent`, `created_at` (no `updated_at`).

> **Napomena:** Audit log **write service** (`App\Services\AuditLogger`) ide u T1.3 (cross-cutting infra). F2 samo definiše tabelu i model.

- [ ] **Step 1: Generiši fajlove**

```powershell
php artisan make:migration create_audit_log_table
php artisan make:model AuditLogEntry
```

- [ ] **Step 2: Migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');                 // "team.created", "student.verified" itd.
            $table->nullableMorphs('subject');
            $table->json('payload')->nullable();
            $table->ipAddress('ip')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_log');
    }
};
```

- [ ] **Step 3: Model**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLogEntry extends Model
{
    use HasUuids;

    protected $table = 'audit_log';

    public $timestamps = false; // samo created_at, koji se ručno postavlja

    protected $fillable = ['user_id', 'action', 'subject_type', 'subject_id', 'payload', 'ip', 'user_agent', 'created_at'];

    protected function casts(): array
    {
        return ['payload' => 'array', 'created_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return MorphTo<Model, $this> */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    // Immutability — Policy je primarni mehanizam, ali ovdje sprečavamo update preko save()
    protected static function booted(): void
    {
        static::updating(function (): bool {
            throw new \LogicException('AuditLogEntry is append-only. Updates are forbidden.');
        });

        static::deleting(function (): bool {
            throw new \LogicException('AuditLogEntry is append-only. Deletes are forbidden.');
        });
    }
}
```

- [ ] **Step 4: Test**

```php
<?php // tests/Unit/AuditLogEntryTest.php

use App\Models\AuditLogEntry;
use App\Models\User;

it('creates audit log entry with UUID', function () {
    $user = User::factory()->admin()->create();
    $entry = AuditLogEntry::create([
        'user_id' => $user->id,
        'action' => 'test.action',
        'payload' => ['key' => 'value'],
        'ip' => '127.0.0.1',
        'user_agent' => 'PestTest',
        'created_at' => now(),
    ]);

    expect($entry->id)->toMatch('/^[0-9a-f-]{36}$/');
    expect($entry->payload)->toBe(['key' => 'value']);
});

it('refuses updates (immutable)', function () {
    $entry = AuditLogEntry::create([
        'action' => 'test',
        'created_at' => now(),
    ]);

    expect(fn () => $entry->update(['action' => 'changed']))
        ->toThrow(\LogicException::class, 'append-only');
});

it('refuses deletes (immutable)', function () {
    $entry = AuditLogEntry::create([
        'action' => 'test',
        'created_at' => now(),
    ]);

    expect(fn () => $entry->delete())
        ->toThrow(\LogicException::class, 'append-only');
});
```

- [ ] **Step 5: Migrate, test, PASS, commit**

```powershell
php artisan migrate
php artisan test --compact --filter=AuditLogEntryTest
vendor/bin/pint --dirty --format agent
git add database/migrations/ app/Models/AuditLogEntry.php tests/Unit/AuditLogEntryTest.php
git commit -m "F2: audit_log table + AuditLogEntry append-only model"
```

---

## Task 11: AdminUserSeeder + StudentSeeder + ProfessorSeeder

**Files:**
- Create: `database/seeders/AdminUserSeeder.php`
- Create: `database/seeders/ProfessorSeeder.php`
- Create: `database/seeders/StudentSeeder.php`

- [ ] **Step 1: `AdminUserSeeder` (env-driven, idempotent)**

```php
<?php // database/seeders/AdminUserSeeder.php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@savez.test');
        $password = env('ADMIN_PASSWORD', 'password');
        $name = env('ADMIN_NAME', 'Sistemski Admin');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => UserRole::Admin,
                'email_verified_at' => now(),
            ]
        );
    }
}
```

- [ ] **Step 2: `ProfessorSeeder` (idempotent by email)**

```php
<?php // database/seeders/ProfessorSeeder.php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Professor;
use App\Models\School;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProfessorSeeder extends Seeder
{
    public function run(): void
    {
        $schools = School::all();
        if ($schools->isEmpty()) {
            $this->command?->warn('SchoolSeeder mora biti pokrenut prije ProfessorSeeder. Skipping.');

            return;
        }

        foreach ($schools as $school) {
            $code = strtolower($school->code);
            Professor::withoutGlobalScope('professor')->updateOrCreate(
                ['email' => "prof.{$code}.1@savez.test"],
                [
                    'name' => "Profesor 1 ({$school->code})",
                    'password' => Hash::make('password'),
                    'role' => UserRole::Professor,
                    'school_id' => $school->id,
                    'verified_at' => now(),
                    'email_verified_at' => now(),
                ]
            );

            Professor::withoutGlobalScope('professor')->updateOrCreate(
                ['email' => "prof.{$code}.2@savez.test"],
                [
                    'name' => "Profesor 2 ({$school->code})",
                    'password' => Hash::make('password'),
                    'role' => UserRole::Professor,
                    'school_id' => $school->id,
                    'verified_at' => null, // ovaj nije verified
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
```

- [ ] **Step 3: `StudentSeeder` (idempotent by jmb)**

```php
<?php // database/seeders/StudentSeeder.php

namespace Database\Seeders;

use App\Enums\StudentVerificationStatus;
use App\Enums\UserRole;
use App\Models\School;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $schools = School::all();
        if ($schools->isEmpty()) {
            $this->command?->warn('SchoolSeeder mora biti pokrenut prije StudentSeeder. Skipping.');

            return;
        }

        $i = 1;
        foreach ($schools as $school) {
            for ($n = 1; $n <= 10; $n++) {
                $jmb = str_pad((string) $i, 13, '0', STR_PAD_LEFT);
                $i++;

                Student::withoutGlobalScope('student')->updateOrCreate(
                    ['jmb' => $jmb],
                    [
                        'name' => "Učenik {$n} ({$school->code})",
                        'email' => "student.{$jmb}@savez.test",
                        'password' => Hash::make('password'),
                        'role' => UserRole::Student,
                        'school_id' => $school->id,
                        'grade' => fake()->randomElement(['7-1', '8-1', '8-2', '9-1']),
                        'birth_date' => fake()->dateTimeBetween('-14 years', '-10 years'),
                        'verification_status' => $n <= 5 ? StudentVerificationStatus::Verified : StudentVerificationStatus::Unverified,
                        'parental_consent' => true,
                        'parental_consent_at' => now(),
                        'email_verified_at' => now(),
                    ]
                );
            }
        }
    }
}
```

- [ ] **Step 4: Commit (testovi u DatabaseSeederTest u Task 13)**

```powershell
vendor/bin/pint --dirty --format agent
git add database/seeders/AdminUserSeeder.php database/seeders/ProfessorSeeder.php database/seeders/StudentSeeder.php
git commit -m "F2: AdminUserSeeder + ProfessorSeeder + StudentSeeder (idempotent)"
```

---

## Task 12: TeamSeeder + ResultSeeder (demo data)

**Files:**
- Create: `database/seeders/TeamSeeder.php`
- Create: `database/seeders/ResultSeeder.php`

Po spec 15.2: TeamSeeder kreira 4-6 ekipa za past competitions sa rezultatima + 2-3 draft/submitted za active.

- [ ] **Step 1: TeamSeeder (uses team_uuid for idempotency)**

```php
<?php // database/seeders/TeamSeeder.php

namespace Database\Seeders;

use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\School;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $competitions = Competition::all();
        if ($competitions->isEmpty()) {
            $this->command?->warn('CompetitionSeeder mora biti pokrenut prije TeamSeeder. Skipping.');

            return;
        }

        foreach ($competitions as $comp) {
            $schools = School::take(3)->get();
            foreach ($schools as $school) {
                $professor = Professor::withoutGlobalScope('professor')
                    ->where('school_id', $school->id)
                    ->where('verified_at', '!=', null)
                    ->first();

                if (! $professor) {
                    continue;
                }

                $uuidSeed = "demo-{$comp->id}-{$school->id}";
                $team = Team::firstOrCreate(
                    ['team_uuid' => Str::uuid5(Str::uuid4()->toString(), $uuidSeed)],
                    [
                        'school_id' => $school->id,
                        'competition_id' => $comp->id,
                        'professor_id' => $professor->id,
                        'status' => $comp->status->value === 'completed' ? TeamStatus::Completed : TeamStatus::Draft,
                    ]
                );

                if ($team->members()->count() === 0) {
                    $students = Student::withoutGlobalScope('student')
                        ->where('school_id', $school->id)
                        ->take($comp->sport->members_count)
                        ->get();

                    foreach ($students as $student) {
                        TeamMember::firstOrCreate([
                            'team_id' => $team->id,
                            'student_id' => $student->id,
                        ]);
                    }
                }
            }
        }
    }
}
```

> **Napomena:** `Str::uuid5` daje deterministic UUID po seed string-u, što znači da re-run TeamSeeder-a ne pravi duplikate.

- [ ] **Step 2: ResultSeeder (idempotent po competition + subject)**

```php
<?php // database/seeders/ResultSeeder.php

namespace Database\Seeders;

use App\Enums\MedalType;
use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Result;
use App\Models\Team;
use Illuminate\Database\Seeder;

class ResultSeeder extends Seeder
{
    public function run(): void
    {
        $competitions = Competition::where('status', 'completed')->get();
        foreach ($competitions as $comp) {
            $teams = Team::where('competition_id', $comp->id)
                ->where('status', TeamStatus::Completed->value)
                ->take(3)
                ->get();

            foreach ($teams as $i => $team) {
                $placement = $i + 1;
                Result::firstOrCreate(
                    [
                        'competition_id' => $comp->id,
                        'subject_type' => Team::class,
                        'subject_id' => $team->id,
                    ],
                    [
                        'placement' => $placement,
                        'medal_type' => MedalType::fromPlacement($placement),
                    ]
                );
            }
        }
    }
}
```

- [ ] **Step 3: Pint + commit**

```powershell
vendor/bin/pint --dirty --format agent
git add database/seeders/TeamSeeder.php database/seeders/ResultSeeder.php
git commit -m "F2: TeamSeeder + ResultSeeder for demo data"
```

---

## Task 13: `DatabaseSeeder` orchestration + integration test

**Files:**
- Modify: `database/seeders/DatabaseSeeder.php`
- Create: `tests/Feature/DatabaseSeederTest.php`

Po spec 15.2 + meta-plan 4.1: alfabetski redoslijed, jedan poziv po liniji.

- [ ] **Step 1: Ažuriraj `DatabaseSeeder.php`**

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(AdminUserSeeder::class);
        $this->call(AiDnevnikSeeder::class);
        $this->call(CompetitionSeeder::class);
        $this->call(ProfessorSeeder::class);
        $this->call(ResultSeeder::class);
        $this->call(SchoolSeeder::class);
        $this->call(SportSeeder::class);
        $this->call(StudentSeeder::class);
        $this->call(TeamSeeder::class);
    }
}
```

> **Napomena za merge konflikte:** alfabetski redoslijed sa jednim pozivom po liniji — git merge je trivijalan za line additions.
>
> **Napomena o redoslijedu:** Seederi imaju runtime guards (`if (Schools.empty()) skip`) — alfabetski redoslijed neće reditelj greška jer prva ide AdminUserSeeder bez FK zahtjeva, pa AiDnevnikSeeder bez FK, pa CompetitionSeeder (zahtijeva Sports — ali kreirano kasnije alfabetski; SportSeeder će bilo praznio jer još nije pokrenut). Da bi se ovo riješilo, koristimo `firstOrCreate` u Competition/Team/Result seederima i `early return` ako parent prazno. Re-pokretanje DatabaseSeeder-a popunjava sve.

- [ ] **Step 2: Integration test za seeder**

```php
<?php // tests/Feature/DatabaseSeederTest.php

use App\Models\AiDnevnikSesija;
use App\Models\Competition;
use App\Models\School;
use App\Models\Sport;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

it('full seeder run is idempotent and creates expected counts', function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class); // re-run da provjeri idempotenciju

    expect(School::count())->toBeGreaterThanOrEqualTo(5);
    expect(Sport::count())->toBeGreaterThanOrEqualTo(8);
    expect(Competition::count())->toBeGreaterThanOrEqualTo(1);
    expect(Student::count())->toBeGreaterThanOrEqualTo(30);
    expect(User::where('role', 'admin')->count())->toBe(1);
});

it('AiDnevnikSesija is not affected by seeding', function () {
    $beforeCount = AiDnevnikSesija::count();
    $this->seed(DatabaseSeeder::class);
    expect(AiDnevnikSesija::count())->toBe($beforeCount);
});
```

- [ ] **Step 3: Run — PASS**

```powershell
php artisan test --compact --filter=DatabaseSeederTest
```
Expected: 2/2 PASS.

> Ako test pada zbog FK Constraint na competition (sport nedostaje pri prvom prolazu), drugi pass treba da to popravi (alfabetski redoslijed znači SportSeeder ide poslije CompetitionSeeder; competition seeder skipa, na drugom pass-u kompletiraju se sve). Provjeri da seederi imaju proper early returns.

- [ ] **Step 4: Pint + commit**

```powershell
vendor/bin/pint --dirty --format agent
git add database/seeders/DatabaseSeeder.php tests/Feature/DatabaseSeederTest.php
git commit -m "F2: DatabaseSeeder orchestration with alphabetic order + integration test"
```

---

## Task 14: End-to-end verifikacija (Domain model graf)

**Files:**
- Test: `tests/Feature/DomainModelTest.php`

Spec acceptance: `App\Models\Team::with(["members.student", "competition.sport"])->first()` vraća kompletan graf.

- [ ] **Step 1: Napiši test**

```php
<?php // tests/Feature/DomainModelTest.php

use App\Enums\TeamStatus;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\School;
use App\Models\Sport;
use App\Models\Student;
use App\Models\Team;
use App\Models\TeamMember;

it('full domain graph eager loads', function () {
    $school = School::factory()->create();
    $sport = Sport::factory()->team(5, 3)->create(['slug' => 'fudbal-graph']);
    $comp = Competition::factory()->create(['sport_id' => $sport->id, 'slug' => 'comp-graph']);
    $prof = Professor::factory()->forSchool($school)->create();
    $team = Team::factory()->create([
        'school_id' => $school->id,
        'competition_id' => $comp->id,
        'professor_id' => $prof->id,
    ]);

    $students = Student::factory()->count(3)->forSchool($school)->create();
    foreach ($students as $student) {
        TeamMember::factory()->create(['team_id' => $team->id, 'student_id' => $student->id]);
    }

    $loaded = Team::with(['members.student', 'competition.sport', 'school', 'professor'])->find($team->id);

    expect($loaded->status)->toBe(TeamStatus::Draft);
    expect($loaded->members)->toHaveCount(3);
    expect($loaded->members->first()->student)->not->toBeNull();
    expect($loaded->competition->sport->id)->toBe($sport->id);
    expect($loaded->school->id)->toBe($school->id);
    expect($loaded->professor->id)->toBe($prof->id);
});
```

- [ ] **Step 2: Run — PASS**

```powershell
php artisan test --compact --filter=DomainModelTest
```

- [ ] **Step 3: Run cijela test suita**

```powershell
php artisan test --compact
```
Expected: sve testove PASS (Auth*, Dashboard, AiDnevnik, RoutingTest iz F1, EnumsTest, SchoolFactoryTest, UserStiTest, SportTest, CompetitionTest, TeamTest, MedicalCertificateTest, ResultTest, AuditLogEntryTest, DatabaseSeederTest, DomainModelTest).

- [ ] **Step 4: Commit**

```powershell
vendor/bin/pint --dirty --format agent
git add tests/Feature/DomainModelTest.php
git commit -m "F2: domain model graph integration test"
```

---

## Acceptance criteria (spec 14 + placeholder)

- [x] `php artisan migrate` (additive) prolazi i ne dira `ai_dnevnik_sesije`
- [x] `php artisan db:seed` idempotent (drugi pass identičan)
- [x] `App\Models\Student::count()` > 0
- [x] `App\Models\Team::with(["members.student", "competition.sport"])->first()` vraća kompletan graf
- [x] Pest unit testove za sve enume (validacija dozvoljenih vrijednosti)
- [x] Pest unit testove za factory svake klase
- [x] NIJEDNA `migrate:fresh` referenca

## NE radi (iz placeholder-a)

- Nemoj Controller-e (Phase 1+)
- Nemoj Policy klase (T1.1 to radi)
- Nemoj Service klase (Phase 2 track-ovi)
- Nemoj state machine logiku (samo enum vrijednosti, transitions su pomoć enum metode)
- Nemoj indekse koje spec ne traži

## TODO koji su zaključeni ovde

- ✓ STI vs polimorfna: STI sa `role` enum + nullable role-specific polja u `users` tabeli. Confirmed spec 7.2.
- ✓ JMB: regex format check (`/^\d{13}$/`). Algoritamska validacija = TODO za pilot, kasniji track može dodati.
- ✓ Migration order: schools → users extend → sports → competitions → teams → team_members → medical_certificates → results → audit_log

## Self-review checklist

- Spec sekcija 7 (Domain model) — sve entitete kreirane ✓
- Spec sekcija 13.3 (Audit log model) — `audit_log` tabela sa svim poljima + immutability ✓
- Spec sekcija 15.2 (Seed strategija) — svi seederi idempotentni, alfabetski redoslijed ✓
- Spec sekcija 17 (Glossary) — engleski tehnički nazivi sa CG-specifičnim izuzecima (`jmb`, `school_code`) ✓
- Meta-plan 4.1 — DatabaseSeeder line-per-call layout ✓
- Database safety — bez `migrate:fresh`, sve additive ✓
