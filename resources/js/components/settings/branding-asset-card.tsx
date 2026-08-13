import { useForm } from '@inertiajs/react';
import { IconLoader2, IconPhoto, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import { type ChangeEvent, type CSSProperties, useEffect, useRef, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppConfirmDialog } from '@/components/ui/AppConfirmDialog';
import { cn } from '@/lib/cn';

export type BrandingAssetType = 'logo_light' | 'logo_dark' | 'logo_compact' | 'favicon';

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_FILE_BYTES = 2 * 1024 * 1024;

/**
 * Neutral preview backdrops, one per asset kind, so a light or dark logo stays
 * readable regardless of the active theme. The caption labels the backdrop so
 * state is never communicated by color alone.
 */
const PREVIEW_META: Record<BrandingAssetType, { backdrop: CSSProperties; caption: string }> = {
    logo_light: {
        backdrop: { backgroundColor: '#fafafa' },
        caption: 'Fond clair',
    },
    logo_dark: {
        backdrop: { backgroundColor: '#0f172a' },
        caption: 'Fond sombre',
    },
    logo_compact: {
        backdrop: {
            backgroundColor: '#f8fafc',
            backgroundImage: 'repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%)',
            backgroundSize: '16px 16px',
        },
        caption: 'Vignette',
    },
    favicon: {
        backdrop: { backgroundColor: '#f8fafc' },
        caption: 'Onglet du navigateur',
    },
};

const PREVIEW_HEIGHT: Record<BrandingAssetType, string> = {
    logo_light: 'h-32',
    logo_dark: 'h-32',
    logo_compact: 'h-28',
    favicon: 'h-24',
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} o`;
    }
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} Ko`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

type BrandingAssetCardProps = {
    title: string;
    description: string;
    assetType: BrandingAssetType;
    currentUrl: string | null;
    recommendedSize?: string;
    canEdit: boolean;
};

export function BrandingAssetCard({
    title,
    description,
    assetType,
    currentUrl,
    recommendedSize,
    canEdit,
}: BrandingAssetCardProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [failedSource, setFailedSource] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const form = useForm<{ asset_type: BrandingAssetType; file: File | null }>({
        asset_type: assetType,
        file: null,
    });

    const busy = form.processing;

    // Release the object URL whenever the preview is replaced or unmounted.
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const source = previewUrl ?? currentUrl;
    const imageFailed = failedSource === source;
    const meta = PREVIEW_META[assetType];

    const previewContent =
        imageFailed || !source ? null : (
            <img
                key={source}
                src={source}
                alt={previewUrl ? `${title} — aperçu du nouveau fichier` : `${title} actuel`}
                className="max-h-full max-w-full object-contain"
                onError={() => setFailedSource(source)}
            />
        );

    const previewEmpty =
        imageFailed ? (
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-muted)]">
                <IconPhoto size={14} aria-hidden />
                Image indisponible
            </span>
        ) : (
            <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                <IconPhoto size={18} className="text-[var(--text-subtle)]" aria-hidden />
                <span className="text-[10px] text-[var(--text-muted)]">Aucun logo personnalisé</span>
            </div>
        );

    const previewArea = (
        <div
            className={cn(
                'relative flex items-center justify-center overflow-hidden',
                PREVIEW_HEIGHT[assetType],
            )}
            style={meta.backdrop}
        >
            {previewContent ?? previewEmpty}
            <span className="absolute left-1.5 top-1.5 rounded bg-[var(--surface)]/80 px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-muted)]">
                {meta.caption}
            </span>
        </div>
    );

    function handleSelect(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        // Allow re-selecting the same file after a rejected attempt.
        event.target.value = '';
        form.clearErrors('file');
        setLocalError(null);

        if (!file) {
            return;
        }

        if (!ACCEPTED_TYPES.has(file.type)) {
            setLocalError('Format non pris en charge. Utilisez PNG, JPG ou WEBP.');
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            setLocalError('L’image ne doit pas dépasser 2 Mo.');
            return;
        }

        setSelectedFile(file);
        form.setData('file', file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    function cancelSelection() {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setSelectedFile(null);
        setLocalError(null);
        form.clearErrors();
        form.setData('file', null);
    }

    function saveAsset() {
        if (busy || !selectedFile) {
            return;
        }

        form.post('/settings/system-appearance/assets', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);
                setSelectedFile(null);
                form.clearErrors();
            },
        });
    }

    function removeAsset() {
        if (busy) {
            return;
        }

        form.delete(`/settings/system-appearance/assets?asset_type=${encodeURIComponent(assetType)}`, {
            preserveScroll: true,
            onSuccess: () => setConfirmOpen(false),
        });
    }

    const uploadError = localError ?? form.errors.file;

    return (
        <div className="flex min-w-0 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <h3 className="text-[13px] font-semibold text-[var(--text)]">{title}</h3>
            <p className="mt-0.5 text-[11px] leading-4 text-[var(--text-muted)]">{description}</p>

            <div className="mt-3 min-w-0">
                {assetType === 'favicon' ? (
                    <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                        <div className="flex items-center gap-1 bg-[#f1f5f9] px-2 py-1.5">
                            <span className="size-1.5 rounded-full bg-[#f87171]" aria-hidden />
                            <span className="size-1.5 rounded-full bg-[#fbbf24]" aria-hidden />
                            <span className="size-1.5 rounded-full bg-[#34d399]" aria-hidden />
                            <span className="ml-2 flex min-w-0 items-center gap-1 rounded-t-md bg-white px-2 py-0.5">
                                {source && !imageFailed ? (
                                    <img
                                        src={source}
                                        alt=""
                                        className="size-2.5 shrink-0 object-contain"
                                        onError={() => setFailedSource(source)}
                                    />
                                ) : (
                                    <span className="size-2.5 shrink-0 rounded-sm bg-[var(--surface-2)]" aria-hidden />
                                )}
                                <span className="truncate text-[8px] text-[var(--text-muted)]">lbocrm</span>
                            </span>
                        </div>
                        {previewArea}
                    </div>
                ) : (
                    previewArea
                )}
            </div>

            {selectedFile ? (
                <p className="mt-2 truncate text-[10px] text-[var(--text-muted)]" title={selectedFile.name}>
                    {selectedFile.name} · {formatBytes(selectedFile.size)}
                </p>
            ) : recommendedSize ? (
                <p className="mt-2 text-[10px] leading-4 text-[var(--text-subtle)]">{recommendedSize}</p>
            ) : null}

            {uploadError ? (
                <p className="mt-1.5 text-[10px] font-semibold text-[var(--danger)]" role="alert">
                    {uploadError}
                </p>
            ) : null}

            {canEdit ? (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {selectedFile ? (
                        <>
                            <AppButton variant="ghost" compact onPress={cancelSelection} isDisabled={busy}>
                                <IconX size={14} aria-hidden />
                                Annuler
                            </AppButton>
                            <AppButton variant="primary" compact onPress={saveAsset} isDisabled={busy}>
                                {busy ? (
                                    <IconLoader2 size={14} className="animate-spin" aria-hidden />
                                ) : (
                                    <IconUpload size={14} aria-hidden />
                                )}
                                {busy ? 'Enregistrement…' : 'Enregistrer'}
                            </AppButton>
                        </>
                    ) : (
                        <>
                            <AppButton
                                variant="bordered"
                                compact
                                onPress={() => inputRef.current?.click()}
                                isDisabled={busy}
                            >
                                <IconUpload size={14} aria-hidden />
                                Choisir une image
                            </AppButton>
                            {currentUrl ? (
                                <AppButton
                                    variant="danger"
                                    compact
                                    onPress={() => setConfirmOpen(true)}
                                    isDisabled={busy}
                                >
                                    <IconTrash size={14} aria-hidden />
                                    Supprimer
                                </AppButton>
                            ) : null}
                        </>
                    )}
                </div>
            ) : null}

            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleSelect}
                aria-label={`Choisir une image pour ${title}`}
            />

            <AppConfirmDialog
                isOpen={confirmOpen}
                title={assetType === 'favicon' ? 'Supprimer le favicon ?' : 'Supprimer le logo ?'}
                description="L’application utilisera l’image par défaut après la suppression."
                confirmLabel="Supprimer"
                cancelLabel="Annuler"
                variant="danger"
                onConfirm={removeAsset}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
}
