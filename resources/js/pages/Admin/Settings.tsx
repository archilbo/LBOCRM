import { Head, router, usePage } from '@inertiajs/react';
import { IconBuilding, IconCircleCheck, IconCircleDot, IconCircleOff, IconKey, IconMail, IconMapPin, IconPalette, IconPencil, IconPlus, IconPower, IconRestore, IconSettings2, IconShieldLock, IconTrash, IconTrashX } from '@tabler/icons-react';

import { Button, Chip, Input, Pagination, Switch, Table } from '@heroui/react';
import { TabPanel } from 'react-aria-components';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { AppShell } from '@/components/layout/AppShell';
import { AppCard } from '@/components/ui/AppCard';
import { AppPageHeader } from '@/components/ui/AppPageHeader';
import { AppWorkspaceTabs, type AppWorkspaceTab } from '@/components/ui/AppWorkspaceTabs';
import { AppSearchInput } from '@/components/ui/AppSearchInput';
import { AppTextField } from '@/components/ui/AppTextField';
import { FinanceSettingsForm, type FinanceSettingsFormProps } from '@/features/finance/components/FinanceSettingsForm';
import { SystemAppearancePanel, type SystemAppearancePermissions } from '@/components/settings/system-appearance-panel';
import { DrawerSection, DrawerField, drawerStyles } from '@/components/drawers';
import type { FormErrors } from '@/lib/formErrors';
import type { PublicBrandingSettings } from '@/types/branding';

type CityRow = {
    id: number;
    name: string;
    code: string;
    color: string;
    isActive: boolean;
    dossiersCount: number;
};

type PageProps = {
    cities: CityRow[];
    usedColors: string[];
    canViewCities?: boolean;
    canManageCities?: boolean;
    canDeleteCities?: boolean;
    canViewFinanceSettings?: boolean;
    canManageFinanceSettings?: boolean;
    canViewSystemAppearance?: boolean;
    financeSettings?: FinanceSettingsFormProps | null;
    branding?: PublicBrandingSettings | null;
    permissions?: SystemAppearancePermissions | null;
    recovery?: RecoveryWorkspace;
    accountSecurity?: AccountSecurity;
};

type AccountSecurity = { email: string; recoveryEmails: Array<{ id: number; email: string; verifiedAt: string | null }>; twoFactorEnabled: boolean; twoFactorSetupKey: string | null; twoFactorProvisioningUri: string | null; recoveryCodes: string[] };

type RecoveryWorkspace = {
    items: RecoveryItem[];
    pagination: { currentPage: number; lastPage: number; total: number };
    filters: { search: string; type: string; deletedBy: string };
    types: Array<{ key: string; label: string; count: number }>;
    summary: { total: number; tasks: number; calendar: number };
};

type RecoveryItem = {
    key: string; id: number; entityType: string; entityLabel: string; title: string;
    subtitle?: string | null; deletedAt: string; deletedBy?: { id: number; name: string } | null;
    capabilities: { restore: boolean; purge: boolean };
};

const SWATCHES = ['#E08D3C', '#4A90D9', '#7EB36A', '#C0392B', '#8E44AD', '#2C3E50', '#D35400', '#16A085', '#F39C12', '#2980B9'];
const CITIES_PAGE_SIZE = 8;

const BASE_TABS: AppWorkspaceTab[] = [
    { id: 'cities', label: 'Villes', icon: IconMapPin },
];

function visiblePageNumbers(currentPage: number, totalPages: number): number[] {
    const count = Math.min(5, totalPages);
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - count + 1));

    return Array.from({ length: count }, (_, index) => start + index);
}

