<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreCommentRequest;
use App\Http\Resources\TaskCommentResource;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use App\Services\Task\TaskActivityService;
use App\Services\Task\TaskNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    public function __construct(
        protected TaskActivityService $activityService,
        protected TaskNotificationService $notificationService,
    ) {}

    public function index(Task $task)
    {
        $this->authorize('view', $task);
        $comments = $task->comments()->with('user')->latest()->get();
        return TaskCommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request, Task $task): TaskCommentResource
    {
        $this->authorize('update', $task);
        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
            'is_note' => $request->boolean('is_note', false),
        ]);

        $comment->load('user');

        $isNote = $comment->is_note;
        $desc = $isNote ? 'Note added' : 'Comment added';
        $this->activityService->log($task, $request->user()->id, $isNote ? 'note_added' : 'comment_added', $desc);

        if (! $isNote) {
            $this->notificationService->notifyWatchers($task, 'comment_added', $desc . ' on ' . $task->title);
        }

        preg_match_all('/@(\w+)/', $comment->body, $matches);
        if (! empty($matches[1])) {
            $existing = User::whereIn('name', $matches[1])->pluck('id', 'name');
            foreach ($matches[1] as $username) {
                if (isset($existing[$username]) && $existing[$username] !== $request->user()->id) {
                    $mentioned = User::find($existing[$username]);
                    if ($mentioned) {
                        $this->notificationService->notifyMentioned($request->user(), $task, $mentioned, 'a ' . ($isNote ? 'note on' : 'comment on') . ' ' . $task->title);
                    }
                }
            }
        }

        return new TaskCommentResource($comment);
    }

    public function destroy(Task $task, TaskComment $comment): RedirectResponse
    {
        $this->authorize('update', $task);
        abort_unless($comment->task_id === $task->id, 404);
        $comment->delete();
        return redirect()->back()->with('success', 'Comment deleted.');
    }
}
