<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSchoolRequest;
use App\Http\Requests\Admin\UpdateSchoolRequest;
use App\Models\School;
use App\Services\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SchoolController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    public function index(): Response
    {
        $this->authorize('viewAny', School::class);

        return Inertia::render('admin/schools/index', [
            'schools' => School::orderBy('name')->paginate(25),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', School::class);

        return Inertia::render('admin/schools/create');
    }

    public function store(StoreSchoolRequest $request): RedirectResponse
    {
        $school = School::create($request->validated());
        $this->audit->log('school.created', $school);

        return redirect()->route('admin.schools.index');
    }

    public function edit(School $school): Response
    {
        $this->authorize('update', $school);

        return Inertia::render('admin/schools/edit', ['school' => $school]);
    }

    public function update(UpdateSchoolRequest $request, School $school): RedirectResponse
    {
        $school->update($request->validated());
        $this->audit->log('school.updated', $school);

        return redirect()->route('admin.schools.index');
    }

    public function destroy(School $school): RedirectResponse
    {
        $this->authorize('delete', $school);

        $school->delete();
        $this->audit->log('school.deleted', $school);

        return redirect()->route('admin.schools.index');
    }
}
