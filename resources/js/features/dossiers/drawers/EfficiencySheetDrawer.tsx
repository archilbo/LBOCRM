import { useCallback, useEffect, useRef, useState } from 'react';
import { Input, Skeleton } from '@heroui/react';
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck, IconClipboardCheck, IconDownload, IconEye, IconFileText, IconFileTypePdf, IconPrinter } from '@tabler/icons-react';
import { toast } from 'sonner';

import { AppButton } from '@/components/ui/AppButton';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerBaseProps, DrawerError, DrawerSection, drawerStyles } from '@/components/drawers';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';

/*
 * Fiche efficacité drawer (Step 4).
 *
 * Reuses the shared AppDrawer + drawerStyles conventions used by the
 * Contract/Project drawers. Only the two manual fields are editable and
 * submitted; automatic values come from the backend drawer payload
 * (fiche/prefill/missingFields) and are displayed read-only.
 */

export type EfficiencySheetDrawerData = {
    fiche: {
        id: number;
        status: string;
        version: number;
        manual: {
            usageDuBatiment: string;
            ownerName: string;
        };
        /** Generated-file visibility only — raw storage paths never reach the client. */
        docxGeneratedAt: string | null;
        hasDocx: boolean;
        hasPdf: boolean;
    } | null;

    prefill: {
        project: {
            name: string | null;
            address: string | null;
        };
        client: {
            address: string | null;
        };
        enterprise: {
            representative: string | null;
            address: string | null;
            phone: string | null;
            fax: string | null;
            email: string | null;
        };
    };

    missingFields: string[];
};

export type EfficiencySheetDrawerProps = DrawerBaseProps & {
    dossierId: number | string;
    canCreate: boolean;
    canUpdate: boolean;
    canGenerate?: boolean;
};

const MISSING_FIELD_CODES = new Set([
    'PROJET_ADDRESS',
    'CLIENT_ADDRESS',
    'ENTREPRISE_CEO',
    'ENTREPRISE_ADDRESS',
    'ENTREPRISE_PHONE',
    'ENTREPRISE_FAX',
    'ENTREPRISE_MAIL',
]);

function missingFieldLabel(code: string, t: (key: string) => string): string {
    if (!MISSING_FIELD_CODES.has(code)) return code;
    return t(`dossiers.efficiencySheet.missingFields.${code}`);
}

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function ReadOnlyRow({ label, value }: { label: string; value: string | null | undefined }) {
    const { t } = useTranslation();
    const isEmpty = value === null || value === undefined || value === '';
    return (
        <div className="flex min-w-0 flex-col gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
            <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</span>
            <div className="flex min-w-0 items-start gap-1.5">
                {isEmpty ? <IconAlertCircle size={12} className="mt-0.5 shrink-0 text-amber-500" /> : null}
                <span className={cn(
                    'min-w-0 text-xs font-medium break-words leading-5',
                    isEmpty ? 'italic text-amber-500/90' : 'text-[var(--foreground)]',
                )}>
                    {isEmpty ? t('dossiers.efficiencySheet.notProvided') : value}
                </span>
            </div>
        </div>
    );
}

function DrawerSkeleton() {
    return (
        <div className="flex flex-col gap-3" aria-hidden="true">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
        </div>
    );
}

