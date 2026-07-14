import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppTextField } from '@/components/ui/AppTextField';
import { AppModal } from '@/components/ui/AppModal';
import { AppShell } from '@/components/layout/AppShell';
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
};

const SWATCHES = ['#E08D3C', '#4A90D9', '#7EB36A', '#C0392B', '#8E44AD', '#2C3E50', '#D35400', '#16A085', '#F39C12', '#2980B9'];

export default function ArchivesCities({ cities, usedColors }: PageProps) {
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
            setErrors({ name: !form.name.trim() ? 'Required' : undefined, code: !form.code.trim() ? 'Required' : undefined });
            return;
        }
        const payload = { ...form, code: form.code.toUpperCase() };
        if (editCity) {
            router.put(`/archives/cities/${editCity.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); toast.success('City updated.'); },
                onError: (err) => setErrors(err as FormErrors),
            });
        } else {
            router.post('/archives/cities', payload, {
                preserveScroll: true,
                onSuccess: () => { setDrawerOpen(false); toast.success('City created.'); },
                onError: (err) => setErrors(err as FormErrors),
            });
        }
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        router.delete(`/archives/cities/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => { setDeleteTarget(null); toast.success('Deleted.'); },
            onError: () => toast.error('Cannot delete city with dossiers.'),
        });
    }

    return (
        <>
            <Head title="Cities" />
            <AppShell>
                <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => router.visit('/archives')}
                                className="flex size-7 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/5 transition">
                                <ArrowLeft size={13} />
                            </button>
                            <h1 className="text-lg font-semibold text-white/90">Cities</h1>
                            <span className="rounded bg-white/5 px-2 py-0.5 text-[11px] font-mono text-white/40">{cities.length}</span>
                        </div>
                        <button type="button" onClick={openCreate}
                            className={cn(
                                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition',
                                'bg-amber-500/15 text-amber-400 border border-amber-500/25',
                                'hover:bg-amber-500/25 hover:border-amber-500/40',
                                'active:bg-amber-500/30',
                            )}>
                            <Plus size={14} strokeWidth={2.5} />
                            Add city
                        </button>
                    </div>

                    {/* Table card */}
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    {['Code', 'Name', 'Color', 'Status', 'Dossiers', ''].map((label) => (
                                        <th key={label} className="h-9 px-3 text-left text-[10px] font-semibold uppercase tracking-wider text-white/40">
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {cities.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-3 py-10 text-center text-sm text-white/30">
                                            No cities yet
                                        </td>
                                    </tr>
                                ) : (
                                    cities.map((city) => (
                                        <tr key={city.id} className="group transition hover:bg-white/[0.015]">
                                            <td className="px-3 py-2.5">
                                                <span className="font-mono text-[13px] font-bold text-white/80">{city.code}</span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className="text-[13px] text-white/70">{city.name}</span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="size-4 rounded-md ring-1 ring-black/10 shrink-0" style={{ backgroundColor: city.color }} />
                                                    <span className="font-mono text-[11px] text-white/40">{city.color}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-full px-2 py-[2px] text-[10px] font-medium',
                                                    city.isActive
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-white/5 text-white/40',
                                                )}>
                                                    <span className={cn('size-1.5 rounded-full', city.isActive ? 'bg-emerald-400' : 'bg-white/20')} />
                                                    {city.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className="text-[13px] tabular-nums text-white/50">{city.dossiersCount}</span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-1">
                                                    <button type="button" onClick={() => openEdit(city)}
                                                        className="flex size-7 items-center justify-center rounded text-white/40 hover:text-white/80 hover:bg-white/5 transition">
                                                        <Pencil size={12} />
                                                    </button>
                                                    <button type="button" onClick={() => setDeleteTarget(city)}
                                                        className="flex size-7 items-center justify-center rounded text-white/40 hover:text-red-400 hover:bg-white/5 transition"
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
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Building2 size={13} className="text-white/30" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Identity</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <AppTextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })}
                                            placeholder="e.g. Marrakech" error={errors.name} isRequired />
                                    </div>
                                    <div>
                                        <AppTextField label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })}
                                            placeholder="e.g. MRK" error={errors.code} isRequired maxLength={8} />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Color */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="4" />
                                    </svg>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Folder color</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                                        className="size-9 rounded-lg border border-white/10 bg-transparent cursor-pointer p-0.5" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-white/50">{form.color}</span>
                                            {errors.color && <span className="text-[11px] text-red-400">{errors.color}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableSwatches.length === 0 ? (
                                        <span className="text-[11px] text-white/30 italic">All preset colors are taken</span>
                                    ) : (
                                        availableSwatches.map((s) => (
                                            <button key={s} type="button" onClick={() => setForm({ ...form, color: s })}
                                                className={cn(
                                                    'size-6 rounded-md ring-1 ring-inset transition hover:scale-110',
                                                    form.color === s ? 'ring-2 ring-amber-400 scale-110' : 'ring-white/10',
                                                )}
                                                style={{ backgroundColor: s }} />
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Section: Status */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Status</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>
                                <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer group">
                                    <div
                                        onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                        className={cn(
                                            'relative inline-flex h-5 w-9 items-center rounded-full transition-all cursor-pointer',
                                            form.is_active ? 'bg-emerald-500' : 'bg-white/10 group-hover:bg-white/15',
                                        )}>
                                        <span className={cn(
                                            'inline-block size-3.5 rounded-full bg-white transition-transform shadow-sm',
                                            form.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]',
                                        )} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium text-white/70">Active</span>
                                        <span className="text-[10px] text-white/40">City appears in filters and dropdowns</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="shrink-0 border-t border-white/5 px-5 py-4">
                            <div className="flex items-center justify-between gap-2">
                                <button type="button" onClick={() => setDrawerOpen(false)}
                                    className="rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/5 transition">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className={cn(
                                        'rounded-lg px-4 py-1.5 text-xs font-semibold transition',
                                        'bg-amber-500/20 text-amber-400 border border-amber-500/30',
                                        'hover:bg-amber-500/30 hover:border-amber-500/50',
                                    )}>
                                    {editCity ? 'Update city' : 'Create city'}
                                </button>
                            </div>
                        </div>
                    </form>
                </AppDrawer>

                {/* Delete modal */}
                <AppModal isOpen={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Delete city?" size="sm">
                    <p className="mb-4 text-sm text-white/70">
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
            </AppShell>
        </>
    );
}
