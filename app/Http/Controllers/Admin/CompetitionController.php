<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCompetitionRequest;
use App\Http\Requests\Admin\UpdateCompetitionRequest;
use App\Models\Competition;
use App\Models\Sport;
use App\Services\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CompetitionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Competition::class);

        return Inertia::render('admin/competitions/index', [
            'competitions' => Competition::with('sport')->orderByDesc('start_date')->paginate(25),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Competition::class);

        return Inertia::render('admin/competitions/create', [
            'sports' => Sport::orderBy('name')->get(['id', 'name', 'type']),
        ]);
    }

    public function store(StoreCompetitionRequest $request): RedirectResponse
    {
        $comp = Competition::create($request->validated());
        $this->audit->log('competition.created', $comp);

        return redirect()->route('admin.competitions.index');
    }

    public function edit(Competition $competition): Response
    {
        $this->authorize('update', $competition);

        return Inertia::render('admin/competitions/edit', [
            'competition' => $competition->load('sport'),
            'sports' => Sport::orderBy('name')->get(['id', 'name', 'type']),
        ]);
    }

    public function update(UpdateCompetitionRequest $request, Competition $competition): RedirectResponse
    {
        $oldStatus = $competition->status;
        $competition->update($request->validated());

        $action = $competition->status !== $oldStatus ? 'competition.status_changed' : 'competition.updated';
        $this->audit->log($action, $competition, ['from' => $oldStatus->value, 'to' => $competition->status->value]);

        return redirect()->route('admin.competitions.index');
    }

    public function destroy(Competition $competition): RedirectResponse
    {
        $this->authorize('delete', $competition);

        if ($competition->teams()->exists()) {
            return back()->withErrors(['general' => 'Ne možeš obrisati takmičenje sa prijavljenim ekipama.']);
        }

        $competition->delete();
        $this->audit->log('competition.deleted', $competition);

        return redirect()->route('admin.competitions.index');
    }
}
