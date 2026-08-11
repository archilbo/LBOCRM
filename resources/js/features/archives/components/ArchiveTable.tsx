import { useMemo } from 'react';
import { IconAlertCircle, IconArrowsSort, IconChevronDown, IconChevronUp, IconLogout, IconDots, IconPencil, IconTrash, IconArrowBackUp } from '@tabler/icons-react';
import { Checkbox, Dropdown } from '@heroui/react';

import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { StatusPill } from '@/components/ui/StatusPill';
import { AppWorkspaceTable, type AppWorkspaceTableColumn } from '@/components/ui/AppWorkspaceTable';
import type { ArchiveRecordRow } from '@/features/archives/types';
import { useTranslation } from '@/lib/i18n';

type ArchiveTableProps = {
    archives: ArchiveRecordRow[];
    selectedIds: Set<number>;
    allSelected: boolean;
    sort: string | undefined;
    onToggleSelect: (id: number) => void;
    onToggleAll: () => void;
    onRowClick: (record: ArchiveRecordRow) => void;
    onCheckoutSingle?: (record: ArchiveRecordRow) => void;
    onReturnSingle?: (record: ArchiveRecordRow) => void;
    onEditSingle?: (record: ArchiveRecordRow) => void;
    onDeleteSingle?: (record: ArchiveRecordRow) => void;
    onSortChange: (sort: string | undefined) => void;
    onCreateFromEmpty?: () => void;
};

function SortHeader({ label, sortKey, sort, onSortChange }: { label: string; sortKey: string; sort: string | undefined; onSortChange: (s: string | undefined) => void }) {
    const [col, dir] = (typeof sort === 'string' ? sort : '').split(':');
    const active = col === sortKey;
    return (
        <button type="button" onClick={() => {
            if (!active) onSortChange(`${sortKey}:asc`);
            else if (dir === 'asc') onSortChange(`${sortKey}:desc`);
            else onSortChange(undefined);
        }}
            className="flex items-center gap-1 text-[10px] capitalize tracking-wide text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]/80 select-none whitespace-nowrap">
            {label}
            {active ? (dir === 'asc' ? <IconChevronUp size={11} /> : <IconChevronDown size={11} />) : <IconArrowsSort size={11} className="opacity-30" />}
        </button>
    );
}

/** Stored as {CITYCODE}-{YEAR}-{SEQ:04d} → display {YEAR}-{SEQ:3+} (e.g. SALE-2002-0001 → 2002-001). */
function formatArchiveNumber(archiveNumber: string): string {
    const parts = archiveNumber.split('-');
    if (parts.length < 3) return archiveNumber;
    const year = parts[parts.length - 2];
    const seq = parts[parts.length - 1];
    if (!year || !/^\d+$/.test(seq)) return archiveNumber;
    return `${year}-${String(Number(seq)).padStart(3, '0')}`;
}

function LocationBreadcrumbs({ record }: { record: ArchiveRecordRow }) {
    const raw = [record.room, record.shelf, record.box].filter((p): p is string => Boolean(p));
    if (raw.length === 0) return <span className="text-[var(--crm-text-muted)]">-</span>;
    // Shelf/box are stored as full paths (SALLE-B-ET01, SALLE-B-ET01-BT01): show only the delta
    // from the previous segment, falling back to the raw value when it isn't a prefixed path.
    const parts = raw.map((value, i) => {
        if (i === 0) return value;
        return value.startsWith(raw[i - 1]) ? value.slice(raw[i - 1].length).replace(/^[-\s/]+/, '') : value;
    });
    return (
        <span className="text-[11px] text-[var(--crm-text-muted)] whitespace-nowrap">
            {parts.map((p, i) => (
                <span key={i}>
                    {i > 0 && <span className="text-[var(--crm-text-soft)]/60 mx-1">/</span>}
                    {p}
                </span>
            ))}
        </span>
    );
}

