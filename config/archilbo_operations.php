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

    'task_request_statuses' => [
        'submitted',
        'accepted',
        'rejected',
        'converted',
    ],

    'task_request_status_labels' => [
        'submitted' => 'Submitted',
        'accepted' => 'Accepted',
        'rejected' => 'Rejected',
        'converted' => 'Converted',
    ],

    'task_request_types' => [
        'document_upload',
        'payment_follow_up',
        'client_call',
        'contract_generation',
        'authorization_follow_up',
        'admin_help',
    ],

    'task_request_type_labels' => [
        'document_upload' => 'Document upload',
        'payment_follow_up' => 'Payment follow-up',
        'client_call' => 'Client call',
        'contract_generation' => 'Contract generation',
        'authorization_follow_up' => 'Authorization follow-up',
        'admin_help' => 'Admin help',
    ],

    'task_request_task_mapping' => [
        'document_upload' => ['type' => 'missing_document', 'category' => 'documents'],
        'payment_follow_up' => ['type' => 'finance', 'category' => 'finance'],
        'client_call' => ['type' => 'client_follow_up', 'category' => 'client_follow_up'],
        'contract_generation' => ['type' => 'contract', 'category' => 'contract'],
        'authorization_follow_up' => ['type' => 'authorization', 'category' => 'authorization'],
        'admin_help' => ['type' => 'internal_admin', 'category' => 'general_admin'],
    ],
];
