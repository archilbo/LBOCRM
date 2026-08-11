import { IconArrowForwardUp, IconCopy, IconCornerUpLeft, IconPencil, IconTrash } from '@tabler/icons-react';

import { toast } from 'sonner';
import { InboxIconButton } from '@/features/inbox/components/InboxIconButton';

type Props = {
    isMine: boolean;
    body?: string | null;
    onReply: () => void;
    onForward: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

export function MessageActionToolbar({ isMine, body, onReply, onForward, onEdit, onDelete }: Props) {
    function handleCopy() {
        if (!body) return;

        navigator.clipboard.writeText(body).then(
            () => toast.success('Message copié.'),
            () => toast.error('Impossible de copier le message.'),
        );
    }

    return (
        <div
            className="flex items-center gap-0.5 opacity-0 pointer-events-none transition-all duration-150 group-hover/message:pointer-events-auto group-hover/message:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100"
        >
            <InboxIconButton label="Répondre" onPress={onReply} className="size-6 min-w-6 rounded-full"><IconCornerUpLeft size={13} /></InboxIconButton>
            <InboxIconButton label="Transférer" onPress={onForward} className="size-6 min-w-6 rounded-full"><IconArrowForwardUp size={13} /></InboxIconButton>
            {body ? <InboxIconButton label="Copier" onPress={handleCopy} className="size-6 min-w-6 rounded-full"><IconCopy size={13} /></InboxIconButton> : null}
            {isMine && body ? <InboxIconButton label="Modifier" onPress={onEdit} className="size-6 min-w-6 rounded-full"><IconPencil size={13} /></InboxIconButton> : null}
            {isMine ? <InboxIconButton label="Supprimer" tone="danger" onPress={onDelete} className="size-6 min-w-6 rounded-full"><IconTrash size={13} /></InboxIconButton> : null}
        </div>
    );
}
