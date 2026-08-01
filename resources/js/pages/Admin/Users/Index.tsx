import { Head, router } from '@inertiajs/react';
import { type ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import type { Key } from 'react-aria-components';
import {
    AlertTriangle,
    ChevronDown,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Download,
    EllipsisVertical,
    Eye,
    Mail,
    PenLine,
    Plus,
    Power,
    Save,
    Search,
    ShieldAlert,
    ShieldCheck,
    SlidersHorizontal,
    Trash2,
    UserCheck,
    UserCog,
    UserMinus,
    Users,
    Upload,
    X,
} from 'lucide-react';
import { Accordion, Button, Checkbox, Chip, Dropdown, Input, ListBox, Select, Switch } from '@heroui/react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppModal } from '@/components/ui/AppModal';
import { AppWorkspaceTable, type AppWorkspaceTableColumn } from '@/components/ui/AppWorkspaceTable';
import { AppWorkspaceTabs } from '@/components/ui/AppWorkspaceTabs';
import { TabPanel } from 'react-aria-components';
import { cn } from '@/lib/cn';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
import type { AppWorkspaceTab } from '@/components/ui/AppWorkspaceTabs';
import type { AdminUserRow, RoleOption } from '@/features/users/types';

type PageProps = {
    users: AdminUserRow[];
    roles: RoleOption[];
    filterRoles: RoleOption[];
    currentUserId: number;
};

type TabId = 'users' | 'security';

type ActivityLogEntry = {
    id: number;
    timestamp: string;
    user: string;
    action: string;
    ip: string;
};

const ROLE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    admin: { bg: 'bg-[var(--crm-danger-soft)]', text: 'text-[var(--crm-danger)]', dot: 'bg-[var(--crm-danger)]' },
    super_admin: { bg: 'bg-[var(--crm-danger-soft)]', text: 'text-[var(--crm-danger)]', dot: 'bg-[var(--crm-danger)]' },
    finance_admin: { bg: 'bg-[var(--crm-success-soft)]', text: 'text-[var(--crm-success)]', dot: 'bg-[var(--crm-success)]' },
    manager: { bg: 'bg-[var(--crm-violet-soft)]', text: 'text-[var(--crm-violet)]', dot: 'bg-[var(--crm-violet)]' },
    operations_manager: { bg: 'bg-[var(--crm-info-soft)]', text: 'text-[var(--crm-info)]', dot: 'bg-[var(--crm-info)]' },
    staff: { bg: 'bg-[var(--crm-info-soft)]', text: 'text-[var(--crm-info)]', dot: 'bg-[var(--crm-info)]' },
    viewer: { bg: 'bg-[var(--crm-surface-2)]', text: 'text-[var(--crm-text-muted)]', dot: 'bg-[var(--crm-text-muted)]' },
};

const TABS: (AppWorkspaceTab & { id: TabId })[] = [
    { id: 'users', label: 'User & Permissions', icon: UserCheck },
    { id: 'security', label: 'Security & Audit', icon: ShieldCheck },
];

const MODULES = ['Projects', 'Finance', 'Contracts', 'Clients', 'Documents', 'Tasks', 'Archives'];
const SCOPE_MODULES = new Set(['Projects', 'Finance', 'Contracts', 'Clients', 'Documents', 'Tasks', 'Archives']);

type PermissionLevel = 'none' | 'view' | 'edit' | 'delete';
type PermissionScope = 'none' | 'all' | 'assigned_only';
type ModulePerm = { access: PermissionLevel; scope: PermissionScope };
type PermissionsState = Record<string, ModulePerm>;

const ROLE_DEFAULTS: Record<string, PermissionsState> = {
    admin: Object.fromEntries(MODULES.map((m) => [m, { access: 'delete' as PermissionLevel, scope: (SCOPE_MODULES.has(m) ? 'all' : 'none') as PermissionScope }])),
    manager: Object.fromEntries(MODULES.map((m) => {
        if (m === 'Finance' || m === 'Contracts' || m === 'Archives') return [m, { access: 'view' as PermissionLevel, scope: (SCOPE_MODULES.has(m) ? 'all' : 'none') as PermissionScope }];
        return [m, { access: 'edit' as PermissionLevel, scope: (SCOPE_MODULES.has(m) ? 'all' : 'none') as PermissionScope }];
    })),
    staff: Object.fromEntries(MODULES.map((m) => {
        if (m === 'Finance' || m === 'Contracts' || m === 'Archives') return [m, { access: 'view' as PermissionLevel, scope: (SCOPE_MODULES.has(m) ? 'assigned_only' : 'none') as PermissionScope }];
        return [m, { access: 'edit' as PermissionLevel, scope: (SCOPE_MODULES.has(m) ? 'assigned_only' : 'none') as PermissionScope }];
    })),
    viewer: Object.fromEntries(MODULES.map((m) => [m, { access: 'view' as PermissionLevel, scope: (SCOPE_MODULES.has(m) ? 'all' : 'none') as PermissionScope }])),
};

function permsMatchDefaults(perms: PermissionsState, role: string): boolean {
    const defs = ROLE_DEFAULTS[role];
    if (!defs) return false;
    return MODULES.every((m) => perms[m]?.access === defs[m]?.access && perms[m]?.scope === defs[m]?.scope);
}

function cloneDefaults(role: string): PermissionsState {
    return JSON.parse(JSON.stringify(ROLE_DEFAULTS[role] || ROLE_DEFAULTS.viewer));
}

const TABLE_PAGE_SIZE = 10;

function roleIcon(role: string) {
    if (role === 'admin' || role === 'super_admin') return ShieldAlert;
    if (role === 'manager') return ShieldCheck;
    return UserCog;
}

function isProtectedAdministrator(role: string) {
    return role === 'admin' || role === 'super_admin';
}

function initials(name: string) {
    return name.split(' ').map((p) => p.charAt(0)).join('').slice(0, 2).toUpperCase() || 'U';
}

function primaryRole(user: AdminUserRow) {
    return user.displayRole ?? user.roles[0] ?? 'viewer';
}

function formatRoleLabel(role: string) {
    return role.replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function permissionModule(permission: string) {
    const leadingSegment = permission.split('.')[0] ?? permission;
    const module = leadingSegment.trim().split(/\s+/).at(-1) ?? leadingSegment;

    return formatRoleLabel(module);
}

function permissionActionLabel(permission: string) {
    if (permission.includes('.')) {
        return formatRoleLabel(permission.split('.').slice(1).join(' '));
    }

    const words = permission.trim().split(/\s+/);

    return formatRoleLabel(words.slice(0, -1).join(' ') || permission);
}

function groupPermissions(permissions: string[]) {
    return Object.entries(permissions.reduce<Record<string, string[]>>((groups, permission) => {
        const module = permissionModule(permission);
        groups[module] ??= [];
        groups[module].push(permission);

        return groups;
    }, {})).sort(([left], [right]) => left.localeCompare(right));
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).replace(',', ',');
}

