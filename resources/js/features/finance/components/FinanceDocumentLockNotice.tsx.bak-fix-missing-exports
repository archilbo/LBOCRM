import type { ReactNode } from 'react';
import type { FinanceDocument } from '../types';

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
    return document?.lock?.message ?? 'Document locked after export. Number, type, and issue date cannot be changed.';
}

export function FinanceDocumentLockBadge({ document }: { document?: LockableFinanceDocument | null }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = getFinanceDocumentLockedAt(document);

    return (
        <span
            className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300"
            title={lockedAt ? `Locked at ${lockedAt}` : 'Locked after export'}
        >
            Locked
        </span>
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
        <div className={`rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                    Locked
                </span>
                {displayLockedAt ? <span className="text-xs text-amber-100/60">Locked at {displayLockedAt}</span> : null}
            </div>
            <p className="mt-2 text-amber-100/80">{displayMessage}</p>
        </div>
    );
}

export default FinanceDocumentLockNotice;