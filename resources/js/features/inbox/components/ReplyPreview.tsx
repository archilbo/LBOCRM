import { IconFileText, IconPhoto } from '@tabler/icons-react';

import type { MessageReplyPreview } from '@/features/chat/types';

type Props = {
    replyTo: MessageReplyPreview;
    isMine: boolean;
    onClick?: () => void;
};

function replyLabel(replyTo: MessageReplyPreview): string {
    if (replyTo.attachmentsCount === 0) return replyTo.body || '';
    const count = replyTo.attachmentsCount;
    if (count > 1) return `${count} pièces jointes`;
    return 'Photo ou fichier';
}

export function ReplyPreview({ replyTo, isMine, onClick }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`mb-1.5 flex max-h-[54px] items-stretch gap-2 rounded-lg px-2.5 py-1.5 text-left ${
                isMine
                    ? 'bg-black/20'
                    : 'bg-[var(--surface-3)]'
            }`}
        >
            <div className={`w-0.5 shrink-0 rounded-full ${isMine ? 'bg-[var(--accent)]/50' : 'bg-[var(--border)]'}`} />
            <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold text-[var(--text-muted)]">
                    {replyTo.userName || 'Message'}
                </p>
                <p className="line-clamp-2 text-[9px] text-[var(--text-muted)]/80">
                    {replyTo.body || (replyTo.attachmentsCount > 0 ? (
                        <span className="flex items-center gap-1">{replyTo.attachmentsCount > 1 ? <IconFileText size={10} /> : <IconPhoto size={10} />}{replyLabel(replyTo)}</span>
                    ) : '')}
                </p>
            </div>
        </button>
    );
}