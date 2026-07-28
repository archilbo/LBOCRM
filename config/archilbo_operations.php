<?php

return [
    'task_types' => [
        'general',
        'missing_document',
        'client_follow_up',
        'contract',
        'authorization',
        'finance',
        'archive',
        'review',
        'internal_admin',
    ],

    'task_categories' => [
        'documents',
        'client_follow_up',
        'contract',
        'authorization',
        'finance',
        'archive',
        'general_admin',
    ],

    'task_statuses' => [
        'backlog',
        'not_started',
        'in_progress',
        'waiting_client',
        'waiting_admin',
        'blocked',
        'in_review',
        'completed',
        'cancelled',
    ],

    'task_priorities' => [
        'low',
        'medium',
        'high',
        'urgent',
    ],

    'task_impacts' => [
        'low',
        'normal',
        'high',
        'critical',
    ],

];
