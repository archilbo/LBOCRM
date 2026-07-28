import { Head, router } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { Key } from 'react-aria-components';
import {
    AlertTriangle,
    Briefcase,
    Building2,
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    EllipsisVertical,
    Eye,
    LogIn,
    PenLine,
    Plus,
    Save,
    Search,
    ShieldAlert,
    ShieldCheck,
    SlidersHorizontal,
    Trash2,
    Upload,
    UserCheck,
    UserCog,
    UserMinus,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { Button, Dropdown, Input, Select, SelectItem } from '@heroui/react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppSelect } from '@/components/ui/AppSelect';
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
};

type TabId = 'firm' | 'users' | 'security';

type ActivityLogEntry = {
    id: number;
    timestamp: string;
    user: string;
    action: string;
    ip: string;
};

const ROLE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    admin: { bg: 'bg-[var(--crm-danger-soft)]', text: 'text-[var(--crm-danger)]', dot: 'bg-[var(--crm-danger)]' },
    manager: { bg: 'bg-[var(--crm-violet-soft)]', text: 'text-[var(--crm-violet)]', dot: 'bg-[var(--crm-violet)]' },
    staff: { bg: 'bg-[var(--crm-info-soft)]', text: 'text-[var(--crm-info)]', dot: 'bg-[var(--crm-info)]' },
    viewer: { bg: 'bg-[var(--crm-surface-2)]', text: 'text-[var(--crm-text-muted)]', dot: 'bg-[var(--crm-text-muted)]' },
};

const TABS: (AppWorkspaceTab & { id: TabId })[] = [
    { id: 'firm', label: 'Firm Profile', icon: Building2 },
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
    if (role === 'admin') return ShieldAlert;
    if (role === 'manager') return ShieldCheck;
    return UserCog;
}

function initials(name: string) {
    return name.split(' ').map((p) => p.charAt(0)).join('').slice(0, 2).toUpperCase() || 'U';
}

function primaryRole(user: AdminUserRow) {
    return user.roles[0] ?? 'viewer';
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
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--crm-text-soft)]">Module</span>
                {levels.map(l => (
                    <span key={l.key} className="text-[10px] font-semibold uppercase tracking-widest text-[var(--crm-text-soft)] text-center">{l.label}</span>
                ))}
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--crm-text-soft)] text-center">Scope</span>
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
                            <span className="text-[13px] font-medium text-[var(--crm-text)]/80">{mod}</span>
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
                                    <div className="flex items-center rounded-md text-[10px] font-semibold overflow-hidden border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30">
                                        <button type="button" onClick={() => onScopeChange(mod, 'all')}
                                            className={cn('px-2 py-0.5 transition', p.scope === 'all' ? 'bg-[var(--crm-surface-2)] text-[var(--crm-text-muted)]' : 'text-[var(--crm-text-soft)] hover:text-[var(--crm-text-muted)]')}>All</button>
                                        <button type="button" onClick={() => onScopeChange(mod, 'assigned_only')}
                                            className={cn('px-2 py-0.5 transition', p.scope === 'assigned_only' ? 'bg-[var(--crm-surface-2)] text-[var(--crm-text-muted)]' : 'text-[var(--crm-text-soft)] hover:text-[var(--crm-text-muted)]')}>Asgn</button>
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-[var(--crm-text-soft)]/40">—</span>
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

