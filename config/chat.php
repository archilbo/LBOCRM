<?php

return [
    'message_edit_window_minutes' => (int) env('CHAT_EDIT_WINDOW_MINUTES', 30),
    'message_delete_window_minutes' => (int) env('CHAT_DELETE_WINDOW_MINUTES', 30),
    'attachment_disk' => env('CHAT_ATTACHMENT_DISK', 'local'),
    'max_attachments' => 10,
    'max_attachment_kilobytes' => 15360,
];