export function ArchiveTable({
    archives,
    selectedIds,
    allSelected,
    sort,
    onToggleSelect,
    onToggleAll,
    onRowClick,
    onCheckoutSingle,
    onReturnSingle,
    onEditSingle,
    onDeleteSingle,
    onSortChange,
    onCreateFromEmpty,
}: ArchiveTableProps) {
    const { t } = useTranslation();

    const columns = useMemo<AppWorkspaceTableColumn<ArchiveRecordRow>[]>(() => [
        {
            id: 'select',
            label: (
                <Checkbox
                    isSelected={allSelected}
                    isIndeterminate={selectedIds.size > 0 && !allSelected}
                    onChange={onToggleAll}
                    aria-label={t('table.selectAll')}
                />
            ),
            headerClassName: 'w-9',
            reorderable: false,
            fixedPosition: 'start',
            render: (record) => (
                <span className="inline-flex items-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        isSelected={selectedIds.has(record.id)}
                        onChange={() => onToggleSelect(record.id)}
                        aria-label={`${t('table.select')} ${record.archiveNumber}`}
                    />
                </span>
            ),
        },
        {
            id: 'arc',
            label: <SortHeader label={t('table.arc')} sortKey="archive_number" sort={sort} onSortChange={onSortChange} />,
            render: (record) => <span className="text-[12px] text-[var(--crm-text)] whitespace-nowrap">{formatArchiveNumber(record.archiveNumber)}</span>,
        },
        {
            id: 'project',
            label: t('table.project'),
            render: (record) => (
                <div className="min-w-0 max-w-[220px]">
                    <p className="truncate font-medium text-[var(--crm-text)]">{record.projectObject || '-'}</p>
                    <p className="truncate text-[11px] text-[var(--crm-text-muted)]">{record.clientName || '-'}</p>
                </div>
            ),
        },
        {
            id: 'city',
            label: t('table.city'),
            render: (record) => record.city ? (
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-black/10"
                        style={{ backgroundColor: record.city.color }}
                        aria-label={record.city.name} />
                    <span className="text-xs text-[var(--crm-text-muted)]">{record.city.code}</span>
                </span>
            ) : <span className="text-xs text-[var(--crm-text-muted)]">—</span>,
        },
        {
            id: 'location',
            label: t('table.location'),
            render: (record) => <LocationBreadcrumbs record={record} />,
        },
        {
            id: 'status',
            label: <SortHeader label={t('table.status')} sortKey="status" sort={sort} onSortChange={onSortChange} />,
            render: (record) => (
                <StatusPill
                    status={record.status}
                    isOverdue={record.isOverdue}
                    label={t(`status.${record.isOverdue ? 'overdue' : record.status}`)}
                />
            ),
        },
        {
            id: 'requester',
            label: t('table.requester'),
            render: (record) => <span className="block max-w-[140px] truncate text-[var(--crm-text-muted)]">{record.requestedBy || '-'}</span>,
        },
        {
            id: 'due',
            label: <SortHeader label={t('table.due')} sortKey="due_at" sort={sort} onSortChange={onSortChange} />,
            render: (record) => record.isOverdue ? (
                <span className="inline-flex items-center gap-1 text-[var(--crm-text)]/80 tabular-nums whitespace-nowrap"><IconAlertCircle size={11} className="text-[var(--crm-danger)]" />{record.dueAt}</span>
            ) : record.dueAt ? (
                <span className="text-[var(--crm-text-muted)] tabular-nums whitespace-nowrap">{record.dueAt}</span>
            ) : <span className="text-[var(--crm-text-soft)]">—</span>,
        },
        {
            id: 'actions',
            label: '',
            headerClassName: 'w-10',
            reorderable: false,
            fixedPosition: 'end',
            render: (record) => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    {onCheckoutSingle || onReturnSingle || onEditSingle || onDeleteSingle ? (
                        <Dropdown>
                            <Dropdown.Trigger
                                className="flex size-7 items-center justify-center rounded text-[var(--crm-text-soft)] transition hover:bg-[var(--crm-elevated)] hover:text-[var(--crm-text)]/80 data-[open]:text-[var(--crm-gold)]"
                                aria-label={`${t('table.actions')} ${record.archiveNumber}`}
                            >
                                <IconDots size={14} />
                            </Dropdown.Trigger>
                            <Dropdown.Popover placement="bottom end" className="min-w-36 rounded-xl border border-[var(--crm-border)] bg-[var(--crm-elevated)] p-1 shadow-xl">
                                <Dropdown.Menu
                                    aria-label={t('table.actions')}
                                    itemClasses={{ base: 'rounded-lg px-2 py-1 text-[11px] font-medium text-[var(--crm-text)]/80 transition data-[hover]:bg-[var(--crm-gold)]/10' }}
                                >
                                    {onCheckoutSingle ? (
                                        <Dropdown.Item key="checkout" textValue={t('table.checkout')} onAction={() => onCheckoutSingle?.(record)}>
                                            <div className="flex items-center gap-2"><span className="flex size-4 shrink-0 items-center justify-center"><IconLogout size={12} /></span><span>{t('table.checkout')}</span></div>
                                        </Dropdown.Item>
                                    ) : null}
                                    {onReturnSingle ? (
                                        <Dropdown.Item key="return" textValue={t('table.return')} onAction={() => onReturnSingle?.(record)}>
                                            <div className="flex items-center gap-2"><span className="flex size-4 shrink-0 items-center justify-center"><IconArrowBackUp size={12} /></span><span>{t('table.return')}</span></div>
                                        </Dropdown.Item>
                                    ) : null}
                                    {onEditSingle ? (
                                        <Dropdown.Item key="edit" textValue={t('table.edit')} onAction={() => onEditSingle?.(record)}>
                                            <div className="flex items-center gap-2"><span className="flex size-4 shrink-0 items-center justify-center"><IconPencil size={12} /></span><span>{t('table.edit')}</span></div>
                                        </Dropdown.Item>
                                    ) : null}
                                    {onDeleteSingle ? (
                                        <Dropdown.Item key="delete" textValue={t('table.delete')} onAction={() => onDeleteSingle?.(record)} className="text-[var(--crm-danger)] data-[hover]:bg-[var(--crm-danger)]/10">
                                            <div className="flex items-center gap-2"><span className="flex size-4 shrink-0 items-center justify-center"><IconTrash size={12} /></span><span>{t('table.delete')}</span></div>
                                        </Dropdown.Item>
                                    ) : null}
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    ) : null}
                </div>
            ),
        },
    ], [allSelected, selectedIds, sort, t, onToggleSelect, onToggleAll, onSortChange, onCheckoutSingle, onReturnSingle, onEditSingle, onDeleteSingle]);

    return (
        <AppWorkspaceTable
            ariaLabel={t('archivesWorkspace.title')}
            columns={columns}
            data={archives}
            rowKey={(record) => record.id}
            minTableWidthClassName="min-w-max"
            onRowPress={onRowClick}
            className="flex min-h-0 flex-1 flex-col"
            emptyContent={
                <AppEmptyState
                    title={t('empty.noArchives')}
                    description={t('empty.tryAdjusting')}
                    action={onCreateFromEmpty ? (
                        <button type="button" onClick={() => onCreateFromEmpty()}
                            className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--text)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]">
                            {t('empty.clearFilters')}
                        </button>
                    ) : undefined}
                />
            }
        />
    );
}
