<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLogEntry;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AuditLogEntry::class);

        $entries = AuditLogEntry::with('user:id,name,email,role')
            ->when($request->integer('user_id'), fn ($q, $v) => $q->where('user_id', $v))
            ->when($request->string('action')->toString(), fn ($q, $v) => $q->where('action', 'like', "{$v}%"))
            ->when($request->string('subject_type')->toString(), fn ($q, $v) => $q->where('subject_type', 'like', "%{$v}%"))
            ->when($request->date('from'), fn ($q, $v) => $q->where('created_at', '>=', $v))
            ->when($request->date('to'), fn ($q, $v) => $q->where('created_at', '<=', $v))
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('admin/audit-log/index', [
            'entries' => $entries,
            'filters' => $request->only(['user_id', 'action', 'subject_type', 'from', 'to']),
            'users' => User::select('id', 'name', 'email')->orderBy('name')->limit(100)->get(),
        ]);
    }

    public function show(AuditLogEntry $auditLog): Response
    {
        $this->authorize('view', $auditLog);

        // Log self-access meta-action
        app(AuditLogger::class)->log('audit.viewed', $auditLog, ['entry_id' => $auditLog->id]);

        return Inertia::render('admin/audit-log/show', [
            'entry' => $auditLog->load('user'),
        ]);
    }
}
