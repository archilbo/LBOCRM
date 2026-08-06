import { FormEvent, useState } from 'react';
import { Input } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerField, drawerStyles } from '@/components/drawers';
import { DateField } from '@/features/archives/components/DateField';
import { strToDate, dateToStr } from '@/lib/dateUtils';
import type { ArchiveRecordRow } from '@/features/archives/types';
import { useTranslation } from '@/lib/i18n';

type CheckoutDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    archives: ArchiveRecordRow[];
    onConfirm: (data: { archiveIds: number[]; requester: string; dueAt: string; purpose: string }) => void;
};

function defaultDue(days = 7): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

export function CheckoutDrawer({ isOpen, onOpenChange, archives, onConfirm }: CheckoutDrawerProps) {
    const { t } = useTranslation();
    const [requester, setRequester] = useState('');
    const [dueAt, setDueAt] = useState(defaultDue());
    const [purpose, setPurpose] = useState('');

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onConfirm({
            archiveIds: archives.map((a) => a.id),
            requester,
            dueAt,
            purpose,
        });
        onOpenChange(false);
    }

    function presetDays(days: number) {
        setDueAt(defaultDue(days));
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={t('drawers.checkout.title', { count: archives.length })}
            description={t('drawers.checkout.description')}
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>{t('drawers.checkout.cancel')}</AppButton>
                    <AppButton variant="primary" type="submit" form="checkout-form">{t('drawers.checkout.confirm')}</AppButton>
                </>
            }
        >
            <form id="checkout-form" className="space-y-4" onSubmit={handleSubmit}>
                <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg bg-[var(--surface-2)] p-2">
                    {archives.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-xs">
                            <span className="tabular-nums text-[var(--foreground)]">{a.archiveNumber}</span>
                            <span className="truncate text-[var(--text-muted)] ml-2">{a.projectObject}</span>
                        </div>
                    ))}
                </div>

                <DrawerField label={t('drawers.checkout.requesterLabel')}>
                    <Input type="text" value={requester} onChange={(e) => setRequester(e.target.value)}
                        placeholder={t('drawers.checkout.requesterPlaceholder')} className={drawerStyles.input} />
                </DrawerField>

                <div>
                    <DateField label={t('drawers.checkout.dueDateLabel')} value={strToDate(dueAt)} onChange={(d) => setDueAt(dateToStr(d))} />
                    <div className="mt-1 flex gap-1">
                        {[7, 14, 30].map((days) => (
                            <button
                                key={days}
                                type="button"
                                onClick={() => presetDays(days)}
                                className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                            >
                                +{days}j
                            </button>
                        ))}
                    </div>
                </div>

                <DrawerField label={t('drawers.checkout.purposeLabel')}>
                    <Input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)}
                        placeholder={t('drawers.checkout.purposePlaceholder')} className={drawerStyles.input} />
                </DrawerField>
            </form>
        </AppDrawer>
    );
}
