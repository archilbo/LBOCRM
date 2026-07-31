import { Head, router, usePage } from '@inertiajs/react';
import { Building2, MapPin, Palette, Pencil, Plus, Power, Settings, Settings2, Trash2 } from 'lucide-react';
import { Button, Input, Switch } from '@heroui/react';
import { TabPanel } from 'react-aria-components';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppModal } from '@/components/ui/AppModal';
import { AppShell } from '@/components/layout/AppShell';
import { AppCard } from '@/components/ui/AppCard';
import { AppWorkspaceTabs, type AppWorkspaceTab } from '@/components/ui/AppWorkspaceTabs';
import { FinanceSettingsForm, type FinanceSettingsFormProps } from '@/features/finance/components/FinanceSettingsForm';
import { DrawerSection, DrawerField, drawerStyles } from '@/components/drawers';
import { cn } from '@/lib/cn';
import type { FormErrors } from '@/lib/formErrors';

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
    canViewFinanceSettings?: boolean;
    financeSettings?: FinanceSettingsFormProps | null;
};

const SWATCHES = ['#E08D3C', '#4A90D9', '#7EB36A', '#C0392B', '#8E44AD', '#2C3E50', '#D35400', '#16A085', '#F39C12', '#2980B9'];

const BASE_TABS: AppWorkspaceTab[] = [
    { id: 'cities', label: 'Cities', icon: MapPin },
];

export default function AdminSettings({ cities, usedColors, canViewFinanceSettings = false, financeSettings }: PageProps) {
    const { url } = usePage();

    const tabs: AppWorkspaceTab[] = canViewFinanceSettings
        ? [...BASE_TABS, { id: 'finance', label: 'Finance', icon: Settings2 }]
        : BASE_TABS;

    const [activeTab, setActiveTab] = useState(() => {
        const tab = new URL(url, window.location.origin).searchParams.get('tab');
        return tab === 'finance' && canViewFinanceSettings ? 'finance' : 'cities';
    });

    return (
        <>
            <Head title="Settings" />
            <AppShell fullBleed>
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
                    <div className={cn(
                        'mx-auto w-full px-4 py-6 sm:px-6 lg:px-8',
                        activeTab === 'finance' ? 'max-w-[1540px]' : 'max-w-[1000px]',
                    )}>
                        <AppCard className="p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                    <Settings size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-lg font-semibold text-[var(--text)]">Settings</h1>
                                    <p className="mt-1 text-xs text-[var(--text-muted)]">Manage application settings and archive organization.</p>
                                </div>
                            </div>
                        </AppCard>

                        <AppWorkspaceTabs tabs={tabs} selectedKey={activeTab} onSelectionChange={setActiveTab}>
                            <TabPanel id="cities">
                                <CitiesTabContent
                                    cities={cities}
                                    usedColors={usedColors}
                                />
                            </TabPanel>
                            {canViewFinanceSettings && financeSettings ? (
                                <TabPanel id="finance">
                                    <FinanceSettingsForm
                                        settings={financeSettings.settings}
                                        routes={financeSettings.routes}
                                    />
                                </TabPanel>
                            ) : null}
                        </AppWorkspaceTabs>
                    </div>
                </div>
            </AppShell>
        </>
    );
}

