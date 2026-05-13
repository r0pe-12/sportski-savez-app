<?php

namespace App\Providers;

use App\Adapters\EDnevnik\FakeEDnevnikAdapter;
use App\Adapters\Ocr\FakeOcrAdapter;
use App\Contracts\EDnevnikAdapter;
use App\Contracts\OcrAdapter;
use App\Models\Competition;
use App\Models\Professor;
use App\Models\School;
use App\Models\Sport;
use App\Models\Student;
use App\Models\User;
use App\Observers\CompetitionObserver;
use App\Observers\SportObserver;
use App\Policies\SchoolPolicy;
use App\Policies\UserPolicy;
use App\Services\AuditLogger;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(OcrAdapter::class, function () {
            return config('ocr.adapter') === 'fake'
                ? new FakeOcrAdapter
                : throw new \LogicException('Real OcrAdapter not implemented yet. Set OCR_ADAPTER=fake.');
        });

        $this->app->bind(EDnevnikAdapter::class, function () {
            return config('ednevnik.adapter') === 'fake'
                ? new FakeEDnevnikAdapter
                : throw new \LogicException('Real EDnevnikAdapter not implemented yet. Set EDNEVNIK_ADAPTER=fake.');
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configurePolicies();
        $this->configureAuthEventLogging();
        $this->configureObservers();
    }

    /**
     * Audit log entries for login/logout events.
     */
    protected function configureAuthEventLogging(): void
    {
        Event::listen(Login::class, function (Login $event): void {
            app(AuditLogger::class)->log('user.logged_in', $event->user);
        });

        Event::listen(Logout::class, function (Logout $event): void {
            if ($event->user) {
                app(AuditLogger::class)->log('user.logged_out', $event->user);
            }
        });
    }

    /**
     * Register policies — including STI subclasses Professor/Student which auto-discovery does not detect.
     */
    protected function configurePolicies(): void
    {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Professor::class, UserPolicy::class);
        Gate::policy(Student::class, UserPolicy::class);
        Gate::policy(School::class, SchoolPolicy::class);
    }

    /**
     * Register model observers for cache invalidation.
     */
    protected function configureObservers(): void
    {
        Sport::observe(SportObserver::class);
        Competition::observe(CompetitionObserver::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
