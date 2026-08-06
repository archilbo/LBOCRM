import { useEffect } from 'react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { FolderCard } from '@/features/archives/components/FolderCard';
import type { BoxContents } from '@/features/archives/types';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';

type BoxContentsDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: BoxContents | null;
    loading: boolean;
};

export function BoxContentsDrawer({ isOpen, onOpenChange, data, loading }: BoxContentsDrawerProps) {
    const { t } = useTranslation();
    useEffect(() => {
        if (!isOpen) return;
    }, [isOpen]);

    return (
        <AppDrawer
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            panelClassName="sm:w-[480px]"
            isDismissable={true}
        >
            {loading ? (
                <div className="space-y-3 p-5">
                    <div className="h-5 w-32 animate-pulse rounded bg-[var(--crm-elevated)]" />
                    <div className="h-3 w-48 animate-pulse rounded bg-[var(--crm-elevated)]" />
                    <div className="mt-4 space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 animate-pulse rounded-lg bg-[var(--crm-elevated)]" />
                        ))}
                    </div>
                </div>
            ) : data ? (
                <div className="flex h-full flex-col">
                    <div className="border-b border-[var(--crm-border-soft)] px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-[var(--crm-text)]">{data.box.name}</h2>
                                <p className="mt-0.5 text-xs text-[var(--crm-text-soft)]">
                                    {data.box.roomName ? `${data.box.roomName} / ` : ''}
                                    {t('boxContents.shelf')} {data.box.shelfCode}
                                </p>
                            </div>
                            <span className={cn(
                                'rounded-md px-2 py-1 text-xs font-medium',
                                data.box.count === 0 ? 'bg-[var(--crm-elevated)] text-[var(--crm-text-soft)]' :
                                data.box.count >= data.box.capacity ? 'bg-[var(--crm-danger-soft)] text-[var(--crm-danger)]' :
                                'bg-[var(--crm-success-soft)] text-[var(--crm-success)]',
                            )}>
                                {data.box.count}/{data.box.capacity}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-none p-5">
                        {data.groups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-[var(--crm-text-soft)]">
                                <span className="text-sm">{t('boxContents.empty')}</span>
                                <span className="mt-1 text-xs">{t('boxContents.addArchives')}</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data.groups.map((group) => (
                                    <div key={group.city.code}>
                                        <div className="mb-2 flex items-center gap-2">
                                            <span
                                                className="inline-block size-2 rounded-full shrink-0"
                                                style={{ backgroundColor: group.city.color }}
                                            />
                                            <span className="text-xs font-medium uppercase tracking-wider text-[var(--crm-text-muted)]">
                                                {group.city.name}
                                            </span>
                                            <span className="text-xs text-[var(--crm-text-soft)]">({group.records.length})</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {group.records.map((record) => (
                                                <FolderCard
                                                    key={record.id}
                                                    record={record}
                                                    cityColor={group.city.color}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center py-12 text-[var(--crm-text-soft)] text-sm">
                    {t('boxContents.failedToLoad')}
                </div>
            )}
        </AppDrawer>
    );
}
