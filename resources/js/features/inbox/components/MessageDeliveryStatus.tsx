import { IconCheck, IconChecks } from '@tabler/icons-react';


type Props = {
    createdAt?: string | null;
    isMine: boolean;
    readBy?: number[];
    isEdited?: boolean;
    isFailed?: boolean;
    onRetry?: () => void;
};

function safeTimeLabel(value?: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageDeliveryStatus({ createdAt, isMine, readBy, isEdited, isFailed, onRetry }: Props) {
    const time = safeTimeLabel(createdAt);

    return (
        <div className="flex items-center gap-1">
            {isFailed ? (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-1 text-[9px] font-semibold text-red-400 hover:underline"
                >
                    Échec - Réessayer
                </button>
            ) : null}
            {isEdited ? <span className="text-[9px] text-[var(--text-muted)]">modifié</span> : null}
            {time ? <span className="text-[9px] text-[var(--text-muted)]">{time}</span> : null}
            {isMine ? (
                readBy && readBy.length > 0 ? (
                    <IconChecks size={11} className="text-emerald-400" />
                ) : (
                    <IconCheck size={11} className="text-[var(--text-muted)]" />
                )
            ) : null}
        </div>
    );
}
