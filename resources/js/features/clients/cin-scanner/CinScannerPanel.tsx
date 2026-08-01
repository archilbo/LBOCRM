import {
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    ImageUp,
    RefreshCcw,
    RotateCcw,
    RotateCw,
    ScanLine,
    ShieldCheck,
    X,
} from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/lib/cn';
import {
    CIN_IMAGE_ACCEPT,
    inspectCinImage,
    rotateCinImage,
    type CinClientImageInfo,
} from '@/features/clients/cin-scanner/imageUtils';
import type {
    CinScanErrorResponse,
    CinScanResult,
    CinScannedField,
} from '@/features/clients/cin-scanner/types';

type CinScannerPanelProps = {
    onAutoFill: (result: CinScanResult) => void;
    onContinue: () => void;
    onCancel: () => void;
};

type ImageSlotState = {
    file: File | null;
    preview: string | null;
    info: CinClientImageInfo | null;
    error: string | null;
};

type ImageSlotProps = {
    side: 'front' | 'back';
    label: string;
    state: ImageSlotState;
    isDisabled: boolean;
    onSelect: (file: File) => void;
    onRotate: (degrees: 90 | -90) => void;
    onClear: () => void;
};

const emptySlot: ImageSlotState = {
    file: null,
    preview: null,
    info: null,
    error: null,
};

const progressLabels = [
    'Préparation des images',
    'Détection du modèle de carte',
    'Lecture du recto et du verso',
    'Vérification de la zone MRZ',
    'Validation des données extraites',
];

const fieldRows: Array<{
    key: keyof CinScanResult['fields'];
    label: string;
}> = [
    { key: 'cinNumber', label: 'Numéro CIN' },
    { key: 'firstName', label: 'Prénom' },
    { key: 'lastName', label: 'Nom' },
    { key: 'expiryDate', label: 'Date d\'expiration' },
    { key: 'address', label: 'Adresse' },
    { key: 'fatherName', label: 'Nom du père' },
    { key: 'motherName', label: 'Nom de la mère' },
    { key: 'sex', label: 'Sexe' },
    { key: 'birthDate', label: 'Date de naissance' },
    { key: 'birthPlace', label: 'Lieu de naissance' },
    { key: 'documentNumber', label: 'Numéro du document' },
    { key: 'canNumber', label: 'CAN' },
    { key: 'civilStatusNumber', label: 'N° état civil' },
];

function ImageSlot({
    side,
    label,
    state,
    isDisabled,
    onSelect,
    onRotate,
    onClear,
}: ImageSlotProps) {
    const inputId = useId();

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[var(--foreground)]">
                    {label}
                </p>

                {state.info ? (
                    <span className="text-[9px] text-[var(--text-muted)]">
                        {state.info.width}×{state.info.height}
                    </span>
                ) : null}
            </div>

            {state.preview ? (
                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                    <div className="relative flex min-h-40 items-center justify-center bg-[var(--surface-2)] p-2">
                        <img
                            src={state.preview}
                            alt={label}
                            className="max-h-52 w-full rounded-lg object-contain"
                        />

                        <button
                            type="button"
                            aria-label={`Supprimer ${label}`}
                            onClick={onClear}
                            disabled={isDisabled}
                            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shadow-sm transition hover:text-[var(--danger)] disabled:opacity-50"
                        >
                            <X size={13} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] px-2.5 py-2">
                        <p className="min-w-0 truncate text-[9px] text-[var(--text-muted)]">
                            {state.file?.name}
                        </p>

                        <div className="flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                aria-label={`Tourner ${label} à gauche`}
                                onClick={() => onRotate(-90)}
                                disabled={isDisabled}
                                className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] disabled:opacity-50"
                            >
                                <RotateCcw size={13} />
                            </button>

                            <button
                                type="button"
                                aria-label={`Tourner ${label} à droite`}
                                onClick={() => onRotate(90)}
                                disabled={isDisabled}
                                className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] disabled:opacity-50"
                            >
                                <RotateCw size={13} />
                            </button>

                            <label
                                htmlFor={inputId}
                                className={cn(
                                    'cursor-pointer rounded-md px-2 py-1 text-[9px] font-medium text-[var(--accent)] transition hover:bg-[var(--accent)]/10',
                                    isDisabled && 'pointer-events-none opacity-50',
                                )}
                            >
                                Remplacer
                            </label>
                        </div>
                    </div>
                </div>
            ) : (
                <label
                    htmlFor={inputId}
                    className={cn(
                        'flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-center transition hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)]',
                        isDisabled && 'pointer-events-none opacity-50',
                    )}
                >
                    <div className="flex size-11 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                        <ImageUp size={20} />
                    </div>

                    <span className="mt-2 text-xs font-medium text-[var(--foreground)]">
                        {label}
                    </span>

                    <span className="mt-1 text-[9px] leading-4 text-[var(--text-muted)]">
                        Photo nette, carte entière, sans reflet
                        <br />
                        JPEG, PNG ou WEBP · 15 Mo max
                    </span>
                </label>
            )}

            <input
                id={inputId}
                type="file"
                accept={CIN_IMAGE_ACCEPT}
                capture="environment"
                disabled={isDisabled}
                className="sr-only"
                onChange={(event) => {
                    const file = event.currentTarget.files?.[0];

                    if (file) {
                        onSelect(file);
                    }

                    event.currentTarget.value = '';
                }}
            />

            {state.info?.warnings.map((warning) => (
                <p
                    key={`${side}-${warning}`}
                    className="flex items-center gap-1.5 text-[9px] text-amber-500"
                >
                    <AlertTriangle size={11} />
                    {warning}
                </p>
            ))}

            {state.error ? (
                <p className="text-[9px] font-medium text-[var(--danger)]">
                    {state.error}
                </p>
            ) : null}
        </div>
    );
}

