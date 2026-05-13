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
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompetitionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Competition::class);

        $status = $request->string('status')->toString();
        $sportId = $request->integer('sport_id');
        $year = $request->integer('year');

        $query = Competition::with('sport')->orderByDesc('start_date');

        if ($status !== '') {
            $query->where('status', $status);
        }
        if ($sportId) {
            $query->where('sport_id', $sportId);
        }
        if ($year) {
            $query->where('year', $year);
        }

        return Inertia::render('admin/competitions/index', [
            'competitions' => $query->paginate(25)->withQueryString(),
            'sports' => Sport::orderBy('name')->get(['id', 'name']),
            'filters' => [
                'status' => $status !== '' ? $status : null,
                'sport_id' => $sportId ?: null,
                'year' => $year ?: null,
            ],
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
