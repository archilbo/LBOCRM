import { IconLogout, IconArrowMoveRight, IconArrowBackUp, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/lib/i18n';

type BulkActionBarProps = {
    count: number;
    onCheckout: () => void;
    onReturn: () => void;
    onMove: () => void;
    onClear: () => void;
};

export function BulkActionBar({ count, onCheckout, onReturn, onMove, onClear }: BulkActionBarProps) {
    const { t } = useTranslation();
    if (count === 0) return null;

    return (
        <div className="flex items-center gap-2 border-t border-[var(--crm-border-soft)] bg-[var(--crm-gold-soft)] px-3 py-2.5 shrink-0">
            <span className="text-sm font-semibold tabular-nums text-[var(--crm-gold)]">{count}</span>
            <span className="text-xs text-[var(--crm-text-soft)]">{t('table.selected')}</span>

            <div className="ml-3 flex items-center gap-1">
                <button type="button" onClick={onCheckout}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--crm-border)] px-2.5 py-1.5 text-xs text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-elevated)] transition">
                    <IconLogout size={13} /> {t('table.checkout')}
                </button>
                <button type="button" onClick={onReturn}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--crm-border)] px-2.5 py-1.5 text-xs text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-elevated)] transition">
                    <IconArrowBackUp size={13} /> {t('table.return')}
                </button>
                <button type="button" onClick={onMove}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--crm-border)] px-2.5 py-1.5 text-xs text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-elevated)] transition">
                    <IconArrowMoveRight size={13} /> {t('table.move')}
                </button>
            </div>

            <button type="button" onClick={onClear}
                className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[var(--crm-text-soft)] hover:text-[var(--crm-text-muted)] transition">
                <IconX size={13} /> {t('table.clear')}
            </button>
        </div>
    );
}
