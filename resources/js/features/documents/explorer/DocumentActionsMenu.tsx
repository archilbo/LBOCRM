import { Dropdown } from '@heroui/react';
import { Download as DownloadIcon, Eye as EyeIcon, Pencil as PencilIcon, Printer as PrinterIcon, Trash as TrashIcon, MoreVertical as MoreVerticalIcon, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import type { ClientProjectDocument } from '@/features/clients/types';
import type { DocumentExplorerItem } from './documentExplorerTypes';

type DocumentActionsMenuProps = {
    item: DocumentExplorerItem;
    onOpen: (document: DocumentExplorerItem) => void;
    onPrint: (document: ClientProjectDocument) => void;
    onDownload: (document: ClientProjectDocument) => void;
    onReplace: (document: ClientProjectDocument) => void;
    onDelete: (document: ClientProjectDocument) => void;
};

type MenuEntry = {
    key: string;
    label: string;
    icon: LucideIcon;
    isDanger?: boolean;
    onSelect: () => void;
};

/**
 * Always-visible "More actions" menu. Entries are gated exclusively by the
 * normalized capability flags — never by role names, URL presence or callback
 * existence. Replace / update-status / delete entries are wired here but stay
 * hidden until the backend resource exposes canReplace / canUpdateStatus /
 * canDelete (currently normalized to false). Delete never executes directly:
 * it routes through the existing confirmation flow in the page.
 */
export function DocumentActionsMenu({
    item,
    onOpen,
    onPrint,
    onDownload,
    onReplace,
    onDelete,
}: DocumentActionsMenuProps) {
    const { t } = useTranslation();

    const entries: MenuEntry[] = [];

    if (item.capabilities.canView) {
        entries.push({ key: 'open', label: t('documentsExplorer.actions.open'), icon: EyeIcon, onSelect: () => onOpen(item) });
    }

    if (item.capabilities.canDownload) {
        entries.push({ key: 'download', label: t('documentsExplorer.actions.download'), icon: DownloadIcon, onSelect: () => onDownload(item) });
    }

    if (item.capabilities.canPrint) {
        entries.push({ key: 'print', label: t('documentsExplorer.actions.print'), icon: PrinterIcon, onSelect: () => onPrint(item) });
    }

    if (item.capabilities.canReplace) {
        entries.push({ key: 'replace', label: t('documentsExplorer.actions.replace'), icon: PencilIcon, onSelect: () => onReplace(item) });
    }

    if (item.capabilities.canDelete) {
        entries.push({ key: 'delete', label: t('documentsExplorer.actions.delete'), icon: TrashIcon, isDanger: true, onSelect: () => onDelete(item) });
    }

    if (entries.length === 0) {
        return null;
    }

    const menuLabel = t('documentsExplorer.actions.more');

    return (
        <Dropdown>
            <Dropdown.Trigger
                aria-label={`${menuLabel} — ${item.name}`}
                className="flex size-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] data-[open]:border-[var(--accent)] data-[open]:text-[var(--accent)]"
            >
                <MoreVerticalIcon size={15} />
            </Dropdown.Trigger>

            <Dropdown.Popover placement="bottom end" className="min-w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                <Dropdown.Menu
                    aria-label={menuLabel}
                    onAction={(key) => {
                        const entry = entries.find((candidate) => candidate.key === key);

                        entry?.onSelect();
                    }}
                >
                    {entries.map((entry) => (
                        <Dropdown.Item
                            key={entry.key}
                            id={entry.key}
                            textValue={entry.label}
                            className={cn(
                                'data-[hover]:bg-[var(--surface-2)]',
                                entry.isDanger && 'text-[var(--danger)] data-[hover]:bg-[var(--danger)]/10',
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <span className="flex size-4 shrink-0 items-center justify-center">
                                    <entry.icon size={14} />
                                </span>
                                <span>{entry.label}</span>
                            </div>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
