import { useState } from 'react';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { useCreateFolder } from '../hooks/useProjectDesignMutations';

export function NewFolderModal({ isOpen, onClose, dossierId }: { isOpen: boolean; onClose: () => void; dossierId: number }) {
    const [name, setName] = useState('');
    const createFolder = useCreateFolder(dossierId);

    async function handleSubmit() {
        if (!name.trim()) return;
        await createFolder.mutateAsync(name.trim());
        setName('');
        onClose();
    }

    return (
        <AppModal isOpen={isOpen} onOpenChange={(o) => { if (!o) onClose(); }} title="New folder" size="sm">
            <div className="space-y-4">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name..."
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] outline-none focus:border-[var(--accent)]"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }} aria-label="Folder name" />
                <div className="flex justify-end gap-2">
                    <AppButton variant="bordered" size="sm" onPress={onClose}>Cancel</AppButton>
                    <AppButton size="sm" onPress={handleSubmit} isDisabled={!name.trim() || createFolder.isPending}>Create</AppButton>
                </div>
            </div>
        </AppModal>
    );
}
