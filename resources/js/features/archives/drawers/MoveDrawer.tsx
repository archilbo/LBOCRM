import { FormEvent, useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { DrawerField, DrawerSelect } from '@/components/drawers';
import type { ArchiveRecordRow, TreeNode } from '@/features/archives/types';
import { useTranslation } from '@/lib/i18n';

type MoveDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    archives: ArchiveRecordRow[];
    tree: TreeNode[];
    onConfirm: (data: { archiveIds: number[]; roomCode: string; shelfCode: string; boxCode: string }) => void;
};

export function MoveDrawer({ isOpen, onOpenChange, archives, tree, onConfirm }: MoveDrawerProps) {
    const { t } = useTranslation();
    const [roomCode, setRoomCode] = useState('');
    const [shelfCode, setShelfCode] = useState('');
    const [boxCode, setBoxCode] = useState('');

    const roomOptions = useMemo(() => tree.map((r) => ({ id: r.code, label: `${r.code} - ${r.name}` })), [tree]);

    const shelfOptions = useMemo(() => {
        const room = tree.find((r) => r.code === roomCode);
        if (!room?.shelves) return [];
        return room.shelves.map((s) => ({ id: s.code, label: s.code }));
    }, [tree, roomCode]);

    const boxOptions = useMemo(() => {
        const room = tree.find((r) => r.code === roomCode);
        const shelf = room?.shelves?.find((s) => s.code === shelfCode);
        if (!shelf?.boxes) return [];
        return shelf.boxes.map((b) => ({ id: b.code, label: `${b.code} (${b.count}/${b.capacity})` }));
    }, [tree, roomCode, shelfCode]);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!roomCode || !shelfCode || !boxCode) return;
        onConfirm({ archiveIds: archives.map((a) => a.id), roomCode, shelfCode, boxCode });
        onOpenChange(false);
    }

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={`${t('drawers.move.title')} ${archives.length} archive${archives.length > 1 ? 's' : ''}`}
            description={t('drawers.move.description')}
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>{t('drawers.move.cancel')}</AppButton>
                    <AppButton variant="primary" type="submit" form="move-form">{t('drawers.move.confirm')}</AppButton>
                </>
            }
        >
            <form id="move-form" className="space-y-4" onSubmit={handleSubmit}>
                <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg bg-[var(--surface-2)] p-2">
                    {archives.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-xs">
                            <span className="tabular-nums text-[var(--foreground)]">{a.archiveNumber}</span>
                            <span className="truncate text-[var(--text-muted)] ml-2">{a.projectObject}</span>
                        </div>
                    ))}
                </div>

                <DrawerField label={t('drawers.move.roomLabel')}>
                    <DrawerSelect
                        value={roomCode}
                        onChange={(v) => { setRoomCode(v); setShelfCode(''); setBoxCode(''); }}
                        options={roomOptions}
                        placeholder={t('drawers.move.roomPlaceholder')}
                    />
                </DrawerField>

                <DrawerField label={t('drawers.move.shelfLabel')}>
                    <DrawerSelect
                        value={shelfCode}
                        onChange={(v) => { setShelfCode(v); setBoxCode(''); }}
                        options={shelfOptions}
                        placeholder={roomCode ? t('drawers.move.shelfPlaceholder') : t('drawers.move.roomFirst')}
                        isDisabled={!roomCode}
                    />
                </DrawerField>

                <DrawerField label={t('drawers.move.boxLabel')}>
                    <DrawerSelect
                        value={boxCode}
                        onChange={(v) => setBoxCode(v)}
                        options={boxOptions}
                        placeholder={shelfCode ? t('drawers.move.boxPlaceholder') : t('drawers.move.shelfFirst')}
                        isDisabled={!shelfCode}
                    />
                </DrawerField>
            </form>
        </AppDrawer>
    );
}