function FieldStatus({ field }: { field: CinScannedField }) {
    const percentage = Math.round(field.confidence * 100);

    if (field.status === 'verified') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-medium text-emerald-500">
                <CheckCircle2 size={11} />
                Vérifié · {percentage}%
            </span>
        );
    }

    if (field.status === 'review') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[9px] font-medium text-amber-500">
                <AlertTriangle size={11} />
                À vérifier · {percentage}%
            </span>
        );
    }

    return (
        <span className="rounded-full bg-[var(--surface-2)] px-2 py-1 text-[9px] text-[var(--text-muted)]">
            Illisible
        </span>
    );
}

export function CinScannerPanel({
    onAutoFill,
    onContinue,
    onCancel,
}: CinScannerPanelProps) {
    const [front, setFront] = useState<ImageSlotState>(emptySlot);
    const [back, setBack] = useState<ImageSlotState>(emptySlot);
    const [isScanning, setIsScanning] = useState(false);
    const [progressIndex, setProgressIndex] = useState(0);
    const [result, setResult] = useState<CinScanResult | null>(null);
    const [requestError, setRequestError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            abortRef.current?.abort();

            if (front.preview) {
                URL.revokeObjectURL(front.preview);
            }

            if (back.preview) {
                URL.revokeObjectURL(back.preview);
            }
        };
    }, [back.preview, front.preview]);

    useEffect(() => {
        if (! isScanning) {
            setProgressIndex(0);
            return;
        }

        const timer = window.setInterval(() => {
            setProgressIndex((current) =>
                Math.min(
                    current + 1,
                    progressLabels.length - 1,
                ),
            );
        }, 1100);

        return () => window.clearInterval(timer);
    }, [isScanning]);

    async function setImage(
        side: 'front' | 'back',
        file: File,
    ): Promise<void> {
        const setter = side === 'front' ? setFront : setBack;
        const current = side === 'front' ? front : back;

        try {
            const info = await inspectCinImage(file);
            const preview = URL.createObjectURL(file);

            if (current.preview) {
                URL.revokeObjectURL(current.preview);
            }

            setter({
                file,
                preview,
                info,
                error: info.isUsable
                    ? null
                    : 'La résolution est insuffisante pour une lecture fiable.',
            });
            setRequestError(null);
            setResult(null);
        } catch (error) {
            setter({
                ...current,
                error: error instanceof Error
                    ? error.message
                    : 'L\'image est invalide.',
            });
        }
    }

    async function rotate(
        side: 'front' | 'back',
        degrees: 90 | -90,
    ): Promise<void> {
        const slot = side === 'front' ? front : back;

        if (! slot.file) {
            return;
        }

        try {
            const rotated = await rotateCinImage(slot.file, degrees);
            await setImage(side, rotated);
        } catch (error) {
            const setter = side === 'front' ? setFront : setBack;
            setter((current) => ({
                ...current,
                error: error instanceof Error
                    ? error.message
                    : 'La rotation a échoué.',
            }));
        }
    }

    function clear(side: 'front' | 'back'): void {
        const slot = side === 'front' ? front : back;
        const setter = side === 'front' ? setFront : setBack;

        if (slot.preview) {
            URL.revokeObjectURL(slot.preview);
        }

        setter(emptySlot);
        setResult(null);
        setRequestError(null);
    }

    async function scan(): Promise<void> {
        if (
            ! front.file
            || ! back.file
            || ! front.info?.isUsable
            || ! back.info?.isUsable
        ) {
            setRequestError(
                'Ajoutez deux images lisibles avant de lancer l\'analyse.',
            );
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setIsScanning(true);
        setRequestError(null);
        setResult(null);

        const payload = new FormData();
        payload.append('front_image', front.file);
        payload.append('back_image', back.file);

        try {
            const response = await fetch('/clients/scan-cin', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement | null
                    )?.content ?? '',
                    Accept: 'application/json',
                },
                body: payload,
                signal: controller.signal,
            });

            const body = await response.json() as
                | CinScanResult
                | CinScanErrorResponse;

            if (! response.ok || ! ('success' in body) || body.success !== true) {
                const errorBody = body as CinScanErrorResponse;
                const validationMessage = errorBody.errors
                    ? Object.values(errorBody.errors).flat()[0]
                    : null;

                setRequestError(
                    validationMessage
                    ?? errorBody.message
                    ?? 'La CNI n\'a pas pu être analysée.',
                );
                return;
            }

            setResult(body);
            onAutoFill(body);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return;
            }

            setRequestError(
                'Connexion impossible avec le service de lecture.',
            );
        } finally {
            if (abortRef.current === controller) {
                abortRef.current = null;
            }

            setIsScanning(false);
        }
    }

    function reset(): void {
        setResult(null);
        setRequestError(null);
    }

    const canScan = Boolean(
        front.file
        && back.file
        && front.info?.isUsable
        && back.info?.isUsable
        && ! isScanning,
    );

    if (result) {
        const verifiedCount = Object.values(result.fields)
            .filter((field) => field.status === 'verified')
            .length;
        const reviewCount = Object.values(result.fields)
            .filter((field) => field.status === 'review')
            .length;

        return (
            <div className="space-y-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                    <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                            <ShieldCheck size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                                Analyse terminée
                            </p>
                            <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                                {result.document.generation === 'new_2020'
                                    ? 'CNIE nouvelle génération (2020)'
                                    : 'CNIE ancienne génération (2008)'}
                                {' · '}
                                {verifiedCount} champ(s) vérifié(s)
                                {reviewCount > 0
                                    ? ` · ${reviewCount} à contrôler`
                                    : ''}
                            </p>
                        </div>
                    </div>

                    {result.document.imagesSwapped ? (
                        <p className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-[10px] text-amber-500">
                            <AlertTriangle size={13} />
                            Les images recto et verso semblent inversées. Les données ont été réorganisées automatiquement.
                        </p>
                    ) : null}

                    {result.document.generation === 'new_2020' && result.mrz.detected ? (
                        <p className={cn(
                            'mt-3 rounded-lg px-3 py-2 text-[10px]',
                            result.mrz.valid
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-amber-500/10 text-amber-500',
                        )}>
                            MRZ {result.mrz.valid
                                ? 'validée par ses clés de contrôle.'
                                : 'détectée mais certaines clés de contrôle nécessitent une vérification.'}
                        </p>
                    ) : null}
                </div>

                <div className="max-h-[46vh] space-y-2 overflow-y-auto pr-1">
                    {fieldRows.map(({ key, label }) => {
                        const field = result.fields[key];

                        return (
                            <div
                                key={key}
                                className="flex items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                        {label}
                                    </p>
                                    <p className="mt-1 break-words text-xs font-medium text-[var(--foreground)]">
                                        {field.value ?? '—'}
                                    </p>
                                    {field.warnings.length > 0 ? (
                                        <p className="mt-1 text-[9px] text-amber-500">
                                            {field.warnings.join(', ')}
                                        </p>
                                    ) : null}
                                </div>

                                <FieldStatus field={field} />
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                    <AppButton
                        variant="bordered"
                        onPress={reset}
                    >
                        <RefreshCcw size={14} />
                        Reprendre les images
                    </AppButton>

                    <AppButton
                        variant="solid"
                        color="primary"
                        onPress={onContinue}
                    >
                        <CheckCircle2 size={14} />
                        Continuer avec les données
                    </AppButton>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-[10px] leading-5 text-[var(--text-muted)]">
                Photographiez toute la carte à plat, sans couper les bords. Évitez les reflets, les ombres et le flou.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <ImageSlot
                    side="front"
                    label="CNI — Recto"
                    state={front}
                    isDisabled={isScanning}
                    onSelect={(file) => void setImage('front', file)}
                    onRotate={(degrees) => void rotate('front', degrees)}
                    onClear={() => clear('front')}
                />

                <ImageSlot
                    side="back"
                    label="CNI — Verso"
                    state={back}
                    isDisabled={isScanning}
                    onSelect={(file) => void setImage('back', file)}
                    onRotate={(degrees) => void rotate('back', degrees)}
                    onClear={() => clear('back')}
                />
            </div>

            {isScanning ? (
                <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-3">
                    <div className="flex items-center gap-3">
                        <ScanLine
                            size={18}
                            className="animate-pulse text-[var(--accent)]"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-[var(--foreground)]">
                                {progressLabels[progressIndex]}
                            </p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                                <div
                                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                                    style={{
                                        width: `${((progressIndex + 1) / progressLabels.length) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {requestError ? (
                <p className="flex items-start gap-2 rounded-lg bg-[var(--danger)]/10 px-3 py-2 text-[10px] text-[var(--danger)]">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                    {requestError}
                </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
                <AppButton
                    variant="bordered"
                    onPress={onCancel}
                    isDisabled={isScanning}
                >
                    Annuler
                </AppButton>

                <AppButton
                    variant="solid"
                    color="primary"
                    onPress={() => void scan()}
                    isDisabled={! canScan || isScanning}
                >
                    {isScanning ? (
                        <ScanLine size={14} className="animate-pulse" />
                    ) : (
                        <ScanLine size={14} />
                    )}
                    Analyser la CNI
                </AppButton>
            </div>
        </div>
    );
}
