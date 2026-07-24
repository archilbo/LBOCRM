import { useState } from 'react';
import { Card, Chip, Input, ListBox, Select, Spinner } from '@heroui/react';
import { Calendar, MessageSquareText, Search, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useRemarks } from '@/features/project-design/hooks/useProjectDesignQueries';
import {
    formatProjectDesignDate,
    SEVERITY_STYLES,
} from '@/features/project-design/utils/projectDesignFormatters';

const REMARK_STATUSES = ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened'];
const REMARK_SEVERITIES = ['critical', 'major', 'minor', 'cosmetic', 'question'];
const STATUS_STYLES: Record<string, string> = {
    open: 'bg-amber-500/10 text-amber-300',
    assigned: 'bg-blue-500/10 text-blue-300',
    in_progress: 'bg-violet-500/10 text-violet-300',
    resolved: 'bg-emerald-500/10 text-emerald-300',
    closed: 'bg-[var(--surface-2)] text-[var(--text-muted)]',
    reopened: 'bg-orange-500/10 text-orange-300',
};

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <Select
            aria-label={label}
            placeholder={label}
            value={value || '__all__'}
            onChange={(key) => onChange(!key || key === '__all__' ? '' : String(key))}
            variant="secondary"
            className="min-w-36"
        >
            <Select.Trigger className="h-8 text-[10px]"><Select.Value /><Select.Indicator /></Select.Trigger>
            <Select.Popover className="z-[160] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl">
                <ListBox>
                    <ListBox.Item id="__all__" textValue={`All ${label.toLowerCase()}`} className="rounded-lg px-2 py-1.5 text-[11px]">All {label.toLowerCase()}</ListBox.Item>
                    {options.map((option) => (
                        <ListBox.Item key={option} id={option} textValue={option} className="rounded-lg px-2 py-1.5 text-[11px] capitalize">
                            {option.replace(/_/g, ' ')}
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );
}

export function DesignRemarksTab({ dossierId }: { dossierId: number }) {
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const { data, isLoading } = useRemarks(dossierId, {
        search: search || undefined,
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
    });
    const remarks = data?.data ?? [];

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-[var(--text-subtle)]" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search remarks"
                        aria-label="Search remarks"
                        variant="secondary"
                        fullWidth
                        className="h-8 pl-8 text-[11px]"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    <FilterSelect label="Severities" value={severityFilter} options={REMARK_SEVERITIES} onChange={setSeverityFilter} />
                    <FilterSelect label="Statuses" value={statusFilter} options={REMARK_STATUSES} onChange={setStatusFilter} />
                </div>
            </div>

            {isLoading ? (
                <div className="flex min-h-52 items-center justify-center"><Spinner size="sm" /></div>
            ) : remarks.length === 0 ? (
                <Card variant="secondary" className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/25">
                    <Card.Content className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]"><MessageSquareText size={17} /></span>
                        <p className="mt-2 text-[12px] font-medium text-[var(--foreground)]">No remarks found</p>
                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">Remarks appear after a design annotation is reviewed.</p>
                    </Card.Content>
                </Card>
            ) : (
                <div className="grid gap-2 xl:grid-cols-2">
                    {remarks.map((remark) => (
                        <Card key={remark.id} variant="secondary" className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                            <Card.Content className="p-3">
                                <div className="flex items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <Chip size="sm" variant="soft" className={cn('h-4 px-1 text-[8px] capitalize', SEVERITY_STYLES[remark.severity] ?? '')}>{remark.severity}</Chip>
                                            <Chip size="sm" variant="soft" className={cn('h-4 px-1 text-[8px] capitalize', STATUS_STYLES[remark.status] ?? '')}>{remark.status.replace(/_/g, ' ')}</Chip>
                                        </div>
                                        <p className="mt-2 text-[11px] font-semibold text-[var(--foreground)]">{remark.title}</p>
                                        {remark.description ? <p className="mt-1 line-clamp-3 text-[10px] leading-4 text-[var(--text-muted)]">{remark.description}</p> : null}
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--border)] pt-2 text-[8px] text-[var(--text-subtle)]">
                                    {remark.file ? <span>{remark.file.name}{remark.versionNumber ? ` · v${remark.versionNumber}` : ''}</span> : null}
                                    {remark.createdBy ? <span className="flex items-center gap-1"><User size={9} />{remark.createdBy.name}</span> : null}
                                    {remark.dueDate ? <span className="flex items-center gap-1"><Calendar size={9} />{formatProjectDesignDate(remark.dueDate)}</span> : null}
                                </div>
                            </Card.Content>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
