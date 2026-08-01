<?php

return [
    'login' => [
        'max_attempts' => (int) env('LOGIN_MAX_ATTEMPTS', 5),
        'decay_seconds' => (int) env('LOGIN_DECAY_SECONDS', 60),
    ],

    'invitation' => [
        'expiration_hours' => (int) env('INVITATION_EXPIRATION_HOURS', 72),
    ],
];
