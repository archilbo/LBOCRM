// @ts-nocheck -- legacy server permission payload is normalized before submission; its generated declaration is wider than the UI contract.
import { Head, router } from '@inertiajs/react';
import { type ChangeEvent, FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    type ColumnDef,
} from '@tanstack/react-table';
import { IconAlertTriangle, IconChevronDown, IconCalendarMonth, IconCheck, IconChevronLeft, IconChevronRight, IconClockHour3, IconHistory, IconKey, IconDownload, IconDotsVertical, IconEye, IconMail, IconPencil, IconPlus, IconPower, IconArrowRotaryFirstLeft, IconDeviceFloppy, IconSearch, IconShieldExclamation, IconShieldCheck, IconAdjustmentsHorizontal, IconTrash, IconUserCheck, IconUserCog, IconUserMinus, IconUsers, IconUpload, IconX } from '@tabler/icons-react';

import { Accordion, Button, Checkbox, Chip, Dropdown, Input, ListBox, Select, Switch } from '@heroui/react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import { useBranding } from '@/hooks/useBranding';
import { AppShell } from '@/components/layout/AppShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppDataTable } from '@/components/ui/AppDataTable';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppKpiCard } from '@/components/ui/AppKpiCard';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppModal } from '@/components/ui/AppModal';
import { AppWorkspaceTabs } from '@/components/ui/AppWorkspaceTabs';
import { AppTooltip } from '@/components/ui/AppTooltip';
import { UserWorkloadTab, type UserWorkloadRow } from '@/features/users/components/UserWorkloadTab';
import { UserOperationsReportTab, type OperationsReport } from '@/features/users/components/UserOperationsReportTab';
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
    permissionModules?: PermissionModuleDefinition[];
    rolePermissionDefaults?: RolePermissionDefaults;
    currentUserId: number;
    canViewUsers?: boolean;
    canCreateUsers?: boolean;
    canManageRoles?: boolean;
    canManageAccess?: boolean;
    canDeleteUsers?: boolean;
    canManageProtectedUsers?: boolean;
    canResetUserPasswords?: boolean;
    canViewWorkload?: boolean;
    canViewOperationsReports?: boolean;
    workload?: UserWorkloadRow[];
    operationsReport?: OperationsReport | null;
    reportedAt?: string;
};

type TabId = 'users' | 'security' | 'workload' | 'reports';

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

type PermissionLevel = 'none' | 'view' | 'edit' | 'delete';
type PermissionScope = 'none' | 'all';
type ModulePerm = { access: PermissionLevel; scope: PermissionScope };
type PermissionsState = Record<string, ModulePerm>;
type PermissionModuleDefinition = { key: string; label: string; permissionCount: number };
type RolePermissionDefaults = Record<string, PermissionsState>;

function clonePermissions(perms: PermissionsState): PermissionsState {
    return JSON.parse(JSON.stringify(perms));
}

function emptyPermissionMatrix(modules: PermissionModuleDefinition[]): PermissionsState {
    return Object.fromEntries(modules.map((module) => [module.key, { access: 'none', scope: 'none' }])) as PermissionsState;
}

function normalizePermissionMatrix(source: PermissionsState | undefined, fallback: PermissionsState, modules: PermissionModuleDefinition[]): PermissionsState {
    return Object.fromEntries(modules.map((module) => {
        const access = source?.[module.key]?.access ?? fallback[module.key]?.access ?? 'none';

        return [module.key, { access, scope: access === 'none' ? 'none' : 'all' }];
    })) as PermissionsState;
}

const TABLE_PAGE_SIZE = 10;

