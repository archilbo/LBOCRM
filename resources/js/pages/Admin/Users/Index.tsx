import { Head, router } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { Key } from 'react-aria-components';
import {
    AlertTriangle,
    Briefcase,
    Building2,
    Check,
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
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppModal } from '@/components/ui/AppModal';
import { cn } from '@/lib/cn';
import type { FormErrors } from '@/lib/formErrors';
import { firstError } from '@/lib/formErrors';
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
    admin: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
    manager: { bg: 'bg-violet-500/10', text: 'text-violet-400', dot: 'bg-violet-400' },
    staff: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
    viewer: { bg: 'bg-white/5', text: 'text-white/40', dot: 'bg-white/20' },
};

const TABS: { id: TabId; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
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
        if (m === 'Finance' || m === 'Contracts' || m === 'Authorizations' || m === 'Archives') return [m, { access: 'view' as PermissionLevel, scope: (SCOPE_MODULES.has(m) ? 'all' : 'none') as PermissionScope }];
        return [m, { access: 'edit' as PermissionLevel, scope: (SCOPE_MODULES.has(m) ? 'all' : 'none') as PermissionScope }];
    })),
    staff: Object.fromEntries(MODULES.map((m) => {
        if (m === 'Finance' || m === 'Contracts' || m === 'Authorizations' || m === 'Archives') return [m, { access: 'view' as PermissionLevel, scope: (SCOPE_MODULES.has(m) ? 'assigned_only' : 'none') as PermissionScope }];
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
        { key: 'none' as PermissionLevel, label: 'None', dot: 'bg-white/15', glow: '' },
        { key: 'view' as PermissionLevel, label: 'View', dot: 'bg-blue-400', glow: 'shadow-blue-400/40' },
        { key: 'edit' as PermissionLevel, label: 'Edit', dot: 'bg-emerald-400', glow: 'shadow-emerald-400/40' },
        { key: 'delete' as PermissionLevel, label: 'Delete', dot: 'bg-red-400', glow: 'shadow-red-400/40' },
    ];

    return (
        <div className="rounded-lg border border-white/5 overflow-hidden">
            {/* Grid header */}
            <div className="grid grid-cols-[1fr_56px_56px_56px_56px_80px] gap-0 bg-white/[0.02] px-4 py-2.5 border-b border-white/5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Module</span>
                {levels.map(l => (
                    <span key={l.key} className="text-[10px] font-semibold uppercase tracking-widest text-white/35 text-center">{l.label}</span>
                ))}
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35 text-center">Scope</span>
            </div>

            {/* Module rows */}
            <div className="divide-y divide-white/[0.02]">
                {MODULES.map((mod) => {
                    const p = perms[mod] ?? { access: 'none', scope: 'none' };
                    const isOverridden = ROLE_DEFAULTS[role] && p.access !== ROLE_DEFAULTS[role][mod]?.access;
                    return (
                        <div key={mod} className={cn(
                            'grid grid-cols-[1fr_56px_56px_56px_56px_80px] gap-0 px-4 py-2.5 items-center transition',
                            isOverridden ? 'bg-amber-500/[0.04]' : 'hover:bg-white/[0.01]',
                        )}>
                            <span className="text-[13px] font-medium text-white/80">{mod}</span>
                            {levels.map(l => (
                                <button key={l.key} type="button" onClick={() => onChange(mod, l.key)}
                                    className="flex items-center justify-center py-0.5 group">
                                    <span className={cn(
                                        'rounded-full transition-all duration-150',
                                        p.access === l.key
                                            ? `size-3 ${l.dot} shadow-sm ${l.glow}`
                                            : 'size-1.5 bg-white/15 group-hover:size-2.5 group-hover:bg-white/30',
                                    )} />
                                </button>
                            ))}
                            <div className="flex items-center justify-center">
                                {SCOPE_MODULES.has(mod) ? (
                                    <div className="flex items-center rounded-md text-[10px] font-semibold overflow-hidden border border-white/5 bg-white/[0.02]">
                                        <button type="button" onClick={() => onScopeChange(mod, 'all')}
                                            className={cn('px-2 py-0.5 transition', p.scope === 'all' ? 'bg-white/15 text-white/65' : 'text-white/30 hover:text-white/50')}>All</button>
                                        <button type="button" onClick={() => onScopeChange(mod, 'assigned_only')}
                                            className={cn('px-2 py-0.5 transition', p.scope === 'assigned_only' ? 'bg-white/15 text-white/65' : 'text-white/30 hover:text-white/50')}>Asgn</button>
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-white/15">—</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.01] border-t border-white/5">
                <button type="button" onClick={onRestore}
                    className="text-[11px] font-medium text-white/40 hover:text-white/70 transition">Restore Role Defaults</button>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onBatch('full')}
                        className="rounded-md border border-emerald-500/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/10 transition">Grant Full Access</button>
                    <button type="button" onClick={() => onBatch('revoke')}
                        className="rounded-md border border-red-500/20 px-3 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 transition">Revoke All Access</button>
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

    // ── derived data ──
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
        { key: 'total', label: 'Total Users', value: users.length, icon: Users, color: 'text-amber-400' },
        { key: 'online', label: 'Active Now', value: users.filter((u) => u.isOnline).length, icon: UserCheck, color: 'text-emerald-400' },
        { key: 'admin', label: 'Admins', value: users.filter((u) => primaryRole(u) === 'admin').length, icon: ShieldAlert, color: 'text-red-400' },
        { key: 'manager', label: 'Managers', value: users.filter((u) => primaryRole(u) === 'manager').length, icon: ShieldCheck, color: 'text-violet-400' },
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

    return (
        <>
            <Head title="User Management" />
            <AppShell>
                <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6">
                    {/* ── Page header ── */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-white/90">User Management</h1>
                            <p className="text-[13px] text-white/40 mt-0.5">Manage team access, roles, and permissions.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => (document.getElementById('csv-import') as HTMLInputElement)?.click()}
                                className="flex h-8 items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 text-[11px] font-semibold text-white/60 transition hover:border-white/10 hover:text-white/80">
                                <Upload size={13} />
                                Import CSV
                            </button>
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
                            <button type="button" onClick={() => { setInviteErrors({}); setInviteForm({ firstName: '', lastName: '', email: '', role: 'staff' }); setIsInviteOpen(true); }}
                                className="flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-semibold text-black transition hover:bg-white/90">
                                <Plus size={13} strokeWidth={2.5} />
                                Add User
                            </button>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex items-center gap-6 mb-6 border-b border-white/5">
                        {TABS.map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'flex items-center gap-2 pb-2.5 text-[12px] font-medium transition border-b-2 -mb-px',
                                        isActive ? 'border-white/70 text-white/90' : 'border-transparent text-white/40 hover:text-white/60',
                                    )}>
                                    <TabIcon size={15} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ═══════════════════════════════════════════════
                       TAB: FIRM PROFILE
                       ═══════════════════════════════════════════════ */}
                    {activeTab === 'firm' && (
                        <div className="max-w-3xl">
                            {/* Logo upload */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-white/50 mb-2 block">Company Logo</label>
                                <div className="flex items-center gap-5 rounded-lg border-2 border-dashed border-white/10 bg-white/[0.01] px-6 py-8 transition hover:border-white/20">
                                    <div className="flex size-16 items-center justify-center rounded-xl bg-amber-500/10 text-xl font-bold text-amber-400">AL</div>
                                    <div>
                                        <p className="text-sm font-medium text-white/60">Drop your logo here or <span className="text-amber-400 underline underline-offset-2 cursor-pointer">browse</span></p>
                                        <p className="text-[11px] text-white/30 mt-0.5">PNG, JPG or SVG. Max 2MB.</p>
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
                                <button type="button" onClick={() => toast.success('Firm profile saved.')}
                                    className="flex h-8 items-center gap-1.5 rounded-lg bg-white px-4 text-[12px] font-semibold text-black transition hover:bg-white/90">
                                    <Save size={13} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════
                       TAB: USERS & PERMISSIONS
                       ═══════════════════════════════════════════════ */}
                    {activeTab === 'users' && (
                        <>
                            {/* KPI cards */}
                            <div className="grid grid-cols-4 gap-3 mb-5">
                                {metrics.map((m) => {
                                    const Icon = m.icon;
                                    const isActive = activeKpi === m.key;
                                    return <AppKpiCard key={m.key} label={m.label} value={m.value} icon={<Icon size={14} className={m.color} />} valueClassName={m.color} onPress={() => setActiveKpi(isActive ? null : m.key)} isSelected={isActive} />;
                                })}
                            </div>

                            {/* Table section */}
                            <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
                                {/* Table header / Bulk actions bar */}
                                {selectedIds.size > 0 ? (
                                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-amber-500/[0.04]">
                                        <span className="text-[12px] font-medium text-amber-400/80">{selectedIds.size} user(s) selected</span>
                                        <div className="flex items-center gap-2">
                                            <select onChange={(e) => {
                                                const role = e.target.value;
                                                if (!role) return;
                                                router.put('/admin/users/bulk/role', { userIds: [...selectedIds], role }, {
                                                    preserveScroll: true,
                                                    onSuccess: () => { setSelectedIds(new Set()); toast.success(`Role updated for ${selectedIds.size} user(s).`); },
                                                    onError: () => toast.error('Could not update roles.'),
                                                });
                                                e.target.value = '';
                                            }}
                                                className="h-7 rounded-md border border-white/10 bg-white/[0.02] px-2 text-[11px] font-medium text-white/60 outline-none transition focus:border-white/20 cursor-pointer">
                                                <option value="">Assign Role</option>
                                                {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                                            </select>
                                            <button type="button" onClick={() => setConfirmBulkAction('suspend')}
                                                className="flex h-7 items-center gap-1.5 rounded-md border border-white/10 px-2 text-[11px] font-medium text-white/50 transition hover:border-white/20 hover:text-white/70">
                                                <UserMinus size={12} />
                                                Suspend
                                            </button>
                                            <button type="button" onClick={() => setConfirmBulkAction('delete')}
                                                className="flex h-7 items-center gap-1.5 rounded-md border border-red-500/20 px-2 text-[11px] font-medium text-red-400 transition hover:bg-red-500/10">
                                                <Trash2 size={12} />
                                                Delete
                                            </button>
                                            <button type="button" onClick={() => setSelectedIds(new Set())}
                                                className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition hover:bg-white/5 hover:text-white/70">
                                                <X size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[12px] font-semibold text-white/70">User Details</span>
                                            <span className="flex h-4 min-w-[20px] items-center justify-center rounded bg-white/10 px-1.5 text-[9px] font-bold text-white/50">{filteredUsers.length}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
                                                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search goals..."
                                                    className="h-7 w-[160px] rounded-md border border-white/5 bg-white/[0.02] pl-7 pr-2 text-[11px] text-white/70 placeholder-white/30 outline-none transition focus:border-white/10" />
                                            </div>
                                            <div className="relative">
                                                <button ref={filterBtnRef} type="button" onClick={() => setFilterOpen((o) => !o)}
                                                    className="flex h-7 items-center gap-1.5 rounded-md border border-white/5 px-2 text-[11px] font-medium text-white/50 transition hover:border-white/10 hover:text-white/70">
                                                    <SlidersHorizontal size={12} />
                                                    Filter
                                                </button>
                                                {filterOpen && (
                                                    <div ref={filterRef} className="absolute right-0 top-full z-50 mt-1 w-60 overflow-hidden rounded-xl border border-white/10 bg-[var(--crm-bg-2)] py-2 shadow-2xl shadow-black/50 backdrop-blur-sm">
                                                        <div className="px-3 pb-1.5">
                                                            <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">By Role</p>
                                                        </div>
                                                        <div className="px-1 pb-2 border-b border-white/5">
                                                            {['admin', 'manager', 'staff', 'viewer'].map((r) => (
                                                                <button key={r} type="button" onClick={() => { const n = new Set(filterRoles); if (n.has(r)) n.delete(r); else n.add(r); setFilterRoles(n); }}
                                                                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] font-medium text-white/65 transition hover:bg-white/[0.04] hover:text-white/85">
                                                                    <span className={cn(
                                                                        'flex size-4 items-center justify-center rounded border transition',
                                                                        filterRoles.has(r) ? 'border-amber-500 bg-amber-500' : 'border-white/15',
                                                                    )}>
                                                                        {filterRoles.has(r) && <Check size={10} strokeWidth={3} className="text-black" />}
                                                                    </span>
                                                                    <span className="capitalize">{r}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="px-3 pt-2 pb-1">
                                                            <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">By Status</p>
                                                        </div>
                                                        <div className="px-1">
                                                            {(['all', 'online', 'offline'] as const).map((s) => (
                                                                <button key={s} type="button" onClick={() => setFilterStatus(s)}
                                                                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] font-medium text-white/65 transition hover:bg-white/[0.04] hover:text-white/85">
                                                                    <span className={cn(
                                                                        'flex size-4 items-center justify-center rounded-full border transition',
                                                                        filterStatus === s ? 'border-amber-500 bg-amber-500' : 'border-white/15',
                                                                    )}>
                                                                        {filterStatus === s && <Check size={10} strokeWidth={3} className="text-black" />}
                                                                    </span>
                                                                    <span className="capitalize">{s}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <button type="button" onClick={exportCsv}
                                                className="flex h-7 items-center gap-1.5 rounded-md border border-white/5 px-2 text-[11px] font-medium text-white/50 transition hover:border-white/10 hover:text-white/70">
                                                <Download size={12} />
                                                Export CSV
                                            </button>
                                            <button type="button" onClick={() => { setInviteErrors({}); setInviteForm({ firstName: '', lastName: '', email: '', role: 'staff' }); setIsInviteOpen(true); }}
                                                className="flex h-7 items-center gap-1.5 rounded-md bg-white px-2 text-[11px] font-semibold text-black transition hover:bg-white/90">
                                                <Plus size={12} strokeWidth={2.5} />
                                                Add User
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Role filter pills */}
                                {selectedIds.size === 0 && (
                                    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5">
                                        {(['all', 'admin', 'manager', 'staff', 'viewer'] as const).map((r) => (
                                            <button key={r} type="button" onClick={() => { setRoleFilter(r); setPage(1); }}
                                                className={cn(
                                                    'inline-flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-medium capitalize transition',
                                                    roleFilter === r ? 'bg-white/10 text-white/80' : 'text-white/40 hover:bg-white/5 hover:text-white/60',
                                                )}>
                                                {r}
                                                <span className="flex h-3 min-w-[14px] items-center justify-center rounded bg-white/10 px-1 text-[7px] font-bold text-white/40">{roleCounts[r]}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="w-12 px-4 py-3">
                                                    <button type="button" onClick={toggleAll}
                                                        className={cn(
                                                            'flex size-4 items-center justify-center rounded border transition',
                                                            isAllSelected() ? 'border-amber-500 bg-amber-500' : 'border-white/20 hover:border-white/40',
                                                        )}>
                                                        {isAllSelected() && <Check size={10} strokeWidth={3} className="text-black" />}
                                                    </button>
                                                </th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">User Name</th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">Email Address</th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">User Role</th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">Status</th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">Add Date</th>
                                                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">Last Active</th>
                                                <th className="w-10 px-3 py-2.5" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {pagedUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="px-3 py-12 text-center text-sm text-white/30">No users match the current filters.</td>
                                                </tr>
                                            ) : (
                                                pagedUsers.map((user) => {
                                                    const role = primaryRole(user);
                                                    const Icon = roleIcon(role);
                                                    const rs = ROLE_STYLES[role] || ROLE_STYLES.viewer;
                                                    return (
                                                        <tr key={user.id}
                                                            onClick={() => setViewProfileUser(user)}
                                                            className="group transition hover:bg-white/[0.025] cursor-pointer">
                                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                                <button type="button" onClick={() => toggleOne(user.id)}
                                                                    className={cn(
                                                                        'flex size-4 items-center justify-center rounded border transition',
                                                                        selectedIds.has(user.id) ? 'border-amber-500 bg-amber-500' : 'border-white/20 hover:border-white/40',
                                                                    )}>
                                                                    {selectedIds.has(user.id) && <Check size={10} strokeWidth={3} className="text-black" />}
                                                                </button>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[11px] font-bold text-amber-400">
                                                                        {initials(user.name)}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[13px] font-medium text-white/80 truncate max-w-[180px]">{user.name}</p>
                                                                        <p className="text-[11px] text-white/35 truncate max-w-[180px]">{user.email}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <span className="text-[12px] text-white/50">{user.email}</span>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold capitalize', rs.bg, rs.text)}>
                                                                    <span className={cn('size-1.5 rounded-full', rs.dot)} />
                                                                    <Icon size={12} />
                                                                    {role}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                {user.isOnline ? (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                                                                        <span className="size-1.5 rounded-full bg-emerald-400" />
                                                                        Online
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-0.5 text-[11px] font-semibold text-white/40">
                                                                        <span className="size-1.5 rounded-full bg-white/20" />
                                                                        Offline
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <span className="text-[12px] text-white/50 tabular-nums">{formatDate(user.createdAt)}</span>
                                                            </td>
                                                            <td className="px-3 py-3">
                                                                <span className="text-[12px] text-white/50 tabular-nums">{user.lastSeenAt ? formatDate(user.lastSeenAt) : '-'}</span>
                                                            </td>
                                                            <td className="px-3 py-3 relative" onClick={(e) => e.stopPropagation()}>
                                                                <button type="button" onClick={() => setOpenActionId(openActionId === user.id ? null : user.id)}
                                                                    className="flex size-7 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/5 hover:text-white/60">
                                                                    <EllipsisVertical size={14} />
                                                                </button>
                                                                {openActionId === user.id && (
                                                                    <>
                                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenActionId(null)} />
                                                                        <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-[var(--crm-bg-2)] py-1.5 shadow-2xl shadow-black/50 backdrop-blur-sm">
                                                                            <button type="button" onClick={() => { setOpenActionId(null); setViewProfileUser(user); }}
                                                                                className="flex w-full items-center gap-3 px-3 py-2 text-[12px] font-medium text-white/75 transition hover:bg-white/[0.04] hover:text-white">
                                                                                <Eye size={14} className="text-white/40" />
                                                                                View Profile
                                                                            </button>
                                                                            <button type="button" onClick={() => {
                                                                                const role = primaryRole(user);
                                                                                const defaults = cloneDefaults(role);
                                                                                setOpenActionId(null);
                                                                                setEditUser(user);
                                                                                setEditRole(role);
                                                                                setEditPerms(defaults);
                                                                                setInitialPerms(JSON.parse(JSON.stringify(defaults)));
                                                                                setPendingEditAction(null);
                                                                            }}
                                                                                className="flex w-full items-center gap-3 px-3 py-2 text-[12px] font-medium text-white/75 transition hover:bg-white/[0.04] hover:text-white">
                                                                                <PenLine size={14} className="text-white/40" />
                                                                                Edit Details
                                                                            </button>
                                                                            <div className="mx-2 my-1 h-px bg-white/5" />
                                                                            <button type="button" onClick={() => { setOpenActionId(null); setDeleteTarget(user); }}
                                                                                className="flex w-full items-center gap-3 px-3 py-2 text-[12px] font-medium text-red-400 transition hover:bg-red-500/10">
                                                                                <Trash2 size={14} className="text-red-400/60" />
                                                                                Delete User
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                                    <span className="text-[11px] text-white/30">
                                        Showing {filteredUsers.length === 0 ? 0 : (page - 1) * TABLE_PAGE_SIZE + 1}-{Math.min(page * TABLE_PAGE_SIZE, filteredUsers.length)} from {filteredUsers.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                                            className={cn(
                                                'flex h-7 items-center gap-1 rounded-md border px-3 text-[11px] font-medium transition',
                                                page <= 1 ? 'border-white/5 text-white/20 cursor-not-allowed' : 'border-white/5 text-white/50 hover:border-white/10 hover:text-white/70',
                                            )}>
                                            Previous
                                        </button>
                                        <button type="button" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages || totalPages === 0}
                                            className={cn(
                                                'flex h-7 items-center gap-1 rounded-md px-3 text-[11px] font-semibold transition',
                                                page >= totalPages || totalPages === 0 ? 'bg-white/20 text-black/50 cursor-not-allowed' : 'bg-white text-black hover:bg-white/90',
                                            )}>
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═══════════════════════════════════════════════
                       TAB: SECURITY & AUDIT
                       ═══════════════════════════════════════════════ */}
                    {activeTab === 'security' && (
                        <>
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-[13px] text-white/40">Track all security-related events and changes in the system.</p>
                                <button type="button" onClick={exportCsv}
                                    className="flex h-8 items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 text-[11px] font-semibold text-white/60 transition hover:border-white/10 hover:text-white/80">
                                    <Download size={13} />
                                    Download Audit Log
                                </button>
                            </div>
                            <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            {['Timestamp', 'User', 'Action Taken', 'IP Address'].map((label) => (
                                                <th key={label} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">{label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {auditLoading ? (
                                            <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-white/30">Loading audit logs...</td></tr>
                                        ) : auditEntries.length === 0 ? (
                                            <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-white/30">No audit logs yet.</td></tr>
                                        ) : auditEntries.map((entry) => (
                                            <tr key={entry.id} className="text-[13px] text-white/60 hover:bg-white/[0.015] transition">
                                                <td className="px-3 py-2.5 tabular-nums text-white/40">{entry.timestamp}</td>
                                                <td className="px-3 py-2.5 font-medium text-white/70">{entry.user}</td>
                                                <td className="px-3 py-2.5 text-white/60">{entry.action}</td>
                                                <td className="px-3 py-2.5 font-mono text-[12px] text-white/40">{entry.ip}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
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
                            <button type="button" onClick={() => setIsInviteOpen(false)}
                                className="rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/5 transition">Cancel</button>
                            <button type="submit"
                                className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-white/90">Send Invite</button>
                        </div>
                    </form>
                </AppModal>

                {/* ── Drawer: View Profile ── */}
                {viewProfileUser && (
                    <>
                        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setViewProfileUser(null)} />
                        <div className="fixed right-0 top-0 z-50 h-full w-[420px] border-l border-white/10 bg-[var(--crm-bg-2)] shadow-2xl shadow-black/40 overflow-y-auto">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                                <span className="text-sm font-semibold text-white/80">User Profile</span>
                                <button type="button" onClick={() => setViewProfileUser(null)}
                                    className="flex size-7 items-center justify-center rounded-md text-white/40 transition hover:bg-white/5 hover:text-white/70">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="p-5 space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-xl font-bold text-amber-400">
                                        {initials(viewProfileUser.name)}
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-white/90">{viewProfileUser.name}</h2>
                                        <p className="text-[13px] text-white/50">{viewProfileUser.email}</p>
                                        <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize mt-1', ROLE_STYLES[primaryRole(viewProfileUser)]?.bg || 'bg-white/5', ROLE_STYLES[primaryRole(viewProfileUser)]?.text || 'text-white/40')}>
                                            {primaryRole(viewProfileUser)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">Assigned Projects</p>
                                    <div className="space-y-2">
                                        {['Parc Central - Phase 2', 'Tour Hassan Expansion', 'Marina Bay Residences'].map((p) => (
                                            <div key={p} className="flex items-center gap-2.5 rounded-md bg-white/[0.02] px-3 py-2">
                                                <Briefcase size={12} className="text-white/30" />
                                                <span className="text-[12px] text-white/60">{p}</span>
                                            </div>
                                        ))}
                                        <p className="text-[11px] text-white/30 italic">+ 2 more projects</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">Recent Activity</p>
                                    <div className="space-y-2">
                                        {[
                                            { icon: Upload, text: 'Uploaded Blueprint_v2.pdf', time: '2h ago' },
                                            { icon: PenLine, text: 'Edited Contract #CT-089', time: '1d ago' },
                                            { icon: LogIn, text: 'Logged in from 192.168.1.22', time: '3d ago' },
                                        ].map((a, i) => {
                                            const A = a.icon;
                                            return (
                                                <div key={i} className="flex items-start gap-2.5">
                                                    <div className="flex size-6 items-center justify-center rounded-md bg-white/5 text-white/30 mt-0.5"><A size={11} /></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[12px] text-white/60">{a.text}</p>
                                                        <p className="text-[10px] text-white/30">{a.time}</p>
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
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-xl font-bold text-amber-400">{initials(editUser.name)}</div>
                                <div>
                                    <p className="text-lg font-semibold text-white/90">{editUser.name}</p>
                                    <p className="text-[13px] text-white/50">{editUser.email}</p>
                                </div>
                            </div>

                            {/* ── Role + Restore ── */}
                            <div className="flex items-end gap-4 mb-7">
                                <div className="flex-1">
                                    <label className="text-[11px] font-semibold uppercase tracking-widest text-white/35 mb-2 block">Access Role</label>
                                    <select value={editRole} onChange={(e) => {
                                        const newRole = e.target.value;
                                        setEditRole(newRole);
                                        setEditPerms(cloneDefaults(newRole));
                                    }}
                                        className="h-10 w-full max-w-xs rounded-lg border border-white/10 bg-white/[0.02] px-3 text-[13px] text-white/70 outline-none transition focus:border-white/20 cursor-pointer appearance-none">
                                        {roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                                    </select>
                                </div>
                                <button type="button" onClick={() => setEditPerms(cloneDefaults(editRole))}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium transition',
                                        JSON.stringify(editPerms) !== JSON.stringify(cloneDefaults(editRole))
                                            ? 'border border-amber-500/20 text-amber-400 hover:bg-amber-500/10'
                                            : 'border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/5',
                                    )}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                                    Restore Defaults
                                </button>
                            </div>

                            {/* ── Permissions grid ── */}
                            <div className="mb-2">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[11px] font-semibold uppercase tracking-widest text-white/35">Module Permissions</label>
                                    {JSON.stringify(editPerms) !== JSON.stringify(initialPerms) && (
                                        <span className="text-[10px] text-amber-400/60">Customized from role defaults</span>
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
                            <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t border-white/5">
                                <button type="button" onClick={() => {
                                    if (JSON.stringify(editPerms) !== JSON.stringify(initialPerms)) {
                                        setShowUnsavedWarning(true);
                                        setPendingEditAction(() => () => { setEditUser(null); setShowUnsavedWarning(false); });
                                        return;
                                    }
                                    setEditUser(null);
                                }}
                                    className="rounded-lg border border-white/10 px-5 py-2 text-[12px] font-medium text-white/60 hover:text-white/80 hover:bg-white/5 transition">Cancel</button>
                                <button type="button" onClick={() => {
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
                                }}
                                    className="rounded-lg bg-white px-5 py-2 text-[12px] font-semibold text-black transition hover:bg-white/90">Save Changes</button>
                            </div>
                        </div>
                    )}
                </AppModal>

                {/* ── Modal: Unsaved Changes Warning ── */}
                <AppModal isOpen={showUnsavedWarning} onOpenChange={(o) => { if (!o) { setShowUnsavedWarning(false); setPendingEditAction(null); } }} title="" size="sm">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
                                <AlertTriangle size={22} className="text-amber-400" />
                            </div>
                        </div>
                        <h3 className="text-base font-semibold text-white/90 mb-2">Unsaved Changes</h3>
                        <p className="text-[13px] text-white/50 leading-relaxed">
                            You have unsaved permission changes. Discard them?
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button type="button" onClick={() => { setShowUnsavedWarning(false); setPendingEditAction(null); }}
                                className="rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/5 transition">Keep Editing</button>
                            <button type="button" onClick={() => { pendingEditAction?.(); }}
                                className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600">Discard Changes</button>
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
                                    confirmBulkAction === 'delete' ? 'bg-red-500/10' : 'bg-amber-500/10',
                                )}>
                                    <AlertTriangle size={22} className={confirmBulkAction === 'delete' ? 'text-red-400' : 'text-amber-400'} />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold text-white/90 mb-2">
                                {confirmBulkAction === 'delete' ? 'Remove Users' : 'Suspend Users'}
                            </h3>
                            <p className="text-[13px] text-white/50 leading-relaxed">
                                {confirmBulkAction === 'delete'
                                    ? `${selectedIds.size} user(s) will lose all access immediately. This cannot be undone.`
                                    : `${selectedIds.size} user(s) will lose access until manually reinstated.`}
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button type="button" onClick={() => setConfirmBulkAction(null)}
                                    className="rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/5 transition">Cancel</button>
                                <button type="button" onClick={() => {
                                    const ids = [...selectedIds];
                                    setConfirmBulkAction(null);
                                    if (confirmBulkAction === 'delete') {
                                        router.post('/admin/users/bulk/delete', { userIds: ids }, {
                                            preserveScroll: true,
                                            onSuccess: () => { setSelectedIds(new Set()); toast.success('Users removed.'); },
                                            onError: () => toast.error('Could not remove some users.'),
                                        });
                                    } else {
                                        router.put('/admin/users/bulk/suspend', { userIds: ids }, {
                                            preserveScroll: true,
                                            onSuccess: () => { setSelectedIds(new Set()); toast.success(`${ids.length} user(s) suspended.`); },
                                            onError: () => toast.error('Could not suspend users.'),
                                        });
                                    }
                                }}
                                    className={cn(
                                        'rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition',
                                        confirmBulkAction === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600',
                                    )}>
                                    {confirmBulkAction === 'delete' ? 'Yes, Remove Users' : 'Yes, Suspend Users'}
                                </button>
                            </div>
                        </div>
                    )}
                </AppModal>

                {/* ── Modal: Delete User ── */}
                {/* ── Modal: CSV Import Review ── */}
                <AppModal isOpen={!!csvModal} onOpenChange={(o) => { if (!o) setCsvModal(null); }} title="Review CSV Import" size="lg">
                    {csvModal && (
                        <div className="space-y-4">
                            <p className="text-[13px] text-white/50">
                                {csvModal.users.filter(u => !csvModal.existing.has(u.email)).length} new · {csvModal.existing.size} existing
                            </p>
                            <div className="max-h-[320px] overflow-y-auto rounded-lg border border-white/5 divide-y divide-white/[0.02]">
                                {csvModal.users.map((u, i) => {
                                    const isDuplicate = csvModal.existing.has(u.email);
                                    const isOverridden = csvModal.overrides.has(u.email);
                                    return (
                                        <div key={i} className={cn(
                                            'flex items-center justify-between px-4 py-2.5 transition',
                                            isDuplicate ? (isOverridden ? 'bg-amber-500/[0.04]' : 'bg-white/[0.01]') : '',
                                        )}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-400">
                                                    {u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-medium text-white/80 truncate">{u.name}</p>
                                                    <p className="text-[11px] text-white/40 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold capitalize text-white/50">{u.role}</span>
                                                {isDuplicate && (
                                                    <div className="flex items-center rounded-md border border-white/5 bg-white/[0.02] text-[10px] font-semibold overflow-hidden">
                                                        <button type="button" onClick={() => {
                                                            setCsvModal((p) => {
                                                                if (!p) return p;
                                                                const next = new Set(p.overrides);
                                                                next.delete(u.email);
                                                                return { ...p, overrides: next };
                                                            });
                                                        }}
                                                            className={cn('px-2 py-0.5 transition', !isOverridden ? 'bg-white/15 text-white/60' : 'text-white/30 hover:text-white/50')}>Skip</button>
                                                        <button type="button" onClick={() => {
                                                            setCsvModal((p) => {
                                                                if (!p) return p;
                                                                const next = new Set(p.overrides);
                                                                next.add(u.email);
                                                                return { ...p, overrides: next };
                                                            });
                                                        }}
                                                            className={cn('px-2 py-0.5 transition', isOverridden ? 'bg-amber-500/15 text-amber-400' : 'text-white/30 hover:text-white/50')}>Override</button>
                                                    </div>
                                                )}
                                                {!isDuplicate && (
                                                    <span className="text-[10px] font-medium text-emerald-400/60">New</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <span className="text-[11px] text-white/30">
                                    {csvModal.existing.size > 0 && (
                                        <>{csvModal.overrides.size} of {csvModal.existing.size} duplicate(s) will be overridden</>
                                    )}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setCsvModal(null)}
                                        className="rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/5 transition">Cancel</button>
                                    <button type="button" onClick={() => {
                                        const overrides: Record<string, boolean> = {};
                                        csvModal.overrides.forEach((e) => { overrides[e] = true; });
                                        const payload = { users: csvModal.users, overrides };
                                        setCsvModal(null);
                                        router.post('/admin/users/invite/bulk', payload, {
                                            preserveScroll: true,
                                            onSuccess: () => toast.success('CSV import completed.'),
                                            onError: () => toast.error('CSV import failed.'),
                                        });
                                    }}
                                        className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-white/90">
                                        Import {csvModal.users.length} User{csvModal.users.length > 1 ? 's' : ''}
                                    </button>
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
                                <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10">
                                    <AlertTriangle size={22} className="text-red-400" />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold text-white/90 mb-2">Remove {deleteTarget.name}?</h3>
                            <p className="text-[13px] text-white/50 leading-relaxed">
                                They will lose all access to <strong className="text-white/70">ARCHI LBO OS</strong> immediately.
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button type="button" onClick={() => setDeleteTarget(null)}
                                    className="rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/5 transition">Cancel</button>
                                <button type="button" onClick={() => { router.delete(`/admin/users/${deleteTarget.id}`, { preserveScroll: true, onSuccess: () => { setDeleteTarget(null); toast.success(`${deleteTarget.name} has been removed.`); }, onError: () => toast.error('Could not remove user.'), }); }}
                                    className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600">Yes, Remove User</button>
                            </div>
                        </div>
                    )}
                </AppModal>
            </AppShell>
        </>
    );
}
