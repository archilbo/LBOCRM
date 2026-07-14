export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer' | string;

export type AdminUserRow = {
    id: number;
    name: string;
    email: string;
    roles: UserRole[];
    permissions: string[];
    lastSeenAt: string | null;
    isOnline: boolean;
    createdAt: string | null;
    updatedAt: string | null;
};

export type RoleOption = {
    id: string;
    label: string;
};