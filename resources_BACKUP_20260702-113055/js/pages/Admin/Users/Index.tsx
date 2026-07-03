import { Head, router } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Key } from 'react-aria-components';
import {
    CheckCircle2,
    Clock3,
    KeyRound,
    MailPlus,
    Search,
    ShieldAlert,
    ShieldCheck,
    UserCog,
    Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { AppFormErrorSummary } from '@/components/ui/AppFormErrorSummary';
import { AppShell } from '@/components/layout/AppShell';
import { AppPagination } from '@/components/ui/AppPagination';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { AdminUserRow, RoleOption } from '@/features/users/types';

const FORCE_ADMIN_USERS_REDESIGN_53K = true;

type PageProps = {
    users: AdminUserRow[];
    roles: RoleOption[];
};

function roleClass(role: string) {
    switch (role) {
        case 'admin':
            return 'border-red-500/25 bg-red-500/10 text-red-300';
        case 'manager':
            return 'border-violet-500/25 bg-violet-500/10 text-violet-300';
        case 'staff':
            return 'border-blue-500/25 bg-blue-500/10 text-blue-300';
        case 'viewer':
            return 'border-white/10 bg-white/5 text-[var(--crm-muted)]';
        default:
            return 'border-amber-500/25 bg-amber-500/10 text-amber-300';
    }
}

function roleIcon(role: string) {
    if (role === 'admin') {
        return ShieldAlert;
    }

    if (role === 'manager') {
        return ShieldCheck;
    }

    return UserCog;
}

function initials(user: AdminUserRow) {
    return user.name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U';
}

function primaryRole(user: AdminUserRow) {
    return user.roles[0] ?? 'viewer';
}

export default function AdminUsersIndex({ users, roles }: PageProps) {
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(users[0] ?? null);
    const [tablePage, setTablePage] = useState(1);
    const TABLE_PAGE_SIZE = 15;
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'staff' as string });
    const [inviteErrors, setInviteErrors] = useState<FormErrors>({});

    const roleCounts = useMemo(() => {
        const counts = new Map<string, number>();

        roles.forEach((role) => counts.set(role.id, 0));

        users.forEach((user) => {
            const role = primaryRole(user);
            counts.set(role, (counts.get(role) ?? 0) + 1);
        });

        return counts;
    }, [roles, users]);

    const filteredUsers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return users.filter((user) => {
            const role = primaryRole(user);
            const searchable = [
                user.name,
                user.email,
                role,
                user.permissions.join(' '),
            ].join(' ').toLowerCase();

            return (roleFilter === 'all' || role === roleFilter)
                && (normalizedQuery === '' || searchable.includes(normalizedQuery));
        });
    }, [query, roleFilter, users]);

    useEffect(() => {
        setTablePage(1);
    }, [query, roleFilter]);

    const pagedUsers = useMemo(
        () => filteredUsers.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE),
        [filteredUsers, tablePage],
    );

    const activeUser = selectedUser && filteredUsers.some((user) => user.id === selectedUser.id)
        ? selectedUser
        : filteredUsers[0] ?? users[0] ?? null;

    const metrics = [
        {
            label: 'Users',
            value: users.length,
            hint: 'Active accounts',
            icon: Users,
            tone: 'text-[var(--crm-accent)]',
        },
        {
            label: 'Admins',
            value: users.filter((user) => primaryRole(user) === 'admin').length,
            hint: 'Full access',
            icon: ShieldAlert,
            tone: 'text-red-300',
        },
        {
            label: 'Managers',
            value: users.filter((user) => primaryRole(user) === 'manager').length,
            hint: 'Operations control',
            icon: ShieldCheck,
            tone: 'text-violet-300',
        },
        {
            label: 'Permissions',
            value: new Set(users.flatMap((user) => user.permissions)).size,
            hint: 'Unique capabilities',
            icon: KeyRound,
            tone: 'text-blue-300',
        },
    ];

    function updateRole(user: AdminUserRow, role: string) {
        if (role === primaryRole(user)) {
            return;
        }

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

    return (
        <>
            <Head title="Users and roles" />

            <AppShell
                eyebrowKey="nav.groups.administration"
                titleKey="nav.users"
                subtitleKey="backendQa.subtitle"
            >
                <div className="crm-page" data-ui-marker={FORCE_ADMIN_USERS_REDESIGN_53K ? 'FORCE_ADMIN_USERS_REDESIGN_53K' : undefined}>
                    <section className="crm-kpi-grid">
                        {metrics.map((metric) => {
                            const Icon = metric.icon;

                            return (
                                <div key={metric.label} className="crm-kpi-card">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="crm-kpi-label">{metric.label}</p>
                                            <p className={`crm-kpi-value ${metric.tone}`}>{metric.value}</p>
                                        </div>
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-white/5">
                                            <Icon size={18} className={metric.tone} />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-[var(--crm-muted)]">{metric.hint}</p>
                                </div>
                            );
                        })}
                    </section>

                    <section className="crm-panel p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRoleFilter('all')}
                                    className={[
                                        'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition',
                                        roleFilter === 'all'
                                            ? 'border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_22%,transparent)] text-[var(--crm-accent)]'
                                            : 'border-[var(--crm-border)] bg-[var(--crm-elevated)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                    ].join(' ')}
                                >
                                    All
                                    <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs">{users.length}</span>
                                </button>

                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setRoleFilter(role.id)}
                                        className={[
                                            'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold capitalize transition',
                                            roleFilter === role.id
                                                ? 'border-[var(--crm-accent)] bg-[color-mix(in_srgb,var(--crm-accent)_22%,transparent)] text-[var(--crm-accent)]'
                                                : 'border-[var(--crm-border)] bg-[var(--crm-elevated)] text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]',
                                        ].join(' ')}
                                    >
                                        {role.label}
                                        <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs">{roleCounts.get(role.id) ?? 0}</span>
                                    </button>
                                ))}
                            </div>

                            <AppButton variant="primary" onPress={() => { setInviteErrors({}); setIsInviteOpen(true); }}>
                                <MailPlus size={16} />
                                Invite user
                            </AppButton>

                            <div className="relative min-w-0 xl:w-[420px]">
                                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--crm-muted)]" size={16} />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search users, email, role, permission..."
                                    className="crm-command-input h-11 w-full pl-11"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="crm-panel min-w-0 overflow-hidden">
                            <div className="flex items-start justify-between gap-3 border-b border-[var(--crm-border)] px-4 py-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[var(--crm-text)]">Company access</h2>
                                    <p className="text-xs text-[var(--crm-muted)]">
                                        Assign one role per user. Changes are saved immediately.
                                    </p>
                                </div>
                                <span className="rounded-full border border-[var(--crm-border)] bg-black/20 px-3 py-1 text-xs font-bold text-[var(--crm-muted)]">
                                    {filteredUsers.length} visible
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="crm-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Current role</th>
                                            <th>Permissions</th>
                                            <th>Created</th>
                                            <th>Updated</th>
                                            <th className="text-right">Change role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedUsers.map((user) => {
                                            const role = primaryRole(user);
                                            const Icon = roleIcon(role);
                                            const selected = activeUser?.id === user.id;

                                            return (
                                                <tr
                                                    key={user.id}
                                                    onClick={() => setSelectedUser(user)}
                                                    className={selected ? 'bg-[color-mix(in_srgb,var(--crm-accent)_12%,transparent)]' : undefined}
                                                >
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-accent)_16%,transparent)] text-xs font-black text-[var(--crm-accent)]">
                                                                {initials(user)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="max-w-[220px] truncate font-semibold text-[var(--crm-text)]">{user.name}</p>
                                                                <p className="text-xs text-[var(--crm-muted)]">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs font-bold capitalize ${roleClass(role)}`}>
                                                            <Icon size={13} />
                                                            {role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-300">
                                                            {user.permissions.length} permissions
                                                        </span>
                                                    </td>
                                                    <td>{user.createdAt || '-'}</td>
                                                    <td>{user.updatedAt || '-'}</td>
                                                    <td>
                                                        <div className="flex justify-end">
                                                            <select
                                                                value={role}
                                                                onClick={(event) => event.stopPropagation()}
                                                                onChange={(event) => updateRole(user, event.target.value)}
                                                                className="h-10 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] px-3 text-sm font-semibold text-[var(--crm-text)] outline-none transition focus:border-[var(--crm-accent)]"
                                                            >
                                                                {roles.map((option) => (
                                                                    <option key={option.id} value={option.id}>
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {filteredUsers.length === 0 ? (
                                <div className="px-4 py-12 text-center text-sm text-[var(--crm-muted)]">
                                    No users match the current filters.
                                </div>
                            ) : null}
                        </div>

                        <aside className="crm-panel h-fit overflow-hidden">
                            {activeUser ? (
                                <>
                                    <div className="border-b border-[var(--crm-border)] p-4">
                                        <p className="crm-eyebrow">Selected user</p>
                                        <div className="mt-3 flex items-start gap-3">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--crm-accent)_18%,transparent)] text-sm font-black text-[var(--crm-accent)]">
                                                {initials(activeUser)}
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="truncate text-lg font-black text-[var(--crm-text)]">{activeUser.name}</h2>
                                                <p className="truncate text-sm text-[var(--crm-muted)]">{activeUser.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 p-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                                                <p className="crm-kpi-label">Role</p>
                                                <p className="mt-2 truncate text-sm font-black capitalize text-[var(--crm-accent)]">{primaryRole(activeUser)}</p>
                                            </div>
                                            <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                                                <p className="crm-kpi-label">Permissions</p>
                                                <p className="mt-2 text-sm font-black">{activeUser.permissions.length}</p>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                                            <p className="crm-kpi-label">Audit</p>
                                            <div className="mt-3 grid gap-2 text-sm text-[var(--crm-muted)]">
                                                <span className="flex items-center gap-2"><Clock3 size={14} />Created: {activeUser.createdAt || '-'}</span>
                                                <span className="flex items-center gap-2"><CheckCircle2 size={14} />Updated: {activeUser.updatedAt || '-'}</span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="crm-kpi-label">Change role</p>
                                                <span className={`rounded-full border px-2 py-1 text-xs font-bold capitalize ${roleClass(primaryRole(activeUser))}`}>
                                                    {primaryRole(activeUser)}
                                                </span>
                                            </div>

                                            <select
                                                value={primaryRole(activeUser)}
                                                onChange={(event) => updateRole(activeUser, event.target.value)}
                                                className="mt-3 h-11 w-full rounded-xl border border-[var(--crm-border)] bg-black/20 px-3 text-sm font-semibold text-[var(--crm-text)] outline-none transition focus:border-[var(--crm-accent)]"
                                            >
                                                {roles.map((option) => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-3">
                                            <p className="crm-kpi-label">Permissions list</p>
                                            <div className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-auto pr-1">
                                                {activeUser.permissions.length > 0 ? activeUser.permissions.map((permission) => (
                                                    <span
                                                        key={permission}
                                                        className="rounded-full border border-[var(--crm-border)] bg-black/20 px-2 py-1 text-xs font-semibold text-[var(--crm-text-muted)]"
                                                    >
                                                        {permission}
                                                    </span>
                                                )) : (
                                                    <span className="text-sm text-[var(--crm-muted)]">No explicit permissions.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 text-center text-sm text-[var(--crm-muted)]">Select a user.</div>
                            )}
                        </aside>
                        <AppPagination page={tablePage} pageSize={TABLE_PAGE_SIZE} total={filteredUsers.length} onChange={setTablePage} />
                    </section>
                </div>

                <AppDrawer
                    isOpen={isInviteOpen}
                    onOpenChange={(open) => { setIsInviteOpen(open); if (!open) setInviteErrors({}); }}
                    title="Invite user"
                    description="Send an invitation email to join the platform."
                    footer={
                        <>
                            <AppButton variant="secondary" onPress={() => setIsInviteOpen(false)}>
                                Cancel
                            </AppButton>
                            <AppButton variant="primary" type="submit" form="invite-form">
                                Send invitation
                            </AppButton>
                        </>
                    }
                >
                    <form id="invite-form" className="space-y-6" onSubmit={(event: FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        setInviteErrors({});
                        router.post('/admin/users/invite', inviteForm, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setIsInviteOpen(false);
                                setInviteForm({ name: '', email: '', role: 'staff' });
                                toast.success('Invitation sent.');
                            },
                            onError: (err) => {
                                setInviteErrors(err);
                            },
                        });
                    }}
                    >
                        <AppFormErrorSummary errors={inviteErrors} />

                        <AppTextField
                            label="Name"
                            placeholder="Full name"
                            value={inviteForm.name}
                            onChange={(value) => setInviteForm((prev) => ({ ...prev, name: value }))}
                            error={firstError(inviteErrors, 'name')}
                        />

                        <AppTextField
                            label="Email"
                            placeholder="user@example.com"
                            value={inviteForm.email}
                            onChange={(value) => setInviteForm((prev) => ({ ...prev, email: value }))}
                            error={firstError(inviteErrors, 'email')}
                        />

                        <AppSelect
                            label="Role"
                            placeholder="Select a role"
                            selectedKey={inviteForm.role}
                            onSelectionChange={(value: Key | null) => setInviteForm((prev) => ({ ...prev, role: value ? String(value) : 'staff' }))}
                            error={firstError(inviteErrors, 'role')}
                            options={roles.map((role) => ({ id: role.id, label: role.label }))}
                        />
                    </form>
                </AppDrawer>
            </AppShell>
        </>
    );
}