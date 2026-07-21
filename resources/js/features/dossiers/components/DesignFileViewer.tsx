import { useState, useCallback, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize, Minimize, X, FileWarning, Download } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';

const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

function isPdf(mime: string) { return mime === 'application/pdf'; }
function isImage(mime: string) { return SUPPORTED_IMAGE_TYPES.includes(mime); }
function isSupported(mime: string) { return isPdf(mime) || isImage(mime); }

function ImageViewer({ src, filename }: { src: string; filename: string }) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const imgRef = useRef<HTMLDivElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panPos, setPanPos] = useState({ x: 0, y: 0 });
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        setZoom((z) => Math.max(0.1, Math.min(5, z - e.deltaY * 0.001)));
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return;
        setPanPos({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    };

    const handleMouseUp = () => setIsPanning(false);

    function fitToScreen() {
        setZoom(1);
        setRotation(0);
        setPanPos({ x: 0, y: 0 });
    }

    return (
        <div className="relative flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{filename}</p>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]" title="Zoom out"><ZoomOut size={13} /></button>
                    <span className="min-w-[3ch] text-center text-[11px] text-[var(--text-muted)]">{Math.round(zoom * 100)}%</span>
                    <button type="button" onClick={() => setZoom((z) => Math.min(5, z + 0.1))} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]" title="Zoom in"><ZoomIn size={13} /></button>
                    <button type="button" onClick={() => setRotation((r) => (r + 90) % 360)} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]" title="Rotate"><RotateCw size={13} /></button>
                    <button type="button" onClick={fitToScreen} className="flex size-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]" title="Fit to screen"><Maximize size={13} /></button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden bg-[var(--surface-2)]/50" onWheel={handleWheel}
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}>
                <div ref={imgRef} className="flex h-full w-full items-center justify-center transition-transform"
                    style={{ transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoom}) rotate(${rotation}deg)` }}>
                    <img src={src} alt={filename} className="max-h-full max-w-full object-contain" draggable={false} />
                </div>
            </div>
        </div>
    );
}

function PdfViewer({ src, filename }: { src: string; filename: string }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className="relative flex h-full w-full flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
                <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{filename}</p>
                <a href={src} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-[var(--accent)] hover:bg-[var(--accent)]/10">
                    <Download size={13} /> Open original
                </a>
            </div>
            <div className="flex-1 bg-[var(--surface-2)]/50">
                {error ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                        <FileWarning size={24} className="text-amber-400" />
                        <p className="text-[13px] text-[var(--text-muted)]">Could not load PDF preview.</p>
                        <a href={src} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[var(--accent)] underline">Open in new tab</a>
                    </div>
                ) : (
                    <iframe src={src} className="h-full w-full border-0" title={filename}
                        onLoad={() => setLoaded(true)} onError={() => setError(true)} />
                )}
            </div>
        </div>
    );
}

function UnsupportedViewer({ filename }: { filename: string }) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <FileWarning size={32} className="text-amber-400" />
            <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Preview not available</p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">"{filename}" cannot be previewed in the browser.</p>
            </div>
        </div>
    );
}

export function DesignFileViewer({ versionId, mimeType, filename, isOpen, onClose }: {
    versionId: number; mimeType: string; filename: string; isOpen: boolean; onClose: () => void;
}) {
    const previewUrl = isOpen ? `/dossiers/design/versions/${versionId}/preview` : '';

    if (!isSupported(mimeType)) {
        return (
            <AppModal isOpen={isOpen} onOpenChange={(o) => { if (!o) onClose(); }} title="Preview" size="lg">
                <UnsupportedViewer filename={filename} />
            </AppModal>
        );
    }

    const content = isImage(mimeType)
        ? <ImageViewer src={previewUrl} filename={filename} />
        : <PdfViewer src={previewUrl} filename={filename} />;

    return (
        <AppModal isOpen={isOpen} onOpenChange={(o) => { if (!o) onClose(); }} title={filename} size="lg">
            <div className="h-[70vh] -mx-4 -mb-4 sm:-mx-5 sm:-mb-5">
                {content}
            </div>
        </AppModal>
    );
}
