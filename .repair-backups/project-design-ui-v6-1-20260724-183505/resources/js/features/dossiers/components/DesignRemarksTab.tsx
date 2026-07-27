import { useState } from 'react';
import { Search, MessageSquareText, User, Calendar, Loader2 } from 'lucide-react';
import { Input, Select, ListBox, ListBoxItem } from '@heroui/react';
import { cn } from '@/lib/cn';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { useRemarks } from '@/features/project-design/hooks/useProjectDesignQueries';
import { formatProjectDesignDate } from '@/features/project-design/utils/projectDesignFormatters';
import { SEVERITY_STYLES } from '@/features/project-design/utils/projectDesignFormatters';

const REMARK_STATUSES = ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened'];
const REMARK_SEVERITIES = ['critical', 'major', 'minor', 'cosmetic', 'question'];

const STATUS_STYLES: Record<string, string> = {
    open: 'bg-amber-400/10 text-amber-400',
    assigned: 'bg-blue-400/10 text-blue-400',
    in_progress: 'bg-purple-400/10 text-purple-400',
    resolved: 'bg-emerald-400/10 text-emerald-400',
    closed: 'bg-[var(--surface-2)] text-[var(--text-muted)]',
    reopened: 'bg-orange-400/10 text-orange-400',
};

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
            <div className="flex items-center gap-2 flex-wrap">
                <Input value={search} onValueChange={setSearch} placeholder="Search remarks..."
                    size="sm" variant="bordered" className="max-w-xs"
                    startContent={<Search size={13} className="text-[var(--text-muted)]" />} />
                <Select size="sm" variant="bordered" placeholder="All severities" className="max-w-40"
                    selectedKey={severityFilter || null}
                    onSelectionChange={(key) => setSeverityFilter(key ? String(key) : '')}>
                    <Select.Trigger className="h-8 min-h-0">
                        <Select.Value className="text-xs" />
                        <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="min-w-32">
                        <ListBox className="p-1">
                            <ListBoxItem key="">All severities</ListBoxItem>
                            {REMARK_SEVERITIES.map((s) => <ListBoxItem key={s} className="capitalize">{s}</ListBoxItem>)}
                        </ListBox>
                    </Select.Popover>
                </Select>
                <Select size="sm" variant="bordered" placeholder="All statuses" className="max-w-40"
                    selectedKey={statusFilter || null}
                    onSelectionChange={(key) => setStatusFilter(key ? String(key) : '')}>
                    <Select.Trigger className="h-8 min-h-0">
                        <Select.Value className="text-xs" />
                        <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="min-w-32">
                        <ListBox className="p-1">
                            <ListBoxItem key="">All statuses</ListBoxItem>
                            {REMARK_STATUSES.map((s) => <ListBoxItem key={s} className="capitalize">{s.replace('_', ' ')}</ListBoxItem>)}
                        </ListBox>
                    </Select.Popover>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[var(--accent)]" /></div>
            ) : remarks.length === 0 ? (
                <AppEmptyState icon={<MessageSquareText size={20} />} title="No remarks yet" description="Remarks will appear here once you annotate a design file." />
            ) : (
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                    {remarks.map((r) => (
                        <div key={r.id} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                            <div className={cn('mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold', SEVERITY_STYLES[r.severity] ?? 'text-[var(--text-muted)]')}>
                                {r.severity}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-[12.5px] font-medium text-[var(--foreground)]">{r.title}</p>
                                    <span className={cn('rounded px-1 py-0.5 text-[9px] font-semibold', STATUS_STYLES[r.status] ?? 'text-[var(--text-muted)]')}>
                                        {r.status.replace('_', ' ')}
                                    </span>
                                </div>
                                {r.description && <p className="mt-0.5 text-[11px] text-[var(--text-muted)] line-clamp-2">{r.description}</p>}
                                <div className="mt-1 flex items-center gap-3 text-[10px] text-[var(--text-subtle)]">
                                    {r.file && <span>{r.file.name}</span>}
                                    {r.versionNumber && <span>v{r.versionNumber}</span>}
                                    {r.createdBy && <span className="flex items-center gap-1"><User size={10} />{r.createdBy.name}</span>}
                                    {r.dueDate && <span className="flex items-center gap-1"><Calendar size={10} />{r.dueDate}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
