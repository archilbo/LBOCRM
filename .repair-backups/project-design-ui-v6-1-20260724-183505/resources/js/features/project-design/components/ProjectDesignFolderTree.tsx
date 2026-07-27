import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, HardDrive } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ProjectDesignFolder } from '../types/projectDesign';

export function ProjectDesignFolderTree({ folders, selectedFolderId, onSelect }: {
    folders: ProjectDesignFolder[]; selectedFolderId: number | null; onSelect: (id: number | null) => void;
}) {
    const rootFolders = folders.filter((f) => !f.parentId);
    const childMap = new Map<number, ProjectDesignFolder[]>();
    for (const f of folders) {
        if (f.parentId) {
            const children = childMap.get(f.parentId) ?? [];
            children.push(f);
            childMap.set(f.parentId, children);
        }
    }
    const [expanded, setExpanded] = useState<Set<number>>(() => new Set(rootFolders.map((f) => f.id)));

    function toggleExpand(id: number) {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function renderFolder(folder: ProjectDesignFolder, depth: number) {
        const children = childMap.get(folder.id) ?? [];
        const isExpanded = expanded.has(folder.id);
        const hasChildren = children.length > 0;
        return (
            <div key={folder.id}>
                <div
                    className={cn(
                        'flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] transition',
                        selectedFolderId === folder.id
                            ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                            : 'text-[var(--foreground)]',
                    )}
                    style={{ paddingLeft: `${8 + depth * 16}px` }}
                >
                    <button
                        type="button"
                        aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
                        onClick={() => toggleExpand(folder.id)}
                        className="flex size-5 shrink-0 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
                    >
                        {hasChildren ? (isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />) : <span className="size-3.5" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelect(folder.id)}
                        aria-label={`Select folder ${folder.name}`}
                        className={cn(
                            'flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition',
                            selectedFolderId === folder.id
                                ? 'text-[var(--accent)]'
                                : 'hover:bg-[var(--surface-2)]',
                        )}
                    >
                    <Folder size={12} className="shrink-0 text-[var(--text-muted)]" />
                    <span className="truncate">{folder.name}</span>
                    <span className="ml-auto text-[10px] text-[var(--text-subtle)]">{folder.filesCount}</span>
                    </button>
                </div>
                {isExpanded && children.map((child) => renderFolder(child, depth + 1))}
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5">
            <button type="button" onClick={() => onSelect(null)} aria-label="Show all files"
                className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] font-medium transition',
                    selectedFolderId === null
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'hover:bg-[var(--surface-2)] text-[var(--foreground)]',
                )}>
                <HardDrive size={13} />
                All files
                <span className="ml-auto text-[10px] text-[var(--text-subtle)]">{folders.reduce((s, f) => s + f.filesCount, 0)}</span>
            </button>
            <div className="mt-0.5 space-y-0.5">
                {rootFolders.map((f) => renderFolder(f, 0))}
            </div>
        </div>
    );
}
