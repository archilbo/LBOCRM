import { router } from '@inertiajs/react';
import { ScanLine, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';

type ScanModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

const ARC_PATTERN = /^ARC-\d{4}-\d{4}$/i;

export function ScanModal({ isOpen, onOpenChange }: ScanModalProps) {
    const [manualCode, setManualCode] = useState('');
    const [mode, setMode] = useState<'camera' | 'manual'>('manual');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setManualCode('');
            setMode('manual');
        }
    }, [isOpen, stopCamera]);

    async function startCamera() {
        setMode('camera');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            // Attempt decode via dynamic import of @zxing/browser
            try {
                const { BrowserQRCodeReader } = await import('@zxing/browser');
                const reader = new BrowserQRCodeReader();
                const result = await reader.decodeOnceFromVideoElement(videoRef.current!);
                const code = result.getText();
                if (ARC_PATTERN.test(code)) {
                    stopCamera();
                    onOpenChange(false);
                    router.visit(`/archives/${encodeURIComponent(code)}`);
                } else {
                    toast.error('Scanned code is not a valid ARC number.');
                    stopCamera();
                    setMode('manual');
                }
            } catch {
                toast.error('Camera scan unavailable. Enter code manually.');
                stopCamera();
                setMode('manual');
            }
        } catch {
            toast.error('Camera access denied.');
            setMode('manual');
        }
    }

    function handleManualSubmit(e: React.FormEvent) {
        e.preventDefault();
        const code = manualCode.trim();
        if (!code) return;
        if (ARC_PATTERN.test(code)) {
            onOpenChange(false);
            router.visit(`/archives/${encodeURIComponent(code)}`);
        } else {
            toast.error(`"${code}" is not a valid ARC number (e.g. ARC-2026-0001)`);
        }
    }

    return (
        <AppModal isOpen={isOpen} onOpenChange={onOpenChange} title="Scan archive QR code" size="sm">
            <div className="space-y-4">
                {mode === 'camera' ? (
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                        <video ref={videoRef} className="h-full w-full object-cover" playsInline />
                        <button type="button" onClick={() => { stopCamera(); setMode('manual'); }}
                            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleManualSubmit} className="space-y-3">
                        <p className="text-xs text-[var(--text-muted)]">Enter the ARC number manually:</p>
                        <input
                            type="text"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            placeholder="ARC-2026-0001"
                            className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <AppButton variant="primary" type="submit" className="h-8 text-xs">Go to archive</AppButton>
                            <AppButton variant="bordered" className="h-8 text-xs" onPress={startCamera}>
                                <ScanLine size={13} /> Use camera
                            </AppButton>
                        </div>
                    </form>
                )}
            </div>
        </AppModal>
    );
}
