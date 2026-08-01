export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer' | string;

export type AdminUserRow = {
    id: number;
    name: string;
    email: string;
    roles: UserRole[];
    displayRole?: UserRole | null;
    permissions: string[];
    permissionConfiguration?: {
        base_role: string;
        is_custom: true;
        modules: Record<string, { access: 'none' | 'view' | 'edit' | 'delete'; scope: 'none' | 'all' | 'assigned_only' }>;
    } | null;
    lastSeenAt: string | null;
    isOnline: boolean;
    isSuspended: boolean;
    accountStatus: 'pending' | 'accepted' | 'blocked';
    invitationExpiresAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type RoleOption = {
    id: string;
    label: string;
};
