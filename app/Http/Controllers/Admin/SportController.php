<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSportRequest;
use App\Http\Requests\Admin\UpdateSportRequest;
use App\Models\Sport;
use App\Services\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SportController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Sport::class);

        return Inertia::render('admin/sports/index', [
            'sports' => Sport::orderBy('name')->paginate(25),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Sport::class);

        return Inertia::render('admin/sports/create');
    }

    public function store(StoreSportRequest $request): RedirectResponse
    {
        $sport = Sport::create($request->validated());
        $this->audit->log('sport.created', $sport);

        return redirect()->route('admin.sports.index');
    }

    public function edit(Sport $sport): Response
    {
        $this->authorize('update', $sport);

        return Inertia::render('admin/sports/edit', ['sport' => $sport]);
    }

    public function update(UpdateSportRequest $request, Sport $sport): RedirectResponse
    {
        $sport->update($request->validated());
        $this->audit->log('sport.updated', $sport);

        return redirect()->route('admin.sports.index');
    }

    public function destroy(Sport $sport): RedirectResponse
    {
        $this->authorize('deactivate', $sport);

        $sport->delete(); // soft delete = deactivate
        $this->audit->log('sport.deactivated', $sport);

        return redirect()->route('admin.sports.index');
    }
}
