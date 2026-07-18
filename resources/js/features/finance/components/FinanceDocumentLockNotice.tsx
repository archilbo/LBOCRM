import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import type { FinanceDocument } from '../types';
import { Tooltip } from '@heroui/react';

export type FinanceDocumentLockStateLike = {
    isLocked?: boolean;
    lockedAt?: string | null;
    lockedAtFormatted?: string | null;
    message?: string;
    blockedFields?: string[];
    canEditNumberFields?: boolean;
    canRegenerateExports?: boolean;
    canGeneratePdf?: boolean;
    canGenerateExcel?: boolean;
};

export type LockableFinanceDocument = Partial<FinanceDocument> & {
    numberLocked?: boolean;
    numberLockedAt?: string | null;
    lock?: FinanceDocumentLockStateLike | null;
};

type NoticeProps = {
    document?: LockableFinanceDocument | null;
    isLocked?: boolean;
    lockedAt?: string | null;
    lockedAtFormatted?: string | null;
    message?: ReactNode;
    compact?: boolean;
    className?: string;
};

export function isFinanceDocumentLocked(document?: LockableFinanceDocument | null): boolean {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked);
}

export function canEditFinanceDocumentNumberFields(document?: LockableFinanceDocument | null): boolean {
    return document?.lock?.canEditNumberFields ?? !isFinanceDocumentLocked(document);
}

export function getFinanceDocumentLockedAt(document?: LockableFinanceDocument | null): string | null {
    return document?.lock?.lockedAtFormatted ?? document?.numberLockedAt ?? document?.lock?.lockedAt ?? null;
}

export function getFinanceDocumentLockMessage(document?: LockableFinanceDocument | null): string {
    return document?.lock?.message ?? 'Document verrouillé après export. Le numéro, le type et la date d\'émission ne peuvent plus être modifiés.';
}

export function FinanceDocumentLockBadge({ document }: { document?: LockableFinanceDocument | null }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const message = getFinanceDocumentLockMessage(document);

    return (
        <Tooltip delay={500}>
            <span className="inline-flex items-center justify-center text-amber-500 hover:text-amber-400 transition-colors cursor-help">
                <Lock size={10} />
            </span>
            <Tooltip.Content className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">{message}</Tooltip.Content>
        </Tooltip>
    );
}

export function FinanceDocumentLockNotice({
    document,
    isLocked,
    lockedAt,
    lockedAtFormatted,
    message,
    compact = false,
    className = '',
}: NoticeProps) {
    const locked = isLocked ?? isFinanceDocumentLocked(document);

    if (!locked) {
        return null;
    }

    const displayLockedAt = lockedAtFormatted ?? lockedAt ?? getFinanceDocumentLockedAt(document);
    const displayMessage = message ?? getFinanceDocumentLockMessage(document);

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200 ${className}`}>
                Locked
                {displayLockedAt ? <span className="font-normal text-amber-100/60">{displayLockedAt}</span> : null}
            </span>
        );
    }

    return (
        <div className={`rounded-[var(--radius-md)] border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500">
                    Locked
                </span>
                {displayLockedAt ? <span className="text-xs text-amber-100/60">Locked at {displayLockedAt}</span> : null}
            </div>
            <p className="mt-2 text-amber-100/80">{displayMessage}</p>
        </div>
    );
}

export default FinanceDocumentLockNotice;