export default function AdminSettings({ cities, usedColors, canViewCities = false, canManageCities = false, canDeleteCities = false, canViewFinanceSettings = false, canManageFinanceSettings = false, canViewSystemAppearance = false, financeSettings, branding, permissions, recovery, accountSecurity }: PageProps) {
    const { url } = usePage();

    const tabs: AppWorkspaceTab[] = [
        ...(canViewCities ? BASE_TABS : []),
        ...(canViewFinanceSettings ? [{ id: 'company', label: 'Entreprise', icon: IconBuilding }, { id: 'finance', label: 'Finance', icon: IconSettings2 }] : []),
        ...(canViewSystemAppearance ? [{ id: 'system-appearance', label: 'Système & apparence', icon: IconPalette }] : []),
        ...(recovery ? [{ id: 'recovery', label: 'Corbeille & récupération', icon: IconTrashX }] : []),
        ...(accountSecurity ? [{ id: 'security', label: 'Securite du compte', icon: IconShieldLock }] : []),
    ];

    function handleTabChange(key: string) {
        setActiveTab(key);
    }

    const [activeTab, setActiveTab] = useState<string>(() => {
        const tab = new URL(url, window.location.origin).searchParams.get('tab');
        if (tab && ((canViewFinanceSettings && ['company', 'finance'].includes(tab)) || (canViewSystemAppearance && tab === 'system-appearance') || (recovery && tab === 'recovery') || (accountSecurity && tab === 'security'))) {
            return tab;
        }

        return canViewCities ? 'cities' : accountSecurity ? 'security' : 'company';
    });

    return (
        <>
            <Head title="Paramètres" />
            <AppShell fullBleed>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
                    <div className="mx-auto w-full max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
                        <AppPageHeader
                            eyebrow="Administration"
                            title="Paramètres"
                            subtitle={activeTab === 'finance'
                                ? 'Centralisez les valeurs appliquées aux devis, factures, reçus et documents.'
                                : activeTab === 'company'
                                    ? 'Gérez l’identité, le logo, les mentions légales et les coordonnées bancaires.'
                                    : activeTab === 'system-appearance'
                                        ? 'Personnalisez l’identité, la couleur de marque et les logos de l’application.'
                                        : activeTab === 'recovery'
                                            ? 'Consultez et restaurez les données supprimées de l’entreprise.'
                                        : 'Gérez les villes utilisées pour l’organisation des dossiers et archives.'}
                        />

                        <AppWorkspaceTabs tabs={tabs} selectedKey={activeTab} onSelectionChange={handleTabChange}>
                            {canViewCities ? (
                            <TabPanel id="cities">
                                <CitiesTabContent
                                    cities={cities}
                                    usedColors={usedColors}
                                    canManage={canManageCities}
                                    canDelete={canDeleteCities}
                                />
                            </TabPanel>
                            ) : null}
                            {canViewFinanceSettings && financeSettings ? (
                                <TabPanel id="company">
                                    <FinanceSettingsForm
                                        settings={financeSettings.settings}
                                        routes={financeSettings.routes}
                                        architectRates={financeSettings.architectRates}
                                        architectFeeOptions={financeSettings.architectFeeOptions}
                                        contractTemplateOptions={financeSettings.contractTemplateOptions}
                                        canManage={canManageFinanceSettings}
                                        showHeader={false}
                                        visibleSections={['company', 'bank']}
                                    />
                                </TabPanel>
                            ) : null}
                            {canViewFinanceSettings && financeSettings ? (
                                <TabPanel id="finance">
                                    <FinanceSettingsForm
                                        settings={financeSettings.settings}
                                        routes={financeSettings.routes}
                                        architectRates={financeSettings.architectRates}
                                        architectFeeOptions={financeSettings.architectFeeOptions}
                                        contractTemplateOptions={financeSettings.contractTemplateOptions}
                                        canManage={canManageFinanceSettings}
                                        showHeader={false}
                                        visibleSections={['finance']}
                                    />
                                </TabPanel>
                            ) : null}
                            {canViewSystemAppearance && branding && permissions ? (
                                <TabPanel id="system-appearance">
                                    <SystemAppearancePanel branding={branding} permissions={permissions} embedded />
                                </TabPanel>
                            ) : null}
                            {recovery ? <TabPanel id="recovery"><RecoveryTab recovery={recovery} /></TabPanel> : null}
                            {accountSecurity ? <TabPanel id="security"><AccountSecurityTab security={accountSecurity} /></TabPanel> : null}
                        </AppWorkspaceTabs>
                    </div>
                </div>
            </AppShell>
        </>
    );
}

