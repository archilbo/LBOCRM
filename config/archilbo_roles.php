<?php

return [
    'super_admin_role' => 'super_admin',

    'assignable' => [
        'super_admin',
        'finance_admin',
        'manager',
        'operations_manager',
        'staff',
        'viewer',
    ],

    // Legacy admin accounts remain protected while they are migrated to Super Admin.
    'protected' => [
        'admin',
        'super_admin',
    ],
];
