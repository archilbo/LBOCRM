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
        $comments = $task->comments()->with('user')->latest()->get();
        return TaskCommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request, Task $task): TaskCommentResource
    {
        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'body' => $request->validated('body'),
            'is_note' => $request->validated('is_note', false),
        ]);

        $comment->load('user');

        $desc = $comment->is_note ? 'Note added' : 'Comment added';
        $this->activityService->log($task, $request->user()->id, $comment->is_note ? 'note_added' : 'comment_added', $desc);
        $this->notificationService->notifyWatchers($task, 'comment_added', $desc . ' on ' . $task->title);

        preg_match_all('/@(\w+)/', $comment->body, $matches);
        if (! empty($matches[1])) {
            foreach ($matches[1] as $username) {
                $mentioned = User::where('name', 'like', "%{$username}%")->first();
                if ($mentioned && $mentioned->id !== $request->user()->id) {
                    $this->notificationService->notifyMentioned($request->user(), $task, $mentioned, 'a comment on ' . $task->title);
                }
            }
        }

        return new TaskCommentResource($comment);
    }

    public function destroy(Task $task, TaskComment $comment): RedirectResponse
    {
        $comment->delete();
        return redirect()->back()->with('success', 'Comment deleted.');
    }
}