// ───────────────────────────────────────────────────────
// Permissions Matrix Component — radio‑dot grid
// ───────────────────────────────────────────────────────
function PermissionsMatrix({
    perms,
    onChange,
    isCustom,
    onRestore,
    onBatch,
    role,
}: {
    perms: PermissionsState;
    onChange: (module: string, access: PermissionLevel) => void;
    onScopeChange: (module: string, scope: PermissionScope) => void;
    isCustom: boolean;
    onRestore: () => void;
    onBatch: (action: 'full' | 'revoke') => void;
    role: string;
}) {
    const levels = [
        { key: 'none' as PermissionLevel, label: 'None', dot: 'bg-[var(--crm-text-soft)]', glow: '' },
        { key: 'view' as PermissionLevel, label: 'View', dot: 'bg-[var(--crm-info)]', glow: 'shadow-[var(--crm-info)]/40' },
        { key: 'edit' as PermissionLevel, label: 'Edit', dot: 'bg-[var(--crm-success)]', glow: 'shadow-[var(--crm-success)]/40' },
        { key: 'delete' as PermissionLevel, label: 'Delete', dot: 'bg-[var(--crm-danger)]', glow: 'shadow-[var(--crm-danger)]/40' },
    ];

    return (
        <div className="rounded-lg border border-[var(--crm-border)] overflow-hidden">
            {/* Grid header */}
            <div className="grid grid-cols-[1fr_56px_56px_56px_56px_80px] gap-0 bg-[var(--crm-surface-3)]/30 px-4 py-2.5 border-b border-[var(--crm-border)]">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--crm-text-soft)]">Module</span>
                {levels.map(l => (
                    <span key={l.key} className="text-[9px] font-semibold uppercase tracking-widest text-[var(--crm-text-soft)] text-center">{l.label}</span>
                ))}
                <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--crm-text-soft)] text-center">Scope</span>
            </div>

            {/* Module rows */}
            <div className="divide-y divide-[var(--crm-border)]/40">
                {MODULES.map((mod) => {
                    const p = perms[mod] ?? { access: 'none', scope: 'none' };
                    const isOverridden = ROLE_DEFAULTS[role] && p.access !== ROLE_DEFAULTS[role][mod]?.access;
                    return (
                        <div key={mod} className={cn(
                            'grid grid-cols-[1fr_56px_56px_56px_56px_80px] gap-0 px-4 py-2.5 items-center transition',
                            isOverridden ? 'bg-[var(--crm-gold-soft)]' : 'hover:bg-[var(--crm-surface-hover)]',
                        )}>
                            <span className="text-[12px] font-medium text-[var(--crm-text)]/80">{mod}</span>
                            {levels.map(l => (
                                <button key={l.key} type="button" onClick={() => onChange(mod, l.key)}
                                    className="flex items-center justify-center py-0.5 group">
                                    <span className={cn(
                                        'rounded-full transition-all duration-150',
                                        p.access === l.key
                                            ? `size-3 ${l.dot} shadow-sm ${l.glow}`
                                            : 'size-1.5 bg-[var(--crm-text-soft)] group-hover:size-2.5 group-hover:bg-[var(--crm-text-muted)]',
                                    )} />
                                </button>
                            ))}
                            <div className="flex items-center justify-center">
                                {SCOPE_MODULES.has(mod) ? (
                                    <div className="flex items-center rounded-md text-[9px] font-semibold overflow-hidden border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30">
                                        <button type="button" onClick={() => onScopeChange(mod, 'all')}
                                            className={cn('px-2 py-0.5 transition', p.scope === 'all' ? 'bg-[var(--crm-surface-2)] text-[var(--crm-text-muted)]' : 'text-[var(--crm-text-soft)] hover:text-[var(--crm-text-muted)]')}>All</button>
                                        <button type="button" onClick={() => onScopeChange(mod, 'assigned_only')}
                                            className={cn('px-2 py-0.5 transition', p.scope === 'assigned_only' ? 'bg-[var(--crm-surface-2)] text-[var(--crm-text-muted)]' : 'text-[var(--crm-text-soft)] hover:text-[var(--crm-text-muted)]')}>Asgn</button>
                                    </div>
                                ) : (
                                    <span className="text-[9px] text-[var(--crm-text-soft)]/40">—</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--crm-surface-3)]/30 border-t border-[var(--crm-border)]">
                <AppButton variant="ghost" onPress={onRestore}>Restore Role Defaults</AppButton>
                <div className="flex items-center gap-2">
                    <AppButton variant="bordered" color="success" compact onPress={() => onBatch('full')}>Grant Full Access</AppButton>
                    <AppButton variant="bordered" color="danger" compact onPress={() => onBatch('revoke')}>Revoke All Access</AppButton>
                </div>
            </div>
        </div>
    );
}

export default function AdminUsersIndex({ users, roles, filterRoles: filterRoleOptions, currentUserId }: PageProps) {
    const [activeTab, setActiveTab] = useState<TabId>('users');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [filterRoles, setFilterRoles] = useState<Set<string>>(() => new Set(filterRoleOptions.map((role) => role.id)));
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'suspended'>('all');
    const [activeKpi, setActiveKpi] = useState<string | null>(null);

    // Modals & drawers state
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '', password: '', passwordConfirmation: '', role: 'staff' as string });
    const [inviteErrors, setInviteErrors] = useState<FormErrors>({});
    const [viewProfileUser, setViewProfileUser] = useState<AdminUserRow | null>(null);
    const [editUser, setEditUser] = useState<AdminUserRow | null>(null);
    const [editPerms, setEditPerms] = useState<PermissionsState>({});
    const [editRole, setEditRole] = useState<string>('viewer');
    const [initialPerms, setInitialPerms] = useState<PermissionsState>({});
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
    const [pendingEditAction, setPendingEditAction] = useState<(() => void) | null>(null);
    const [confirmBulkAction, setConfirmBulkAction] = useState<'suspend' | 'delete' | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
    const [csvModal, setCsvModal] = useState<{ users: { name: string; email: string; role: string }[]; existing: Set<string>; overrides: Set<string> } | null>(null);
    const [auditEntries, setAuditEntries] = useState<ActivityLogEntry[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [accessUpdatingUserId, setAccessUpdatingUserId] = useState<number | null>(null);
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [openRowActionId, setOpenRowActionId] = useState<number | null>(null);
    const [bulkRoleSelectOpen, setBulkRoleSelectOpen] = useState(false);

    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter((user) => {
            const role = primaryRole(user);
            if (activeKpi === 'online' && !user.isOnline) return false;
            if (activeKpi === 'admin' && role !== 'admin') return false;
            if (activeKpi === 'manager' && role !== 'manager') return false;
            if (!filterRoles.has(role)) return false;
            if (filterStatus === 'online' && (!user.isOnline || user.isSuspended)) return false;
            if (filterStatus === 'offline' && (user.isOnline || user.isSuspended)) return false;
            if (filterStatus === 'suspended' && !user.isSuspended) return false;
            const searchable = [user.name, user.email, role, ...user.permissions].join(' ').toLowerCase();
            return q === '' || searchable.includes(q);
        });
    }, [users, query, activeKpi, filterRoles, filterStatus]);

    const totalPages = Math.ceil(filteredUsers.length / TABLE_PAGE_SIZE);
    const pagedUsers = filteredUsers.slice((page - 1) * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE);

    useEffect(() => { setPage(1); }, [query, activeKpi, filterRoles, filterStatus]);

    // ── fetch audit logs when security tab is active ──
    useEffect(() => {
        if (activeTab !== 'security') return;
        setAuditLoading(true);
        fetch('/admin/users/audit-logs')
            .then((r) => r.json())
            .then((data) => { setAuditEntries(data.logs); setAuditLoading(false); })
            .catch(() => { setAuditLoading(false); });
    }, [activeTab]);

    // ── helpers ──
    function isAllSelected() {
        return pagedUsers.length > 0 && pagedUsers.every((u) => selectedIds.has(u.id));
    }

    function hasPartialSelection() {
        return pagedUsers.some((u) => selectedIds.has(u.id)) && !isAllSelected();
    }

    function toggleAll() {
        setSelectedIds((current) => {
            const next = new Set(current);

            if (isAllSelected()) {
                pagedUsers.forEach((user) => next.delete(user.id));
            } else {
                pagedUsers.forEach((user) => next.add(user.id));
            }

            return next;
        });
    }

    function toggleOne(id: number) {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function updateUserAccess(user: AdminUserRow, isActive: boolean) {
        if (user.id === currentUserId || accessUpdatingUserId === user.id) return;

        setAccessUpdatingUserId(user.id);
        router.put(`/admin/users/${user.id}/access`, { is_active: isActive }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success(isActive ? 'User access restored.' : 'User access suspended.'),
            onError: () => toast.error('User access could not be updated.'),
            onFinish: () => setAccessUpdatingUserId(null),
        });
    }

    function UserAccessSwitch({ user }: { user: AdminUserRow }) {
        if (isProtectedAdministrator(primaryRole(user))) {
            return <span className="text-[10px] font-medium text-[var(--text-muted)]">Protected</span>;
        }

        const isCurrentUser = user.id === currentUserId;
        const isUpdating = accessUpdatingUserId === user.id;

        return (
            <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                <Switch
                    size="sm"
                    isSelected={!user.isSuspended}
                    isDisabled={isCurrentUser || isUpdating}
                    aria-label={user.isSuspended ? `Restore access for ${user.name}` : `Suspend access for ${user.name}`}
                    onChange={(isActive) => updateUserAccess(user, isActive)}
                >
                    <Switch.Content>
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                    </Switch.Content>
                </Switch>
                <span className={cn('text-[10px] font-medium', user.isSuspended ? 'text-[var(--crm-danger)]' : 'text-[var(--crm-success)]')}>
                    {user.isSuspended ? 'Inactive' : 'Active'}
                </span>
            </div>
        );
    }

    function downloadUsersCsv(records: AdminUserRow[], filename: string) {
        if (records.length === 0) {
            toast.error('There are no users to export.');
            return;
        }

        const header = 'Name,Email,Role,Status,Created,Last Active\n';
        const escapeCsv = (value: string | null) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const rows = records.map((user) => [
            user.name,
            user.email,
            primaryRole(user),
            user.isSuspended ? 'Suspended' : user.isOnline ? 'Online' : 'Offline',
            user.createdAt,
            user.lastSeenAt,
        ].map(escapeCsv).join(',')).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success(`${records.length} user(s) exported.`);
    }

    function exportCsv() {
        downloadUsersCsv(filteredUsers, 'users-export.csv');
    }

    function exportSelectedCsv() {
        downloadUsersCsv(users.filter((user) => selectedIds.has(user.id)), 'selected-users-export.csv');
    }

    async function handleCsvImport(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast.error('Choose a CSV file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (loadEvent) => {
            const text = String(loadEvent.target?.result ?? '');
            const rows = text.split(/\r?\n/).filter((line) => line.trim() !== '');
            const availableRoles = new Set(roles.map((role) => role.id.toLowerCase()));
            const importedUsers = rows.slice(1).reduce<{ name: string; email: string; role: string }[]>((result, row) => {
                const values = row.split(',').map((value) => value.trim().replace(/^"|"$/g, ''));
                const [name = '', email = '', requestedRole = 'staff'] = values;
                const role = requestedRole.toLowerCase();

                if (!name || !email) return result;
                result.push({ name, email, role: availableRoles.has(role) ? role : 'staff' });
                return result;
            }, []);

            if (importedUsers.length === 0) {
                toast.error('No valid users were found in this CSV.');
                return;
            }

            try {
                const response = await fetch('/admin/users/invite/bulk/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name=csrf-token]') as HTMLMetaElement | null)?.content ?? '',
                    },
                    body: JSON.stringify({ emails: importedUsers.map((user) => user.email) }),
                });

                if (!response.ok) throw new Error('Validation request failed.');

                const payload = await response.json();
                setCsvModal({
                    users: importedUsers,
                    existing: new Set(Array.isArray(payload.existing) ? payload.existing : []),
                    overrides: new Set(),
                });
            } catch {
                toast.error('Could not validate the CSV. Try again.');
            }
        };
        reader.readAsText(file);
    }

    function handleInvite(e: FormEvent) {
        e.preventDefault();
        setInviteErrors({});
        router.post('/admin/users', {
            name: `${inviteForm.firstName} ${inviteForm.lastName}`.trim(),
            email: inviteForm.email,
            role: inviteForm.role,
            password: inviteForm.password,
            password_confirmation: inviteForm.passwordConfirmation,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsInviteOpen(false);
                setInviteForm({ firstName: '', lastName: '', email: '', password: '', passwordConfirmation: '', role: 'staff' });
                toast.success(`User account created for ${inviteForm.email}`);
            },
            onError: (err) => setInviteErrors(err),
        });
    }

    // ── KPI metrics ──
    const metrics = useMemo(() => {
        const activeUsers = users.filter((user) => user.isOnline).length;
        const adminUsers = users.filter((user) => isProtectedAdministrator(primaryRole(user))).length;
        const managerUsers = users.filter((user) => primaryRole(user) === 'manager').length;

        return [
            { key: 'total', label: 'Total users', value: users.length, detail: `${users.length} account${users.length === 1 ? '' : 's'} in this company`, icon: Users, color: 'text-[var(--crm-gold)]', accentColor: 'var(--crm-gold)' },
            { key: 'online', label: 'Active now', value: activeUsers, detail: 'Active within the last five minutes', icon: UserCheck, color: 'text-[var(--crm-success)]', accentColor: 'var(--crm-success)' },
            { key: 'admin', label: 'Admins', value: adminUsers, detail: 'Accounts with full administration access', icon: ShieldAlert, color: 'text-[var(--crm-danger)]', accentColor: 'var(--crm-danger)' },
            { key: 'manager', label: 'Managers', value: managerUsers, detail: 'Accounts with management access', icon: ShieldCheck, color: 'text-[var(--crm-violet)]', accentColor: 'var(--crm-violet)' },
        ];
    }, [users]);

    const activeFilterCount = Number(filterRoles.size !== filterRoleOptions.length) + Number(filterStatus !== 'all');

    // ── Firm Profile state ──
    // ── User table columns ──
    const userColumns: AppWorkspaceTableColumn<AdminUserRow>[] = [
        {
            id: 'select',
            label: (
                <Checkbox isSelected={isAllSelected()} isIndeterminate={hasPartialSelection()} onChange={toggleAll} aria-label="Select all visible users">
                    <Checkbox.Content>
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                    </Checkbox.Content>
                </Checkbox>
            ),
            headerClassName: 'w-12',
            reorderable: false,
            fixedPosition: 'start',
            render: (user) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox isSelected={selectedIds.has(user.id)} onChange={() => toggleOne(user.id)} aria-label={`Select ${user.name}`}>
                        <Checkbox.Content>
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                        </Checkbox.Content>
                    </Checkbox>
                </div>
            ),
        },
        {
            id: 'name',
            label: 'User Name',
            icon: <UserCog size={13} />,
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-bold text-[var(--crm-gold)]">{initials(user.name)}</div>
                    <div className="min-w-0">
                        <p className="text-[12px] font-medium text-[var(--text)] truncate max-w-[180px]">{user.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[180px]">{user.email}</p>
                    </div>
                </div>
            ),
        },
        {
            id: 'email',
            label: 'Email Address',
            icon: <Mail size={13} />,
            render: (user) => <span className="text-[11px] text-[var(--text-muted)]">{user.email}</span>,
        },
        {
            id: 'role',
            label: 'User Role',
            icon: <ShieldCheck size={13} />,
            render: (user) => {
                const role = primaryRole(user);
                const Icon = roleIcon(role);
                const rs = ROLE_STYLES[role] || ROLE_STYLES.viewer;
                return (
                    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold', rs.bg, rs.text)}>
                        <span className={cn('size-1.5 rounded-full', rs.dot)} /><Icon size={12} />{formatRoleLabel(role)}
                    </span>
                );
            },
        },
        {
            id: 'status',
            label: 'Status',
            icon: <UserCheck size={13} />,
            render: (user) => user.isSuspended ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-danger)]/20 bg-[var(--crm-danger-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--crm-danger)]">
                    <span className="size-1.5 rounded-full bg-[var(--crm-danger)]" />Suspended
                </span>
            ) : user.isOnline ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-success)]/20 bg-[var(--crm-success-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--crm-success)]">
                    <span className="size-1.5 rounded-full bg-[var(--crm-success)]" />Online
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
                    <span className="size-1.5 rounded-full bg-[var(--text-muted)]" />Offline
                </span>
            ),
        },
        {
            id: 'access',
            label: 'Access',
            icon: <Power size={13} />,
            render: (user) => <UserAccessSwitch user={user} />,
        },
        {
            id: 'created',
            label: 'Add Date',
            icon: <CalendarDays size={13} />,
            render: (user) => <span className="text-[11px] text-[var(--text-muted)] tabular-nums">{formatDate(user.createdAt)}</span>,
        },
        {
            id: 'lastActive',
            label: 'Last Active',
            icon: <Clock3 size={13} />,
            render: (user) => <span className="text-[11px] text-[var(--text-muted)] tabular-nums">{user.lastSeenAt ? formatDate(user.lastSeenAt) : '-'}</span>,
        },
        {
            id: 'actions',
            label: '',
            headerClassName: 'w-10',
            reorderable: false,
            fixedPosition: 'end',
            render: (user) => (
                <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => setViewProfileUser(user)} className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" title="View Profile">
                        <Eye size={12} />
                    </button>
                    <button type="button" onClick={() => { const role = primaryRole(user); const saved = user.permissionConfiguration?.modules; const defaults = saved ?? cloneDefaults(role); setEditUser(user); setEditRole(role); setEditPerms(defaults); setInitialPerms(JSON.parse(JSON.stringify(defaults))); setPendingEditAction(null); }} className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" title="Edit Details">
                        <PenLine size={12} />
                    </button>
                    <Dropdown
                        isOpen={openRowActionId === user.id}
                        onOpenChange={(isOpen) => setOpenRowActionId(isOpen ? user.id : null)}
                    >
                        <Dropdown.Trigger className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]" aria-label="Actions">
                            <EllipsisVertical size={12} />
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom end" className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                            <Dropdown.Menu
                                aria-label="Actions"
                                onAction={(key) => {
                                    setOpenRowActionId(null);

                                    if (key === 'delete') setDeleteTarget(user);
                                }}
                            >
                                <Dropdown.Item key="delete" id="delete" textValue="Delete User" className="text-[var(--danger)] data-[hover]:bg-[var(--danger)]/10">
                                    <div className="flex items-center gap-2"><span className="flex size-4 shrink-0 items-center justify-center"><Trash2 size={14} /></span><span>Delete User</span></div>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="User Management" />
            <AppShell>
                <div className="w-full space-y-5">
                    {/* ── Page header ── */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-[var(--crm-text)]">User Management</h1>
                            <p className="text-[12px] text-[var(--crm-text-muted)] mt-0.5">Manage team access, roles, and permissions.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <AppButton isIconOnly compact variant="solid" color="primary" tooltip="Add User" aria-label="Add User" onPress={() => { setInviteErrors({}); setInviteForm({ firstName: '', lastName: '', email: '', password: '', passwordConfirmation: '', role: 'staff' }); setIsInviteOpen(true); }}>
                                <Plus size={16} />
                            </AppButton>
                        </div>
                    </div>

                    <AppWorkspaceTabs tabs={TABS} selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as TabId)}>

                    <TabPanel id="users" className="outline-none">
                            {/* KPI cards */}
                            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {metrics.map((m) => {
                                    const Icon = m.icon;
                                    const isActive = activeKpi === m.key;
                                    return <AppKpiCard key={m.key} label={m.label} value={m.value} detail={m.detail} icon={<Icon size={15} className={m.color} />} accentColor={m.accentColor} valueClassName={m.color} onPress={() => setActiveKpi(isActive ? null : m.key)} isSelected={isActive} />;
                                })}
                            </div>

                            {/* ── Users table ── */}
                            <AppWorkspaceTable
                                ariaLabel="Users & Permissions"
                                columns={userColumns}
                                data={pagedUsers}
                                rowKey={(user) => user.id}
                                minTableWidthClassName="min-w-[860px]"
                                columnOrderStorageKey="archilbo.admin-users.table.columns.v1"
                                columnOrderHint="Drag to reorder this column"
                                onRowPress={(user) => setViewProfileUser(user)}
                                emptyContent={<AppEmptyState title="No users found" description="No users match the current filters." />}
                                toolbar={
                                    selectedIds.size > 0 ? (
                                        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--accent)]/15 bg-[var(--accent-soft)]/70 px-4 py-3">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div>
                                                    <p className="text-xs font-semibold text-[var(--foreground)]">Bulk actions</p>
                                                    <Chip size="sm" variant="soft" color="warning" startContent={<Check size={12} strokeWidth={2.5} />} className="mt-1 h-5 px-1.5 text-[9px]">
                                                        {selectedIds.size} selected
                                                    </Chip>
                                                </div>
                                            </div>
                                            <div className="ml-auto flex flex-wrap items-center gap-2">
                                                <Select
                                                    aria-label="Assign role to selected users"
                                                    isOpen={bulkRoleSelectOpen}
                                                    onOpenChange={setBulkRoleSelectOpen}
                                                    onChange={(key) => {
                                                        if (!key) return;
                                                        setBulkRoleSelectOpen(false);
                                                        router.put('/admin/users/bulk/role', { userIds: [...selectedIds], role: String(key) }, {
                                                            preserveScroll: true,
                                                            onSuccess: () => { setSelectedIds(new Set()); toast.success(`Role updated for ${selectedIds.size} user(s).`); },
                                                            onError: () => toast.error('Could not update roles.'),
                                                        });
                                                    }}
                                                >
                                                    <Select.Trigger className="h-8 min-w-[150px] rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] shadow-sm transition hover:border-[var(--text-muted)]">
                                                        <Select.Value className="flex-1 truncate text-left" placeholder="Change role" />
                                                        <Select.Indicator />
                                                    </Select.Trigger>
                                                    <Select.Popover className="z-[120] min-w-[150px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                                                        <ListBox aria-label="Assign role to selected users" className="gap-0">
                                                            {roles.map((role) => (
                                                                <ListBox.Item key={role.id} id={role.id} textValue={role.label} className="rounded-lg px-2.5 py-2 text-xs">
                                                                    {role.label}
                                                                </ListBox.Item>
                                                            ))}
                                                        </ListBox>
                                                    </Select.Popover>
                                                </Select>
                                                <AppButton variant="bordered" compact onPress={exportSelectedCsv}>
                                                    <Download size={12} />Export selected
                                                </AppButton>
                                                <AppButton variant="bordered" compact onPress={() => setConfirmBulkAction('suspend')}><UserMinus size={12} />Suspend</AppButton>
                                                <AppButton isIconOnly compact size="sm" variant="solid" color="danger" tooltip="Delete selected users" aria-label="Delete selected users" onPress={() => setConfirmBulkAction('delete')}><Trash2 size={14} /></AppButton>
                                                <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Clear selection" aria-label="Clear selection" onPress={() => setSelectedIds(new Set())}><X size={14} /></AppButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-[11px] font-semibold text-[var(--text)]">User Details</span>
                                                    <span className="flex h-4 min-w-[20px] items-center justify-center rounded bg-[var(--surface-2)] px-1.5 text-[9px] font-bold text-[var(--text-muted)]">{filteredUsers.length}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        size="sm"
                                                        type="text"
                                                        value={query}
                                                        onChange={(e) => setQuery(e.target.value)}
                                                        placeholder="Search name, email, role, or permission..."
                                                        aria-label="Search users"
                                                        classNames={{
                                                            base: 'w-full sm:w-[280px]',
                                                            input: 'text-[11px]',
                                                            inputWrapper: 'h-8 min-h-8 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)]/65 px-2 shadow-sm shadow-black/10 transition hover:border-[var(--text-muted)] focus-within:border-[var(--accent)] focus-within:bg-[var(--surface)]',
                                                        }}
                                                        startContent={<span className="flex size-5 items-center justify-center rounded-md bg-[var(--surface)] text-[var(--accent)]"><Search size={12} /></span>}
                                                        endContent={query ? (
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="ghost"
                                                                aria-label="Clear user search"
                                                                className="-mr-1 size-6 min-w-6 text-[var(--text-muted)]"
                                                                onPress={() => setQuery('')}
                                                            >
                                                                <X size={13} />
                                                            </Button>
                                                        ) : null}
                                                    />
                                                    <Dropdown isOpen={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
                                                        <Dropdown.Trigger>
                                                            <Button
                                                                size="sm"
                                                                variant="bordered"
                                                                className={cn(
                                                                    'h-7 min-h-7 gap-1.5 px-2 text-[10px] font-medium',
                                                                    filterRoles.size !== filterRoleOptions.length || filterStatus !== 'all'
                                                                        ? 'border-[var(--accent)] text-[var(--accent)]'
                                                                        : '',
                                                                )}
                                                            >
                                                                <SlidersHorizontal size={12} />
                                                                Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                                                            </Button>
                                                        </Dropdown.Trigger>
                                                        <Dropdown.Popover placement="bottom end" className="z-[80] min-w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                                                            <Dropdown.Menu
                                                                aria-label="Filter users"
                                                                closeOnSelect={false}
                                                                itemClasses={{ base: 'rounded-lg px-2 py-1.5 text-[11px] font-medium text-[var(--text)] transition data-[hover]:bg-[var(--surface-2)]' }}
                                                            >
                                                                <Dropdown.Section title="By role" className="mb-0">
                                                                    {filterRoleOptions.map((role) => (
                                                                        <Dropdown.Item
                                                                            key={role.id}
                                                                            startContent={
                                                                                <span className={cn('flex size-4 items-center justify-center rounded border transition', filterRoles.has(role.id) ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]')}>
                                                                                    {filterRoles.has(role.id) && <Check size={10} strokeWidth={3} className="text-white" />}
                                                                                </span>
                                                                            }
                                                                            onPress={() => {
                                                                                const nextRoles = new Set(filterRoles);
                                                                                if (nextRoles.has(role.id)) nextRoles.delete(role.id);
                                                                                else nextRoles.add(role.id);
                                                                                setFilterRoles(nextRoles);
                                                                            }}
                                                                        >
                                                                            {role.label}
                                                                        </Dropdown.Item>
                                                                    ))}
                                                                </Dropdown.Section>
                                                                <Dropdown.Section title="By status">
                                                                    {(['all', 'online', 'offline', 'suspended'] as const).map((s) => (
                                                                        <Dropdown.Item
                                                                            key={s}
                                                                            className="capitalize"
                                                                            startContent={
                                                                                <span className={cn('flex size-4 items-center justify-center rounded-full border transition', filterStatus === s ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]')}>
                                                                                    {filterStatus === s && <Check size={10} strokeWidth={3} className="text-white" />}
                                                                                </span>
                                                                            }
                                                                            onPress={() => setFilterStatus(s)}
                                                                        >
                                                                            {s}
                                                                        </Dropdown.Item>
                                                                    ))}
                                                                </Dropdown.Section>
                                                                {activeFilterCount > 0 ? (
                                                                    <Dropdown.Section>
                                                                        <Dropdown.Item
                                                                            id="reset-filters"
                                                                            className="text-[var(--accent)]"
                                                                            onPress={() => {
                                                                                setFilterRoles(new Set(filterRoleOptions.map((role) => role.id)));
                                                                                setFilterStatus('all');
                                                                            }}
                                                                        >
                                                                            Reset filters
                                                                        </Dropdown.Item>
                                                                    </Dropdown.Section>
                                                                ) : null}
                                                            </Dropdown.Menu>
                                                        </Dropdown.Popover>
                                                    </Dropdown>
                                                    <input id="csv-import" type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvImport} />
                                                    <AppButton isIconOnly compact variant="ghost" tooltip="Import CSV" aria-label="Import CSV" onPress={() => (document.getElementById('csv-import') as HTMLInputElement | null)?.click()}>
                                                        <Upload size={16} />
                                                    </AppButton>
                                                    <AppButton isIconOnly compact variant="ghost" tooltip="Export CSV" onPress={exportCsv}><Download size={16} /></AppButton>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                footer={
                                    <div className="flex items-center justify-between px-3 py-2">
                                        <span className="text-[9px] text-[var(--text-muted)]">Showing {filteredUsers.length === 0 ? 0 : (page - 1) * TABLE_PAGE_SIZE + 1}–{Math.min(page * TABLE_PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}</span>
                                        <div className="flex items-center gap-1.5">
                                            <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Previous page" isDisabled={page <= 1} onPress={() => setPage(Math.max(1, page - 1))}><ChevronLeft size={14} /></AppButton>
                                            <span className="min-w-10 text-center text-[9px] font-semibold tabular-nums text-[var(--text-muted)]">{page} / {totalPages || 1}</span>
                                            <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Next page" isDisabled={page >= totalPages || totalPages === 0} onPress={() => setPage(Math.min(totalPages, page + 1))}><ChevronRight size={14} /></AppButton>
                                        </div>
                                    </div>
                                }
                            />
                    </TabPanel>

                    <TabPanel id="security" className="outline-none">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[12px] text-[var(--crm-text-soft)]">Track all security-related events and changes in the system.</p>
                                <AppButton isIconOnly compact variant="ghost" tooltip="Download Audit Log" aria-label="Download Audit Log" onPress={exportCsv}>
                                    <Download size={16} />
                                </AppButton>
                            </div>
                            <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30 overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--crm-border)]">
                                            {['Timestamp', 'User', 'Action Taken', 'IP Address'].map((label) => (
                                                <th key={label} className="px-3 py-2.5 text-left text-[9px] font-semibold uppercase tracking-wider text-[var(--crm-text-soft)]">{label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--crm-border)]/40">
                                        {auditLoading ? (
                                            <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-[var(--crm-text-soft)]">Loading audit logs...</td></tr>
                                        ) : auditEntries.length === 0 ? (
                                            <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-[var(--crm-text-soft)]">No audit logs yet.</td></tr>
                                        ) : auditEntries.map((entry) => (
                                            <tr key={entry.id} className="text-[12px] text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-hover)] transition">
                                                <td className="px-3 py-2.5 tabular-nums text-[var(--crm-text-soft)]">{entry.timestamp}</td>
                                                <td className="px-3 py-2.5 font-medium text-[var(--crm-text)]/70">{entry.user}</td>
                                                <td className="px-3 py-2.5 text-[var(--crm-text-muted)]">{entry.action}</td>
                                                <td className="px-3 py-2.5 font-mono text-[11px] text-[var(--crm-text-soft)]">{entry.ip}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                    </TabPanel>
                </AppWorkspaceTabs>
                </div>

                {/* ── Modal: Invite New Team Member ── */}
                <AppModal isOpen={isInviteOpen} onOpenChange={(o) => { if (!o) { setIsInviteOpen(false); setInviteErrors({}); } }} title="Create user account" size="sm">
                    <form onSubmit={handleInvite} className="space-y-4">
                        <AppTextField label="First Name" placeholder="First name" value={inviteForm.firstName}
                            onChange={(v) => setInviteForm((p) => ({ ...p, firstName: v }))}
                            error={firstError(inviteErrors, 'name')} isRequired />
                        <AppTextField label="Last Name" placeholder="Last name" value={inviteForm.lastName}
                            onChange={(v) => setInviteForm((p) => ({ ...p, lastName: v }))} />
                        <AppTextField label="Email Address" placeholder="user@example.com" value={inviteForm.email}
                            onChange={(v) => setInviteForm((p) => ({ ...p, email: v }))}
                            error={firstError(inviteErrors, 'email')} isRequired />
                        <AppSelect label="Assign Role" placeholder="Select a role"
                            selectedKey={inviteForm.role}
                            onSelectionChange={(v: Key | null) => setInviteForm((p) => ({ ...p, role: v ? String(v) : 'staff' }))}
                            error={firstError(inviteErrors, 'role')}
                            options={roles.map((r) => ({ id: r.id, label: r.label }))} />
                        <AppTextField label="Password" type="password" placeholder="Set a secure password" value={inviteForm.password}
                            onChange={(v) => setInviteForm((p) => ({ ...p, password: v }))}
                            description="At least 12 characters with uppercase, lowercase, number, and symbol."
                            error={firstError(inviteErrors, 'password')} isRequired />
                        <AppTextField label="Confirm password" type="password" placeholder="Repeat the password" value={inviteForm.passwordConfirmation}
                            onChange={(v) => setInviteForm((p) => ({ ...p, passwordConfirmation: v }))}
                            error={firstError(inviteErrors, 'password_confirmation')} isRequired />
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <AppButton variant="bordered" onPress={() => setIsInviteOpen(false)}>Cancel</AppButton>
                            <AppButton type="submit" variant="solid" color="primary">Create user</AppButton>
                        </div>
                    </form>
                </AppModal>

                {/* ── Drawer: View Profile ── */}
                <AppDrawer
                    isOpen={Boolean(viewProfileUser)}
                    onOpenChange={(open) => { if (!open) setViewProfileUser(null); }}
                    title="User profile"
                    description="Account access and current status"
                    headerIcon={<UserCog size={17} />}
                    size="md"
                    footer={viewProfileUser ? (
                        <AppButton
                            variant="solid"
                            color="primary"
                            onPress={() => {
                                const role = primaryRole(viewProfileUser);
                                const defaults = cloneDefaults(role);
                                setEditUser(viewProfileUser);
                                setEditRole(role);
                                setEditPerms(defaults);
                                setInitialPerms(JSON.parse(JSON.stringify(defaults)));
                                setViewProfileUser(null);
                            }}
                        >
                            <PenLine size={15} />Edit permissions
                        </AppButton>
                    ) : null}
                >
                    {viewProfileUser ? (
                        <div className="space-y-4">
                            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/45 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--crm-gold-soft)] text-sm font-bold text-[var(--crm-gold)]">
                                        {initials(viewProfileUser.name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="truncate text-base font-semibold text-[var(--foreground)]">{viewProfileUser.name}</h2>
                                        <p className="mt-0.5 truncate text-sm text-[var(--text-muted)]">{viewProfileUser.email}</p>
                                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                            {viewProfileUser.roles.map((role) => {
                                                const style = ROLE_STYLES[role] ?? ROLE_STYLES.viewer;

                                                return (
                                                    <Chip key={role} size="sm" variant="soft" className={cn('h-6 gap-1 px-2 text-[9px] font-semibold', style.bg, style.text)}>
                                                        <span className={cn('size-1.5 rounded-full', style.dot)} />
                                                        {formatRoleLabel(role)}
                                                    </Chip>
                                                );
                                            })}
                                            <Chip
                                                size="sm"
                                                variant="soft"
                                                className={cn(
                                                    'h-6 px-2 text-[9px] font-semibold',
                                                    viewProfileUser.isSuspended
                                                        ? 'bg-[var(--crm-danger-soft)] text-[var(--crm-danger)]'
                                                        : viewProfileUser.isOnline
                                                            ? 'bg-[var(--crm-success-soft)] text-[var(--crm-success)]'
                                                            : 'bg-[var(--surface)] text-[var(--text-muted)]',
                                                )}
                                            >
                                                {viewProfileUser.isSuspended ? 'Suspended' : viewProfileUser.isOnline ? 'Online' : 'Offline'}
                                            </Chip>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <dl className="grid grid-cols-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)]">
                                {[
                                    ['Account', viewProfileUser.isSuspended ? 'Suspended' : 'Active'],
                                    ['Last active', viewProfileUser.isOnline ? 'Online now' : viewProfileUser.lastSeenAt ? formatDate(viewProfileUser.lastSeenAt) : 'No activity'],
                                    ['Joined', formatDate(viewProfileUser.createdAt)],
                                ].map(([label, value]) => (
                                    <div key={label} className="min-w-0 bg-[var(--surface)] px-3 py-2.5">
                                        <dt className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</dt>
                                        <dd className="mt-1 truncate text-xs font-semibold text-[var(--foreground)]">{value}</dd>
                                    </div>
                                ))}
                            </dl>

                            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-3.5 py-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Access</h3>
                                        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Effective permissions from the assigned roles.</p>
                                    </div>
                                    <Chip size="sm" variant="soft" className="h-6 shrink-0 px-2 text-[9px] text-[var(--text-muted)]">
                                        {viewProfileUser.permissions.length}
                                    </Chip>
                                </div>

                                {viewProfileUser.permissions.length > 0 ? (
                                    <Accordion className="px-1.5 py-1" allowsMultipleExpanded>
                                        {groupPermissions(viewProfileUser.permissions).map(([module, permissions]) => (
                                            <Accordion.Item key={module} id={module} className="border-b border-[var(--border)] last:border-b-0">
                                                <Accordion.Heading>
                                                    <Accordion.Trigger className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left outline-none transition hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
                                                        <span className="flex min-w-0 flex-1 items-center gap-2">
                                                            <span className="size-1.5 rounded-full bg-[var(--accent)]" />
                                                            <span className="truncate text-xs font-semibold text-[var(--foreground)]">{module}</span>
                                                            <span className="text-[9px] text-[var(--text-muted)]">{permissions.length}</span>
                                                        </span>
                                                        <Accordion.Indicator className="text-[var(--text-muted)]"><ChevronDown size={14} /></Accordion.Indicator>
                                                    </Accordion.Trigger>
                                                </Accordion.Heading>
                                                <Accordion.Panel>
                                                    <Accordion.Body className="flex flex-wrap gap-1.5 px-2.5 pb-3">
                                                        {permissions.map((permission) => (
                                                            <Chip key={permission} size="sm" variant="soft" className="h-6 bg-[var(--surface-2)] px-2 text-[9px] text-[var(--text-muted)]">
                                                                {permissionActionLabel(permission)}
                                                            </Chip>
                                                        ))}
                                                    </Accordion.Body>
                                                </Accordion.Panel>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <p className="m-3 rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-sm text-[var(--text-muted)]">
                                        This account currently inherits its role permissions.
                                    </p>
                                )}
                            </section>
                        </div>
                    ) : null}
                </AppDrawer>

                {/* ── Modal: Edit Details (RBAC) ── */}
                <AppModal isOpen={!!editUser} onOpenChange={(o) => {
                    if (!o) {
                        if (JSON.stringify(editPerms) !== JSON.stringify(initialPerms)) {
                            setShowUnsavedWarning(true);
                            setPendingEditAction(() => () => { setEditUser(null); setShowUnsavedWarning(false); });
                            return;
                        }
                        setEditUser(null);
                    }
                }} title="" size="lg">
                    {editUser && (
                        <div className="px-1">
                            {/* ── User identity ── */}
                            <div className="flex items-center gap-4 mb-7">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--crm-gold-soft)] text-xl font-bold text-[var(--crm-gold)]">{initials(editUser.name)}</div>
                                <div>
                                    <p className="text-lg font-semibold text-[var(--crm-text)]/90">{editUser.name}</p>
                                    <p className="text-[12px] text-[var(--crm-text-muted)]">{editUser.email}</p>
                                </div>
                            </div>

                            {/* ── Role + Restore ── */}
                            <div className="flex items-end gap-4 mb-7">
                                <div className="flex-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--crm-text-soft)] mb-2 block">Access Role</label>
                                    <select value={editRole} onChange={(e) => {
                                        const newRole = e.target.value;
                                        setEditRole(newRole);
                                        setEditPerms(cloneDefaults(newRole));
                                    }}
                                        className="h-10 w-full max-w-xs rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30 px-3 text-[12px] text-[var(--crm-text)]/70 outline-none transition focus:border-[var(--crm-border-strong)] focus:ring-2 focus:ring-[var(--crm-gold)]/15 cursor-pointer appearance-none">
                                        {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={() => setEditPerms(cloneDefaults(editRole))}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-medium transition',
                                        JSON.stringify(editPerms) !== JSON.stringify(cloneDefaults(editRole))
                                            ? 'border border-[var(--crm-gold)]/20 text-[var(--crm-gold)] hover:bg-[var(--crm-gold-soft)]'
                                            : 'border border-[var(--crm-border)] text-[var(--crm-text-soft)] hover:text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-hover)]',
                                    )}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                                    Restore Defaults
                                </button>
                            </div>

                            {/* ── Permissions grid ── */}
                            <div className="mb-2">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--crm-text-soft)]">Module Permissions</label>
                                    {JSON.stringify(editPerms) !== JSON.stringify(initialPerms) && (
                                        <span className="text-[9px] text-[var(--crm-gold)]/60">Customized from role defaults</span>
                                    )}
                                </div>
                                <PermissionsMatrix
                                    perms={editPerms}
                                    onChange={(mod, access) => setEditPerms((p) => ({ ...p, [mod]: { ...p[mod], access } }))}
                                    onScopeChange={(mod, scope) => setEditPerms((p) => ({ ...p, [mod]: { ...p[mod], scope } }))}
                                    isCustom={JSON.stringify(editPerms) !== JSON.stringify(cloneDefaults(editRole))}
                                    onRestore={() => setEditPerms(cloneDefaults(editRole))}
                                    onBatch={(action) => {
                                        const level = action === 'full' ? 'delete' as PermissionLevel : 'none' as PermissionLevel;
                                        setEditPerms((p) => {
                                            const next: PermissionsState = {};
                                            MODULES.forEach((m) => {
                                                const cur = p[m] || { access: 'none', scope: 'none' };
                                                next[m] = { access: level, scope: cur.scope };
                                            });
                                            return next;
                                        });
                                    }}
                                    role={editRole}
                                />
                            </div>

                            {/* ── Footer actions ── */}
                            <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t border-[var(--crm-border)]">
                                <AppButton variant="bordered" onPress={() => {
                                    if (JSON.stringify(editPerms) !== JSON.stringify(initialPerms)) {
                                        setShowUnsavedWarning(true);
                                        setPendingEditAction(() => () => { setEditUser(null); setShowUnsavedWarning(false); });
                                        return;
                                    }
                                    setEditUser(null);
                                }}>Cancel</AppButton>
                                <AppButton variant="solid" color="primary" onPress={() => {
                                    const payload = {
                                        userId: editUser.id,
                                        role: editRole,
                                        isCustom: editUser.permissionConfiguration?.is_custom === true || JSON.stringify(editPerms) !== JSON.stringify(cloneDefaults(editRole)),
                                        permissions: editPerms,
                                    };
                                    router.put(`/admin/users/${editUser.id}/permissions`, payload, {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setEditUser(null);
                                            toast.success('Permissions updated successfully.');
                                        },
                                        onError: () => toast.error('Could not update permissions.'),
                                    });
                                }}>Save Changes</AppButton>
                            </div>
                        </div>
                    )}
                </AppModal>

                {/* ── Modal: Unsaved Changes Warning ── */}
                <AppModal isOpen={showUnsavedWarning} onOpenChange={(o) => { if (!o) { setShowUnsavedWarning(false); setPendingEditAction(null); } }} title="" size="sm">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex size-12 items-center justify-center rounded-full bg-[var(--crm-gold-soft)]">
                                <AlertTriangle size={22} className="text-[var(--crm-gold)]" />
                            </div>
                        </div>
                        <h3 className="text-base font-semibold text-[var(--crm-text)]/90 mb-2">Unsaved Changes</h3>
                        <p className="text-[12px] text-[var(--crm-text-muted)] leading-relaxed">
                            You have unsaved permission changes. Discard them?
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <AppButton variant="bordered" onPress={() => { setShowUnsavedWarning(false); setPendingEditAction(null); }}>Keep Editing</AppButton>
                            <AppButton variant="solid" color="danger" onPress={() => { pendingEditAction?.(); }}>Discard Changes</AppButton>
                        </div>
                    </div>
                </AppModal>

                {/* ── Modal: Confirm Bulk Action ── */}
                <AppModal isOpen={!!confirmBulkAction} onOpenChange={(o) => { if (!o) setConfirmBulkAction(null); }} title="" size="sm">
                    {confirmBulkAction && (
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className={cn(
                                    'flex size-12 items-center justify-center rounded-full',
                                    confirmBulkAction === 'delete' ? 'bg-[var(--crm-danger-soft)]' : 'bg-[var(--crm-gold-soft)]',
                                )}>
                                    <AlertTriangle size={22} className={confirmBulkAction === 'delete' ? 'text-[var(--crm-danger)]' : 'text-[var(--crm-gold)]'} />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold text-[var(--crm-text)]/90 mb-2">
                                {confirmBulkAction === 'delete' ? 'Remove Users' : 'Suspend Users'}
                            </h3>
                            <p className="text-[12px] text-[var(--crm-text-muted)] leading-relaxed">
                                {confirmBulkAction === 'delete'
                                    ? `${selectedIds.size} user(s) will lose all access immediately. This cannot be undone.`
                                    : `${selectedIds.size} user(s) will lose access until manually reinstated.`}
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <AppButton variant="bordered" onPress={() => setConfirmBulkAction(null)}>Cancel</AppButton>
                                {confirmBulkAction === 'delete' ? (
                                    <AppButton variant="solid" color="danger" onPress={() => {
                                        const ids = [...selectedIds];
                                        setConfirmBulkAction(null);
                                        router.post('/admin/users/bulk/delete', { userIds: ids }, {
                                            preserveScroll: true,
                                            onSuccess: () => { setSelectedIds(new Set()); toast.success('Bulk deletion processed.'); },
                                            onError: () => toast.error('Could not remove some users.'),
                                        });
                                    }}>Yes, Remove Users</AppButton>
                                ) : (
                                    <AppButton variant="solid" color="primary" onPress={() => {
                                        const ids = [...selectedIds];
                                        setConfirmBulkAction(null);
                                        router.put('/admin/users/bulk/suspend', { userIds: ids }, {
                                            preserveScroll: true,
                                            onSuccess: () => { setSelectedIds(new Set()); toast.success('Bulk suspension processed.'); },
                                            onError: () => toast.error('Could not suspend users.'),
                                        });
                                    }}>Yes, Suspend Users</AppButton>
                                )}
                            </div>
                        </div>
                    )}
                </AppModal>

                {/* ── Modal: Delete User ── */}
                {/* ── Modal: CSV Import Review ── */}
                <AppModal isOpen={!!csvModal} onOpenChange={(o) => { if (!o) setCsvModal(null); }} title="Review CSV Import" size="lg">
                    {csvModal && (
                        <div className="space-y-4">
                            <p className="text-[12px] text-[var(--crm-text-muted)]">
                                {csvModal.users.filter(u => !csvModal.existing.has(u.email)).length} new · {csvModal.existing.size} existing
                            </p>
                            <div className="max-h-[320px] overflow-y-auto rounded-lg border border-[var(--crm-border)] divide-y divide-[var(--crm-border)]/40">
                                {csvModal.users.map((u, i) => {
                                    const isDuplicate = csvModal.existing.has(u.email);
                                    const isOverridden = csvModal.overrides.has(u.email);
                                    return (
                                        <div key={i} className={cn(
                                            'flex items-center justify-between px-4 py-2.5 transition',
                                            isDuplicate ? (isOverridden ? 'bg-[var(--crm-gold-soft)]' : 'bg-[var(--crm-surface-3)]/30') : '',
                                        )}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[9px] font-bold text-[var(--crm-gold)]">
                                                    {u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[12px] font-medium text-[var(--crm-text)]/80 truncate">{u.name}</p>
                                                    <p className="text-[10px] text-[var(--crm-text-soft)] truncate">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="rounded-md bg-[var(--crm-surface-hover)] px-2 py-0.5 text-[9px] font-semibold capitalize text-[var(--crm-text-soft)]">{u.role}</span>
                                                {isDuplicate && (
                                                    <div className="flex items-center rounded-md border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30 text-[9px] font-semibold overflow-hidden">
                                                        <button type="button" onClick={() => {
                                                            setCsvModal((p) => {
                                                                if (!p) return p;
                                                                const next = new Set(p.overrides);
                                                                next.delete(u.email);
                                                                return { ...p, overrides: next };
                                                            });
                                                        }}
                                                            className={cn('px-2 py-0.5 transition', !isOverridden ? 'bg-[var(--crm-surface-2)] text-[var(--crm-text-muted)]' : 'text-[var(--crm-text-soft)] hover:text-[var(--crm-text-muted)]')}>Skip</button>
                                                        <button type="button" onClick={() => {
                                                            setCsvModal((p) => {
                                                                if (!p) return p;
                                                                const next = new Set(p.overrides);
                                                                next.add(u.email);
                                                                return { ...p, overrides: next };
                                                            });
                                                        }}
                                                            className={cn('px-2 py-0.5 transition', isOverridden ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]' : 'text-[var(--crm-text-soft)] hover:text-[var(--crm-text-muted)]')}>Override</button>
                                                    </div>
                                                )}
                                                {!isDuplicate && (
                                                    <span className="text-[9px] font-medium text-[var(--crm-success)]/60">New</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-[var(--crm-border)]">
                                <span className="text-[10px] text-[var(--crm-text-soft)]">
                                    {csvModal.existing.size > 0 && (
                                        <>{csvModal.overrides.size} of {csvModal.existing.size} duplicate(s) will be overridden</>
                                    )}
                                </span>
                                <div className="flex items-center gap-2">
                                    <AppButton variant="bordered" onPress={() => setCsvModal(null)}>Cancel</AppButton>
                                    <AppButton variant="solid" color="primary" onPress={() => {
                                        const overrides: Record<string, boolean> = {};
                                        csvModal.overrides.forEach((e) => { overrides[e] = true; });
                                        const payload = { users: csvModal.users, overrides };
                                        setCsvModal(null);
                                        router.post('/admin/users/invite/bulk', payload, {
                                            preserveScroll: true,
                                            onSuccess: () => toast.success('CSV import completed.'),
                                            onError: () => toast.error('CSV import failed.'),
                                        });
                                    }}>
                                        Import {csvModal.users.length} User{csvModal.users.length > 1 ? 's' : ''}
                                    </AppButton>
                                </div>
                            </div>
                        </div>
                    )}
                </AppModal>

                {/* ── Modal: Delete User ── */}
                <AppModal isOpen={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="" size="sm">
                    {deleteTarget && (
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="flex size-12 items-center justify-center rounded-full bg-[var(--crm-danger-soft)]">
                                    <AlertTriangle size={22} className="text-[var(--crm-danger)]" />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold text-[var(--crm-text)]/90 mb-2">Remove {deleteTarget.name}?</h3>
                            <p className="text-[12px] text-[var(--crm-text-muted)] leading-relaxed">
                                They will lose all access to <strong className="text-[var(--crm-text)]/70">ARCHI LBO OS</strong> immediately.
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                                <AppButton variant="solid" color="danger" onPress={() => { router.delete(`/admin/users/${deleteTarget.id}`, { preserveScroll: true, onSuccess: () => { setDeleteTarget(null); toast.success(`${deleteTarget.name} has been removed.`); }, onError: () => toast.error('Could not remove user.'), }); }}>Yes, Remove User</AppButton>
                            </div>
                        </div>
                    )}
                </AppModal>
            </AppShell>
        </>
    );
}
