import { useEffect } from 'react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { FolderCard } from '@/features/archives/components/FolderCard';
import type { BoxContents } from '@/features/archives/types';
import { cn } from '@/lib/cn';

type BoxContentsDrawerProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: BoxContents | null;
    loading: boolean;
};

export function BoxContentsDrawer({ isOpen, onOpenChange, data, loading }: BoxContentsDrawerProps) {
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
                    <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-48 animate-pulse rounded bg-white/5" />
                    <div className="mt-4 space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 animate-pulse rounded-lg bg-white/5" />
                        ))}
                    </div>
                </div>
            ) : data ? (
                <div className="flex h-full flex-col">
                    <div className="border-b border-white/5 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-white">{data.box.name}</h2>
                                <p className="mt-0.5 text-xs text-white/40">
                                    {data.box.roomName ? `${data.box.roomName} / ` : ''}
                                    Shelf {data.box.shelfCode}
                                </p>
                            </div>
                            <span className={cn(
                                'rounded-md px-2 py-1 text-xs font-medium',
                                data.box.count === 0 ? 'bg-white/5 text-white/30' :
                                data.box.count >= data.box.capacity ? 'bg-red-500/15 text-red-400' :
                                'bg-emerald-500/15 text-emerald-400',
                            )}>
                                {data.box.count}/{data.box.capacity}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-none p-5">
                        {data.groups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-white/30">
                                <span className="text-sm">This box is empty</span>
                                <span className="mt-1 text-xs">Add archives to see them here</span>
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
                                            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                                                {group.city.name}
                                            </span>
                                            <span className="text-xs text-white/30">({group.records.length})</span>
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
                <div className="flex items-center justify-center py-12 text-white/40 text-sm">
                    Failed to load box contents
                </div>
            )}
        </AppDrawer>
    );
}
