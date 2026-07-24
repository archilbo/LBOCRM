import { useMemo, useState } from 'react';
import { Button, Chip, Tooltip } from '@heroui/react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, HardDrive } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ProjectDesignFolder } from '../types/projectDesign';

export function ProjectDesignFolderTree({
    folders,
    selectedFolderId,
    onSelect,
}: {
    folders: ProjectDesignFolder[];
    selectedFolderId: number | null;
    onSelect: (id: number | null) => void;
}) {
    const rootFolders = useMemo(() => folders.filter((folder) => !folder.parentId), [folders]);
    const childMap = useMemo(() => {
        const map = new Map<number, ProjectDesignFolder[]>();
        for (const folder of folders) {
            if (!folder.parentId) continue;
            const children = map.get(folder.parentId) ?? [];
            children.push(folder);
            map.set(folder.parentId, children);
        }
        return map;
    }, [folders]);
    const [expanded, setExpanded] = useState<Set<number>>(
        () => new Set(rootFolders.map((folder) => folder.id)),
    );

    function toggleExpand(id: number) {
        setExpanded((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function renderFolder(folder: ProjectDesignFolder, depth: number) {
        const children = childMap.get(folder.id) ?? [];
        const isExpanded = expanded.has(folder.id);
        const isSelected = selectedFolderId === folder.id;
        const FolderIcon = isExpanded && children.length ? FolderOpen : Folder;

        return (
            <div key={folder.id} className="space-y-0.5">
                <div className="flex items-center gap-0.5" style={{ paddingLeft: `${depth * 12}px` }}>
                    {children.length ? (
                        <Tooltip delay={450}>
                            <Tooltip.Trigger>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="ghost"
                                    aria-label={isExpanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
                                    onPress={() => toggleExpand(folder.id)}
                                    className="h-7 w-7 min-w-0 shrink-0 rounded-lg text-[var(--text-muted)]"
                                >
                                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>{isExpanded ? 'Collapse folder' : 'Expand folder'}</Tooltip.Content>
                        </Tooltip>
                    ) : (
                        <span className="block size-7 shrink-0" aria-hidden="true" />
                    )}

                    <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => onSelect(folder.id)}
                        aria-pressed={isSelected}
                        className={cn(
                            'h-7 min-w-0 flex-1 justify-start gap-2 rounded-lg px-2 text-left text-[11px]',
                            isSelected
                                ? 'bg-[var(--accent)]/12 text-[var(--accent)]'
                                : 'text-[var(--foreground)] hover:bg-[var(--surface-2)]',
                        )}
                    >
                        <FolderIcon size={12} className="shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                        <Chip size="sm" variant="soft" className="h-4 min-w-5 px-1 text-[8px]">
                            {folder.filesCount}
                        </Chip>
                    </Button>
                </div>
                {isExpanded ? children.map((child) => renderFolder(child, depth + 1)) : null}
            </div>
        );
    }

    const total = folders.reduce((sum, folder) => sum + folder.filesCount, 0);

    return (
        <div className="space-y-0.5">
            <Button
                size="sm"
                variant="ghost"
                onPress={() => onSelect(null)}
                aria-pressed={selectedFolderId === null}
                className={cn(
                    'h-8 w-full justify-start gap-2 rounded-lg px-2.5 text-[11px] font-medium',
                    selectedFolderId === null
                        ? 'bg-[var(--accent)]/12 text-[var(--accent)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--surface-2)]',
                )}
            >
                <HardDrive size={13} />
                <span className="min-w-0 flex-1 text-left">All files</span>
                <Chip size="sm" variant="soft" className="h-4 min-w-5 px-1 text-[8px]">
                    {total}
                </Chip>
            </Button>
            {rootFolders.map((folder) => renderFolder(folder, 0))}
        </div>
    );
}