function roleIcon(role: string) {
    if (role === 'admin' || role === 'super_admin') return IconShieldExclamation;
    if (role === 'manager') return IconShieldCheck;
    return IconUserCog;
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
    return ROLE_LABELS_FR[role] ?? role.replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

const ROLE_LABELS_FR: Record<string, string> = {
    admin: 'Administrateur',
    super_admin: 'Super administrateur',
    finance_admin: 'Administrateur financier',
    manager: 'Gestionnaire',
    operations_manager: "Gestionnaire d'opérations",
    staff: 'Collaborateur',
    viewer: 'Consultant',
};

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
    return d.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ───────────────────────────────────────────────────────
// Permissions Matrix Component — radio‑dot grid
// ───────────────────────────────────────────────────────
function PermissionsMatrix({
    modules,
    defaults,
    perms,
    onChange,
    onRestore,
    onBatch,
}: {
    modules: PermissionModuleDefinition[];
    defaults: PermissionsState;
    perms: PermissionsState;
    onChange: (module: string, access: PermissionLevel) => void;
    onRestore: () => void;
    onBatch: (action: 'full' | 'revoke') => void;
}) {
    const [query, setQuery] = useState('');
    const [onlyCustomized, setOnlyCustomized] = useState(false);
    const levels = [
        { key: 'none' as PermissionLevel, label: 'Aucun', description: 'Module masque', icon: IconX, tone: 'text-[var(--text-muted)]' },
        { key: 'view' as PermissionLevel, label: 'Voir', description: 'Consultation', icon: IconEye, tone: 'text-[var(--accent)]' },
        { key: 'edit' as PermissionLevel, label: 'Modifier', description: 'Créer et modifier', icon: IconPencil, tone: 'text-[var(--success)]' },
        { key: 'delete' as PermissionLevel, label: 'Complet', description: 'Gestion complète', icon: IconKey, tone: 'text-[var(--danger)]' },
    ];
    const filteredModules = modules.filter((module) => {
        const matchesQuery = module.label.toLocaleLowerCase('fr-FR').includes(query.trim().toLocaleLowerCase('fr-FR'));
        const isCustomized = (perms[module.key]?.access ?? 'none') !== defaults[module.key]?.access;

        return matchesQuery && (!onlyCustomized || isCustomized);
    });
    const hasChanges = JSON.stringify(perms) !== JSON.stringify(defaults);
    const customizedCount = modules.filter((module) => (perms[module.key]?.access ?? 'none') !== defaults[module.key]?.access).length;

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex flex-col gap-2.5 border-b border-[var(--border)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                        <IconShieldCheck size={15} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-[var(--foreground)]">Accès par module</h3>
                            <Chip size="sm" variant="soft" className="h-5 bg-[var(--surface-2)] px-1.5 text-[9px] text-[var(--text-muted)]">{modules.length} modules</Chip>
                            {customizedCount > 0 ? <Chip size="sm" variant="soft" color="warning" className="h-5 px-1.5 text-[9px]">{customizedCount} personnalisé{customizedCount > 1 ? 's' : ''}</Chip> : null}
                        </div>
                        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Limitées à la société et à la branche de l'utilisateur.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Checkbox isSelected={onlyCustomized} onChange={setOnlyCustomized} className="text-[11px] text-[var(--text-muted)]">Personnalisés</Checkbox>
                    <Input aria-label="Rechercher un module" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" size="sm" startContent={<IconSearch size={13} className="text-[var(--text-muted)]" />} classNames={{ base: 'w-full sm:w-48', input: 'text-xs', inputWrapper: 'h-9 min-h-9 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2.5 shadow-none' }} />
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
                <div className="min-w-[590px]">
                    <div className="grid grid-cols-[minmax(13rem,1fr)_repeat(4,3.75rem)] items-end gap-1 border-b border-[var(--border)] bg-[var(--surface-2)]/45 px-4 py-2.5">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Module</p>
                            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Choisissez un seul niveau</p>
                        </div>
                        {levels.map((level) => {
                            const Icon = level.icon;

                            return <div key={level.key} className="flex flex-col items-center gap-1 text-center"><Icon size={14} className={level.tone} /><span className="text-[10px] font-semibold text-[var(--foreground)]">{level.label}</span></div>;
                        })}
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                        {filteredModules.map((module) => {
                            const permission = perms[module.key] ?? { access: 'none', scope: 'none' };
                            const isOverridden = permission.access !== defaults[module.key]?.access;
                            const selectedLevel = levels.find((level) => level.key === permission.access) ?? levels[0];

                            return (
                                <div key={module.key} className={cn('grid grid-cols-[minmax(13rem,1fr)_repeat(4,3.75rem)] items-center gap-1 px-4 py-2.5 transition', isOverridden ? 'bg-[var(--accent-soft)]/35' : 'hover:bg-[var(--surface-2)]/45')}>
                                    <div className="min-w-0 pr-3">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-semibold text-[var(--foreground)]">{module.label}</p>
                                            {isOverridden ? <Chip size="sm" variant="soft" color="warning" className="h-5 shrink-0 px-1.5 text-[9px]">Perso.</Chip> : null}
                                        </div>
                                        <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">{module.permissionCount} autorisation{module.permissionCount > 1 ? 's' : ''} · {selectedLevel.description}</p>
                                    </div>
                                    {levels.map((level) => {
                                        const Icon = level.icon;
                                        const isSelected = permission.access === level.key;

                                        return <div key={level.key} className="flex justify-center"><AppButton isIconOnly compact size="sm" variant={isSelected ? 'solid' : 'quiet'} color={isSelected && level.key === 'delete' ? 'danger' : isSelected ? 'primary' : 'default'} tooltip={`${level.label}: ${level.description}`} aria-label={`${module.label}: ${level.label}`} onPress={() => onChange(module.key, level.key)} className={cn('rounded-lg', isSelected && level.key === 'edit' && 'bg-[var(--success)] text-black hover:opacity-90', isSelected && level.key === 'none' && 'bg-[var(--surface-3)] text-[var(--foreground)]')}><Icon size={14} /></AppButton></div>;
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {filteredModules.length === 0 ? <p className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">Aucun module ne correspond à cette recherche.</p> : null}

            <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--border)] bg-[var(--surface-2)]/35 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <span className={cn('text-[11px] font-medium', hasChanges ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}>{hasChanges ? 'Des droits ont été personnalisés.' : 'Les droits suivent le rôle de référence.'}</span>
                <div className="flex items-center gap-1">
                    <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Restaurer les droits du rôle" aria-label="Restaurer les droits du rôle" onPress={onRestore}>
                        <IconArrowRotaryFirstLeft size={14} />
                    </AppButton>
                    <AppButton isIconOnly compact size="sm" variant="quiet" color="success" tooltip="Autoriser tous les modules" aria-label="Autoriser tous les modules" onPress={() => onBatch('full')}>
                        <IconKey size={14} />
                    </AppButton>
                    <AppButton isIconOnly compact size="sm" variant="quiet" color="danger" tooltip="Retirer tous les droits" aria-label="Retirer tous les droits" onPress={() => onBatch('revoke')}>
                        <IconX size={14} />
                    </AppButton>
                </div>
            </div>
        </section>
    );
}

export default function AdminUsersIndex({
    users,
    roles,
    filterRoles: filterRoleOptions,
    permissionModules = [],
    rolePermissionDefaults = {},
    currentUserId,
    canViewUsers = false,
    canCreateUsers = false,
    canManageRoles = false,
    canManageAccess = false,
    canDeleteUsers = false,
    canManageProtectedUsers = false,
    canResetUserPasswords = false,
    canViewWorkload = false,
    canViewOperationsReports = false,
    workload = [],
    operationsReport = null,
    reportedAt = new Date().toISOString(),
}: PageProps) {
    const { t } = useTranslation();
    const branding = useBranding();
    const appName = branding.appName || 'ARCHI LBO OS';
    const [activeTab, setActiveTab] = useState<TabId>(() => {
        const requested = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('tab');
        if (requested === 'workload' && canViewWorkload) return 'workload';
        if (requested === 'reports' && canViewOperationsReports) return 'reports';
        if (canViewUsers) return 'users';
        return canViewWorkload ? 'workload' : 'reports';
    });
    const [query, setQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [filterRoles, setFilterRoles] = useState<Set<string>>(() => new Set(filterRoleOptions.map((role) => role.id)));
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'blocked'>('all');
    const [activeKpi, setActiveKpi] = useState<string | null>(null);

    // Modals & drawers state
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '', role: 'staff' as string });
    const [inviteErrors, setInviteErrors] = useState<FormErrors>({});
    const [isInviting, setIsInviting] = useState(false);
    const [resendingId, setResendingId] = useState<number | null>(null);
    const [viewProfileUser, setViewProfileUser] = useState<AdminUserRow | null>(null);
    const [editUser, setEditUser] = useState<AdminUserRow | null>(null);
    const [editPerms, setEditPerms] = useState<PermissionsState>({});
    const [editRole, setEditRole] = useState<string>('viewer');
    const [initialPerms, setInitialPerms] = useState<PermissionsState>({});
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
    const [pendingEditAction, setPendingEditAction] = useState<(() => void) | null>(null);
    const [confirmBulkAction, setConfirmBulkAction] = useState<'suspend' | 'delete' | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
    const [passwordResetTarget, setPasswordResetTarget] = useState<AdminUserRow | null>(null);
    const [csvModal, setCsvModal] = useState<{ users: { name: string; email: string; role: string }[]; existing: Set<string>; overrides: Set<string> } | null>(null);
    const [auditEntries, setAuditEntries] = useState<ActivityLogEntry[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const [accessUpdatingUserId, setAccessUpdatingUserId] = useState<number | null>(null);
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [openRowActionId, setOpenRowActionId] = useState<number | null>(null);
    const [bulkRoleSelectOpen, setBulkRoleSelectOpen] = useState(false);

    const defaultPermissionsFor = (role: string) => clonePermissions(rolePermissionDefaults[role] ?? emptyPermissionMatrix(permissionModules));
    const permissionsForUser = (user: AdminUserRow, role: string) => normalizePermissionMatrix(
        user.permissionConfiguration?.modules,
        defaultPermissionsFor(role),
        permissionModules,
    );

    const filteredUsers = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter((user) => {
            const role = primaryRole(user);
            if (activeKpi === 'online' && !user.isOnline) return false;
            if (activeKpi === 'admin' && role !== 'admin') return false;
            if (activeKpi === 'manager' && role !== 'manager') return false;
            if (!filterRoles.has(role)) return false;
            if (filterStatus !== 'all' && user.accountStatus !== filterStatus) return false;
            const searchable = [user.name, user.email, role, ...user.permissions].join(' ').toLowerCase();
            return q === '' || searchable.includes(q);
        });
    }, [users, query, activeKpi, filterRoles, filterStatus]);

    // ── fetch audit logs when security tab is active ──
    useEffect(() => {
        if (activeTab !== 'security' || !canViewUsers) return;
        setAuditLoading(true);
        fetch('/admin/users/audit-logs')
            .then((r) => r.json())
            .then((data) => { setAuditEntries(data.logs); setAuditLoading(false); })
            .catch(() => { setAuditLoading(false); });
    }, [activeTab]);

    // ── helpers ──
    function isAllSelected() {
        return filteredUsers.length > 0 && filteredUsers.every((u) => selectedIds.has(u.id));
    }

    function hasPartialSelection() {
        return filteredUsers.some((u) => selectedIds.has(u.id)) && !isAllSelected();
    }

    function toggleAll() {
        setSelectedIds((current) => {
            const next = new Set(current);

            if (isAllSelected()) {
                filteredUsers.forEach((user) => next.delete(user.id));
            } else {
                filteredUsers.forEach((user) => next.add(user.id));
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
        if (!canManageAccess || user.id === currentUserId || accessUpdatingUserId === user.id) return;

        setAccessUpdatingUserId(user.id);
        router.put(`/admin/users/${user.id}/access`, { is_active: isActive }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success(isActive ? 'Accès utilisateur rétabli.' : 'Accès utilisateur suspendu.'),
            onError: () => toast.error("Impossible de mettre à jour l'accès utilisateur."),
            onFinish: () => setAccessUpdatingUserId(null),
        });
    }

    function UserAccessSwitch({ user }: { user: AdminUserRow }) {
        if (isProtectedAdministrator(primaryRole(user))) {
            return <span className="text-[10px] font-medium text-[var(--text-muted)]">Protégé</span>;
        }

        const isCurrentUser = user.id === currentUserId;
        const isUpdating = accessUpdatingUserId === user.id;

        return (
            <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                <Switch
                    size="sm"
                    isSelected={!user.isSuspended}
                    isDisabled={!canManageAccess || isCurrentUser || isUpdating}
                    aria-label={user.isSuspended ? `Rétablir l'accès de ${user.name}` : `Suspendre l'accès de ${user.name}`}
                    onChange={(isActive) => updateUserAccess(user, isActive)}
                >
                    <Switch.Content>
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                    </Switch.Content>
                </Switch>
                <span className={cn('text-[10px] font-medium', user.isSuspended ? 'text-[var(--crm-danger)]' : 'text-[var(--crm-success)]')}>
                    {user.isSuspended ? 'Inactif' : 'Actif'}
                </span>
            </div>
        );
    }

    function downloadUsersCsv(records: AdminUserRow[], filename: string) {
        if (records.length === 0) {
            toast.error('Aucun utilisateur à exporter.');
            return;
        }

        const header = 'Nom,Email,Rôle,Statut,Créé,Dernière activité\n';
        const escapeCsv = (value: string | null) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const rows = records.map((user) => [
            user.name,
            user.email,
            primaryRole(user),
            user.accountStatus,
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
        toast.success(`${records.length} utilisateur(s) exporté(s).`);
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
            toast.error('Choisissez un fichier CSV.');
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
                toast.error('Aucun utilisateur valide trouvé dans ce CSV.');
                return;
            }

            try {
                const response = await fetch('/admin/users/invite/bulk/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'IconX-CSRF-TOKEN': (document.querySelector('meta[name=csrf-token]') as HTMLMetaElement | null)?.content ?? '',
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
                toast.error('Impossible de valider le CSV. Réessayez.');
            }
        };
        reader.readAsText(file);
    }

    function handleInvite(e: FormEvent) {
        e.preventDefault();
        if (isInviting) {
            return;
        }
        setInviteErrors({});
        setIsInviting(true);
        router.post('/admin/users/invite', {
            name: `${inviteForm.firstName} ${inviteForm.lastName}`.trim(),
            email: inviteForm.email,
            role: inviteForm.role,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsInviteOpen(false);
                setInviteForm({ firstName: '', lastName: '', email: '', role: 'staff' });
            },
            onError: (err) => {
                setInviteErrors(err);
                if (Object.keys(err).length === 0) {
                    toast.error(t('users.invitations.toast.sendFailed'));
                }
            },
            onFinish: () => setIsInviting(false),
        });
    }

    // ── KPI metrics ──
    const metrics = useMemo(() => {
        const activeUsers = users.filter((user) => user.isOnline).length;
        const adminUsers = users.filter((user) => isProtectedAdministrator(primaryRole(user))).length;
        const managerUsers = users.filter((user) => primaryRole(user) === 'manager').length;

        return [
            { key: 'total', label: 'Utilisateurs', value: users.length, detail: `${users.length} compte${users.length === 1 ? '' : 's'} dans cette société`, icon: IconUsers, color: 'text-[var(--crm-gold)]', accentColor: 'var(--crm-gold)' },
            { key: 'online', label: 'Actifs maintenant', value: activeUsers, detail: 'Actifs au cours des cinq dernières minutes', icon: IconUserCheck, color: 'text-[var(--crm-success)]', accentColor: 'var(--crm-success)' },
            { key: 'admin', label: 'Administrateurs', value: adminUsers, detail: "Comptes disposant d'un accès d'administration complet", icon: IconShieldExclamation, color: 'text-[var(--crm-danger)]', accentColor: 'var(--crm-danger)' },
            { key: 'manager', label: 'Gestionnaires', value: managerUsers, detail: "Comptes disposant d'un accès de gestion", icon: IconShieldCheck, color: 'text-[var(--crm-violet)]', accentColor: 'var(--crm-violet)' },
        ];
    }, [users]);

    const activeFilterCount = Number(filterRoles.size !== filterRoleOptions.length) + Number(filterStatus !== 'all');

    // ── Audit log columns ──
    const auditColumns: ColumnDef<ActivityLogEntry>[] = [
        {
            id: 'timestamp',
            header: 'Horodatage',
            cell: (info) => <span className="text-[11px] tabular-nums text-[var(--text-muted)]">{info.row.original.timestamp}</span>,
        },
        {
            id: 'user',
            header: 'Utilisateur',
            cell: (info) => <span className="text-[11px] font-medium text-[var(--text)]">{info.row.original.user}</span>,
        },
        {
            id: 'action',
            header: 'Action',
            cell: (info) => <span className="text-[11px] text-[var(--text-muted)]">{info.row.original.action}</span>,
        },
        {
            id: 'ip',
            header: 'Adresse IP',
            cell: (info) => <span className="font-mono text-[10px] text-[var(--text-muted)]">{info.row.original.ip}</span>,
        },
    ];

    // ── Firm Profile state ──
    // ── User table columns ──
    const userColumns: ColumnDef<AdminUserRow>[] = [
        {
            id: 'select',
            header: () => (
                <Checkbox isSelected={isAllSelected()} isIndeterminate={hasPartialSelection()} onChange={toggleAll} aria-label="Sélectionner tous les utilisateurs visibles">
                    <Checkbox.Content>
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                    </Checkbox.Content>
                </Checkbox>
            ),
            cell: (info) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox isSelected={selectedIds.has(info.row.original.id)} onChange={() => toggleOne(info.row.original.id)} aria-label={`Sélectionner ${info.row.original.name}`}>
                        <Checkbox.Content>
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                        </Checkbox.Content>
                    </Checkbox>
                </div>
            ),
            size: 48,
        },
        {
            id: 'name',
            header: 'Nom',
            size: 200,
            cell: (info) => (
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-bold text-[var(--crm-gold)]">{initials(info.row.original.name)}</div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-[var(--text)] truncate">{info.row.original.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">{info.row.original.email}</p>
                    </div>
                </div>
            ),
        },
        {
            id: 'role',
            header: 'Rôle',
            size: 120,
            cell: (info) => {
                const role = primaryRole(info.row.original);
                const Icon = roleIcon(role);
                const rs = ROLE_STYLES[role] || ROLE_STYLES.viewer;
                return (
                    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold whitespace-nowrap', rs.bg, rs.text)}>
                        <span className={cn('size-1.5 rounded-full', rs.dot)} /><Icon size={12} />{formatRoleLabel(role)}
                    </span>
                );
            },
            meta: { hideOnMobile: true },
        },
        {
            id: 'status',
            header: 'Statut',
            size: 120,
            cell: (info) => info.row.original.accountStatus === 'blocked' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-danger)]/20 bg-[var(--crm-danger-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--crm-danger)] whitespace-nowrap">
                    <span className="size-1.5 rounded-full bg-[var(--crm-danger)]" />Bloqué
                </span>
            ) : info.row.original.accountStatus === 'pending' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-gold)]/20 bg-[var(--crm-gold-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--crm-gold)] whitespace-nowrap">
                    <span className="size-1.5 rounded-full bg-[var(--crm-gold)]" />Invitation en attente
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--crm-success)]/20 bg-[var(--crm-success-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--crm-success)] whitespace-nowrap">
                    <span className="size-1.5 rounded-full bg-[var(--crm-success)]" />Accepté
                </span>
            ),
            meta: { hideOnMobile: true },
        },
        {
            id: 'access',
            header: 'Accès',
            size: 80,
            cell: (info) => <UserAccessSwitch user={info.row.original} />,
            meta: { hideOnMobile: true },
        },
        {
            id: 'created',
            header: "Date d'ajout",
            size: 100,
            cell: (info) => <span className="text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap block">{formatDate(info.row.original.createdAt)}</span>,
            meta: { hideOnTablet: true },
        },
        {
            id: 'lastActive',
            header: 'Dernière activité',
            size: 100,
            cell: (info) => <span className="text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap block">{info.row.original.lastSeenAt ? formatDate(info.row.original.lastSeenAt) : '-'}</span>,
            meta: { hideOnTablet: true },
        },
        {
            id: 'actions',
            header: '',
            size: 120,
            cell: (info) => (
                <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <AppTooltip label="Voir le profil">
                        <button type="button" className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label="Voir le profil" onClick={() => setViewProfileUser(info.row.original)}>
                            <IconEye size={11} />
                        </button>
                    </AppTooltip>
                    {canManageRoles && roles.some((role) => role.id === primaryRole(info.row.original)) && (!isProtectedAdministrator(primaryRole(info.row.original)) || canManageProtectedUsers) ? <AppTooltip label="Modifier les permissions">
                        <button type="button" className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label="Modifier les permissions" onClick={() => { const role = primaryRole(info.row.original); const permissions = permissionsForUser(info.row.original, role); setEditUser(info.row.original); setEditRole(role); setEditPerms(permissions); setInitialPerms(clonePermissions(permissions)); setPendingEditAction(null); }}>
                            <IconPencil size={11} />
                        </button>
                    </AppTooltip> : null}
                    {info.row.original.accountStatus === 'pending' && canCreateUsers ? <AppTooltip label="Renvoyer l'invitation">
                        <button type="button" disabled={resendingId === info.row.original.id} className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)] disabled:pointer-events-none disabled:opacity-50" aria-label="Renvoyer l'invitation" onClick={() => {
                            const userId = info.row.original.id;
                            if (resendingId === userId) {
                                return;
                            }
                            setResendingId(userId);
                            router.post(`/admin/users/${userId}/invite/resend`, {}, {
                                preserveScroll: true,
                                onError: () => toast.error(t('users.invitations.toast.resendFailed')),
                                onFinish: () => setResendingId(null),
                            });
                        }}>
                            <IconMail size={11} />
                        </button>
                    </AppTooltip> : null}
                    {info.row.original.accountStatus === 'accepted' && canResetUserPasswords && (!isProtectedAdministrator(primaryRole(info.row.original)) || canManageProtectedUsers) ? <AppTooltip label="Envoyer un lien de MDP">
                        <button type="button" className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label="Envoyer un lien de MDP" onClick={() => setPasswordResetTarget(info.row.original)}>
                            <IconKey size={11} />
                        </button>
                    </AppTooltip> : null}
                    {canDeleteUsers && (!isProtectedAdministrator(primaryRole(info.row.original)) || canManageProtectedUsers) ? <Dropdown
                        isOpen={openRowActionId === info.row.original.id}
                        onOpenChange={(isOpen) => setOpenRowActionId(isOpen ? info.row.original.id : null)}
                    >
                        <AppTooltip label="Actions">
                            <Dropdown.Trigger className="flex size-6 items-center justify-center rounded text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]" aria-label="Actions">
                                <IconDotsVertical size={11} />
                            </Dropdown.Trigger>
                        </AppTooltip>
                        <Dropdown.Popover placement="bottom end" className="min-w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                            <Dropdown.Menu
                                aria-label="Actions"
                                onAction={(key) => {
                                    setOpenRowActionId(null);

                                    if (key === 'delete') setDeleteTarget(info.row.original);
                                }}
                            >
                                <Dropdown.Item key="delete" id="delete" textValue="Supprimer l'utilisateur" className="text-[var(--danger)] data-[hover]:bg-[var(--danger)]/10">
                                    <div className="flex items-center gap-2"><span className="flex size-4 shrink-0 items-center justify-center"><IconTrash size={14} /></span><span>Supprimer l'utilisateur</span></div>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown> : null}
                </div>
            ),
        },
    ];

    const tabs: (AppWorkspaceTab & { id: TabId })[] = [
        ...(canViewUsers ? [{ id: 'users' as const, label: 'Utilisateurs', icon: IconUserCheck }, { id: 'security' as const, label: 'Sécurité et audit', icon: IconShieldCheck }] : []),
        ...(canViewWorkload ? [{ id: 'workload' as const, label: 'Charge de travail', icon: IconUsers }] : []),
        ...(canViewOperationsReports ? [{ id: 'reports' as const, label: "Rapport d’activité", icon: IconCalendarMonth }] : []),
    ];

    return (
        <>
            <Head title="Gestion des utilisateurs" />
            <AppShell>
                <div className="w-full min-w-0 space-y-5">
                    {/* ── Page header ── */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-[var(--crm-text)]">Gestion des utilisateurs</h1>
                            <p className="text-[12px] text-[var(--crm-text-muted)] mt-0.5">Gérez les accès, les rôles et les permissions de l'équipe.</p>
                        </div>
                        {canCreateUsers ? <div className="flex items-center gap-2">
                            <AppButton isIconOnly compact variant="solid" color="primary" tooltip="Ajouter un utilisateur" aria-label="Ajouter un utilisateur" onPress={() => { setInviteErrors({}); setInviteForm({ firstName: '', lastName: '', email: '', role: 'staff' }); setIsInviteOpen(true); }}>
                                <IconPlus size={16} />
                            </AppButton>
                        </div> : null}
                    </div>

                    <AppWorkspaceTabs tabs={tabs} selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as TabId)}>

                    {canViewUsers ? <TabPanel id="users" className="outline-none">
                            {/* KPI cards */}
                            <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 min-w-0">
                                {metrics.map((m) => {
                                    const Icon = m.icon;
                                    const isActive = activeKpi === m.key;
                                    return <AppKpiCard key={m.key} label={m.label} value={m.value} detail={m.detail} icon={<Icon size={15} className={m.color} />} accentColor={m.accentColor} valueClassName={m.color} onPress={() => setActiveKpi(isActive ? null : m.key)} isSelected={isActive} />;
                                })}
                            </div>

                            {/* ── IconUsers table ── */}
                            <div className="min-w-0 space-y-3">
                                {/* Custom toolbar with bulk actions and filters */}
                                {selectedIds.size > 0 ? (
                                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--accent)]/15 bg-[var(--accent-soft)]/70 px-4 py-3">
                                        <div className="flex min-w-0 items-center gap-2.5 flex-1">
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-[var(--foreground)]">Actions groupées</p>
                                                <Chip size="sm" variant="soft" color="warning" className="mt-1 h-5 px-1.5 text-[9px]">
                                                    {selectedIds.size} sélectionné(s)
                                                </Chip>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {canManageRoles ? <Select
                                                aria-label="Attribuer un rôle aux utilisateurs sélectionnés"
                                                isOpen={bulkRoleSelectOpen}
                                                onOpenChange={setBulkRoleSelectOpen}
                                                onChange={(key) => {
                                                    if (!key) return;
                                                    setBulkRoleSelectOpen(false);
                                                    router.put('/admin/users/bulk/role', { userIds: [...selectedIds], role: String(key) }, {
                                                        preserveScroll: true,
                                                        onSuccess: () => { setSelectedIds(new Set()); toast.success(`Rôle mis à jour pour ${selectedIds.size} utilisateur(s).`); },
                                                        onError: () => toast.error('Impossible de mettre à jour les rôles.'),
                                                    });
                                                }}
                                            >
                                                <Select.Trigger className="h-8 min-w-[120px] sm:min-w-[150px] rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-xs text-[var(--foreground)] shadow-sm transition hover:border-[var(--text-muted)]">
                                                    <Select.Value className="flex-1 truncate text-left" />
                                                    <Select.Indicator />
                                                </Select.Trigger>
                                                <Select.Popover className="z-[120] min-w-[150px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                                                    <ListBox aria-label="Attribuer un rôle aux utilisateurs sélectionnés" className="gap-0">
                                                        {roles.map((role) => (
                                                            <ListBox.Item key={role.id} id={role.id} textValue={role.label} className="rounded-lg px-2.5 py-2 text-xs">
                                                                {role.label}
                                                            </ListBox.Item>
                                                        ))}
                                                    </ListBox>
                                                </Select.Popover>
                                            </Select> : null}
                                            <AppButton variant="outline" compact onPress={exportSelectedCsv}>
                                                <IconDownload size={12} />Exporter la sélection
                                            </AppButton>
                                            {canManageAccess ? <AppButton variant="outline" compact onPress={() => setConfirmBulkAction('suspend')}><IconUserMinus size={12} />Suspendre</AppButton> : null}
                                            {canDeleteUsers ? <AppButton isIconOnly compact size="sm" variant="solid" color="danger" tooltip="Supprimer les utilisateurs sélectionnés" aria-label="Supprimer les utilisateurs sélectionnés" onPress={() => setConfirmBulkAction('delete')}><IconTrash size={14} /></AppButton> : null}
                                            <AppButton isIconOnly compact size="sm" variant="quiet" tooltip="Effacer la sélection" aria-label="Effacer la sélection" onPress={() => setSelectedIds(new Set())}><IconX size={14} /></AppButton>
                                        </div>
                                    </div>
                                ) : null}

                                {/* Table with AppDataTable */}
                                <AppDataTable
                                    data={filteredUsers}
                                    columns={userColumns}
                                    searchPlaceholder="Rechercher un nom, un rôle ou une permission…"
                                    emptyTitle="Aucun utilisateur trouvé"
                                    emptyDescription="Aucun utilisateur ne correspond aux filtres actuels."
                                    pageSize={TABLE_PAGE_SIZE}
                                    onRowClick={(user) => setViewProfileUser(user)}
                                    toolbarActions={
                                        <>
                                            <Dropdown isOpen={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
                                                <Dropdown.Trigger>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className={cn(
                                                            'h-7 min-h-7 gap-1.5 px-2 text-[10px] font-medium',
                                                            filterRoles.size !== filterRoleOptions.length || filterStatus !== 'all'
                                                                ? 'border-[var(--accent)] text-[var(--accent)]'
                                                                : '',
                                                        )}
                                                    >
                                                        <IconAdjustmentsHorizontal size={12} />
                                                        Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                                                    </Button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Popover placement="bottom end" className="z-[80] min-w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                                                    <Dropdown.Menu
                                                        aria-label="Filtrer les utilisateurs"
                                                        selectionMode="none"
                                                        onAction={(key) => {
                                                            if (key === 'reset-filters') {
                                                                setFilterRoles(new Set(filterRoleOptions.map((role) => role.id)));
                                                                setFilterStatus('all');
                                                            }
                                                        }}
                                                    >
                                                        <Dropdown.Section aria-label="Par rôle">
                                                            {filterRoleOptions.map((role) => (
                                                                <Dropdown.Item
                                                                    key={role.id}
                                                                    textValue={role.label}
                                                                    onPress={() => {
                                                                        const nextRoles = new Set(filterRoles);
                                                                        if (nextRoles.has(role.id)) nextRoles.delete(role.id);
                                                                        else nextRoles.add(role.id);
                                                                        setFilterRoles(nextRoles);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={cn('flex size-4 items-center justify-center rounded border transition', filterRoles.has(role.id) ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]')}>
                                                                            {filterRoles.has(role.id) && <IconCheck size={10} strokeWidth={3} className="text-white" />}
                                                                        </span>
                                                                        {role.label}
                                                                    </div>
                                                                </Dropdown.Item>
                                                            ))}
                                                        </Dropdown.Section>
                                                        <Dropdown.Section aria-label="Par statut">
                                                            {(['all', 'pending', 'accepted', 'blocked'] as const).map((s) => (
                                                                <Dropdown.Item
                                                                    key={s}
                                                                    className="capitalize"
                                                                    textValue={s === 'all' ? 'Tous les statuts' : s === 'pending' ? 'Invitation en attente' : s === 'accepted' ? 'Accepté' : 'Bloqué'}
                                                                    onPress={() => setFilterStatus(s)}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={cn('flex size-4 items-center justify-center rounded-full border transition', filterStatus === s ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border)]')}>
                                                                            {filterStatus === s && <IconCheck size={10} strokeWidth={3} className="text-white" />}
                                                                        </span>
                                                                        {s === 'all' ? 'Tous les statuts' : s === 'pending' ? 'Invitation en attente' : s === 'accepted' ? 'Accepté' : 'Bloqué'}
                                                                    </div>
                                                                </Dropdown.Item>
                                                            ))}
                                                        </Dropdown.Section>
                                                        {activeFilterCount > 0 ? (
                                                            <Dropdown.Section>
                                                                <Dropdown.Item
                                                                    key="reset-filters"
                                                                    textValue="Réinitialiser les filtres"
                                                                    className="text-[var(--accent)]"
                                                                >
                                                                    Réinitialiser les filtres
                                                                </Dropdown.Item>
                                                            </Dropdown.Section>
                                                        ) : null}
                                                    </Dropdown.Menu>
                                                </Dropdown.Popover>
                                            </Dropdown>
                                            <input id="csv-import" type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvImport} />
                                            <AppButton isIconOnly compact variant="ghost" tooltip="Importer un CSV" aria-label="Importer un CSV" onPress={() => (document.getElementById('csv-import') as HTMLInputElement | null)?.click()}>
                                                <IconUpload size={16} />
                                            </AppButton>
                                            <AppButton isIconOnly compact variant="ghost" tooltip="Exporter en CSV" onPress={exportCsv}><IconDownload size={16} /></AppButton>
                                        </>
                                    }
                                />
                            </div>
                    </TabPanel> : null}

                    {canViewWorkload ? <TabPanel id="workload" className="outline-none">
                        <UserWorkloadTab workload={workload} />
                    </TabPanel> : null}

                    {canViewOperationsReports && operationsReport ? <TabPanel id="reports" className="outline-none">
                        <UserOperationsReportTab report={operationsReport} reportedAt={reportedAt} onRefresh={() => router.reload({ only: ['workload', 'operationsReport', 'reportedAt'] })} />
                    </TabPanel> : null}

                    {canViewUsers ? <TabPanel id="security" className="outline-none">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[var(--text)]">Sécurité et audit</h2>
                                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">Traçabilité des actions sensibles de votre organisation.</p>
                                </div>
                                <AppButton isIconOnly compact variant="ghost" tooltip="Exporter les utilisateurs visibles" aria-label="Exporter les utilisateurs visibles" onPress={exportCsv}><IconDownload size={16} /></AppButton>
                            </div>
                            <AppDataTable
                                data={auditEntries}
                                columns={auditColumns}
                                emptyTitle={auditLoading ? 'Chargement du journal…' : 'Aucun événement de sécurité'}
                                emptyDescription={auditLoading ? 'Le journal est en cours de récupération.' : 'Les actions sensibles apparaîtront ici.'}
                                pageSize={TABLE_PAGE_SIZE}
                                compact
                            />
                        </div>
                    </TabPanel> : null}
                </AppWorkspaceTabs>
                </div>

                {/* ── Modal: Invite New Team Member ── */}
                <AppModal isOpen={isInviteOpen} onOpenChange={(open) => { if (!open) { setIsInviteOpen(false); setInviteErrors({}); } }} title="Nouveau compte utilisateur" size="md">
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-3.5 py-3">
                            <p className="text-sm font-semibold text-[var(--foreground)]">Créer un accès interne</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">Le compte est rattaché à votre société et à votre agence actuelles. Nous envoyons un lien sécurisé afin que le destinataire puisse choisir son mot de passe et activer son accès.</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <AppTextField label="Prénom" placeholder="Prénom" value={inviteForm.firstName} onChange={(value) => setInviteForm((current) => ({ ...current, firstName: value }))} error={firstError(inviteErrors, 'name')} isRequired />
                            <AppTextField label="Nom" placeholder="Nom" value={inviteForm.lastName} onChange={(value) => setInviteForm((current) => ({ ...current, lastName: value }))} />
                        </div>
                        <AppTextField label="Adresse e-mail" type="email" placeholder="utilisateur@archilbo.com" value={inviteForm.email} onChange={(value) => setInviteForm((current) => ({ ...current, email: value }))} error={firstError(inviteErrors, 'email')} isRequired />
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[var(--foreground)]">Rôle initial</label>
                            <Select selectedKey={inviteForm.role} onSelectionChange={(key) => setInviteForm((current) => ({ ...current, role: String(key ?? 'staff') }))} aria-label="Rôle initial">
                                <Select.Trigger className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)]"><Select.Value className="flex-1 truncate text-left" /><Select.Indicator /></Select.Trigger>
                                <Select.Popover className="z-[140] min-w-[280px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl"><ListBox aria-label="Choisir le rôle" className="gap-0">{roles.map((role) => <ListBox.Item key={role.id} id={role.id} textValue={role.label} className="rounded-lg px-3 py-2.5 text-xs">{role.label}</ListBox.Item>)}</ListBox></Select.Popover>
                            </Select>
                            {firstError(inviteErrors, 'role') ? <p className="text-xs font-medium text-[var(--danger)]">{firstError(inviteErrors, 'role')}</p> : null}
                        </div>
                        <div className="flex items-start gap-2 rounded-lg border border-[var(--crm-info)]/20 bg-[var(--crm-info-soft)] px-3 py-2.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
                            <IconMail size={14} className="mt-0.5 shrink-0 text-[var(--crm-info)]" />
                            <span>L'invitation expire après 72 heures. Tant qu'elle n'est pas acceptée, le compte reste en attente et ne peut pas se connecter.</span>
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
                            <AppButton variant="bordered" onPress={() => setIsInviteOpen(false)}>Annuler</AppButton>
                            <AppButton type="submit" variant="solid" color="primary" isDisabled={isInviting}><IconMail size={15} />{isInviting ? "Envoi en cours…" : "Envoyer l'invitation"}</AppButton>
                        </div>
                    </form>
                </AppModal>

                <AppModal isOpen={Boolean(passwordResetTarget)} onOpenChange={(open) => { if (!open) setPasswordResetTarget(null); }} title="Réinitialisation du mot de passe" size="sm">
                    {passwordResetTarget ? <div className="space-y-4">
                        <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-gold-soft)] text-[var(--accent)]"><IconKey size={16} /></div>
                            <div>
                                <p className="text-sm font-semibold text-[var(--foreground)]">{passwordResetTarget.name}</p>
                                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{passwordResetTarget.email}</p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-[var(--text-muted)]">Les mots de passe ne peuvent ni être consultés ni récupérés. Envoyez un lien sécurisé à durée limitée pour que cet utilisateur puisse choisir un nouveau mot de passe.</p>
                        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
                            <AppButton variant="bordered" onPress={() => setPasswordResetTarget(null)}>Annuler</AppButton>
                            <AppButton variant="solid" color="primary" onPress={() => {
                                const target = passwordResetTarget;
                                setPasswordResetTarget(null);
                                router.post(`/admin/users/${target.id}/password-reset`, {}, { preserveScroll: true, onSuccess: () => toast.success(`Lien de réinitialisation envoyé à ${target.email}`), onError: () => toast.error("Impossible d'envoyer le lien de réinitialisation.") });
                            }}><IconMail size={14} />Envoyer le lien</AppButton>
                        </div>
                    </div> : null}
                </AppModal>

                {/* ── Drawer: View Profile ── */}
                <AppDrawer
                    isOpen={Boolean(viewProfileUser)}
                    onOpenChange={(open) => { if (!open) setViewProfileUser(null); }}
                    title="Profil de l'utilisateur"
                    description="Accès au compte et statut actuel"
                    headerIcon={<IconUserCog size={17} />}
                    size="md"
                    footer={viewProfileUser && canManageRoles && roles.some((role) => role.id === primaryRole(viewProfileUser)) && (!isProtectedAdministrator(primaryRole(viewProfileUser)) || canManageProtectedUsers) ? (
                        <AppButton
                            variant="solid"
                            color="primary"
                            onPress={() => {
                                const role = primaryRole(viewProfileUser);
                                const defaults = permissionsForUser(viewProfileUser, role);
                                setEditUser(viewProfileUser);
                                setEditRole(role);
                                setEditPerms(defaults);
                                setInitialPerms(clonePermissions(defaults));
                                setViewProfileUser(null);
                            }}
                        >
                            <IconPencil size={15} />Modifier les permissions
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
                                                    viewProfileUser.accountStatus === 'blocked'
                                                        ? 'bg-[var(--crm-danger-soft)] text-[var(--crm-danger)]'
                                                        : viewProfileUser.accountStatus === 'pending'
                                                            ? 'bg-[var(--crm-gold-soft)] text-[var(--crm-gold)]'
                                                            : 'bg-[var(--crm-success-soft)] text-[var(--crm-success)]',
                                                )}
                                            >
                                                {viewProfileUser.accountStatus === 'blocked' ? 'Bloqué' : viewProfileUser.accountStatus === 'pending' ? 'Invitation en attente' : 'Accepté'}
                                            </Chip>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <dl className="grid grid-cols-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)]">
                                {[
                                    ['Compte', viewProfileUser.accountStatus === 'blocked' ? 'Bloqué' : viewProfileUser.accountStatus === 'pending' ? 'Invitation en attente' : 'Accepté'],
                                    ['Dernière activité', viewProfileUser.isOnline ? 'En ligne maintenant' : viewProfileUser.lastSeenAt ? formatDate(viewProfileUser.lastSeenAt) : 'Aucune activité'],
                                    ['Inscrit', formatDate(viewProfileUser.createdAt)],
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
                                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Accès</h3>
                                        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">Permissions effectives issues des rôles attribués.</p>
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
                                                        <Accordion.Indicator className="text-[var(--text-muted)]"><IconChevronDown size={14} /></Accordion.Indicator>
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
                                        Ce compte hérite actuellement des permissions de son rôle.
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
                }} title="Gérer les accès" size="xl" containerClassName="!w-[calc(100vw-2rem)] !max-w-[68rem]">
                    {editUser && (
                        <div className="flex max-h-[calc(100dvh-11rem)] flex-col gap-3 overflow-hidden px-1 pb-1">
                            {/* ── User identity ── */}
                            <section className="grid shrink-0 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/45 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)_auto] lg:items-end">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent)]">{initials(editUser.name)}</div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[var(--foreground)]">{editUser.name}</p>
                                        <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">{editUser.email}</p>
                                    </div>
                                </div>


                            {/* ── Role + Restore ── */}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <IconShieldCheck size={13} className="text-[var(--accent)]" />
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Rôle de référence</p>
                                    </div>
                                    <Select selectedKey={editRole} onSelectionChange={(key) => {
                                        const newRole = String(key ?? 'viewer');
                                        setEditRole(newRole);
                                        setEditPerms(defaultPermissionsFor(newRole));
                                    }} aria-label="Rôle de référence" className="mt-1.5">
                                        <Select.Trigger className="h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--foreground)] shadow-none"><Select.Value className="flex-1 truncate text-left" /><Select.Indicator /></Select.Trigger>
                                        <Select.Popover className="z-[140] min-w-[260px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl"><ListBox aria-label="Choisir un rôle" className="gap-0">{roles.map((role) => <ListBox.Item key={role.id} id={role.id} textValue={role.label} className="rounded-lg px-3 py-2.5 text-xs">{role.label}</ListBox.Item>)}</ListBox></Select.Popover>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-px overflow-hidden self-start rounded-lg border border-[var(--border)] bg-[var(--border)] lg:self-auto">
                                    {[['Aucun', 'none'], ['Voir', 'view'], ['Modifier', 'edit'], ['Complet', 'delete']].map(([label, level]) => <div key={level} className="min-w-12 bg-[var(--surface)] px-2 py-1.5 text-center"><p className="text-[8px] font-medium text-[var(--text-muted)]">{label}</p><p className="mt-0.5 text-xs font-semibold tabular-nums text-[var(--foreground)]">{Object.values(editPerms).filter((permission) => permission.access === level).length}</p></div>)}
                                </div>
                            </section>

                            {/* ── Permissions grid ── */}
                            <PermissionsMatrix
                                modules={permissionModules}
                                defaults={defaultPermissionsFor(editRole)}
                                perms={editPerms}
                                onChange={(module, access) => setEditPerms((current) => ({ ...current, [module]: { access, scope: access === 'none' ? 'none' : 'all' } }))}
                                onRestore={() => setEditPerms(defaultPermissionsFor(editRole))}
                                onBatch={(action) => setEditPerms(Object.fromEntries(permissionModules.map((module) => {
                                    const access = action === 'full' ? 'delete' as PermissionLevel : 'none' as PermissionLevel;
                                    return [module.key, { access, scope: access === 'none' ? 'none' : 'all' }];
                                })) as PermissionsState)}
                            />

                            {/* ── Footer actions ── */}
                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[var(--border)] pt-3">
                                <AppButton variant="bordered" onPress={() => {
                                    if (JSON.stringify(editPerms) !== JSON.stringify(initialPerms)) {
                                        setShowUnsavedWarning(true);
                                        setPendingEditAction(() => () => { setEditUser(null); setShowUnsavedWarning(false); });
                                        return;
                                    }
                                    setEditUser(null);
                                }}>Annuler</AppButton>
                                <AppButton variant="solid" color="primary" onPress={() => {
                                    const payload = {
                                        userId: editUser.id,
                                        role: editRole,
                                        isCustom: JSON.stringify(editPerms) !== JSON.stringify(defaultPermissionsFor(editRole)),
                                        permissions: editPerms,
                                    };
                                    router.put(`/admin/users/${editUser.id}/permissions`, payload, {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setEditUser(null);
                                            toast.success('Les accès ont été mis à jour.');
                                        },
                                        onError: () => toast.error("Impossible de mettre à jour les accès."),
                                    });
                                }}><IconDeviceFloppy size={15} />Enregistrer</AppButton>
                            </div>
                        </div>
                    )}
                </AppModal>

                {/* ── Modal: Unsaved Changes Warning ── */}
                <AppModal isOpen={showUnsavedWarning} onOpenChange={(o) => { if (!o) { setShowUnsavedWarning(false); setPendingEditAction(null); } }} title="" size="sm">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex size-12 items-center justify-center rounded-full bg-[var(--crm-gold-soft)]">
                                <IconAlertTriangle size={22} className="text-[var(--crm-gold)]" />
                            </div>
                        </div>
                        <h3 className="text-base font-semibold text-[var(--crm-text)]/90 mb-2">Modifications non enregistrées</h3>
                        <p className="text-[12px] text-[var(--crm-text-muted)] leading-relaxed">
                            Vous avez des modifications de permissions non enregistrées. Les ignorer ?
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <AppButton variant="bordered" onPress={() => { setShowUnsavedWarning(false); setPendingEditAction(null); }}>Continuer la modification</AppButton>
                            <AppButton variant="solid" color="danger" onPress={() => { pendingEditAction?.(); }}>Ignorer les modifications</AppButton>
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
                                    <IconAlertTriangle size={22} className={confirmBulkAction === 'delete' ? 'text-[var(--crm-danger)]' : 'text-[var(--crm-gold)]'} />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold text-[var(--crm-text)]/90 mb-2">
                                {confirmBulkAction === 'delete' ? 'Supprimer les utilisateurs' : 'Suspendre les utilisateurs'}
                            </h3>
                            <p className="text-[12px] text-[var(--crm-text-muted)] leading-relaxed">
                                {confirmBulkAction === 'delete'
                                    ? `${selectedIds.size} utilisateur(s) perdront immédiatement tout accès. Cette action est irréversible.`
                                    : `${selectedIds.size} utilisateur(s) perdront l'accès jusqu'à une réactivation manuelle.`}
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <AppButton variant="bordered" onPress={() => setConfirmBulkAction(null)}>Annuler</AppButton>
                                {confirmBulkAction === 'delete' ? (
                                    <AppButton variant="solid" color="danger" onPress={() => {
                                        const ids = [...selectedIds];
                                        setConfirmBulkAction(null);
                                        router.post('/admin/users/bulk/delete', { userIds: ids }, {
                                            preserveScroll: true,
                                            onSuccess: () => { setSelectedIds(new Set()); toast.success('Suppression groupée effectuée.'); },
                                            onError: () => toast.error('Impossible de supprimer certains utilisateurs.'),
                                        });
                                    }}>Oui, supprimer</AppButton>
                                ) : (
                                    <AppButton variant="solid" color="primary" onPress={() => {
                                        const ids = [...selectedIds];
                                        setConfirmBulkAction(null);
                                        router.put('/admin/users/bulk/suspend', { userIds: ids }, {
                                            preserveScroll: true,
                                            onSuccess: () => { setSelectedIds(new Set()); toast.success('Suspension groupée effectuée.'); },
                                            onError: () => toast.error('Impossible de suspendre les utilisateurs.'),
                                        });
                                    }}>Oui, suspendre</AppButton>
                                )}
                            </div>
                        </div>
                    )}
                </AppModal>

                {/* ── Modal: Delete User ── */}
                {/* ── Modal: CSV Import Review ── */}
                <AppModal isOpen={!!csvModal} onOpenChange={(o) => { if (!o) setCsvModal(null); }} title="Examen de l'import CSV" size="lg">
                    {csvModal && (
                        <div className="space-y-4">
                            <p className="text-[12px] text-[var(--crm-text-muted)]">
                                {csvModal.users.filter(u => !csvModal.existing.has(u.email)).length} nouveau(x) · {csvModal.existing.size} existant(s)
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
                                                        <Button size="sm" variant={isOverridden ? 'ghost' : 'primary'} onPress={() => {
                                                            setCsvModal((p) => {
                                                                if (!p) return p;
                                                                const next = new Set(p.overrides);
                                                                next.delete(u.email);
                                                                return { ...p, overrides: next };
                                                            });
                                                        }}
                                                            className="h-6 min-w-0 rounded-r-none px-2 text-[9px]">Ignorer</Button>
                                                        <Button size="sm" variant={isOverridden ? 'primary' : 'ghost'} onPress={() => {
                                                            setCsvModal((p) => {
                                                                if (!p) return p;
                                                                const next = new Set(p.overrides);
                                                                next.add(u.email);
                                                                return { ...p, overrides: next };
                                                            });
                                                        }}
                                                            className="h-6 min-w-0 rounded-l-none px-2 text-[9px]">Remplacer</Button>
                                                    </div>
                                                )}
                                                {!isDuplicate && (
                                                    <span className="text-[9px] font-medium text-[var(--crm-success)]/60">Nouveau</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-[var(--crm-border)]">
                                <span className="text-[10px] text-[var(--crm-text-soft)]">
                                    {csvModal.existing.size > 0 && (
                                        <>{csvModal.overrides.size} sur {csvModal.existing.size} doublon(s) seront remplacés</>
                                    )}
                                </span>
                                <div className="flex items-center gap-2">
                                    <AppButton variant="bordered" onPress={() => setCsvModal(null)}>Annuler</AppButton>
                                    <AppButton variant="solid" color="primary" onPress={() => {
                                        const overrides: Record<string, boolean> = {};
                                        csvModal.overrides.forEach((e) => { overrides[e] = true; });
                                        const payload = { users: csvModal.users, overrides };
                                        setCsvModal(null);
                                        router.post('/admin/users/invite/bulk', payload, {
                                            preserveScroll: true,
                                            onSuccess: () => toast.success('Import CSV terminé.'),
                                            onError: () => toast.error("Échec de l'import CSV."),
                                        });
                                    }}>
                                        Importer {csvModal.users.length} utilisateur{csvModal.users.length > 1 ? 's' : ''}
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
                                    <IconAlertTriangle size={22} className="text-[var(--crm-danger)]" />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold text-[var(--crm-text)]/90 mb-2">Supprimer {deleteTarget.name} ?</h3>
                            <p className="text-[12px] text-[var(--crm-text-muted)] leading-relaxed">
                                Il perdra immédiatement tout accès à <strong className="text-[var(--crm-text)]/70">{appName}</strong>.
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <AppButton variant="bordered" onPress={() => setDeleteTarget(null)}>Annuler</AppButton>
                                <AppButton variant="solid" color="danger" onPress={() => { router.delete(`/admin/users/${deleteTarget.id}`, { preserveScroll: true, onSuccess: () => { setDeleteTarget(null); toast.success(`${deleteTarget.name} a été supprimé.`); }, onError: () => toast.error("Impossible de supprimer l'utilisateur."), }); }}>Oui, supprimer l'utilisateur</AppButton>
                            </div>
                        </div>
                    )}
                </AppModal>
            </AppShell>
        </>
    );
}
