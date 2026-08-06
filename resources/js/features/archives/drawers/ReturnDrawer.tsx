import { FormEvent, useState } from 'react';
import { TextArea } from '@heroui/react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerField, drawerStyles } from '@/components/drawers';
import type { ArchiveRecordRow } from '@/features/archives/types';
import { useTranslation } from '@/lib/i18n';

type ReturnDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    archives: ArchiveRecordRow[];
    onConfirm: (data: { archiveIds: number[]; note: string }) => void;
};

export function ReturnDrawer({ isOpen, onOpenChange, archives, onConfirm }: ReturnDrawerProps) {
    const { t } = useTranslation();
    const [note, setNote] = useState('');

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onConfirm({ archiveIds: archives.map((a) => a.id), note });
        onOpenChange(false);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={t('drawers.return.title', { count: archives.length })}
            description={t('drawers.return.description')}
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>{t('drawers.return.cancel')}</AppButton>
                    <AppButton variant="primary" type="submit" form="return-form">{t('drawers.return.confirm')}</AppButton>
                </>
            }
        >
            <form id="return-form" className="space-y-4" onSubmit={handleSubmit}>
                <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg bg-[var(--surface-2)] p-2">
                    {archives.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-xs">
                            <span className="tabular-nums text-[var(--foreground)]">{a.archiveNumber}</span>
                            <span className="truncate text-[var(--text-muted)] ml-2">{a.projectObject}</span>
                        </div>
                    ))}
                </div>

                <DrawerField label={t('drawers.return.noteLabel')}>
                    <TextArea value={note} onChange={(e) => setNote(e.target.value)}
                        placeholder={t('drawers.return.notePlaceholder')} className={drawerStyles.textarea} />
                </DrawerField>
            </form>
        </AppDrawer>
    );
}
