import { IconActivity, IconCircleCheck, IconClockHour3, IconFolder, IconDatabase, IconLayersLinked, IconMessage2Exclamation } from '@tabler/icons-react';

import type { ProjectDesignSummary } from '../types/projectDesign';

export function ProjectDesignSummaryBar({ summary }: { summary: ProjectDesignSummary | null }) {
    const items = [
        { label: 'Folders', value: summary?.folders ?? 0, icon: IconFolder },
        { label: 'Files', value: summary?.files ?? 0, icon: IconDatabase },
        { label: 'Awaiting Review', value: summary?.awaitingReview ?? 0, icon: IconLayersLinked },
        { label: 'Open Remarks', value: summary?.openRemarks ?? 0, icon: IconMessage2Exclamation },
        { label: 'Overdue', value: summary?.overdueRemarks ?? 0, icon: IconClockHour3 },
        { label: 'Approved', value: summary?.approvedFiles ?? 0, icon: IconCircleCheck },
        { label: 'IconActivity', value: summary?.activities ?? 0, icon: IconActivity },
    ];

    const approvalProgress = Math.max(0, Math.min(100, summary?.approvalProgress ?? 0));

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-7">
                {items.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 rounded-lg bg-[var(--surface-2)] px-3 py-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--text-muted)]">
                            <item.icon size={14} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)]">{item.label}</p>
                            <p className="text-sm font-semibold text-[var(--foreground)]">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                    <span>Approval Progress</span>
                    <span>{approvalProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${approvalProgress}%` }} />
                </div>
            </div>
        </div>
    );
}
