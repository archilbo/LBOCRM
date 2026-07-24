import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Chip, Tooltip } from '@heroui/react';
import {
    ChevronDown,
    ChevronRight,
    FileText,
    Folder,
    FolderOpen,
    MessageSquareText,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ProjectDesignFile, ProjectDesignFolder } from '../types/projectDesign';

export type ProjectDesignTreeCommand = {
    key: number;
    type: 'expand-all' | 'collapse-all';
};

type Props = {
    dossierId: number;
    folders: ProjectDesignFolder[];
    files: ProjectDesignFile[];
    selectedFileId: number | null;
    onFileSelect: (file: ProjectDesignFile) => void;
    command?: ProjectDesignTreeCommand | null;
};

function fileExtension(name: string): string {
    const extension = name.split('.').pop();
    return extension && extension !== name ? extension.toUpperCase() : 'FILE';
}

function sortFolders(left: ProjectDesignFolder, right: ProjectDesignFolder) {
    return left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' });
}

function sortFiles(left: ProjectDesignFile, right: ProjectDesignFile) {
    return left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' });
}

export function ProjectDesignFolderTree({
    dossierId,
    folders,
    files,
    selectedFileId,
    onFileSelect,
    command,
}: Props) {
    const storageKey = `project-design:${dossierId}:expanded-folders`;
    const selectedRowRef = useRef<HTMLDivElement | null>(null);

    const folderById = useMemo(
        () => new Map(folders.map((folder) => [folder.id, folder])),
        [folders],
    );
    const rootFolders = useMemo(
        () => folders.filter((folder) => folder.parentId == null).sort(sortFolders),
        [folders],
    );
    const childFolders = useMemo(() => {
        const map = new Map<number, ProjectDesignFolder[]>();
        for (const folder of folders) {
            if (folder.parentId == null) continue;
            const current = map.get(folder.parentId) ?? [];
            current.push(folder);
            map.set(folder.parentId, current);
        }
        for (const children of map.values()) children.sort(sortFolders);
        return map;
    }, [folders]);
    const filesByFolder = useMemo(() => {
        const map = new Map<number | null, ProjectDesignFile[]>();
        for (const file of files) {
            const key = file.folderId ?? null;
            const current = map.get(key) ?? [];
            current.push(file);
            map.set(key, current);
        }
        for (const items of map.values()) items.sort(sortFiles);
        return map;
    }, [files]);

    const [expanded, setExpanded] = useState<Set<number>>(() => {
        if (typeof window === 'undefined') return new Set<number>();
        try {
            const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as number[];
            return new Set(saved.filter((id) => Number.isInteger(id)));
        } catch {
            return new Set<number>();
        }
    });

    useEffect(() => {
        if (expanded.size > 0 || rootFolders.length === 0) return;
        setExpanded(new Set(rootFolders.map((folder) => folder.id)));
    }, [expanded.size, rootFolders]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(storageKey, JSON.stringify([...expanded]));
    }, [expanded, storageKey]);

    useEffect(() => {
        if (!command) return;
        setExpanded(command.type === 'expand-all' ? new Set(folders.map((folder) => folder.id)) : new Set());
    }, [command, folders]);

    useEffect(() => {
        if (!selectedFileId) return;
        const selectedFile = files.find((file) => file.id === selectedFileId);
        if (!selectedFile?.folderId) return;

        setExpanded((current) => {
            const next = new Set(current);
            let folder = folderById.get(selectedFile.folderId ?? 0);
            let changed = false;
            while (folder) {
                if (!next.has(folder.id)) {
                    next.add(folder.id);
                    changed = true;
                }
                folder = folder.parentId ? folderById.get(folder.parentId) : undefined;
            }
            return changed ? next : current;
        });
    }, [files, folderById, selectedFileId]);

    useEffect(() => {
        if (!selectedFileId) return;
        const timer = window.setTimeout(() => {
            selectedRowRef.current?.scrollIntoView({ block: 'nearest' });
        }, 40);
        return () => window.clearTimeout(timer);
    }, [expanded, selectedFileId]);

    const toggleFolder = useCallback((folderId: number) => {
        setExpanded((current) => {
            const next = new Set(current);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
    }, []);

    function renderFile(file: ProjectDesignFile, depth: number) {
        const selected = selectedFileId === file.id;
        return (
            <div
                key={file.id}
                ref={selected ? selectedRowRef : undefined}
                data-project-design-file-id={file.id}
                className="relative"
            >
                <Button
                    size="sm"
                    variant="ghost"
                    fullWidth
                    onPress={() => onFileSelect(file)}
                    aria-pressed={selected}
                    className={cn(
                        'group h-7 min-h-7 justify-start rounded-none border-0 px-1.5 text-left text-[11px] font-normal',
                        selected
                            ? 'bg-[var(--accent)]/18 text-[var(--foreground)]'
                            : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                    )}
                    style={{ paddingLeft: `${10 + depth * 13}px` }}
                >
                    <FileText size={13} className={cn('shrink-0', selected ? 'text-[var(--accent)]' : 'text-sky-400/75')} />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    {file.openRemarksCount > 0 ? (
                        <span className="flex shrink-0 items-center gap-0.5 text-[9px] text-amber-300">
                            <MessageSquareText size={10} />
                            {file.openRemarksCount}
                        </span>
                    ) : null}
                    <span className="hidden shrink-0 text-[8px] uppercase text-[var(--text-subtle)] group-hover:inline">
                        {fileExtension(file.name)}
                    </span>
                </Button>
            </div>
        );
    }

    function renderFolder(folder: ProjectDesignFolder, depth: number) {
        const children = childFolders.get(folder.id) ?? [];
        const folderFiles = filesByFolder.get(folder.id) ?? [];
        const hasChildren = children.length > 0 || folderFiles.length > 0;
        const isExpanded = expanded.has(folder.id);
        const FolderIcon = isExpanded ? FolderOpen : Folder;

        return (
            <div key={folder.id}>
                <div className="group flex h-7 min-w-0 items-center hover:bg-[var(--surface-2)]" style={{ paddingLeft: `${depth * 13}px` }}>
                    <Tooltip delay={500}>
                        <Tooltip.Trigger>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                aria-label={isExpanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
                                isDisabled={!hasChildren}
                                onPress={() => toggleFolder(folder.id)}
                                className="h-7 w-5 min-w-5 rounded-none text-[var(--text-subtle)] disabled:opacity-30"
                            >
                                {hasChildren ? (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <span className="size-3" />}
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>{isExpanded ? 'Collapse' : 'Expand'}</Tooltip.Content>
                    </Tooltip>
                    <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => hasChildren && toggleFolder(folder.id)}
                        className="h-7 min-w-0 flex-1 justify-start gap-1.5 rounded-none px-0.5 text-left text-[11px] font-normal text-[var(--foreground)]"
                    >
                        <FolderIcon size={13} className="shrink-0 text-amber-300/85" />
                        <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                        <Chip size="sm" variant="soft" className="mr-1 h-4 min-w-5 shrink-0 px-1 text-[8px] text-[var(--text-subtle)]">
                            {folder.filesCount}
                        </Chip>
                    </Button>
                </div>
                {isExpanded ? (
                    <div className="relative">
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute bottom-0 top-0 w-px bg-[var(--border)]/65"
                            style={{ left: `${9 + depth * 13}px` }}
                        />
                        {children.map((child) => renderFolder(child, depth + 1))}
                        {folderFiles.map((file) => renderFile(file, depth + 1))}
                    </div>
                ) : null}
            </div>
        );
    }

    const rootFiles = filesByFolder.get(null) ?? [];

    return (
        <div className="min-w-0 py-0.5" role="tree" aria-label="Project design files">
            {rootFolders.map((folder) => renderFolder(folder, 0))}
            {rootFiles.map((file) => renderFile(file, 0))}
            {folders.length === 0 && files.length === 0 ? (
                <div className="px-3 py-8 text-center text-[10px] leading-4 text-[var(--text-muted)]">
                    No folders or files match this view.
                </div>
            ) : null}
        </div>
    );
}
