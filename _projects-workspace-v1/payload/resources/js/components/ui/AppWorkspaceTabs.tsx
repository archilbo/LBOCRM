import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';
import { cn } from '@/lib/cn';

export type AppWorkspaceTab<T extends string = string> = {
    id: T;
    label: string;
    icon: LucideIcon;
    count?: number;
    isDisabled?: boolean;
};

type AppWorkspaceTabsProps<T extends string> = {
    tabs: AppWorkspaceTab<T>[];
    selectedKey: T;
    onSelectionChange: (key: T) => void;
    ariaLabel: string;
    children: ReactNode;
    className?: string;
    panelClassName?: string;
};

/** Accessible compact workspace tabs matching the Finance navigation pattern. */
export function AppWorkspaceTabs<T extends string>({
    tabs,
    selectedKey,
    onSelectionChange,
    ariaLabel,
    children,
    className,
    panelClassName,
}: AppWorkspaceTabsProps<T>) {
    return (
        <Tabs
            selectedKey={selectedKey}
            onSelectionChange={(key) => onSelectionChange(String(key) as T)}
            className={cn('min-w-0', className)}
        >
            <div className="shrink-0 overflow-hidden border-b border-[var(--border)] px-1">
                <TabList
                    aria-label={ariaLabel}
                    className="flex min-w-max gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <Tab
                                key={tab.id}
                                id={tab.id}
                                isDisabled={tab.isDisabled}
                                className="group relative flex h-10 shrink-0 cursor-pointer items-center gap-2 border-x-0 border-y-0 bg-transparent px-3 text-xs font-medium text-[var(--text-muted)] shadow-none outline-none transition data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40 data-[focus-visible]:text-[var(--accent)] data-[focus-visible]:underline data-[focus-visible]:decoration-[var(--accent)] data-[focus-visible]:underline-offset-4 data-[hovered]:text-[var(--text)] data-[selected]:border-x-0 data-[selected]:border-y-0 data-[selected]:bg-transparent data-[selected]:font-semibold data-[selected]:text-[var(--accent)] data-[selected]:shadow-none"
                            >
                                <span
                                    aria-hidden="true"
                                    className="flex size-6 items-center justify-center text-[var(--text-muted)] transition group-data-[selected]:text-[var(--accent)]"
                                >
                                    <Icon size={14} />
                                </span>
                                <span>{tab.label}</span>
                                {typeof tab.count === 'number' ? (
                                    <span className="text-[9px] font-semibold tabular-nums text-[var(--text-muted)] group-data-[selected]:text-[var(--accent)]">
                                        {tab.count}
                                    </span>
                                ) : null}
                            </Tab>
                        );
                    })}
                </TabList>
            </div>

            <TabPanel id={selectedKey} className={cn('outline-none', panelClassName)}>
                {children}
            </TabPanel>
        </Tabs>
    );
}
