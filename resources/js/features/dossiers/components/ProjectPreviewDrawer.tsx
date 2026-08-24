import { IconArchive, IconArrowUpRight, IconBuildingCommunity, IconEdit, IconFolder, IconMapPin, IconProgressCheck, IconTrash, IconUser } from '@tabler/icons-react';
import { router } from '@inertiajs/react';
import { Chip } from '@heroui/react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppButton } from '@/components/ui/AppButton';
import { getDossierReadiness, getDossierWorkflowLabel } from '@/config/statuses';
import type { DossierRow } from '@/features/dossiers/types';
import { useTranslation } from '@/lib/i18n';

type Props = {
    dossier: DossierRow | null;
    isOpen: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canArchive: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (dossier: DossierRow) => void;
    onDelete: (dossier: DossierRow) => void;
    onArchive: (dossier: DossierRow) => void;
};

const statusColors: Record<string, 'success' | 'accent' | 'default' | 'warning'> = {
    active: 'success', opened: 'accent', closed: 'default', archived: 'warning', paused: 'warning',
};

function surface(value: number | null | undefined) {
    return value ? `${new Intl.NumberFormat('fr-MA').format(value)} m²` : '—';
}

export function ProjectPreviewDrawer({ dossier, isOpen, canEdit, canDelete, canArchive, onOpenChange, onEdit, onDelete, onArchive }: Props) {
    const { t } = useTranslation();
    const readiness = dossier ? getDossierReadiness(dossier) : [];
    const completed = readiness.filter((item) => item.done).length;
    const status = dossier?.status ?? 'opened';
    const statusLabel = t(`dossiers.show.statuses.${status}`);

    return (
        <AppDrawer isOpen={isOpen} onOpenChange={onOpenChange} title={dossier?.projectObject || t('dossiers.preview.title')} description={dossier?.dossierNumber ?? undefined} size="md">
            {dossier ? (
                <div className="space-y-5 pb-4">
                    <section className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
                                <IconFolder size={20} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="min-w-0 truncate text-base font-semibold text-[var(--foreground)]">{dossier.projectObject || dossier.dossierNumber}</h2>
                                    <Chip variant="soft" size="sm" color={statusColors[status] ?? 'default'}>{statusLabel}</Chip>
                                </div>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{dossier.dossierNumber}</p>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label={t('dossiers.preview.details')}>
                        <PreviewField icon={IconUser} label={t('dossiers.preview.client')} value={dossier.clientName || '—'} detail={dossier.clientNumber || undefined} />
                        <PreviewField icon={IconProgressCheck} label={t('dossiers.preview.workflow')} value={getDossierWorkflowLabel(dossier.workflowStep)} accent />
                        <PreviewField icon={IconBuildingCommunity} label={t('dossiers.preview.city')} value={dossier.city?.name || '—'} color={dossier.city?.color} />
                        <PreviewField icon={IconMapPin} label={t('dossiers.preview.location')} value={dossier.province || '—'} detail={dossier.commune || undefined} />
                        <PreviewField icon={IconBuildingCommunity} label={t('dossiers.preview.surface')} value={surface(dossier.floorArea)} />
                        <PreviewField icon={IconProgressCheck} label={t('dossiers.preview.status')} value={statusLabel} />
                    </section>

                    <section className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('dossiers.preview.readiness')}</p>
                                <p className="mt-1 text-xs text-[var(--text-muted)]">{t('dossiers.preview.readinessDescription', { completed, total: readiness.length })}</p>
                            </div>
                            <span className="text-sm font-semibold text-[var(--foreground)]">{completed}/{readiness.length}</span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]" aria-label={t('dossiers.preview.readinessProgress', { completed, total: readiness.length })}>
                            <div className="h-full rounded-full bg-[var(--accent)] transition-[width]" style={{ width: `${readiness.length ? (completed / readiness.length) * 100 : 0}%` }} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {readiness.map((item) => <span key={item.key} className={item.done ? 'rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400' : 'rounded-full bg-[var(--surface-3)] px-2 py-1 text-[10px] font-medium text-[var(--text-muted)]'}>{item.label}</span>)}
                        </div>
                    </section>

                    <section className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-2 sm:grid-cols-2">
                        <AppButton variant="solid" color="primary" size="sm" onPress={() => router.visit(`/dossiers/${dossier.id}`)}>
                            <IconArrowUpRight size={15} /> {t('dossiers.preview.open')}
                        </AppButton>
                        {canEdit ? <AppButton variant="bordered" size="sm" onPress={() => onEdit(dossier)}><IconEdit size={15} /> {t('dossiers.show.edit')}</AppButton> : null}
                        {canArchive ? <AppButton variant="quiet" size="sm" onPress={() => onArchive(dossier)}><IconArchive size={15} /> {t('dossiers.preview.archive')}</AppButton> : null}
                        {canDelete ? <AppButton variant="quiet" size="sm" className="text-danger" onPress={() => onDelete(dossier)}><IconTrash size={15} /> {t('dossiers.show.contract.delete')}</AppButton> : null}
                    </section>
                </div>
            ) : null}
        </AppDrawer>
    );
}

function PreviewField({ icon: Icon, label, value, detail, accent, color }: { icon: typeof IconUser; label: string; value: string; detail?: string; accent?: boolean; color?: string }) {
    return (
        <div className="min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-subtle)]"><Icon size={13} /> {label}</div>
            <div className="mt-2 flex min-w-0 items-center gap-1.5">
                {color ? <span className="size-2 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color }} /> : null}
                <p className={accent ? 'truncate text-sm font-semibold text-[var(--accent)]' : 'truncate text-sm font-semibold text-[var(--foreground)]'}>{value}</p>
            </div>
            {detail ? <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{detail}</p> : null}
        </div>
    );
}
