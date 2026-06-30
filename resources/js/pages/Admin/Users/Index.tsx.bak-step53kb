import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ShieldCheck, UserCog } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppCard } from '@/components/ui/AppCard';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppSelect } from '@/components/ui/AppSelect';
import type { AdminUserRow, RoleOption } from '@/features/users/types';

type PageProps = {
    users: AdminUserRow[];
    roles: RoleOption[];
};

function roleTone(role: string): 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet' {
    switch (role) {
        case 'admin':
            return 'red';
        case 'manager':
            return 'violet';
        case 'staff':
            return 'blue';
        case 'viewer':
            return 'neutral';
        default:
            return 'neutral';
    }
}

export default function AdminUsersIndex({ users, roles }: PageProps) {
    function updateRole(user: AdminUserRow, role: string) {
        router.put(
            `/admin/users/${user.id}/role`,
            { role },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('User role updated.'),
                onError: () => toast.error('Role could not be updated.'),
            },
        );
    }

    const columns = useMemo<ColumnDef<AdminUserRow, unknown>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'User',
                cell: ({ row }) => (
                    <div className="app-table-primary-cell">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                                <UserCog size={15} />
                            </div>

                            <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-sm font-semibold">
                                    {row.original.name}
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {row.original.email}
                                </p>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'roles',
                header: 'Role',
                cell: ({ row }) => {
                    const role = row.original.roles[0] ?? 'viewer';

                    return <AppBadge tone={roleTone(role)}>{role}</AppBadge>;
                },
            },
            {
                accessorKey: 'permissions',
                header: 'Permissions',
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.permissions.length} permissions
                    </span>
                ),
            },
            {
                accessorKey: 'createdAt',
                header: 'Created',
                cell: ({ row }) => (
                    <span className="text-sm text-[var(--text-muted)]">
                        {row.original.createdAt || '-'}
                    </span>
                ),
            },
            {
                id: 'changeRole',
                header: 'Change role',
                cell: ({ row }) => (
                    <div className="w-44">
                        <AppSelect
                            label="Role"
                            selectedKey={row.original.roles[0] ?? 'viewer'}
                            options={roles}
                            onSelectionChange={(key) => {
                                if (key) {
                                    updateRole(row.original, String(key));
                                }
                            }}
                        />
                    </div>
                ),
            },
        ],
        [roles],
    );

    const metrics = [
        { label: 'Users', value: users.length },
        { label: 'Admins', value: users.filter((user) => user.roles.includes('admin')).length },
        { label: 'Managers', value: users.filter((user) => user.roles.includes('manager')).length },
        { label: 'Staff', value: users.filter((user) => user.roles.includes('staff')).length },
    ];

    return (
        <>
            <Head title="Users and roles" />

            <AppShell
                eyebrowKey="backendQa.eyebrow"
                titleKey="backendQa.title"
                subtitleKey="backendQa.subtitle"
            >
                <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <AppCard key={metric.label} className="p-4">
                            <p className="text-sm text-[var(--text-muted)]">{metric.label}</p>
                            <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                        </AppCard>
                    ))}
                </section>

                <AppCard className="p-5">
                    <div className="mb-4 flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]">
                            <ShieldCheck size={18} />
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold">Company access roles</h2>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Assign one role per user. Admin can manage users and all modules.
                            </p>
                        </div>
                    </div>

                    <AppDataTable
                        data={users}
                        columns={columns}
                        searchPlaceholder="Search users by name, email, role..."
                        emptyTitle="No users found"
                        emptyDescription="Create users later from the user management workflow."
                        pageSize={8}
                    />
                </AppCard>
            </AppShell>
        </>
    );
}