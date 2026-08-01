import { useRef, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type MoreAction = 'edit' | 'delete';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLElement>;
    isMine: boolean;
    hasBody: boolean;
    onAction: (action: MoreAction) => void;
};

export function MessageMoreMenu({ isOpen, onClose, anchorRef, isMine, hasBody, onAction }: Props) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (!isOpen || !anchorRef.current || !menuRef.current) return;
        const anchor = anchorRef.current.getBoundingClientRect();
        const w = 190;
        let left: number;
        if (anchor.left + anchor.width / 2 < window.innerWidth / 2) {
            left = anchor.right + 4;
        } else {
            left = anchor.left - w - 4;
        }
        if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
        if (left < 8) left = 8;
        setStyle({ left, top: Math.max(8, anchor.top - 4), position: 'fixed', zIndex: 999 });
    }, [isOpen, anchorRef]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent | KeyboardEvent) => {
            if (e instanceof KeyboardEvent && e.key === 'Escape') { e.preventDefault(); onClose(); return; }
            if (menuRef.current && !menuRef.current.contains(e.target as Node) && !anchorRef.current?.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        document.addEventListener('keydown', handler);
        return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', handler); };
    }, [isOpen, onClose, anchorRef]);

    if (!isOpen) return null;

    const items: { id: MoreAction; label: string; icon: React.ReactNode; danger?: boolean }[] = [];
    if (isMine && hasBody) items.push({ id: 'edit', label: 'Modifier', icon: <Pencil size={15} /> });
    if (isMine) items.push({ id: 'delete', label: 'Supprimer', icon: <Trash2 size={15} />, danger: true });

    if (items.length === 0) return null;

    return (
        <div
            ref={menuRef}
            style={style}
            className="w-[190px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-2xl outline-none"
            role="menu"
        >
            {items.map((item) => (
                <div key={item.id}>
                    {item.id === 'delete' && items.length > 1 ? (
                        <div className="mx-1 my-1 border-t border-[var(--border)]" />
                    ) : null}
                    <button
                        role="menuitem"
                        onClick={() => { onAction(item.id); onClose(); }}
                        className={cn(
                            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium outline-none transition hover:bg-[var(--surface-2)] focus-visible:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
                            item.danger ? 'text-red-400' : 'text-[var(--text)]',
                        )}
                    >
                        <span className="text-[var(--text-muted)]">{item.icon}</span>
                        {item.label}
                    </button>
                </div>
            ))}
        </div>
    );
}