import { useEffect, useRef, useState } from 'react';

type PaperSize = 'A4' | 'A5' | 'Letter';
type Orientation = 'portrait' | 'landscape';

const PAPER_DIMENSIONS: Record<PaperSize, Record<Orientation, { width: number; height: number }>> = {
    A4: { portrait: { width: 794, height: 1123 }, landscape: { width: 1123, height: 794 } },
    A5: { portrait: { width: 559, height: 794 }, landscape: { width: 794, height: 559 } },
    Letter: { portrait: { width: 816, height: 1056 }, landscape: { width: 1056, height: 816 } },
};

type DocPreviewIframeProps = {
    html: string;
    paperSize?: PaperSize;
    orientation?: Orientation;
    className?: string;
};

export function DocPreviewIframe({ html, paperSize = 'A4', orientation = 'portrait', className = '' }: DocPreviewIframeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.5);
    const dims = PAPER_DIMENSIONS[paperSize][orientation];

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            const s = Math.min(width / dims.width, 1);
            setScale(s);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [dims.width]);

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden rounded-[var(--radius-md)] border bg-[var(--surface-2)] ${className}`}
        >
            <div className="flex justify-center">
                <div
                    style={{
                        width: dims.width,
                        height: dims.height,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                    }}
                    className="shrink-0"
                >
                    <iframe
                        srcDoc={html}
                        title="Document preview"
                        className="block h-full w-full border-0 bg-white"
                    />
                </div>
            </div>
        </div>
    );
}