export default function AdminUsersIndex({ users, roles }: PageProps) {
    const [activeTab, setActiveTab] = useState<TabId>('users');
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterRoles, setFilterRoles] = useState<Set<string>>(new Set(['admin', 'manager', 'staff', 'viewer']));
    const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
    const [activeKpi, setActiveKpi] = useState<string | null>(null);

    // Modals & drawers state
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '', role: 'staff' as string });
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

    // Refs for filter dropdown positioning
    const filterRef = useRef<HTMLDivElement>(null);
    const filterBtnRef = useRef<HTMLButtonElement>(null);
    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter((user) => {
            const role = primaryRole(user);
            if (activeKpi === 'online' && !user.isOnline) return false;
            if (activeKpi === 'admin' && role !== 'admin') return false;
            if (activeKpi === 'manager' && role !== 'manager') return false;
            if (!filterRoles.has(role)) return false;
            if (filterStatus === 'online' && !user.isOnline) return false;
            if (filterStatus === 'offline' && user.isOnline) return false;
            const searchable = [user.name, user.email, role, ...user.permissions].join(' ').toLowerCase();
            return (roleFilter === 'all' || role === roleFilter) && (q === '' || searchable.includes(q));
        });
    }, [users, query, roleFilter, activeKpi, filterRoles, filterStatus]);

    const totalPages = Math.ceil(filteredUsers.length / TABLE_PAGE_SIZE);
    const pagedUsers = filteredUsers.slice((page - 1) * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE);

    useEffect(() => { setPage(1); }, [query, roleFilter, activeKpi, filterRoles, filterStatus]);

    useEffect(() => {
        if (!filterOpen) return;
        function handleClick(e: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(e.target as Node) && filterBtnRef.current && !filterBtnRef.current.contains(e.target as Node)) {
                setFilterOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [filterOpen]);

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

    function toggleAll() {
        if (isAllSelected()) setSelectedIds(new Set());
        else setSelectedIds(new Set(pagedUsers.map((u) => u.id)));
    }

    function toggleOne(id: number) {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelectedIds(next);
    }

    function exportCsv() {
        const header = 'Name,Email,Role,Status,Created,Last Active\n';
        const rows = users.map((u) => `${u.name},${u.email},${primaryRole(u)},${u.isOnline ? 'Online' : 'Offline'},${u.createdAt || ''},${u.lastSeenAt || ''}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-export.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported.');
    }

    function handleInvite(e: FormEvent) {
        e.preventDefault();
        setInviteErrors({});
        router.post('/admin/users/invite', { name: `${inviteForm.firstName} ${inviteForm.lastName}`, email: inviteForm.email, role: inviteForm.role }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsInviteOpen(false);
                setInviteForm({ firstName: '', lastName: '', email: '', role: 'staff' });
                toast.success(`Invite sent to ${inviteForm.email}`);
            },
            onError: (err) => setInviteErrors(err),
        });
    }

    // ── KPI metrics ──
    const metrics = useMemo(() => [
        { key: 'total', label: 'Total Users', value: users.length, icon: Users, color: 'text-[var(--crm-gold)]' },
        { key: 'online', label: 'Active Now', value: users.filter((u) => u.isOnline).length, icon: UserCheck, color: 'text-[var(--crm-success)]' },
        { key: 'admin', label: 'Admins', value: users.filter((u) => primaryRole(u) === 'admin').length, icon: ShieldAlert, color: 'text-[var(--crm-danger)]' },
        { key: 'manager', label: 'Managers', value: users.filter((u) => primaryRole(u) === 'manager').length, icon: ShieldCheck, color: 'text-[var(--crm-violet)]' },
    ], [users]);

    const roleCounts = useMemo(() => ({
        all: users.length,
        admin: users.filter((u) => primaryRole(u) === 'admin').length,
        manager: users.filter((u) => primaryRole(u) === 'manager').length,
        staff: users.filter((u) => primaryRole(u) === 'staff').length,
        viewer: users.filter((u) => primaryRole(u) === 'viewer').length,
    }), [users]);

    // ── Firm Profile state ──
    const [firmForm, setFirmForm] = useState({ name: 'ARCHI LBO', regNumber: 'NDIS 435678965', phone: '+212 5XX XX XX XX', address: '123 Avenue Mohammed V, Casablanca' });

    // ── User table columns ──
    const userColumns: AppWorkspaceTableColumn<AdminUserRow>[] = [
        {
            id: 'select',
            label: (
                <button type="button" onClick={toggleAll} className={cn('flex size-4 items-center justify-center rounded border transition', isAllSelected() ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)]' : 'border-[var(--crm-border-strong)] hover:border-[var(--crm-text-muted)]')}>
                    {isAllSelected() && <Check size={10} strokeWidth={3} className="text-black" />}
                </button>
            ),
            headerClassName: 'w-12',
            reorderable: false,
            render: (user) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => toggleOne(user.id)} className={cn('flex size-4 items-center justify-center rounded border transition', selectedIds.has(user.id) ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)]' : 'border-[var(--crm-border-strong)] hover:border-[var(--crm-text-muted)]')}>
                        {selectedIds.has(user.id) && <Check size={10} strokeWidth={3} className="text-black" />}
                    </button>
                </div>
            ),
        },
        {
            id: 'name',
            label: 'User Name',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[11px] font-bold text-[var(--crm-gold)]">{initials(user.name)}</div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[var(--text)] truncate max-w-[180px]">{user.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[180px]">{user.email}</p>
                    </div>
                </div>
            ),
        },
        {
            id: 'email',
            label: 'Email Address',
            render: (user) => <span className="text-[12px] text-[var(--text-muted)]">{user.email}</span>,
        },
        {
            id: 'role',
            label: 'User Role',
            render: (user) => {
                const role = primaryRole(user);
                const Icon = roleIcon(role);
                const rs = ROLE_STYLES[role] || ROLE_STYLES.viewer;
                return (
                    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold capitalize', rs.bg, rs.text)}>
                        <span className={cn('size-1.5 rounded-full', rs.dot)} /><Icon size={12} />{role}
                    </span>
                );
            },
        },
        {
            id: 'status',
            label: 'Status',
            render: (user) => user.isOnline ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-success)]/20 bg-[var(--crm-success-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--crm-success)]">
                    <span className="size-1.5 rounded-full bg-[var(--crm-success)]" />Online
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">
                    <span className="size-1.5 rounded-full bg-[var(--text-muted)]" />Offline
                </span>
            ),
        },
        {
            id: 'created',
            label: 'Add Date',
            render: (user) => <span className="text-[12px] text-[var(--text-muted)] tabular-nums">{formatDate(user.createdAt)}</span>,
        },
        {
            id: 'lastActive',
            label: 'Last Active',
            render: (user) => <span className="text-[12px] text-[var(--text-muted)] tabular-nums">{user.lastSeenAt ? formatDate(user.lastSeenAt) : '-'}</span>,
        },
        {
            id: 'actions',
            label: '',
            headerClassName: 'w-10',
            reorderable: false,
            render: (user) => (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <AppButton isIconOnly variant="quiet" compact tooltip="Actions" onPress={() => setOpenActionId(openActionId === user.id ? null : user.id)}>
                        <EllipsisVertical size={14} />
                    </AppButton>
                    {openActionId === user.id && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                            <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1.5 shadow-2xl">
                                <AppButton variant="quiet" fullWidth className="justify-start gap-3 px-3 text-[12px] font-medium" onPress={() => { setOpenActionId(null); setViewProfileUser(user); }}><Eye size={14} />View Profile</AppButton>
                                <AppButton variant="quiet" fullWidth className="justify-start gap-3 px-3 text-[12px] font-medium" onPress={() => { const role = primaryRole(user); const defaults = cloneDefaults(role); setOpenActionId(null); setEditUser(user); setEditRole(role); setEditPerms(defaults); setInitialPerms(JSON.parse(JSON.stringify(defaults))); setPendingEditAction(null); }}><PenLine size={14} />Edit Details</AppButton>
                                <div className="mx-2 my-1 h-px bg-[var(--border)]" />
                                <AppButton variant="quiet" fullWidth color="danger" className="justify-start gap-3 px-3 text-[12px] font-medium" onPress={() => { setOpenActionId(null); setDeleteTarget(user); }}><Trash2 size={14} />Delete User</AppButton>
                            </div>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title="User Management" />
            <AppShell>
                <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6">
                    {/* ── Page header ── */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-[var(--crm-text)]">User Management</h1>
                            <p className="text-[13px] text-[var(--crm-text-muted)] mt-0.5">Manage team access, roles, and permissions.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <AppButton isIconOnly compact variant="ghost" tooltip="Import CSV" aria-label="Import CSV" onPress={() => (document.getElementById('csv-import') as HTMLInputElement)?.click()}>
                                <Upload size={16} />
                            </AppButton>
                            <input id="csv-import" type="file" accept=".csv" className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = async (ev) => {
                                        const text = ev.target?.result as string;
                                        const lines = text.split('\n').filter(Boolean);
                                        const users: { name: string; email: string; role: string }[] = [];
                                        for (let i = 1; i < lines.length; i++) {
                                            const cols = lines[i].split(',').map((c) => c.trim());
                                            const name = cols[0] || '';
                                            const email = cols[1] || '';
                                            const role = cols[2] || 'staff';
                                            if (!name || !email) continue;
                                            users.push({ name, email, role });
                                        }
                                        if (users.length === 0) { toast.error('No valid rows found in CSV.'); return; }
                                        try {
                                            const res = await fetch('/admin/users/invite/bulk/validate', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name=csrf-token]') as HTMLMetaElement)?.content || '' },
                                                body: JSON.stringify({ emails: users.map(u => u.email) }),
                                            });
                                            const data = await res.json();
                                            setCsvModal({ users, existing: new Set(data.existing), overrides: new Set() });
                                        } catch {
                                            toast.error('Could not validate CSV. Try again.');
                                        }
                                    };
                                    reader.readAsText(file);
                                    e.target.value = '';
                                }} />
                            <AppButton isIconOnly compact variant="solid" color="primary" tooltip="Add User" aria-label="Add User" onPress={() => { setInviteErrors({}); setInviteForm({ firstName: '', lastName: '', email: '', role: 'staff' }); setIsInviteOpen(true); }}>
                                <Plus size={16} />
                            </AppButton>
                        </div>
                    </div>

                    <AppWorkspaceTabs tabs={TABS} selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as TabId)}>

                    <TabPanel id="firm" className="outline-none">
                        <div className="max-w-3xl">
                            {/* Logo upload */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-[var(--crm-text-muted)] mb-2 block">Company Logo</label>
                                <div className="flex items-center gap-5 rounded-lg border-2 border-dashed border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30 px-6 py-8 transition hover:border-[var(--crm-border-strong)]">
                                    <div className="flex size-16 items-center justify-center rounded-xl bg-[var(--crm-gold-soft)] text-xl font-bold text-[var(--crm-gold)]">AL</div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--crm-text-muted)]">Drop your logo here or <span className="text-[var(--crm-gold)] underline underline-offset-2 cursor-pointer">browse</span></p>
                                        <p className="text-[11px] text-[var(--crm-text-soft)] mt-0.5">PNG, JPG or SVG. Max 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Two-column form */}
                            <div className="grid grid-cols-2 gap-5 mb-6">
                                <div>
                                    <AppTextField label="Firm Name" value={firmForm.name} onChange={(v) => setFirmForm((p) => ({ ...p, name: v }))} />
                                </div>
                                <div>
                                    <AppTextField label="Registration Number" value={firmForm.regNumber} onChange={(v) => setFirmForm((p) => ({ ...p, regNumber: v }))} />
                                </div>
                                <div>
                                    <AppTextField label="Primary Phone" value={firmForm.phone} onChange={(v) => setFirmForm((p) => ({ ...p, phone: v }))} />
                                </div>
                                <div>
                                    <AppTextField label="Billing Address" value={firmForm.address} onChange={(v) => setFirmForm((p) => ({ ...p, address: v }))} />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <AppButton compact variant="solid" color="primary" onPress={() => toast.success('Firm profile saved.')}>
                                    <Save size={13} />
                                    Save Changes
                                </AppButton>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel id="users" className="outline-none">
                            {/* KPI cards */}
                            <div className="grid grid-cols-4 gap-3 mb-5">
                                {metrics.map((m) => {
                                    const Icon = m.icon;
                                    const isActive = activeKpi === m.key;
                                    return <AppKpiCard key={m.key} label={m.label} value={m.value} icon={<Icon size={14} className={m.color} />} valueClassName={m.color} onPress={() => setActiveKpi(isActive ? null : m.key)} isSelected={isActive} />;
                                })}
                            </div>

                            {/* ── Users table ── */}
                            {(() => {
                                const userColumns: AppWorkspaceTableColumn<typeof pagedUsers[0]>[] = [
                                    {
                                        id: 'select',
                                        label: (
                                            <button type="button" onClick={toggleAll} className={cn('flex size-4 items-center justify-center rounded border transition', isAllSelected() ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)]' : 'border-[var(--crm-border-strong)] hover:border-[var(--crm-text-muted)]')}>
                                                {isAllSelected() && <Check size={10} strokeWidth={3} className="text-black" />}
                                            </button>
                                        ),
                                        headerClassName: 'w-12',
                                        reorderable: false,
                                        render: (user) => (
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <button type="button" onClick={() => toggleOne(user.id)} className={cn('flex size-4 items-center justify-center rounded border transition', selectedIds.has(user.id) ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)]' : 'border-[var(--crm-border-strong)] hover:border-[var(--crm-text-muted)]')}>
                                                    {selectedIds.has(user.id) && <Check size={10} strokeWidth={3} className="text-black" />}
                                                </button>
                                            </div>
                                        ),
                                    },
                                    {
                                        id: 'name',
                                        label: 'User Name',
                                        render: (user) => (
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[11px] font-bold text-[var(--crm-gold)]">{initials(user.name)}</div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-medium text-[var(--crm-text)]/80 truncate max-w-[180px]">{user.name}</p>
                                                    <p className="text-[11px] text-[var(--crm-text-soft)] truncate max-w-[180px]">{user.email}</p>
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        id: 'email',
                                        label: 'Email Address',
                                        render: (user) => <span className="text-[12px] text-[var(--crm-text-muted)]">{user.email}</span>,
                                    },
                                    {
                                        id: 'role',
                                        label: 'User Role',
                                        render: (user) => {
                                            const role = primaryRole(user);
                                            const Icon = roleIcon(role);
                                            const rs = ROLE_STYLES[role] || ROLE_STYLES.viewer;
                                            return (
                                                <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold capitalize', rs.bg, rs.text)}>
                                                    <span className={cn('size-1.5 rounded-full', rs.dot)} /><Icon size={12} />{role}
                                                </span>
                                            );
                                        },
                                    },
                                    {
                                        id: 'status',
                                        label: 'Status',
                                        render: (user) => user.isOnline ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-success)]/20 bg-[var(--crm-success-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--crm-success)]">
                                                <span className="size-1.5 rounded-full bg-[var(--crm-success)]" />Online
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--crm-text-soft)]">
                                                <span className="size-1.5 rounded-full bg-[var(--crm-text-soft)]" />Offline
                                            </span>
                                        ),
                                    },
                                    {
                                        id: 'created',
                                        label: 'Add Date',
                                        render: (user) => <span className="text-[12px] text-[var(--crm-text-muted)] tabular-nums">{formatDate(user.createdAt)}</span>,
                                    },
                                    {
                                        id: 'lastActive',
                                        label: 'Last Active',
                                        render: (user) => <span className="text-[12px] text-[var(--crm-text-muted)] tabular-nums">{user.lastSeenAt ? formatDate(user.lastSeenAt) : '-'}</span>,
                                    },
                                    {
                                        id: 'actions',
                                        label: '',
                                        headerClassName: 'w-10',
                                        reorderable: false,
                                        render: (user) => (
                                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                <AppButton isIconOnly variant="quiet" compact tooltip="Actions" onPress={() => setOpenActionId(openActionId === user.id ? null : user.id)}>
                                                    <EllipsisVertical size={14} />
                                                </AppButton>
                                                {openActionId === user.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                                                        <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-[var(--crm-border)] bg-[var(--crm-bg-2)] py-1.5 shadow-2xl shadow-black/50 backdrop-blur-sm">
                                                            <AppButton variant="quiet" fullWidth className="justify-start gap-3 px-3 text-[12px] font-medium" onPress={() => { setOpenActionId(null); setViewProfileUser(user); }}><Eye size={14} />View Profile</AppButton>
                                                            <AppButton variant="quiet" fullWidth className="justify-start gap-3 px-3 text-[12px] font-medium" onPress={() => { const role = primaryRole(user); const defaults = cloneDefaults(role); setOpenActionId(null); setEditUser(user); setEditRole(role); setEditPerms(defaults); setInitialPerms(JSON.parse(JSON.stringify(defaults))); setPendingEditAction(null); }}><PenLine size={14} />Edit Details</AppButton>
                                                            <div className="mx-2 my-1 h-px bg-[var(--crm-border)]" />
                                                            <AppButton variant="quiet" fullWidth color="danger" className="justify-start gap-3 px-3 text-[12px] font-medium" onPress={() => { setOpenActionId(null); setDeleteTarget(user); }}><Trash2 size={14} />Delete User</AppButton>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ),
                                    },
                                ];

                                const bulkToolbar = (
                                    <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--crm-gold-soft)]">
                                        <span className="text-[12px] font-medium text-[var(--crm-gold)]/80">{selectedIds.size} user(s) selected</span>
                                        <div className="flex items-center gap-2">
                                            <select onChange={(e) => { const role = e.target.value; if (!role) return; router.put('/admin/users/bulk/role', { userIds: [...selectedIds], role }, { preserveScroll: true, onSuccess: () => { setSelectedIds(new Set()); toast.success(`Role updated for ${selectedIds.size} user(s).`); }, onError: () => toast.error('Could not update roles.') }); e.target.value = ''; }} className="h-7 rounded-md border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30 px-2 text-[11px] font-medium text-[var(--crm-text-muted)] outline-none transition focus:border-[var(--crm-border-strong)] cursor-pointer">
                                                <option value="">Assign Role</option>
                                                {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                                            </select>
                                            <AppButton variant="bordered" compact onPress={() => setConfirmBulkAction('suspend')}><UserMinus size={12} />Suspend</AppButton>
                                            <AppButton variant="solid" color="danger" compact onPress={() => setConfirmBulkAction('delete')}><Trash2 size={12} />Delete</AppButton>
                                            <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Clear selection" aria-label="Clear selection" onPress={() => setSelectedIds(new Set())}><X size={13} /></AppButton>
                                        </div>
                                    </div>
                                );

                                const normalToolbar = (
                                    <div>
                                        <div className="flex items-center justify-between px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] font-semibold text-[var(--crm-text)]/70">User Details</span>
                                                <span className="flex h-4 min-w-[20px] items-center justify-center rounded bg-[var(--crm-surface-2)] px-1.5 text-[9px] font-bold text-[var(--crm-text-soft)]">{filteredUsers.length}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)]" />
                                                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="h-7 w-[160px] rounded-md border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30 pl-7 pr-2 text-[11px] text-[var(--crm-text)]/70 placeholder-[var(--crm-text-soft)] outline-none transition focus:border-[var(--crm-border-strong)]" />
                                                </div>
                                                <div className="relative">
                                                    <button ref={filterBtnRef} type="button" onClick={() => setFilterOpen((o) => !o)} className="flex h-7 items-center gap-1.5 rounded-md border border-[var(--crm-border)] px-2 text-[11px] font-medium text-[var(--crm-text-soft)] transition hover:border-[var(--crm-border-strong)] hover:text-[var(--crm-text-muted)]">
                                                        <SlidersHorizontal size={12} />Filter
                                                    </button>
                                                    {filterOpen && (
                                                        <div ref={filterRef} className="absolute right-0 top-full z-50 mt-1 w-60 overflow-hidden rounded-xl border border-[var(--crm-border)] bg-[var(--crm-bg-2)] py-2 shadow-2xl shadow-black/50 backdrop-blur-sm">
                                                            <div className="px-3 pb-1.5"><p className="text-[10px] font-semibold tracking-widest text-[var(--crm-text-soft)] uppercase">By Role</p></div>
                                                            <div className="px-1 pb-2 border-b border-[var(--crm-border)]">
                                                                {['admin', 'manager', 'staff', 'viewer'].map((r) => (
                                                                    <button key={r} type="button" onClick={() => { const n = new Set(filterRoles); if (n.has(r)) n.delete(r); else n.add(r); setFilterRoles(n); }} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] font-medium text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface-hover)] hover:text-[var(--crm-text)]/85">
                                                                        <span className={cn('flex size-4 items-center justify-center rounded border transition', filterRoles.has(r) ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)]' : 'border-[var(--crm-border-strong)]')}>{filterRoles.has(r) && <Check size={10} strokeWidth={3} className="text-black" />}</span>
                                                                        <span className="capitalize">{r}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            <div className="px-3 pt-2 pb-1"><p className="text-[10px] font-semibold tracking-widest text-[var(--crm-text-soft)] uppercase">By Status</p></div>
                                                            <div className="px-1">
                                                                {(['all', 'online', 'offline'] as const).map((s) => (
                                                                    <button key={s} type="button" onClick={() => setFilterStatus(s)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] font-medium text-[var(--crm-text-muted)] transition hover:bg-[var(--crm-surface-hover)] hover:text-[var(--crm-text)]/85">
                                                                        <span className={cn('flex size-4 items-center justify-center rounded-full border transition', filterStatus === s ? 'border-[var(--crm-gold)] bg-[var(--crm-gold)]' : 'border-[var(--crm-border-strong)]')}>{filterStatus === s && <Check size={10} strokeWidth={3} className="text-black" />}</span>
                                                                        <span className="capitalize">{s}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <AppButton isIconOnly compact variant="ghost" tooltip="Export CSV" aria-label="Export CSV" onPress={exportCsv}><Download size={16} /></AppButton>
                                                <AppButton isIconOnly compact variant="solid" color="primary" tooltip="Add User" aria-label="Add User" onPress={() => { setInviteErrors({}); setInviteForm({ firstName: '', lastName: '', email: '', role: 'staff' }); setIsInviteOpen(true); }}><Plus size={16} /></AppButton>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 px-4 py-2 border-t border-[var(--border)]">
                                            {(['all', 'admin', 'manager', 'staff', 'viewer'] as const).map((r) => (
                                                <button key={r} type="button" onClick={() => { setRoleFilter(r); setPage(1); }} className={cn('inline-flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-medium capitalize transition', roleFilter === r ? 'bg-[var(--surface-2)] text-[var(--foreground)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]')}>
                                                    {r}
                                                    <span className="flex h-3 min-w-[14px] items-center justify-center rounded bg-[var(--surface-2)] px-1 text-[7px] font-bold text-[var(--text-muted)]">{roleCounts[r]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );

                                return (
                                    <AppWorkspaceTable
                                        ariaLabel="Users & Permissions"
                                        columns={userColumns}
                                        data={pagedUsers}
                                        rowKey={(user) => user.id}
                                        minTableWidthClassName="min-w-[860px]"
                                        onRowPress={(user) => setViewProfileUser(user)}
                                        emptyContent={<AppEmptyState title="No users found" description="No users match the current filters." />}
                                        toolbar={selectedIds.size > 0 ? bulkToolbar : normalToolbar}
                                        footer={
                                            <div className="flex items-center justify-between px-3 py-2">
                                                <span className="text-[10px] text-[var(--text-muted)]">Showing {filteredUsers.length === 0 ? 0 : (page - 1) * TABLE_PAGE_SIZE + 1}–{Math.min(page * TABLE_PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Previous page" aria-label="Previous page" isDisabled={page <= 1} onPress={() => setPage(Math.max(1, page - 1))}><ChevronLeft size={14} /></AppButton>
                                                    <span className="min-w-10 text-center text-[10px] font-semibold tabular-nums text-[var(--text-muted)]">{page} / {totalPages || 1}</span>
                                                    <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Next page" aria-label="Next page" isDisabled={page >= totalPages || totalPages === 0} onPress={() => setPage(Math.min(totalPages, page + 1))}><ChevronRight size={14} /></AppButton>
                                                </div>
                                            </div>
                                        }
                                    />
                                );
                            })()}
                    </TabPanel>

                    <TabPanel id="security" className="outline-none">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[13px] text-[var(--crm-text-soft)]">Track all security-related events and changes in the system.</p>
                                <AppButton isIconOnly compact variant="ghost" tooltip="Download Audit Log" aria-label="Download Audit Log" onPress={exportCsv}>
                                    <Download size={16} />
                                </AppButton>
                            </div>
                            <div className="rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30 overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[var(--crm-border)]">
                                            {['Timestamp', 'User', 'Action Taken', 'IP Address'].map((label) => (
                                                <th key={label} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--crm-text-soft)]">{label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--crm-border)]/40">
                                        {auditLoading ? (
                                            <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-[var(--crm-text-soft)]">Loading audit logs...</td></tr>
                                        ) : auditEntries.length === 0 ? (
                                            <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-[var(--crm-text-soft)]">No audit logs yet.</td></tr>
                                        ) : auditEntries.map((entry) => (
                                            <tr key={entry.id} className="text-[13px] text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-hover)] transition">
                                                <td className="px-3 py-2.5 tabular-nums text-[var(--crm-text-soft)]">{entry.timestamp}</td>
                                                <td className="px-3 py-2.5 font-medium text-[var(--crm-text)]/70">{entry.user}</td>
                                                <td className="px-3 py-2.5 text-[var(--crm-text-muted)]">{entry.action}</td>
                                                <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--crm-text-soft)]">{entry.ip}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                    </TabPanel>
                </AppWorkspaceTabs>
                </div>

                {/* ── Modal: Invite New Team Member ── */}
                <AppModal isOpen={isInviteOpen} onOpenChange={(o) => { if (!o) { setIsInviteOpen(false); setInviteErrors({}); } }} title="Invite New Team Member" size="sm">
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
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <AppButton variant="bordered" onPress={() => setIsInviteOpen(false)}>Cancel</AppButton>
                            <AppButton type="submit" variant="solid" color="primary">Send Invite</AppButton>
                        </div>
                    </form>
                </AppModal>

                {/* ── Drawer: View Profile ── */}
                {viewProfileUser && (
                    <>
                        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setViewProfileUser(null)} />
                        <div className="fixed right-0 top-0 z-50 h-full w-[420px] border-l border-[var(--crm-border)] bg-[var(--crm-bg-2)] shadow-2xl shadow-black/40 overflow-y-auto">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--crm-border)]">
                                <span className="text-sm font-semibold text-[var(--crm-text)]/80">User Profile</span>
                                <AppButton isIconOnly variant="quiet" compact tooltip="Close" onPress={() => setViewProfileUser(null)}>
                                    <X size={14} />
                                </AppButton>
                            </div>
                            <div className="p-5 space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--crm-gold-soft)] text-xl font-bold text-[var(--crm-gold)]">
                                        {initials(viewProfileUser.name)}
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-[var(--crm-text)]/90">{viewProfileUser.name}</h2>
                                        <p className="text-[13px] text-[var(--crm-text-muted)]">{viewProfileUser.email}</p>
                                        <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize mt-1', ROLE_STYLES[primaryRole(viewProfileUser)]?.bg || 'bg-[var(--crm-surface-2)]', ROLE_STYLES[primaryRole(viewProfileUser)]?.text || 'text-[var(--crm-text-soft)]')}>
                                            {primaryRole(viewProfileUser)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--crm-text-soft)] mb-2">Assigned Projects</p>
                                    <div className="space-y-2">
                                        {['Parc Central - Phase 2', 'Tour Hassan Expansion', 'Marina Bay Residences'].map((p) => (
                                            <div key={p} className="flex items-center gap-2.5 rounded-md bg-[var(--crm-surface-3)]/30 px-3 py-2">
                                                <Briefcase size={12} className="text-[var(--crm-text-soft)]" />
                                                <span className="text-[12px] text-[var(--crm-text-muted)]">{p}</span>
                                            </div>
                                        ))}
                                        <p className="text-[11px] text-[var(--crm-text-soft)] italic">+ 2 more projects</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--crm-text-soft)] mb-2">Recent Activity</p>
                                    <div className="space-y-2">
                                        {[
                                            { icon: Upload, text: 'Uploaded Blueprint_v2.pdf', time: '2h ago' },
                                            { icon: PenLine, text: 'Edited Contract #CT-089', time: '1d ago' },
                                            { icon: LogIn, text: 'Logged in from 192.168.1.22', time: '3d ago' },
                                        ].map((a, i) => {
                                            const A = a.icon;
                                            return (
                                                <div key={i} className="flex items-start gap-2.5">
                                                    <div className="flex size-6 items-center justify-center rounded-md bg-[var(--crm-surface-hover)] text-[var(--crm-text-soft)] mt-0.5"><A size={11} /></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[12px] text-[var(--crm-text-muted)]">{a.text}</p>
                                                        <p className="text-[10px] text-[var(--crm-text-soft)]">{a.time}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

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
                                    <p className="text-[13px] text-[var(--crm-text-muted)]">{editUser.email}</p>
                                </div>
                            </div>

                            {/* ── Role + Restore ── */}
                            <div className="flex items-end gap-4 mb-7">
                                <div className="flex-1">
                                    <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--crm-text-soft)] mb-2 block">Access Role</label>
                                    <select value={editRole} onChange={(e) => {
                                        const newRole = e.target.value;
                                        setEditRole(newRole);
                                        setEditPerms(cloneDefaults(newRole));
                                    }}
                                        className="h-10 w-full max-w-xs rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30 px-3 text-[13px] text-[var(--crm-text)]/70 outline-none transition focus:border-[var(--crm-border-strong)] cursor-pointer appearance-none">
                                        {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={() => setEditPerms(cloneDefaults(editRole))}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium transition',
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
                                    <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--crm-text-soft)]">Module Permissions</label>
                                    {JSON.stringify(editPerms) !== JSON.stringify(initialPerms) && (
                                        <span className="text-[10px] text-[var(--crm-gold)]/60">Customized from role defaults</span>
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
                                        isCustom: JSON.stringify(editPerms) !== JSON.stringify(cloneDefaults(editRole)),
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
                        <p className="text-[13px] text-[var(--crm-text-muted)] leading-relaxed">
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
                            <p className="text-[13px] text-[var(--crm-text-muted)] leading-relaxed">
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
                                            onSuccess: () => { setSelectedIds(new Set()); toast.success('Users removed.'); },
                                            onError: () => toast.error('Could not remove some users.'),
                                        });
                                    }}>Yes, Remove Users</AppButton>
                                ) : (
                                    <AppButton variant="solid" color="primary" onPress={() => {
                                        const ids = [...selectedIds];
                                        setConfirmBulkAction(null);
                                        router.put('/admin/users/bulk/suspend', { userIds: ids }, {
                                            preserveScroll: true,
                                            onSuccess: () => { setSelectedIds(new Set()); toast.success(`${ids.length} user(s) suspended.`); },
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
                            <p className="text-[13px] text-[var(--crm-text-muted)]">
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
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-bold text-[var(--crm-gold)]">
                                                    {u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-medium text-[var(--crm-text)]/80 truncate">{u.name}</p>
                                                    <p className="text-[11px] text-[var(--crm-text-soft)] truncate">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="rounded-md bg-[var(--crm-surface-hover)] px-2 py-0.5 text-[10px] font-semibold capitalize text-[var(--crm-text-soft)]">{u.role}</span>
                                                {isDuplicate && (
                                                    <div className="flex items-center rounded-md border border-[var(--crm-border)] bg-[var(--crm-surface-3)]/30 text-[10px] font-semibold overflow-hidden">
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
                                                    <span className="text-[10px] font-medium text-[var(--crm-success)]/60">New</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-[var(--crm-border)]">
                                <span className="text-[11px] text-[var(--crm-text-soft)]">
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
                            <p className="text-[13px] text-[var(--crm-text-muted)] leading-relaxed">
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
