import { FormEvent, useMemo, useState } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { AppSelect } from '@/components/ui/AppSelect';
import type { AppSelectOption } from '@/components/ui/AppSelect';
import type { ArchiveRecordRow, TreeNode } from '@/features/archives/types';

type MoveDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    archives: ArchiveRecordRow[];
    tree: TreeNode[];
    onConfirm: (data: { archiveIds: number[]; roomCode: string; shelfCode: string; boxCode: string }) => void;
};

export function MoveDrawer({ isOpen, onOpenChange, archives, tree, onConfirm }: MoveDrawerProps) {
    const [roomCode, setRoomCode] = useState('');
    const [shelfCode, setShelfCode] = useState('');
    const [boxCode, setBoxCode] = useState('');

    const roomOptions: AppSelectOption[] = useMemo(() => tree.map((r) => ({ id: r.code, label: `${r.code} - ${r.name}` })), [tree]);

    const shelfOptions: AppSelectOption[] = useMemo(() => {
        const room = tree.find((r) => r.code === roomCode);
        if (!room?.shelves) return [];
        return room.shelves.map((s) => ({ id: s.code, label: s.code }));
    }, [tree, roomCode]);

    const boxOptions: AppSelectOption[] = useMemo(() => {
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
            title={`Move ${archives.length} archive${archives.length > 1 ? 's' : ''}`}
            description="Select target location."
            footer={
                <>
                    <AppButton variant="secondary" onPress={() => onOpenChange(false)}>Cancel</AppButton>
                    <AppButton variant="primary" type="submit" form="move-form">Move</AppButton>
                </>
            }
        >
            <form id="move-form" className="space-y-4" onSubmit={handleSubmit}>
                <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg bg-[var(--surface-2)] p-2">
                    {archives.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-xs">
                            <span className="font-mono tabular-nums text-[var(--foreground)]">{a.archiveNumber}</span>
                            <span className="truncate text-[var(--text-muted)] ml-2">{a.projectObject}</span>
                        </div>
                    ))}
                </div>

                <AppSelect label="Room" placeholder="Select room" selectedKey={roomCode || null} onSelectionChange={(v) => { setRoomCode(v ? String(v) : ''); setShelfCode(''); setBoxCode(''); }} options={roomOptions} />

                <AppSelect label="Shelf" placeholder={roomCode ? 'Select shelf' : 'Select room first'} selectedKey={shelfCode || null} onSelectionChange={(v) => { setShelfCode(v ? String(v) : ''); setBoxCode(''); }} options={shelfOptions} isDisabled={!roomCode} />

                <AppSelect label="Box" placeholder={shelfCode ? 'Select box' : 'Select shelf first'} selectedKey={boxCode || null} onSelectionChange={(v) => setBoxCode(v ? String(v) : '')} options={boxOptions} isDisabled={!shelfCode} />
            </form>
        </AppDrawer>
    );
}