export function EfficiencySheetDrawer({
    isOpen,
    onOpenChange,
    dossierId,
    canCreate,
    canUpdate,
    canGenerate = false,
}: EfficiencySheetDrawerProps) {
    const { t } = useTranslation();
    const [data, setData] = useState<EfficiencySheetDrawerData | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [usage, setUsage] = useState('');
    const [owner, setOwner] = useState('');
    const [savedUsage, setSavedUsage] = useState('');
    const [savedOwner, setSavedOwner] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const [confirmAbandon, setConfirmAbandon] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [generateError, setGenerateError] = useState('');
    const requestSeq = useRef(0);

    /*
     * Loaded when the drawer opens. State is only written in promise
     * callbacks (never synchronously), so the open-effect performs no
     * synchronous setState; loading/error are derived from data/loadFailed.
     */
    const fetchData = useCallback(() => {
        const seq = ++requestSeq.current;

        fetch(`/dossiers/${dossierId}/efficiency-sheet`, {
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json() as Promise<EfficiencySheetDrawerData>;
            })
            .then((payload) => {
                if (seq !== requestSeq.current) return;

                setData(payload);
                const manual = payload.fiche?.manual;
                setUsage(manual?.usageDuBatiment ?? '');
                setOwner(manual?.ownerName ?? '');
                setSavedUsage(manual?.usageDuBatiment ?? '');
                setSavedOwner(manual?.ownerName ?? '');
                setLoadFailed(false);
            })
            .catch(() => {
                if (seq !== requestSeq.current) return;
                setLoadFailed(true);
            });
    }, [dossierId]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, fetchData]);

    const isLoading = isOpen && data === null && !loadFailed;
    const loadError = isOpen && data === null && loadFailed;

    const fiche = data?.fiche ?? null;
    const mode: 'create' | 'edit' = fiche ? 'edit' : 'create';
    const canEdit = mode === 'create' ? canCreate : canUpdate;
    const isDirty = usage !== savedUsage || owner !== savedOwner;
    const usageValid = usage.trim().length > 0 && usage.length <= 255;
    const ownerValid = owner.trim().length > 0 && owner.length <= 255;
    const canSubmit = canEdit && isDirty && !submitting && usageValid && ownerValid;
    const manualFieldsComplete = usageValid && ownerValid && !isDirty;
    const automaticFieldsComplete = (data?.missingFields.length ?? 0) === 0;
    const canGenerateNow = canGenerate && fiche !== null && manualFieldsComplete && automaticFieldsComplete && !generating && !pdfGenerating && !submitting;
    const canGeneratePdf = canGenerate && fiche !== null && fiche.hasDocx && manualFieldsComplete && !generating && !pdfGenerating && !submitting;

    async function handleSubmit() {
        if (!canSubmit) return;

        setSubmitting(true);
        setRequestError('');

        try {
            const url = mode === 'create'
                ? `/dossiers/${dossierId}/efficiency-sheet`
                : `/dossiers/${dossierId}/efficiency-sheet/${fiche?.id}`;

            const response = await fetch(url, {
                method: mode === 'create' ? 'POST' : 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({
                    usage_du_batiment: usage,
                    owner_name: owner,
                }),
            });

            const payload = await response.json() as EfficiencySheetDrawerData | { message?: string; errors?: Record<string, string[]> };

            if (!response.ok) {
                const errorPayload = payload as { message?: string; errors?: Record<string, string[]> };
                const firstError = errorPayload.errors
                    ? Object.values(errorPayload.errors).flat()[0]
                    : null;
                const message = firstError ?? errorPayload.message ?? t('dossiers.efficiencySheet.saveFailed');
                setRequestError(message);
                toast.error(message);
                return;
            }

            const next = payload as EfficiencySheetDrawerData;
            const manual = next.fiche?.manual;

            setData(next);
            setUsage(manual?.usageDuBatiment ?? usage);
            setOwner(manual?.ownerName ?? owner);
            setSavedUsage(manual?.usageDuBatiment ?? usage);
            setSavedOwner(manual?.ownerName ?? owner);
            toast.success(mode === 'create' ? t('dossiers.efficiencySheet.draftCreatedToast') : t('dossiers.efficiencySheet.savedToast'));
        } catch {
            const message = t('dossiers.efficiencySheet.saveFailed');
            setRequestError(message);
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }

    function handleCancel() {
        if (!canEdit || !isDirty) {
            onOpenChange(false);
            return;
        }
        setConfirmAbandon(true);
    }

    /*
     * DOCX generation (Step 5). No payload is sent: the backend loads every
     * value from trusted sources and returns the refreshed drawer payload.
     */
    async function handleGenerate() {
        if (!canGenerateNow || !fiche) return;

        setGenerating(true);
        setGenerateError('');

        try {
            const response = await fetch(`/dossiers/${dossierId}/efficiency-sheet/${fiche.id}/generate-docx`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });

            const payload = await response.json() as EfficiencySheetDrawerData | { message?: string };

            if (!response.ok) {
                const message = (payload as { message?: string }).message
                    ?? t('dossiers.efficiencySheet.docxGenerateFailed');
                setGenerateError(message);
                toast.error(message);
                return;
            }

            const next = payload as EfficiencySheetDrawerData;
            setData(next);
            toast.success(t('dossiers.efficiencySheet.docxGeneratedToast', { version: next.fiche?.version ?? 1 }));
        } catch {
            const message = t('dossiers.efficiencySheet.docxGenerateFailed');
            setGenerateError(message);
            toast.error(message);
        } finally {
            setGenerating(false);
        }
    }

    /*
     * PDF generation (Step 6). Operates on the SAVED document only — disabled
     * while manual fields have unsaved changes. On success the drawer data is
     * re-fetched so the generated-file section reflects the new PDF without
     * closing the drawer or reloading the page.
     */
    async function handleGeneratePdf() {
        if (!canGenerate || !fiche || !fiche.hasDocx || isDirty || pdfGenerating) return;

        setPdfGenerating(true);
        setGenerateError('');

        try {
            const response = await fetch(`/dossiers/${dossierId}/efficiency-sheet/${fiche.id}/generate-pdf`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });

            const payload = await response.json() as EfficiencySheetDrawerData | { message?: string };

            if (!response.ok) {
                const message = (payload as { message?: string }).message
                    ?? t('dossiers.efficiencySheet.pdfGenerateFailed');
                setGenerateError(message);
                toast.error(message);
                return;
            }

            const next = payload as EfficiencySheetDrawerData;
            setData(next);
            toast.success(t('dossiers.efficiencySheet.pdfGeneratedToast', { version: next.fiche?.version ?? 1 }));
        } catch {
            const message = t('dossiers.efficiencySheet.pdfGenerateFailed');
            setGenerateError(message);
            toast.error(message);
        } finally {
            setPdfGenerating(false);
        }
    }

    const viewOnly = !canEdit;

    return (
        <>
            <AppDrawer
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="md"
                headerIcon={<IconClipboardCheck size={16} />}
                title={
                    <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate">{t('dossiers.efficiencySheet.title')}</span>
                        {fiche ? (
                            <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[9px] font-semibold text-[var(--text-muted)]">
                                {t('dossiers.efficiencySheet.draftBadge', { version: fiche.version })}
                            </span>
                        ) : null}
                    </span>
                }
                description={t('dossiers.efficiencySheet.description')}
                footer={viewOnly ? null : (
                    <div className="flex w-full flex-col gap-2">
                        {canGenerate && fiche && !generating && !canGenerateNow ? (
                            <p className="text-[10px] font-medium text-amber-500">
                                {t('dossiers.efficiencySheet.missingInfoWarning')}
                            </p>
                        ) : null}
                        <div className="flex w-full items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-1.5">
                                {isDirty ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500">
                                        <IconAlertCircle size={12} />
                                        {t('dossiers.efficiencySheet.unsavedChanges')}
                                    </span>
                                ) : (
                                    <span className="truncate text-[10px] text-[var(--text-subtle)]">
                                        {mode === 'create' ? t('dossiers.efficiencySheet.newDraft') : t('dossiers.efficiencySheet.draftVersion', { version: fiche?.version ?? 1 })}
                                    </span>
                                )}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                {canGenerate && fiche ? (
                                    <AppButton
                                        variant="bordered"
                                        onPress={handleGenerate}
                                        isLoading={generating}
                                        isDisabled={!canGenerateNow}
                                    >
                                        {generating ? t('dossiers.efficiencySheet.generating') : (<><IconFileText size={13} /> {t('dossiers.efficiencySheet.generateDocx')}</>)}
                                    </AppButton>
                                ) : null}
                                <AppButton variant="light" onPress={handleCancel} isDisabled={submitting || generating || pdfGenerating}>
                                    {t('dossiers.efficiencySheet.cancel')}
                                </AppButton>
                                <AppButton
                                    variant="solid"
                                    color="primary"
                                    onPress={handleSubmit}
                                    isLoading={submitting}
                                    isDisabled={!canSubmit || generating || pdfGenerating}
                                >
                                    {mode === 'create' ? t('dossiers.efficiencySheet.createDraft') : t('dossiers.efficiencySheet.save')}
                                </AppButton>
                            </div>
                        </div>
                    </div>
                )}
            >
                {isLoading ? (
                    <DrawerSkeleton />
                ) : loadError ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)]">
                            <IconAlertTriangle size={18} />
                        </span>
                        <p className="text-xs font-medium text-[var(--foreground)]">
                            {t('dossiers.efficiencySheet.loadFailed')}
                        </p>
                        <AppButton variant="bordered" size="sm" onPress={() => fetchData()}>
                            <IconAlertCircle size={13} /> {t('dossiers.efficiencySheet.retry')}
                        </AppButton>
                    </div>
                ) : !data ? null : (
                    <div className="flex flex-col gap-4">
                        {viewOnly && !fiche ? (
                            <div className="flex flex-col items-center gap-2 py-12 text-center">
                                <IconClipboardCheck size={22} className="text-[var(--text-muted)]/40" />
                                <p className="text-[11px] font-medium text-[var(--foreground)]">
                                    {t('dossiers.efficiencySheet.emptyTitle')}
                                </p>
                                <p className="text-[9px] text-[var(--text-muted)]">
                                    {t('dossiers.efficiencySheet.emptyDescription')}
                                </p>
                            </div>
                        ) : (
                            <>
                                {fiche?.status === 'generated' ? (
                                    <div className="flex items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-[10px] font-semibold text-emerald-500">
                                        <IconCircleCheck size={12} />
                                        {t('dossiers.efficiencySheet.docxGeneratedBadge', { version: fiche.version })}
                                    </div>
                                ) : null}

                                {data.missingFields.length > 0 ? (
                                    <div className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2.5">
                                        <p className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-500">
                                            <IconAlertTriangle size={12} />
                                            {t('dossiers.efficiencySheet.missingFieldsTitle')}
                                        </p>
                                        <ul className="mt-1.5 space-y-0.5">
                                            {data.missingFields.map((code) => (
                                                <li key={code} className="text-[10px] text-[var(--text-muted)]">
                                                    • {missingFieldLabel(code, t)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}

                                {requestError ? <DrawerError error={requestError} /> : null}
                                {generateError ? <DrawerError error={generateError} /> : null}

                                <DrawerSection title={t('dossiers.efficiencySheet.projectSection')}>
                                    <div className="flex flex-col gap-2">
                                        {canEdit ? (
                                            <div className={drawerStyles.fieldGroup}>
                                                <label className={drawerStyles.label}>
                                                    {t('dossiers.efficiencySheet.usageLabel')} <span className="text-[var(--danger)]">*</span>
                                                </label>
                                                <Input
                                                    value={usage}
                                                    onChange={(e) => setUsage(e.target.value)}
                                                    maxLength={255}
                                                    isDisabled={submitting}
                                                    placeholder={t('dossiers.efficiencySheet.usagePlaceholder')}
                                                    className={drawerStyles.input}
                                                    aria-invalid={usage !== '' && !usageValid ? true : undefined}
                                                />
                                            </div>
                                        ) : (
                                            <ReadOnlyRow label={t('dossiers.efficiencySheet.usageLabel')} value={fiche?.manual.usageDuBatiment ?? null} />
                                        )}
                                        <ReadOnlyRow label={t('dossiers.efficiencySheet.projectName')} value={data.prefill.project.name} />
                                        <ReadOnlyRow label={t('dossiers.efficiencySheet.projectAddress')} value={data.prefill.project.address} />
                                    </div>
                                </DrawerSection>

                                <DrawerSection title={t('dossiers.efficiencySheet.ownerSection')}>
                                    <div className="flex flex-col gap-2">
                                        {canEdit ? (
                                            <div className={drawerStyles.fieldGroup}>
                                                <label className={drawerStyles.label}>
                                                    {t('dossiers.efficiencySheet.fullName')} <span className="text-[var(--danger)]">*</span>
                                                </label>
                                                <Input
                                                    value={owner}
                                                    onChange={(e) => setOwner(e.target.value)}
                                                    maxLength={255}
                                                    isDisabled={submitting}
                                                    placeholder={t('dossiers.efficiencySheet.fullNamePlaceholder')}
                                                    className={drawerStyles.input}
                                                    aria-invalid={owner !== '' && !ownerValid ? true : undefined}
                                                />
                                            </div>
                                        ) : (
                                            <ReadOnlyRow label={t('dossiers.efficiencySheet.fullName')} value={fiche?.manual.ownerName ?? null} />
                                        )}
                                        <ReadOnlyRow label={t('dossiers.efficiencySheet.address')} value={data.prefill.client.address} />
                                    </div>
                                </DrawerSection>

                                <DrawerSection title={t('dossiers.efficiencySheet.signatorySection')}>
                                    <div className="flex flex-col gap-2">
                                        <ReadOnlyRow label={t('dossiers.efficiencySheet.legalRepresentative')} value={data.prefill.enterprise.representative} />
                                        <ReadOnlyRow label={t('dossiers.efficiencySheet.address')} value={data.prefill.enterprise.address} />
                                        <ReadOnlyRow label={t('dossiers.efficiencySheet.phone')} value={data.prefill.enterprise.phone} />
                                        <ReadOnlyRow label={t('dossiers.efficiencySheet.fax')} value={data.prefill.enterprise.fax} />
                                        <ReadOnlyRow label={t('dossiers.efficiencySheet.email')} value={data.prefill.enterprise.email} />
                                    </div>
                                </DrawerSection>

                                <DrawerSection title={t('dossiers.efficiencySheet.generatedDocsSection')}>
                                    {!fiche || !fiche.hasDocx ? (
                                        <div className="rounded-lg border border-dashed border-[var(--border)] px-3 py-3 text-center text-[10px] text-[var(--text-muted)]">
                                            {t('dossiers.efficiencySheet.noGeneratedDocs')}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]">
                                                        <IconFileText size={13} />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold text-[var(--foreground)]">DOCX</p>
                                                        <p className="truncate text-[9px] text-[var(--text-muted)]">
                                                            {t('dossiers.efficiencySheet.docxMeta', { version: fiche.version, date: formatDate(fiche.docxGeneratedAt) })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                                                    <AppButton
                                                        variant="bordered"
                                                        size="sm"
                                                        className="h-6 px-2 text-[10px]"
                                                        onPress={() => window.open(`/dossiers/${dossierId}/efficiency-sheet/${fiche.id}/download/docx`, '_blank', 'noopener,noreferrer')}
                                                    >
                                                        <IconDownload size={12} /> {t('dossiers.efficiencySheet.download')}
                                                    </AppButton>
                                                    {canGenerate ? (
                                                        <AppButton
                                                            variant="bordered"
                                                            size="sm"
                                                            className="h-6 px-2 text-[10px]"
                                                            onPress={handleGeneratePdf}
                                                            isLoading={pdfGenerating}
                                                            isDisabled={!canGeneratePdf}
                                                        >
                                                            {pdfGenerating ? t('dossiers.efficiencySheet.generatingPdf') : (<><IconFileTypePdf size={12} /> {t('dossiers.efficiencySheet.generatePdf')}</>)}
                                                        </AppButton>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {fiche.hasPdf ? (
                                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)]">
                                                            <IconFileTypePdf size={13} />
                                                        </span>
                                                        <p className="text-[10px] font-semibold text-[var(--foreground)]">PDF</p>
                                                    </div>
                                                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                                                        <AppButton
                                                            variant="bordered"
                                                            size="sm"
                                                            className="h-6 px-2 text-[10px]"
                                                            onPress={() => window.open(`/dossiers/${dossierId}/efficiency-sheet/${fiche.id}/preview/pdf`, '_blank', 'noopener,noreferrer')}
                                                        >
                                                            <IconEye size={12} /> {t('dossiers.efficiencySheet.view')}
                                                        </AppButton>
                                                        <AppButton
                                                            variant="bordered"
                                                            size="sm"
                                                            className="h-6 px-2 text-[10px]"
                                                            onPress={() => window.open(`/dossiers/${dossierId}/efficiency-sheet/${fiche.id}/download/pdf`, '_blank', 'noopener,noreferrer')}
                                                        >
                                                            <IconDownload size={12} /> {t('dossiers.efficiencySheet.download')}
                                                        </AppButton>
                                                        <AppButton
                                                            variant="bordered"
                                                            size="sm"
                                                            className="h-6 px-2 text-[10px]"
                                                            onPress={() => window.open(`/dossiers/${dossierId}/efficiency-sheet/${fiche.id}/print`, '_blank', 'noopener,noreferrer')}
                                                        >
                                                            <IconPrinter size={12} /> {t('dossiers.efficiencySheet.print')}
                                                        </AppButton>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </DrawerSection>
                            </>
                        )}
                    </div>
                )}
            </AppDrawer>

            <AppConfirmDialog
                isOpen={confirmAbandon}
                title={t('dossiers.efficiencySheet.abandonTitle')}
                description={t('dossiers.efficiencySheet.abandonDescription')}
                confirmLabel={t('dossiers.efficiencySheet.abandonConfirm')}
                cancelLabel={t('dossiers.efficiencySheet.abandonCancel')}
                variant="default"
                onConfirm={() => {
                    setConfirmAbandon(false);
                    onOpenChange(false);
                }}
                onCancel={() => setConfirmAbandon(false)}
            />
        </>
    );
}
