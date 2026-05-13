<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddTeamMemberRequest;
use App\Models\Team;
use App\Models\TeamMember;
use App\Services\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;

class TeamMemberController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private AuditLogger $audit) {}

    public function store(AddTeamMemberRequest $request, Team $team): RedirectResponse
    {
        $member = TeamMember::create([
            'team_id' => $team->id,
            'student_id' => $request->validated('student_id'),
        ]);

        $this->audit->log('team_member.added', $member, ['team_id' => $team->id]);

        return back();
    }

    public function destroy(Team $team, TeamMember $member): RedirectResponse
    {
        $this->authorize('removeMember', $team);

        if ($member->team_id !== $team->id) {
            abort(404);
        }

        $studentId = $member->student_id;
        $member->delete();

        $this->audit->log('team_member.removed', $team, ['student_id' => $studentId]);

        return back();
    }
}
