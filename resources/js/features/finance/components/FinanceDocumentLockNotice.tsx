import { Lock } from 'lucide-react';
import { AppBadge } from '@/components/ui/AppBadge';
import type { FinanceDocument } from '@/features/finance/types';

const defaultLockMessage = 'Document locked after export. Number, type, and issue date cannot be changed.';

type LockableDocument = Pick<FinanceDocument, 'numberLocked' | 'numberLockedAt' | 'lock'>;

export function isFinanceDocumentLocked(document?: LockableDocument | null): boolean {
    return Boolean(document?.lock?.isLocked ?? document?.numberLocked ?? false);
}

export function getFinanceDocumentLockMessage(document?: LockableDocument | null): string {
    return document?.lock?.message || defaultLockMessage;
}

export function getFinanceDocumentLockedAt(document?: LockableDocument | null): string | null {
    return document?.lock?.lockedAtFormatted || document?.numberLockedAt || null;
}

export function FinanceDocumentLockBadge({ document, compact = false }: { document?: LockableDocument | null; compact?: boolean }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    return (
        <AppBadge tone="amber" className={compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}>
            <Lock size={compact ? 11 : 13} />
            Locked
        </AppBadge>
    );
}

export function FinanceDocumentLockNotice({ document, compact = false }: { document?: LockableDocument | null; compact?: boolean }) {
    if (!isFinanceDocumentLocked(document)) {
        return null;
    }

    const lockedAt = getFinanceDocumentLockedAt(document);

    return (
        <div className={`rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100 ${compact ? 'p-3 text-xs' : 'p-4 text-sm'}`}>
            <div className="flex items-start gap-2">
                <Lock size={compact ? 14 : 16} className="mt-0.5 shrink-0" />
                <div>
                    <p className="font-semibold">Document locked after export</p>
                    <p className="mt-1">{getFinanceDocumentLockMessage(document)}</p>
                    {lockedAt ? <p className="mt-1 text-xs opacity-80">Locked at: {lockedAt}</p> : null}
                </div>
            </div>
        </div>
    );
}