function CitiesTabContent({ cities, usedColors }: { cities: CityRow[]; usedColors: string[] }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editCity, setEditCity] = useState<CityRow | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CityRow | null>(null);
    const [form, setForm] = useState({ name: '', code: '', color: '#64748B', is_active: true });
    const [errors, setErrors] = useState<FormErrors>({});

    const availableSwatches = SWATCHES.filter((s) => {
        if (s === form.color) return true;
        return !usedColors.includes(s);
    });

    function openCreate() {
        setEditCity(null);
        setForm({ name: '', code: '', color: '#64748B', is_active: true });
        setErrors({});
        setDrawerOpen(true);
    }

    function openEdit(city: CityRow) {
        setEditCity(city);
        setForm({ name: city.name, code: city.code, color: city.color, is_active: city.isActive });
        setErrors({});
        setDrawerOpen(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim() || !form.code.trim()) {
            const newErrors: FormErrors = {};
            if (!form.name.trim()) newErrors.name = 'Required';
            if (!form.code.trim()) newErrors.code = 'Required';
            setErrors(newErrors);
            return;
        }
        const payload = { ...form, code: form.code.toUpperCase() };
        if (editCity) {
            router.put(`/settings/cities/${editCity.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); toast.success('City updated.'); },
                onError: (err) => setErrors(err as FormErrors),
            });
        } else {
            router.post('/settings/cities', payload, {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); toast.success('City created.'); },
                onError: (err) => setErrors(err as FormErrors),
            });
        }
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/settings/cities/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { setDeleteTarget(null); toast.success('Deleted.'); },
            onError: () => toast.error('Cannot delete city with dossiers.'),
        });
    }

    return (
        <>
            <AppCard className="overflow-hidden p-0">
                <div className="flex items-start gap-3 border-b border-[var(--border)] px-5 py-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                        <Building2 size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-semibold text-[var(--text)]">Cities Management</h2>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">Create and manage city codes with folder colors for archive organization.</p>
                    </div>
                    <AppButton variant="primary" compact isIconOnly onPress={openCreate} tooltip="Add city" aria-label="Add city">
                        <Plus size={16} />
                    </AppButton>
                </div>
                <div className="p-5">
                    {/* Table */}
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--border)]">
                                    {['Code', 'Name', 'Color', 'Status', 'Dossiers', ''].map((label) => (
                                        <th key={label} className="h-9 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {cities.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-10 text-center text-sm text-[var(--text-muted)]">
                                            No cities yet
                                        </td>
                                    </tr>
                                ) : (
                                    cities.map((city) => (
                                        <tr key={city.id} className="group transition hover:bg-[var(--surface-2)]">
                                            <td className="px-3 py-2.5">
                                                <span className="font-mono text-[13px] font-bold text-[var(--text)]">{city.code}</span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className="text-[13px] text-[var(--text)]">{city.name}</span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-4 rounded-md ring-1 ring-black/10 shrink-0" style={{ backgroundColor: city.color }} />
                                                    <span className="font-mono text-[11px] text-[var(--text-muted)]">{city.color}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full px-2 py-[2px] text-[10px] font-medium',
                                                    city.isActive
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-[var(--surface-2)] text-[var(--text-muted)]',
                                                )}>
                                                    <span className={cn('size-1.5 rounded-full', city.isActive ? 'bg-emerald-400' : 'bg-[var(--text-muted)]')} />
                                                    {city.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className="text-[13px] tabular-nums text-[var(--text-muted)]">{city.dossiersCount}</span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-1">
                                                    <button type="button" onClick={() => openEdit(city)}
                                                        className="flex size-7 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition">
                                                        <Pencil size={12} />
                                                    </button>
                                                    <button type="button" onClick={() => setDeleteTarget(city)}
                                                        className="flex size-7 items-center justify-center rounded text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--surface-2)] transition"
                                                        disabled={city.dossiersCount > 0}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </AppCard>

            {/* Drawer */}
            <AppDrawer
                isOpen={drawerOpen}
                onOpenChange={setDrawerOpen}
                title={editCity ? 'Edit city' : 'Add city'}
                description="Manage city codes and folder colors."
                size="sm"
            >
                <form onSubmit={handleSubmit} className="flex h-full flex-col">
                    <div className="flex-1 space-y-5 px-5 pb-4">
                        {/* Section: Identity */}
                        <DrawerSection icon={<Building2 size={12} />} title="Identity">
                            <div className="grid gap-2">
                                <DrawerField label="Name" error={errors.name}>
                                    <Input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Marrakech"
                                        className={drawerStyles.input}
                                    />
                                </DrawerField>
                                <DrawerField label="Code" error={errors.code}>
                                    <Input
                                        type="text"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. MRK"
                                        maxLength={8}
                                        className={drawerStyles.input}
                                    />
                                </DrawerField>
                            </div>
                        </DrawerSection>

                        {/* Section: Color */}
                        <DrawerSection icon={<Palette size={12} />} title="Folder color">
                            <DrawerField label="Color" error={errors.color}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={form.color}
                                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                                        className="size-9 shrink-0 cursor-pointer rounded-[var(--radius-md)] border border-[var(--border)] bg-transparent p-0.5"
                                    />
                                    <span className="font-mono text-xs text-[var(--text-muted)]">{form.color}</span>
                                </div>
                            </DrawerField>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {availableSwatches.length === 0 ? (
                                    <span className="text-[11px] italic text-[var(--text-muted)]">All preset colors are taken</span>
                                ) : (
                                    availableSwatches.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setForm({ ...form, color: s })}
                                            aria-label={`Select color ${s}`}
                                            className={cn(
                                                'size-6 rounded-md ring-1 ring-inset transition hover:scale-110',
                                                form.color === s ? 'scale-110 ring-2 ring-[var(--accent)]' : 'ring-[var(--border)]',
                                            )}
                                            style={{ backgroundColor: s }}
                                        />
                                    ))
                                )}
                            </div>
                        </DrawerSection>

                        {/* Section: Status */}
                        <DrawerSection icon={<Power size={12} />} title="Status">
                            <div className="flex items-center gap-3">
                                <Switch
                                    size="sm"
                                    isSelected={form.is_active}
                                    onChange={(isActive) => setForm({ ...form, is_active: isActive })}
                                    aria-label="Active city"
                                >
                                    <Switch.Content>
                                        <Switch.Control>
                                            <Switch.Thumb />
                                        </Switch.Control>
                                    </Switch.Content>
                                </Switch>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-[var(--text)]">Active</span>
                                    <span className="text-[10px] text-[var(--text-muted)]">City appears in filters and dropdowns</span>
                                </div>
                            </div>
                        </DrawerSection>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 border-t border-[var(--border)] px-5 py-4">
                        <div className="flex items-center justify-between gap-2">
                            <Button variant="ghost" size="sm" onPress={() => setDrawerOpen(false)}>Cancel</Button>
                            <Button variant="primary" size="sm" type="submit">
                                {editCity ? 'Update city' : 'Create city'}
                            </Button>
                        </div>
                    </div>
                </form>
            </AppDrawer>

            {/* Delete modal */}
            <AppModal isOpen={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Delete city?" size="sm">
                <p className="mb-4 text-sm text-[var(--text)]">
                    {deleteTarget && deleteTarget.dossiersCount > 0
                        ? `Cannot delete "${deleteTarget.name}" — it has ${deleteTarget.dossiersCount} dossier(s).`
                        : `Delete "${deleteTarget?.name}"? This cannot be undone.`}
                </p>
                <div className="flex justify-end gap-2">
                    <AppButton variant="bordered" size="sm" onPress={() => setDeleteTarget(null)}>Cancel</AppButton>
                    {deleteTarget && deleteTarget.dossiersCount === 0 ? (
                        <AppButton color="danger" variant="solid" size="sm" onPress={confirmDelete}>Delete</AppButton>
                    ) : null}
                </div>
            </AppModal>
        </>
    );
}
