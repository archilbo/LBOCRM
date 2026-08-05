import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { Button, Chip, Dropdown, Input, Tooltip } from '@heroui/react';
import { IconChevronDown, IconChevronRight, IconFileText, IconFolder, IconFolderOpen, IconFolderUp, IconGripVertical, IconMessage2, IconDots, IconPencil } from '@tabler/icons-react';

import { cn } from '@/lib/cn';
import { toast } from 'sonner';
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
    onRenameFile: (file: ProjectDesignFile, name: string) => Promise<void>;
    onRenameFolder: (folder: ProjectDesignFolder, name: string) => Promise<void>;
    onMoveFile: (file: ProjectDesignFile, folderId: number | null) => Promise<void>;
    onMoveFolder: (folder: ProjectDesignFolder, parentId: number | null) => Promise<void>;
    command?: ProjectDesignTreeCommand | null;
};

type DragItem = { kind: 'file' | 'folder'; id: number };
type RenameTarget = { kind: DragItem['kind']; id: number; value: string } | null;
const DRAG_TYPE = 'application/x-archilbo-project-design-tree';

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
    onRenameFile,
    onRenameFolder,
    onMoveFile,
    onMoveFolder,
    command,
}: Props) {
    const storageKey = `project-design:${dossierId}:expanded-folders`;
    const selectedRowRef = useRef<HTMLDivElement | null>(null);
    const fileSelectTimerRef = useRef<number | null>(null);
    const folderToggleTimerRef = useRef<number | null>(null);
    const expansionInitializedRef = useRef(false);

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
    const [renameTarget, setRenameTarget] = useState<RenameTarget>(null);
    const [renameValue, setRenameValue] = useState('');
    const [savingRename, setSavingRename] = useState(false);
    const [dropTarget, setDropTarget] = useState<number | 'root' | null>(null);

    useEffect(() => {
        if (expansionInitializedRef.current || rootFolders.length === 0) return;

        expansionInitializedRef.current = true;

        // New explorers open their root folders once. An empty persisted set means
        // the user intentionally collapsed everything and must be preserved.
        const hasSavedExpansion = typeof window !== 'undefined'
            && window.localStorage.getItem(storageKey) !== null;

        if (!hasSavedExpansion) {
            setExpanded(new Set(rootFolders.map((folder) => folder.id)));
        }
    }, [rootFolders, storageKey]);

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

    useEffect(() => () => {
        if (fileSelectTimerRef.current !== null) window.clearTimeout(fileSelectTimerRef.current);
        if (folderToggleTimerRef.current !== null) window.clearTimeout(folderToggleTimerRef.current);
    }, []);

    const toggleFolder = useCallback((folderId: number) => {
        setExpanded((current) => {
            const next = new Set(current);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
    }, []);

    function clearPendingInteractions() {
        if (fileSelectTimerRef.current !== null) {
            window.clearTimeout(fileSelectTimerRef.current);
            fileSelectTimerRef.current = null;
        }
        if (folderToggleTimerRef.current !== null) {
            window.clearTimeout(folderToggleTimerRef.current);
            folderToggleTimerRef.current = null;
        }
    }

    function queueFileSelect(file: ProjectDesignFile) {
        clearPendingInteractions();
        fileSelectTimerRef.current = window.setTimeout(() => {
            onFileSelect(file);
            fileSelectTimerRef.current = null;
        }, 180);
    }

    function queueFolderToggle(folderId: number) {
        clearPendingInteractions();
        folderToggleTimerRef.current = window.setTimeout(() => {
            toggleFolder(folderId);
            folderToggleTimerRef.current = null;
        }, 180);
    }

    function startRename(target: NonNullable<RenameTarget>) {
        clearPendingInteractions();
        setRenameTarget(target);
        setRenameValue(target.value);
    }

    async function submitRename() {
        if (!renameTarget || savingRename) return;

        const name = renameValue.trim();
        if (!name) {
            toast.error('A name is required.');
            return;
        }
        if (name === renameTarget.value) {
            setRenameTarget(null);
            return;
        }

        setSavingRename(true);
        try {
            if (renameTarget.kind === 'file') {
                const file = files.find((item) => item.id === renameTarget.id);
                if (file) await onRenameFile(file, name);
            } else {
                const folder = folders.find((item) => item.id === renameTarget.id);
                if (folder) await onRenameFolder(folder, name);
            }
            setRenameTarget(null);
        } catch {
            toast.error('Could not rename this item.');
        } finally {
            setSavingRename(false);
        }
    }

    function writeDragItem(event: DragEvent<HTMLElement>, item: DragItem) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData(DRAG_TYPE, JSON.stringify(item));
    }

    function readDragItem(event: DragEvent<HTMLElement>): DragItem | null {
        try {
            const item = JSON.parse(event.dataTransfer.getData(DRAG_TYPE)) as DragItem;
            return item && (item.kind === 'file' || item.kind === 'folder') && Number.isInteger(item.id) ? item : null;
        } catch {
            return null;
        }
    }

    async function moveDroppedItem(event: DragEvent<HTMLElement>, targetFolderId: number | null) {
        event.preventDefault();
        event.stopPropagation();
        setDropTarget(null);
        const item = readDragItem(event);
        if (!item) return;

        try {
            if (item.kind === 'file') {
                const file = files.find((candidate) => candidate.id === item.id);
                if (file && file.folderId !== targetFolderId) await onMoveFile(file, targetFolderId);
            } else {
                const folder = folders.find((candidate) => candidate.id === item.id);
                if (folder && folder.parentId !== targetFolderId) await onMoveFolder(folder, targetFolderId);
            }
        } catch {
            toast.error('Could not move this item.');
        }
    }

    function isDescendantFolder(candidateId: number, ancestorId: number): boolean {
        let current = folderById.get(candidateId);
        while (current?.parentId != null) {
            if (current.parentId === ancestorId) return true;
            current = folderById.get(current.parentId);
        }
        return false;
    }

    function ExplorerActions({
        label,
        currentFolderId,
        excludeFolderId,
        onRename,
        onMove,
    }: {
        label: string;
        currentFolderId: number | null;
        excludeFolderId?: number;
        onRename: () => void;
        onMove: (folderId: number | null) => Promise<void>;
    }) {
        const destinations = folders.filter((folder) => (
            folder.id !== excludeFolderId
            && (excludeFolderId == null || !isDescendantFolder(folder.id, excludeFolderId))
        ));

        const runAction = (key: string) => {
            if (key === 'rename') {
                onRename();
                return;
            }

            const destination = key === 'root' ? null : Number(key.replace('move:', ''));
            if (key !== 'root' && !Number.isInteger(destination)) return;
            if (destination === currentFolderId) return;

            void onMove(destination);
        };

        return (
            <Dropdown>
                <Dropdown.Trigger
                    aria-label={`Actions for ${label}`}
                    className="flex size-6 items-center justify-center rounded-md text-[var(--text-subtle)] outline-none transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] data-[open]:bg-[var(--surface-2)] data-[open]:text-[var(--accent)]"
                >
                    <IconDots size={13} />
                </Dropdown.Trigger>
                <Dropdown.Popover placement="bottom end" className="z-[180] min-w-48 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                    <Dropdown.Menu aria-label={`Actions for ${label}`} onAction={(key) => runAction(String(key))} className="outline-none">
                        <Dropdown.Item key="rename"><IconPencil size={13} /><span>Rename</span></Dropdown.Item>
                        {currentFolderId !== null ? <Dropdown.Item key="root"><IconFolderUp size={13} /><span>Move to project root</span></Dropdown.Item> : null}
                        {destinations
                            .filter((folder) => folder.id !== currentFolderId)
                            .map((folder) => (
                                <Dropdown.Item key={`move:${folder.id}`} id={`move:${folder.id}`}>
                                    <IconFolder size={13} /><span className="truncate">Move to {folder.name}</span>
                                </Dropdown.Item>
                            ))}
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        );
    }

    function renderFile(file: ProjectDesignFile, depth: number) {
        const selected = selectedFileId === file.id;
        return (
            <div
                key={file.id}
                ref={selected ? selectedRowRef : undefined}
                data-project-design-file-id={file.id}
                draggable={renameTarget?.kind !== 'file' || renameTarget.id !== file.id}
                onDragStart={(event) => writeDragItem(event, { kind: 'file', id: file.id })}
                className="group relative cursor-grab active:cursor-grabbing"
            >
                {renameTarget?.kind === 'file' && renameTarget.id === file.id ? (
                    <Input
                        autoFocus
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        onBlur={() => void submitRename()}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') void submitRename();
                            if (event.key === 'Escape') setRenameTarget(null);
                        }}
                        aria-label="Rename design file"
                        variant="secondary"
                        className="m-1 h-7 text-[10px]"
                        style={{ marginLeft: `${6 + depth * 13}px`, width: `calc(100% - ${12 + depth * 13}px)` }}
                        isDisabled={savingRename}
                    />
                ) : (
                    <>
                        <Button
                            size="sm"
                            variant="ghost"
                            fullWidth
                            onPress={() => queueFileSelect(file)}
                            aria-pressed={selected}
                            className={cn(
                                'group h-7 min-h-7 justify-start rounded-none border-0 px-1.5 pr-8 text-left text-[10px] font-normal',
                                selected
                                    ? 'bg-[var(--accent)]/18 text-[var(--foreground)]'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
                            )}
                            style={{ paddingLeft: `${10 + depth * 13}px` }}
                        >
                            <IconGripVertical size={10} className="shrink-0 text-[var(--text-subtle)] opacity-0 transition group-hover:opacity-70" />
                            <IconFileText size={13} className={cn('shrink-0', selected ? 'text-[var(--accent)]' : 'text-sky-400/75')} />
                            <span className="min-w-0 flex-1 truncate" onDoubleClick={(event) => { event.stopPropagation(); startRename({ kind: 'file', id: file.id, value: file.name }); }}>
                                {file.name}
                            </span>
                            {file.openRemarksCount > 0 ? (
                                <span className="flex shrink-0 items-center gap-0.5 text-[9px] text-amber-300"><IconMessage2 size={10} />{file.openRemarksCount}</span>
                            ) : null}
                        </Button>
                        <div className="absolute right-1 top-0.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100" onPointerDown={(event) => event.stopPropagation()}>
                            <ExplorerActions
                                label={file.name}
                                currentFolderId={file.folderId}
                                onRename={() => startRename({ kind: 'file', id: file.id, value: file.name })}
                                onMove={(folderId) => onMoveFile(file, folderId)}
                            />
                        </div>
                    </>
                )}
            </div>
        );
    }

    function renderFolder(folder: ProjectDesignFolder, depth: number) {
        const children = childFolders.get(folder.id) ?? [];
        const folderFiles = filesByFolder.get(folder.id) ?? [];
        const hasChildren = children.length > 0 || folderFiles.length > 0;
        const isExpanded = expanded.has(folder.id);
        const FolderIcon = isExpanded ? IconFolderOpen : IconFolder;

        return (
            <div key={folder.id}>
                <div
                    draggable={renameTarget?.kind !== 'folder' || renameTarget.id !== folder.id}
                    onDragStart={(event) => writeDragItem(event, { kind: 'folder', id: folder.id })}
                    onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); setDropTarget(folder.id); }}
                    onDragLeave={(event) => {
                        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                        setDropTarget((current) => current === folder.id ? null : current);
                    }}
                    onDrop={(event) => void moveDroppedItem(event, folder.id)}
                    className={cn(
                        'group flex h-7 min-w-0 items-center border-y border-transparent transition-colors hover:bg-[var(--surface-2)]',
                        dropTarget === folder.id && 'border-[var(--accent)]/55 bg-[var(--accent)]/10',
                    )}
                    style={{ paddingLeft: `${depth * 13}px` }}
                >
                    <Tooltip delay={500}>
                        <Tooltip.Trigger>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                aria-label={isExpanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
                                isDisabled={!hasChildren}
                                onPress={() => { clearPendingInteractions(); toggleFolder(folder.id); }}
                                className="h-7 w-5 min-w-5 rounded-none text-[var(--text-subtle)] disabled:opacity-30"
                            >
                                {hasChildren ? (isExpanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />) : <span className="size-3" />}
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>{isExpanded ? 'Collapse' : 'Expand'}</Tooltip.Content>
                    </Tooltip>
                    {renameTarget?.kind === 'folder' && renameTarget.id === folder.id ? (
                        <Input
                            autoFocus
                            value={renameValue}
                            onChange={(event) => setRenameValue(event.target.value)}
                            onBlur={() => void submitRename()}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') void submitRename();
                                if (event.key === 'Escape') setRenameTarget(null);
                            }}
                            aria-label="Rename design folder"
                            variant="secondary"
                            className="mx-1 h-7 flex-1 text-[10px]"
                            isDisabled={savingRename}
                        />
                    ) : (
                        <Button
                            size="sm"
                            variant="ghost"
                            onPress={() => hasChildren && queueFolderToggle(folder.id)}
                            className="h-7 min-w-0 flex-1 justify-start gap-1.5 rounded-none px-0.5 text-left text-[10px] font-normal text-[var(--foreground)]"
                        >
                            <IconGripVertical size={10} className="shrink-0 text-[var(--text-subtle)] opacity-0 transition group-hover:opacity-70" />
                            <FolderIcon size={13} className="shrink-0 text-amber-300/85" />
                            <span className="min-w-0 flex-1 truncate" onDoubleClick={(event) => { event.stopPropagation(); startRename({ kind: 'folder', id: folder.id, value: folder.name }); }}>
                                {folder.name}
                            </span>
                            <Chip size="sm" variant="soft" className="mr-1 h-4 min-w-5 shrink-0 px-1 text-[8px] text-[var(--text-subtle)]">
                                {folder.filesCount}
                            </Chip>
                        </Button>
                    )}
                    {renameTarget?.kind !== 'folder' || renameTarget.id !== folder.id ? (
                        <div className="mr-1 shrink-0 opacity-100 transition md:opacity-0 md:group-hover:opacity-100" onPointerDown={(event) => event.stopPropagation()}>
                            <ExplorerActions
                                label={folder.name}
                                currentFolderId={folder.parentId}
                                excludeFolderId={folder.id}
                                onRename={() => startRename({ kind: 'folder', id: folder.id, value: folder.name })}
                                onMove={(parentId) => onMoveFolder(folder, parentId)}
                            />
                        </div>
                    ) : null}
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
            <div
                onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); setDropTarget('root'); }}
                onDragLeave={(event) => {
                    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                    setDropTarget((current) => current === 'root' ? null : current);
                }}
                onDrop={(event) => void moveDroppedItem(event, null)}
                className={cn(
                    'mx-2 mb-1 flex h-6 items-center justify-center rounded-md border border-dashed border-[var(--border)] text-[8px] font-medium uppercase tracking-[0.1em] text-[var(--text-subtle)] transition-colors',
                    dropTarget === 'root' && 'border-[var(--accent)]/70 bg-[var(--accent)]/10 text-[var(--accent)]',
                )}
            >
                {dropTarget === 'root' ? 'Release to move to root' : 'Project Design root'}
            </div>
            {rootFolders.map((folder) => renderFolder(folder, 0))}
            {rootFiles.map((file) => renderFile(file, 0))}
            {folders.length === 0 && files.length === 0 ? (
                <div className="px-3 py-8 text-center text-[9px] leading-4 text-[var(--text-muted)]">
                    No folders or files match this view.
                </div>
            ) : null}
        </div>
    );
}
