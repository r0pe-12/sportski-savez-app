<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Professor;
use App\Models\School;
use App\Models\Student;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    public function index(): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::with('school')
            ->orderByDesc('created_at')
            ->paginate(25);

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('admin/users/create', [
            'schools' => School::orderBy('name')->get(['id', 'name', 'code']),
            'roles' => array_map(fn ($r) => ['value' => $r->value, 'label' => $r->label()], UserRole::cases()),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        if (! empty($data['verified_at_now'])) {
            $data['verified_at'] = now();
            $data['email_verified_at'] = now();
        }
        unset($data['verified_at_now']);

        $role = UserRole::from($data['role']);
        $user = match ($role) {
            UserRole::Admin => User::create($data),
            UserRole::Professor => Professor::create($data),
            UserRole::Student => Student::create($data + ['parental_consent' => true, 'parental_consent_at' => now()]),
        };

        $this->audit->log('user.created', $user, ['role' => $role->value]);

        return redirect()->route('admin.users.index');
    }

    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('admin/users/edit', [
            'user' => $user->load('school'),
            'schools' => School::orderBy('name')->get(['id', 'name', 'code']),
            'roles' => array_map(fn ($r) => ['value' => $r->value, 'label' => $r->label()], UserRole::cases()),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->update($request->validated());
        $this->audit->log('user.updated', $user, ['fields' => array_keys($request->validated())]);

        return redirect()->route('admin.users.index');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->delete();
        $this->audit->log('user.deleted', $user);

        return redirect()->route('admin.users.index');
    }
}