function AccountSecurityTab({ security }: { security: AccountSecurity }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [backupEmail, setBackupEmail] = useState('');
    const [isAddingBackupEmail, setIsAddingBackupEmail] = useState(false);
    const [code, setCode] = useState('');
    const request = (url: string, data: Record<string, string>, method: 'post' | 'put' | 'delete' = 'post') => {
        const options = { preserveScroll: true, onSuccess: () => { setCurrentPassword(''); setPassword(''); setPasswordConfirmation(''); setBackupEmail(''); setCode(''); } };
        if (method === 'put') router.put(url, data, options);
        else if (method === 'delete') router.delete(url, { ...options, data });
        else router.post(url, data, options);
    };

    return <div className="mx-auto grid max-w-5xl gap-5 py-5 lg:grid-cols-2">
        <AppCard className="space-y-4 p-5"><div className="flex items-start gap-3"><IconKey className="mt-0.5 text-[var(--accent)]" size={19} /><div><h2 className="font-semibold">Mot de passe</h2><p className="text-sm text-[var(--text-muted)]">Utilisez un mot de passe unique et robuste.</p></div></div><AppTextField label="Mot de passe actuel" type="password" value={currentPassword} onChange={setCurrentPassword} /><AppTextField label="Nouveau mot de passe" type="password" value={password} onChange={setPassword} description="12 caractères minimum, majuscule, minuscule, chiffre et symbole." /><AppTextField label="Confirmer le nouveau mot de passe" type="password" value={passwordConfirmation} onChange={setPasswordConfirmation} /><AppButton variant="primary" onPress={() => request('/settings/security/password', { current_password: currentPassword, password, password_confirmation: passwordConfirmation }, 'put')}>Changer le mot de passe</AppButton></AppCard>
        <AppCard className="space-y-4 p-5"><div className="flex items-start gap-3"><IconMail className="mt-0.5 text-[var(--accent)]" size={19} /><div><h2 className="font-semibold">E-mails de secours</h2><p className="text-sm text-[var(--text-muted)]">Ajoutez jusqu’à quatre adresses vérifiées pour recevoir un lien de réinitialisation.</p></div></div><p className="rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm">Adresse de connexion : <strong>{security.email}</strong></p>{security.recoveryEmails.map((email) => <div key={email.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"><span className="min-w-0 truncate">{email.email} <span className="text-[var(--text-muted)]">{email.verifiedAt ? '· Vérifié' : '· En attente de vérification'}</span></span><Button isIconOnly size="sm" variant="ghost" aria-label="Supprimer l’adresse" onPress={() => request(`/settings/security/recovery-emails/${email.id}`, { current_password: currentPassword }, 'delete')}><IconTrash size={15} /></Button></div>)}{isAddingBackupEmail ? <div className="space-y-3 rounded-xl border border-[var(--border)] p-3"><AppTextField label="Nouvel e-mail de secours" type="email" value={backupEmail} onChange={setBackupEmail} /><AppTextField label="Mot de passe actuel" type="password" value={currentPassword} onChange={setCurrentPassword} /><div className="flex gap-2"><AppButton variant="secondary" onPress={() => request('/settings/security/recovery-emails', { email: backupEmail, current_password: currentPassword })}>Envoyer le lien</AppButton><AppButton variant="ghost" onPress={() => setIsAddingBackupEmail(false)}>Annuler</AppButton></div></div> : security.recoveryEmails.length < 4 ? <AppButton variant="secondary" onPress={() => setIsAddingBackupEmail(true)}>Ajouter un e-mail de secours</AppButton> : null}</AppCard>
        <AppCard className="space-y-4 p-5 lg:col-span-2"><div className="flex items-start gap-3"><IconShieldLock className="mt-0.5 text-[var(--accent)]" size={19} /><div><h2 className="font-semibold">Vérification en deux étapes</h2><p className="text-sm text-[var(--text-muted)]">Protégez votre compte avec une application d’authentification.</p></div></div>{security.twoFactorEnabled ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[color-mix(in_srgb,var(--success)_8%,transparent)] p-3"><span className="text-sm font-medium text-[var(--success)]">La vérification en deux étapes est active.</span><AppButton variant="danger" onPress={() => request('/settings/security/two-factor', { current_password: currentPassword }, 'delete')}>Désactiver</AppButton></div> : security.twoFactorSetupKey ? <div className="grid gap-4 rounded-xl border border-[var(--border)] p-4 md:grid-cols-2"><div><p className="text-sm font-medium">Clé de configuration</p><code className="mt-2 block break-all rounded-lg bg-[var(--surface-2)] p-3 text-xs">{security.twoFactorSetupKey}</code><p className="mt-2 text-xs text-[var(--text-muted)]">Ajoutez cette clé dans Google Authenticator, Microsoft Authenticator ou 1Password.</p></div><div className="space-y-3"><AppTextField label="Code à 6 chiffres" inputMode="numeric" value={code} onChange={setCode} /><AppButton variant="primary" onPress={() => request('/settings/security/two-factor/confirm', { code })}>Confirmer et activer</AppButton></div></div> : <div className="flex flex-wrap items-end gap-3"><div className="min-w-64 flex-1"><AppTextField label="Mot de passe actuel" type="password" value={currentPassword} onChange={setCurrentPassword} /></div><AppButton variant="primary" onPress={() => request('/settings/security/two-factor', { current_password: currentPassword })}>Configurer</AppButton></div>}{security.recoveryCodes.length ? <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--crm-gold-soft)] p-4"><p className="font-medium">Codes de récupération — enregistrez-les maintenant</p><div className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm">{security.recoveryCodes.map((recoveryCode) => <span key={recoveryCode}>{recoveryCode}</span>)}</div></div> : null}</AppCard>
    </div>;
}

function RecoveryTab({ recovery }: { recovery: RecoveryWorkspace }) {
    const [search, setSearch] = useState(recovery.filters.search);
    const [purgeTarget, setPurgeTarget] = useState<RecoveryItem | null>(null);
    const [pendingId, setPendingId] = useState<number | null>(null);

    const visit = (params: Record<string, string | number>) => router.get('/settings', { tab: 'recovery', ...params }, { preserveScroll: true, preserveState: true });
    const restore = (item: RecoveryItem) => {
        setPendingId(item.id);
        router.post(`/settings/recovery/${item.id}/restore`, {}, { preserveScroll: true, onFinish: () => setPendingId(null) });
    };
    const purge = () => {
        if (!purgeTarget) return;
        setPendingId(purgeTarget.id);
        router.delete(`/settings/recovery/${purgeTarget.id}/purge`, { preserveScroll: true, onFinish: () => { setPendingId(null); setPurgeTarget(null); } });
    };

    return <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
            <RecoveryMetric label="Éléments supprimés" value={recovery.summary.total} />
            <RecoveryMetric label="Tâches" value={recovery.summary.tasks} />
            <RecoveryMetric label="Calendrier" value={recovery.summary.calendar} />
        </div>
        <AppCard className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <form onSubmit={(event) => { event.preventDefault(); visit({ search, type: recovery.filters.type }); }} className="w-full max-w-md">
                    <AppSearchInput value={search} onChange={setSearch} placeholder="Rechercher une donnée supprimée" />
                </form>
                <div className="flex flex-wrap gap-2">
                    <AppButton size="sm" variant={!recovery.filters.type ? 'secondary' : 'ghost'} onPress={() => visit({ search, type: '' })}>Tous ({recovery.summary.total})</AppButton>
                    {recovery.types.map((type) => <AppButton key={type.key} size="sm" variant={recovery.filters.type === type.key ? 'secondary' : 'ghost'} onPress={() => visit({ search, type: type.key })}>{type.label} ({type.count})</AppButton>)}
                </div>
            </div>
            <div className="mt-4 space-y-2">
                {recovery.items.length ? recovery.items.map((item) => <div key={item.key} className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><p className="text-xs font-semibold text-[var(--accent)]">{item.entityLabel}</p><p className="truncate text-sm font-semibold text-[var(--text)]">{item.title}</p><p className="mt-1 text-xs text-[var(--text-muted)]">Supprimé {new Date(item.deletedAt).toLocaleString('fr-FR')}{item.deletedBy ? ` par ${item.deletedBy.name}` : ''}</p></div>
                    <div className="flex shrink-0 gap-2">
                        {item.capabilities.restore ? <AppButton size="sm" variant="secondary" compact isIconOnly tooltip="Restaurer" aria-label="Restaurer" isDisabled={pendingId === item.id} onPress={() => restore(item)}><IconRestore size={15} /></AppButton> : null}
                        {item.capabilities.purge ? <AppButton size="sm" variant="danger-soft" compact isIconOnly tooltip="Supprimer définitivement" aria-label="Supprimer définitivement" isDisabled={pendingId === item.id} onPress={() => setPurgeTarget(item)}><IconTrash size={15} /></AppButton> : null}
                    </div>
                </div>) : <div className="py-12 text-center"><IconTrashX className="mx-auto mb-3 text-[var(--text-muted)]" size={30} /><p className="font-semibold text-[var(--text)]">Corbeille vide</p><p className="mt-1 text-sm text-[var(--text-muted)]">Aucune donnée supprimée à restaurer.</p></div>}
            </div>
            {recovery.pagination.lastPage > 1 ? <div className="mt-4 flex justify-end"><Pagination><Pagination.Content><Pagination.Item><Pagination.Previous isDisabled={recovery.pagination.currentPage <= 1} onPress={() => visit({ search, type: recovery.filters.type, page: recovery.pagination.currentPage - 1 })}>Précédent</Pagination.Previous></Pagination.Item><Pagination.Item><Pagination.Link isActive>{recovery.pagination.currentPage}</Pagination.Link></Pagination.Item><Pagination.Item><Pagination.Next isDisabled={recovery.pagination.currentPage >= recovery.pagination.lastPage} onPress={() => visit({ search, type: recovery.filters.type, page: recovery.pagination.currentPage + 1 })}>Suivant</Pagination.Next></Pagination.Item></Pagination.Content></Pagination></div> : null}
        </AppCard>
        <AppModal isOpen={Boolean(purgeTarget)} onOpenChange={(open) => !open && setPurgeTarget(null)} title="Supprimer définitivement ?" size="sm">
            <p className="text-sm text-[var(--text-muted)]">Cette action est irréversible depuis ARCHI LBO.</p>
            <div className="mt-5 flex justify-end gap-2"><AppButton variant="ghost" onPress={() => setPurgeTarget(null)}>Annuler</AppButton><AppButton className="bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]" isDisabled={pendingId === purgeTarget?.id} onPress={purge}>Supprimer</AppButton></div>
        </AppModal>
    </section>;
}

function RecoveryMetric({ label, value }: { label: string; value: number }) {
    return <AppCard className="p-4"><p className="text-2xl font-bold text-[var(--text)]">{value}</p><p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{label}</p></AppCard>;
}

function CitiesTabContent({ cities, usedColors, canManage, canDelete }: { cities: CityRow[]; usedColors: string[]; canManage: boolean; canDelete: boolean }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editCity, setEditCity] = useState<CityRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CityRow | null>(null);
    const [form, setForm] = useState({ name: '', code: '', color: '#64748B', is_active: true });
    const [errors, setErrors] = useState<FormErrors>({});
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [page, setPage] = useState(1);

    const filteredCities = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return cities.filter((city) => {
            const matchesSearch = !normalizedSearch
                || city.name.toLowerCase().includes(normalizedSearch)
                || city.code.toLowerCase().includes(normalizedSearch);
            const matchesStatus = statusFilter === 'all'
                || (statusFilter === 'active' && city.isActive)
                || (statusFilter === 'inactive' && !city.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [cities, search, statusFilter]);

    const availableSwatches = SWATCHES.filter((s) => {
        if (s === form.color) return true;
        return !usedColors.includes(s);
    });
    const activeCitiesCount = cities.filter((city) => city.isActive).length;
    const inactiveCitiesCount = cities.length - activeCitiesCount;
    const totalPages = Math.max(1, Math.ceil(filteredCities.length / CITIES_PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedCities = filteredCities.slice((currentPage - 1) * CITIES_PAGE_SIZE, currentPage * CITIES_PAGE_SIZE);
    const firstResult = filteredCities.length === 0 ? 0 : (currentPage - 1) * CITIES_PAGE_SIZE + 1;
    const lastResult = Math.min(currentPage * CITIES_PAGE_SIZE, filteredCities.length);

    function openCreate() {
        if (!canManage) return;
        setEditCity(null);
        setForm({ name: '', code: '', color: '#64748B', is_active: true });
        setErrors({});
        setDrawerOpen(true);
    }

    function openEdit(city: CityRow) {
        if (!canManage) return;
        setEditCity(city);
        setForm({ name: city.name, code: city.code, color: city.color, is_active: city.isActive });
        setErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const normalizedCode = form.code.trim().toUpperCase();
        const normalizedName = form.name.trim().replace(/\s+/g, ' ');
        const normalizedNameKey = normalizedName.toLocaleLowerCase('fr-FR');
        const newErrors: FormErrors = {};

        if (!normalizedName) {
            newErrors.name = 'Le nom est obligatoire.';
        }
        if (!/^[A-Z]{2,8}$/.test(normalizedCode)) {
            newErrors.code = 'Utilisez 2 à 8 lettres, par exemple MAR, MAD ou FES.';
        }
        if (!/^#[0-9A-Fa-f]{6}$/.test(form.color)) {
            newErrors.color = 'Choisissez une couleur valide.';
        }

        if (cities.some((city) => city.id !== editCity?.id && city.name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr-FR') === normalizedNameKey)) {
            newErrors.name = 'Cette ville existe déjà.';
        }
        if (cities.some((city) => city.id !== editCity?.id && city.code.toUpperCase() === normalizedCode)) {
            newErrors.code = 'Ce code de ville existe déjà.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (!canManage) {
            return;
        }

        const payload = { ...form, name: normalizedName, code: normalizedCode };
        if (editCity) {
            router.put(`/settings/cities/${editCity.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); toast.success('Ville mise à jour.'); },
                onError: (err) => setErrors(err as FormErrors),
            });
        } else {
            router.post('/settings/cities', payload, {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); toast.success('Ville créée.'); },
                onError: (err) => setErrors(err as FormErrors),
            });
        }
    }

    function confirmDelete() {
        if (!deleteTarget || !canDelete) return;
        router.delete(`/settings/cities/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { setDeleteTarget(null); toast.success('Ville supprimée.'); },
            onError: () => toast.error('Impossible de supprimer cette ville.'),
        });
    }

    function updateAvailability(city: CityRow, isActive: boolean) {
        if (!canManage || city.isActive === isActive) return;

        router.put(`/settings/cities/${city.id}`, {
            name: city.name,
            code: city.code,
            color: city.color,
            is_active: isActive,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(isActive ? 'Ville activée.' : 'Ville désactivée.'),
            onError: () => toast.error('Impossible de mettre à jour la disponibilité de cette ville.'),
        });
    }

    return (
        <>
            <AppCard className="overflow-hidden p-0">
                <div className="flex flex-wrap items-start gap-3 border-b border-[var(--border)] px-5 py-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                        <IconMapPin size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-semibold text-[var(--text)]">Villes</h2>
                            <Chip size="sm" variant="soft">{cities.length} villes</Chip>
                            <Chip size="sm" variant="soft" color="success">{activeCitiesCount} actives</Chip>
                            {inactiveCitiesCount > 0 ? <Chip size="sm" variant="soft">{inactiveCitiesCount} inactives</Chip> : null}
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Codes et couleurs utilisés pour classer les dossiers et archives.</p>
                    </div>
                    {canManage ? <AppButton variant="primary" compact isIconOnly onPress={openCreate} tooltip="Ajouter une ville" aria-label="Ajouter une ville">
                        <IconPlus size={16} />
                    </AppButton> : null}
                </div>
                <div className="p-5">
                    <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <AppSearchInput
                            value={search}
                            onChange={(value) => {
                                setSearch(value);
                                setPage(1);
                            }}
                            placeholder="Rechercher une ville ou un code"
                            ariaLabel="Rechercher une ville"
                        />
                        <div className="flex items-center gap-1 rounded-full bg-[var(--surface-2)] p-1">
                            {([
                                ['all', 'Toutes', IconCircleDot, 'text-[var(--accent)]'],
                                ['active', 'Actives', IconCircleCheck, 'text-[var(--crm-success)]'],
                                ['inactive', 'Inactives', IconCircleOff, 'text-[var(--text-muted)]'],
                            ] as const).map(([value, label, Icon, colorClassName]) => (
                                <AppButton
                                    key={value}
                                    variant={statusFilter === value ? 'secondary' : 'quiet'}
                                    compact
                                    className="h-7 rounded-full px-2.5 text-[10px]"
                                    onPress={() => {
                                        setStatusFilter(value);
                                        setPage(1);
                                    }}
                                >
                                    <Icon size={12} className={colorClassName} />
                                    {label}
                                </AppButton>
                            ))}
                        </div>
                    </div>

                    <Table.Root className="overflow-hidden rounded-2xl bg-[var(--surface)]">
                        <Table.ScrollContainer>
                            <Table.Content aria-label="Liste des villes">
                                <Table.Header>
                                    <Table.Column isRowHeader>Code</Table.Column>
                                    <Table.Column>Ville</Table.Column>
                                    <Table.Column>Couleur</Table.Column>
                                    <Table.Column>Statut</Table.Column>
                                    <Table.Column>Dossiers</Table.Column>
                                    {canManage || canDelete ? <Table.Column>Actions</Table.Column> : null}
                                </Table.Header>
                                <Table.Body
                                    items={paginatedCities}
                                    renderEmptyState={() => (
                                        <div className="px-3 py-10 text-center text-sm text-[var(--text-muted)]">
                                            {cities.length === 0 ? 'Aucune ville configurée.' : 'Aucune ville ne correspond aux filtres.'}
                                        </div>
                                    )}
                                >
                                    {(city) => (
                                        <Table.Row id={city.id} className="group transition hover:bg-[var(--surface-2)]">
                                            <Table.Cell><span className="font-mono text-[12px] font-bold text-[var(--text)]">{city.code}</span></Table.Cell>
                                            <Table.Cell><span className="text-[12px] font-medium text-[var(--text)]">{city.name}</span></Table.Cell>
                                            <Table.Cell>
                                                <div className="flex items-center gap-2">
                                                    <span className="size-4 shrink-0 rounded-md ring-1 ring-black/10" style={{ backgroundColor: city.color }} />
                                                    <span className="font-mono text-[10px] text-[var(--text-muted)]">{city.color}</span>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex items-center gap-2">
                                                    <Chip size="sm" variant="soft" color={city.isActive ? 'success' : 'default'}>{city.isActive ? 'Active' : 'Inactive'}</Chip>
                                                    {canManage ? <Switch size="sm" isSelected={city.isActive} onChange={(isActive) => updateAvailability(city, isActive)} aria-label={`${city.isActive ? 'Désactiver' : 'Activer'} ${city.name}`}>
                                                        <Switch.Content><Switch.Control><Switch.Thumb /></Switch.Control></Switch.Content>
                                                    </Switch> : null}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell><span className="text-[12px] tabular-nums text-[var(--text-muted)]">{city.dossiersCount}</span></Table.Cell>
                                            {canManage || canDelete ? <Table.Cell>
                                                <div className="flex items-center gap-1">
                                                    {canManage ? <AppButton variant="quiet" compact isIconOnly tooltip="Modifier la ville" aria-label="Modifier la ville" onPress={() => openEdit(city)}><IconPencil size={13} /></AppButton> : null}
                                                    {canDelete ? <AppButton variant="danger-soft" compact isIconOnly tooltip={city.dossiersCount > 0 ? 'Suppression impossible : des dossiers utilisent cette ville' : 'Supprimer la ville'} aria-label="Supprimer la ville" onPress={() => setDeleteTarget(city)} isDisabled={city.dossiersCount > 0}><IconTrash size={13} /></AppButton> : null}
                                                </div>
                                            </Table.Cell> : null}
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table.Content>
                        </Table.ScrollContainer>
                        <Table.Footer>
                            <Pagination size="sm" aria-label="Pagination des villes">
                                <Pagination.Summary>{firstResult}-{lastResult} sur {filteredCities.length}</Pagination.Summary>
                                <Pagination.Content>
                                    <Pagination.Item>
                                        <Pagination.Previous isDisabled={currentPage === 1} onPress={() => setPage(currentPage - 1)} aria-label="Page précédente"><Pagination.PreviousIcon /></Pagination.Previous>
                                    </Pagination.Item>
                                    {visiblePageNumbers(currentPage, totalPages).map((pageNumber) => (
                                        <Pagination.Item key={pageNumber}>
                                            <Pagination.Link isActive={pageNumber === currentPage} onPress={() => setPage(pageNumber)}>{pageNumber}</Pagination.Link>
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Item>
                                        <Pagination.Next isDisabled={currentPage === totalPages} onPress={() => setPage(currentPage + 1)} aria-label="Page suivante"><Pagination.NextIcon /></Pagination.Next>
                                    </Pagination.Item>
                                </Pagination.Content>
                            </Pagination>
                        </Table.Footer>
                    </Table.Root>
                </div>
            </AppCard>

            {/* Drawer */}
            <AppDrawer
                isOpen={drawerOpen}
                onOpenChange={setDrawerOpen}
                title={editCity ? 'Modifier la ville' : 'Ajouter une ville'}
                description="Code, couleur de classement et disponibilité de la ville."
                size="sm"
            >
                <form onSubmit={handleSubmit} className="flex h-full flex-col">
                    <div className="flex-1 space-y-5 px-5 pb-4">
                        <DrawerSection icon={<IconBuilding size={12} />} title="Identification">
                            <div className="grid gap-2">
                                <DrawerField label="Nom de la ville" error={errors.name}>
                                    <Input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex. Marrakech"
                                        maxLength={255}
                                        className={drawerStyles.input}
                                    />
                                </DrawerField>
                                <DrawerField label="Code de la ville" error={errors.code}>
                                    <Input
                                        type="text"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
                                        placeholder="Ex. MRK"
                                        maxLength={8}
                                        className={drawerStyles.input}
                                    />
                                </DrawerField>
                                <p className="text-[10px] leading-4 text-[var(--text-muted)]">2 à 8 lettres en majuscules, par exemple MAR, MAD ou FES.</p>
                            </div>
                        </DrawerSection>

                        <DrawerSection icon={<IconPalette size={12} />} title="Couleur des dossiers">
                            <DrawerField label="Couleur" error={errors.color}>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="color"
                                        value={form.color}
                                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                                        aria-label="Choisir une couleur personnalisée"
                                        className="size-9 shrink-0 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border)] bg-transparent p-0.5"
                                    />
                                    <span className="font-mono text-xs text-[var(--text-muted)]">{form.color}</span>
                                </div>
                            </DrawerField>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {availableSwatches.length === 0 ? (
                                    <span className="text-[10px] italic text-[var(--text-muted)]">Toutes les couleurs prédéfinies sont utilisées.</span>
                                ) : (
                                    availableSwatches.map((s) => (
                                        <Button
                                            key={s}
                                            type="button"
                                            isIconOnly
                                            onClick={() => setForm({ ...form, color: s })}
                                            aria-label={`Sélectionner la couleur ${s}`}
                                            className={`size-6 min-w-6 rounded-md ring-1 ring-inset transition hover:scale-110 ${form.color === s ? 'scale-110 ring-2 ring-[var(--accent)]' : 'ring-[var(--border)]'}`}
                                            style={{ backgroundColor: s }}
                                        />
                                    ))
                                )}
                            </div>
                        </DrawerSection>

                        <DrawerSection icon={<IconPower size={12} />} title="Disponibilité">
                            <div className="flex items-center gap-3">
                                <Switch
                                    size="sm"
                                    isSelected={form.is_active}
                                    onChange={(isActive) => setForm({ ...form, is_active: isActive })}
                                    aria-label="Ville active"
                                >
                                    <Switch.Content>
                                        <Switch.Control>
                                            <Switch.Thumb />
                                        </Switch.Control>
                                    </Switch.Content>
                                </Switch>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-[var(--text)]">Ville active</span>
                                    <span className="text-[9px] text-[var(--text-muted)]">Disponible dans les filtres et nouvelles sélections.</span>
                                </div>
                            </div>
                        </DrawerSection>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 border-t border-[var(--border)] px-5 py-4">
                        <div className="flex items-center justify-between gap-2">
                            <Button variant="ghost" size="sm" onPress={() => setDrawerOpen(false)}>Annuler</Button>
                            <Button variant="primary" size="sm" type="submit">
                                {editCity ? 'Enregistrer' : 'Créer la ville'}
                            </Button>
                        </div>
                    </div>
                </form>
            </AppDrawer>

            <AppModal isOpen={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Supprimer la ville ?" size="sm">
                <p className="mb-4 text-sm text-[var(--text)]">
                    {deleteTarget && deleteTarget.dossiersCount > 0
                        ? `Impossible de supprimer « ${deleteTarget.name} » : ${deleteTarget.dossiersCount} dossier(s) utilisent cette ville.`
                        : `Supprimer « ${deleteTarget?.name} » ? Cette action est définitive.`}
                </p>
                <div className="flex justify-end gap-2">
                    <AppButton variant="bordered" size="sm" onPress={() => setDeleteTarget(null)}>Annuler</AppButton>
                    {deleteTarget && deleteTarget.dossiersCount === 0 ? (
                        <AppButton color="danger" variant="solid" size="sm" onPress={confirmDelete}>Supprimer</AppButton>
                    ) : null}
                </div>
            </AppModal>
        </>
    );
}
