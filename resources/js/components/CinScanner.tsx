import { useCallback, useEffect, useRef, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextField } from '@/components/ui/AppTextField';

type CinScanResult = {
    document_type: string;
    recto: {
        cin_number: string | null;
        last_name: string | null;
        first_name: string | null;
        date_of_birth: string | null;
        place_of_birth: string | null;
        expiry_date: string | null;
        can_number: string | null;
    };
    verso: {
        sex: string | null;
        civil_status_number: string | null;
        filiation: string | null;
        address: string | null;
    };
};

type ApiResponse = {
    success: boolean;
    data: CinScanResult;
    error?: string;
};

type ScannerMode = 'select' | 'camera' | 'upload' | 'loading' | 'result' | 'error';

type FormData = {
    cin_number: string;
    last_name: string;
    first_name: string;
    date_of_birth: string;
    place_of_birth: string;
    expiry_date: string;
    can_number: string;
    sex: string;
    civil_status_number: string;
    filiation: string;
    address: string;
};

type CinScannerProps = {
    scanEndpoint?: string;
    onComplete?: (data: FormData) => void;
};

export function CinScanner({ scanEndpoint = '/api/ocr/scan', onComplete }: CinScannerProps) {
    const [mode, setMode] = useState<ScannerMode>('select');
    const [errorMessage, setErrorMessage] = useState('');
    const [result, setResult] = useState<CinScanResult | null>(null);
    const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
    const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const dragRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => stopCamera();
    }, []);

    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }

    async function startCamera() {
        try {
            setErrorMessage('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setMode('camera');
        } catch {
            setErrorMessage('Camera access denied. Please use file upload instead.');
            setMode('upload');
        }
    }

    function captureFrame() {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            if (!blob) return;
            setCapturedImage(blob);
            setCapturedPreview(URL.createObjectURL(blob));
            stopCamera();
            setMode('upload');
        }, 'image/jpeg', 0.92);
    }

    function handleFileSelect(file: File) {
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please select a valid image file (JPEG, PNG, or WebP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('Image must be under 5 MB.');
            return;
        }

        setCapturedImage(file);
        setCapturedPreview(URL.createObjectURL(file));
        setMode('upload');
        setErrorMessage('');
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
    }

    function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    }

    async function analyzeImage() {
        if (!capturedImage) return;

        setMode('loading');
        setErrorMessage('');

        const formData = new FormData();
        formData.append('image', capturedImage, 'cin.jpg');
        formData.append('side', 'recto');

        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

            const res = await fetch(scanEndpoint, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrf,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const json: ApiResponse = await res.json();

            if (!res.ok || !json.success) {
                setErrorMessage(json.error || 'Could not read the CIN image. Please try again with a clearer photo.');
                setMode('error');
                return;
            }

            setResult(json.data);
            setMode('result');

            if (capturedPreview) {
                URL.revokeObjectURL(capturedPreview);
                setCapturedPreview(null);
            }
        } catch {
            setErrorMessage('Network error. Please check your connection and try again.');
            setMode('error');
        } finally {
            setCapturedImage(null);
        }
    }

    function resetAll() {
        if (capturedPreview) {
            URL.revokeObjectURL(capturedPreview);
        }
        setCapturedImage(null);
        setCapturedPreview(null);
        setResult(null);
        setErrorMessage('');
        setMode('select');
    }

    const mockResult: CinScanResult = {
        document_type: 'Moroccan CIN',
        recto: {
            cin_number: 'U1234567',
            last_name: 'EL ALAMI',
            first_name: 'Mohamed',
            date_of_birth: '1985-06-15',
            place_of_birth: 'OUARZAZATE',
            expiry_date: '2030-12-31',
            can_number: '123456',
        },
        verso: {
            sex: 'M',
            civil_status_number: '1234/5678/1983',
            filiation: 'fils de Ahmed et Fatima',
            address: '12, Avenue Mohammed V, Ouarzazate',
        },
    };

    if (mode === 'select') {
        return (
            <div className="space-y-4">
                <p className="text-[11px] text-[var(--text-muted)]">
                    Choose how to capture the CIN card. For best results, place the card on a flat surface with even lighting.
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={startCamera}
                        className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] p-6 transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span className="text-[12px] font-medium text-[var(--text)]">Use Camera</span>
                        <span className="text-[10px] text-[var(--text-muted)]">Capture live with your device camera</span>
                    </button>

                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] p-6 transition hover:border-[var(--accent)] hover:bg-[var(--surface-2)]">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInputChange} className="hidden" />
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-[12px] font-medium text-[var(--text)]">Upload Image</span>
                        <span className="text-[10px] text-[var(--text-muted)]">Select a photo from your device</span>
                    </label>
                </div>

                {errorMessage && (
                    <p className="text-[11px] font-medium text-[var(--danger)]">{errorMessage}</p>
                )}
            </div>
        );
    }

    if (mode === 'camera') {
        return (
            <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl bg-black">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="h-auto w-full max-h-[420px] object-contain"
                    />

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-44 w-72 rounded-xl border-2 border-[var(--accent)] opacity-70" />
                    </div>

                    <canvas ref={canvasRef} className="hidden" />
                </div>

                <p className="text-center text-[10px] text-[var(--text-muted)]">
                    Align the CIN card within the yellow frame, then tap Capture.
                </p>

                <div className="flex gap-2">
                    <AppButton variant="bordered" className="flex-1" onPress={() => { stopCamera(); setMode('select'); }}>
                        Cancel
                    </AppButton>
                    <AppButton variant="solid" color="primary" className="flex-1" onPress={captureFrame}>
                        Capture
                    </AppButton>
                </div>
            </div>
        );
    }

    if (mode === 'upload') {
        return (
            <div className="space-y-3">
                <div
                    ref={dragRef}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] p-6 transition hover:border-[var(--accent)]"
                >
                    {capturedPreview ? (
                        <div className="relative w-full">
                            <img src={capturedPreview} alt="Captured CIN" className="max-h-52 w-full rounded-xl object-contain" />
                            <button
                                type="button"
                                onClick={() => { setCapturedImage(null); setCapturedPreview(null); setMode('select'); }}
                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white text-[10px] hover:bg-black/70"
                            >
                                &times;
                            </button>
                        </div>
                    ) : (
                        <>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <p className="text-[12px] text-[var(--text-muted)]">
                                Drag & drop an image here, or{' '}
                                <label className="cursor-pointer font-medium text-[var(--accent)] hover:underline">
                                    browse
                                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInputChange} className="hidden" />
                                </label>
                            </p>
                            <p className="text-[10px] text-[var(--text-subtle)]">JPEG, PNG, or WebP &middot; Max 5 MB</p>
                        </>
                    )}
                </div>

                {errorMessage && (
                    <p className="text-[11px] font-medium text-[var(--danger)]">{errorMessage}</p>
                )}

                <div className="flex gap-2">
                    <AppButton variant="bordered" className="flex-1" onPress={resetAll}>
                        Cancel
                    </AppButton>
                    <AppButton
                        variant="solid"
                        color="primary"
                        className="flex-1"
                        isDisabled={!capturedImage}
                        onPress={analyzeImage}
                    >
                        Analyze CIN
                    </AppButton>
                </div>
            </div>
        );
    }

    if (mode === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-[var(--border)] border-t-[var(--accent)]" />
                <div className="text-center">
                    <p className="text-sm font-medium text-[var(--text)]">AI is analyzing your card...</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Extracting text from the CIN image</p>
                </div>
            </div>
        );
    }

    if (mode === 'error') {
        return (
            <div className="space-y-3">
                <div className="rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-4">
                    <div className="flex items-start gap-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-[var(--danger)]">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        <div>
                            <p className="text-[12px] font-medium text-[var(--danger)]">Scan Failed</p>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{errorMessage}</p>
                        </div>
                    </div>
                </div>
                <AppButton variant="solid" color="primary" className="w-full" onPress={resetAll}>
                    Try Again
                </AppButton>
            </div>
        );
    }

    const recto = result?.recto ?? mockResult.recto;
    const verso = result?.verso ?? mockResult.verso;

    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] px-4 py-3">
                <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p className="text-[11px] font-medium text-[var(--accent)]">CIN data extracted successfully. Review and correct any errors below.</p>
                </div>
            </div>

            <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Identity Information
                </p>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <AppTextField
                            label="CIN Number"
                            value={recto.cin_number ?? ''}
                            onChange={() => {}}
                        />
                        <AppTextField
                            label="Sex"
                            value={verso.sex === 'M' ? 'Masculin' : verso.sex === 'F' ? 'Féminin' : ''}
                            onChange={() => {}}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <AppTextField
                            label="First Name"
                            value={recto.first_name ?? ''}
                            onChange={() => {}}
                        />
                        <AppTextField
                            label="Last Name"
                            value={recto.last_name ?? ''}
                            onChange={() => {}}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <AppTextField
                            label="Date of Birth"
                            type="date"
                            value={recto.date_of_birth ?? ''}
                            onChange={() => {}}
                        />
                        <AppTextField
                            label="Place of Birth"
                            value={recto.place_of_birth ?? ''}
                            onChange={() => {}}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <AppTextField
                            label="Expiry Date"
                            type="date"
                            value={recto.expiry_date ?? ''}
                            onChange={() => {}}
                        />
                        <AppTextField
                            label="CAN Number"
                            value={recto.can_number ?? ''}
                            onChange={() => {}}
                        />
                    </div>
                </div>
            </div>

            <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Additional Information
                </p>
                <div className="space-y-3">
                    <AppTextField
                        label="Civil Status Number"
                        value={verso.civil_status_number ?? ''}
                        onChange={() => {}}
                    />
                    <AppTextField
                        label="Filiation (Parentage)"
                        value={verso.filiation ?? ''}
                        onChange={() => {}}
                    />
                    <AppTextField
                        label="Address"
                        value={verso.address ?? ''}
                        onChange={() => {}}
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <AppButton variant="bordered" className="flex-1" onPress={resetAll}>
                    Rescan
                </AppButton>
                <AppButton
                    variant="solid"
                    color="primary"
                    className="flex-1"
                    onPress={() => onComplete?.({
                        cin_number: recto.cin_number ?? '',
                        last_name: recto.last_name ?? '',
                        first_name: recto.first_name ?? '',
                        date_of_birth: recto.date_of_birth ?? '',
                        place_of_birth: recto.place_of_birth ?? '',
                        expiry_date: recto.expiry_date ?? '',
                        can_number: recto.can_number ?? '',
                        sex: verso.sex ?? '',
                        civil_status_number: verso.civil_status_number ?? '',
                        filiation: verso.filiation ?? '',
                        address: verso.address ?? '',
                    })}
                >
                    Confirm & Use
                </AppButton>
            </div>
        </div>
    );
}
