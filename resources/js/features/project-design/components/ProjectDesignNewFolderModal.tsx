import { useEffect, useState } from 'react';
import { Button, Input, Modal } from '@heroui/react';
import { FolderPlus } from 'lucide-react';
import { useCreateFolder } from '../hooks/useProjectDesignMutations';

export function NewFolderModal({
    isOpen,
    onClose,
    dossierId,
    portalContainer,
}: {
    isOpen: boolean;
    onClose: () => void;
    dossierId: number;
    portalContainer?: HTMLElement | null;
}) {
    const [name, setName] = useState('');
    const createFolder = useCreateFolder(dossierId);

    useEffect(() => {
        if (!isOpen) setName('');
    }, [isOpen]);

    async function handleSubmit() {
        const trimmed = name.trim();
        if (!trimmed || createFolder.isPending) return;

        await createFolder.mutateAsync(trimmed);
        setName('');
        onClose();
    }

    return (
        <Modal>
            <Modal.Backdrop
                isOpen={isOpen}
                onOpenChange={(open) => {
                    if (!open && !createFolder.isPending) onClose();
                }}
                variant="blur"
                className="z-[190] bg-black/65"
                UNSTABLE_portalContainer={portalContainer ?? undefined}
            >
                <Modal.Container size="sm" placement="center" className="z-[191] p-3">
                    <Modal.Dialog
                        aria-label="Create design folder"
                        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-2xl"
                    >
                        <Modal.CloseTrigger
                            aria-label="Close create folder dialog"
                            className="absolute right-3 top-3 z-10"
                        />
                        <Modal.Header className="border-b border-[var(--border)] px-5 py-4 pr-12">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent)]/12 text-[var(--accent)]">
                                    <FolderPlus size={17} />
                                </span>
                                <div>
                                    <Modal.Heading className="text-sm font-semibold text-[var(--foreground)]">
                                        New folder
                                    </Modal.Heading>
                                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                                        Organize project design files without leaving fullscreen.
                                    </p>
                                </div>
                            </div>
                        </Modal.Header>
                        <Modal.Body className="px-5 py-4">
                            <Input
                                autoFocus
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        void handleSubmit();
                                    }
                                }}
                                placeholder="Folder name"
                                aria-label="Folder name"
                                variant="secondary"
                                fullWidth
                                className="h-10"
                            />
                        </Modal.Body>
                        <Modal.Footer className="flex justify-end gap-2 border-t border-[var(--border)] px-5 py-3">
                            <Button
                                size="sm"
                                variant="ghost"
                                onPress={onClose}
                                isDisabled={createFolder.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                variant="primary"
                                onPress={() => void handleSubmit()}
                                isDisabled={!name.trim()}
                                isPending={createFolder.isPending}
                            >
                                Create folder
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
