<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAttachment;
use App\Services\Task\TaskActivityService;
use App\Services\Task\TaskNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentController extends Controller
{
    public function __construct(
        protected TaskActivityService $activityService,
        protected TaskNotificationService $notificationService,
    ) {}

    public function store(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);
        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $file = $request->file('file');
        $filename = $file->hashName();
        $path = $file->storeAs('task-attachments/' . $task->id, $filename, 'local');

        if ($path === false) {
            return redirect()->back()->with('error', 'Failed to store file.');
        }

        $attachment = TaskAttachment::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'filename' => $filename,
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        $this->activityService->log($task, $request->user()->id, 'attachment_added', 'File attached: ' . $attachment->original_filename);
        $this->notificationService->notifyWatchers($task, 'file_attached', 'File attached to ' . $task->title);

        return redirect()->back()->with('success', 'File attached.');
    }

    public function destroy(Task $task, TaskAttachment $attachment): RedirectResponse
    {
        $this->authorize('update', $task);
        abort_unless($attachment->task_id === $task->id, 404);

        $path = 'task-attachments/' . $task->id . '/' . $attachment->filename;
        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }

        $this->activityService->log($task, $attachment->user_id, 'attachment_removed', 'File removed: ' . $attachment->original_filename);

        $attachment->delete();
        return redirect()->back()->with('success', 'Attachment removed.');
    }
}
