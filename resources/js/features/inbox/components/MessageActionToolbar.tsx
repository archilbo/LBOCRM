import { useRef, useState } from 'react';
import { IconCornerUpLeft, IconPlayerSkipForward, IconCopy, IconDots } from '@tabler/icons-react';

import { toast } from 'sonner';
import { MessageMoreMenu, type MoreAction } from '@/features/inbox/components/MessageMoreMenu';
import { cn } from '@/lib/cn';

type Props = {
    isMine: boolean;
    body?: string | null;
    onReply: () => void;
    onForward: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

export function MessageActionToolbar({ isMine, body, onReply, onForward, onEdit, onDelete }: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const moreRef = useRef<HTMLButtonElement>(null);

    function handleCopy() {
        if (body) {
            navigator.clipboard.writeText(body).then(
                () => toast.success('Message copié.'),
                () => toast.error('Impossible de copier.'),
            );
        }
    }

    function handleAction(action: MoreAction) {
        if (action === 'edit') onEdit?.();
        else if (action === 'delete') onDelete?.();
    }

    return (
        <>
            <div
                className={cn(
                    'flex h-8 items-center gap-0.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-[3px] shadow-sm transition-all duration-150',
                    'opacity-0 pointer-events-none',
                    'group-hover/message:opacity-100 group-hover/message:pointer-events-auto',
                    'focus-within:opacity-100 focus-within:pointer-events-auto',
                    menuOpen && 'opacity-100 pointer-events-auto',
                )}
            >
                <button
                    onClick={onReply}
                    className="flex size-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] active:scale-[0.97] active:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition"
                    aria-label="Répondre"
                    title="Répondre"
                >
                    <IconCornerUpLeft size={14} />
                </button>
                <button
                    onClick={onForward}
                    className="flex size-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] active:scale-[0.97] active:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition"
                    aria-label="Transférer"
                    title="Transférer"
                >
                    <IconPlayerSkipForward size={14} />
                </button>
                {body ? (
                    <button
                        onClick={handleCopy}
                        className="flex size-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] active:scale-[0.97] active:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition"
                        aria-label="Copier"
                        title="Copier"
                    >
                        <IconCopy size={14} />
                    </button>
                ) : null}
                <button
                    ref={moreRef}
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex size-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] active:scale-[0.97] active:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] transition"
                    aria-label="Plus d'actions"
                    title="Plus d'actions"
                >
                    <IconDots size={14} />
                </button>
            </div>

            <MessageMoreMenu
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                anchorRef={moreRef}
                isMine={isMine}
                hasBody={!!body}
                onAction={handleAction}
            />
        </>
    );
}
