import type { ComponentType, ReactNode } from 'react';
import { Tab, TabList, Tabs } from 'react-aria-components';

/**
 * Any icon component accepting `size`/`className` — supports both Lucide
 * (project default) and Tabler (`@tabler/icons-react`) glyphs.
 */
export type WorkspaceTabIcon = ComponentType<{ size?: number; className?: string }>;

export type AppWorkspaceTab = {
    id: string;
    label: string;
    icon: WorkspaceTabIcon;
};

type AppWorkspaceTabsProps = {
    tabs: AppWorkspaceTab[];
    selectedKey: string;
    onSelectionChange: (key: string) => void;
    counts?: Partial<Record<string, number>>;
    children: ReactNode;
};

export function AppWorkspaceTabs({ tabs, selectedKey, onSelectionChange, counts = {}, children }: AppWorkspaceTabsProps) {
    return (
        <Tabs
            selectedKey={selectedKey}
            onSelectionChange={(key) => onSelectionChange(String(key))}
            className="min-w-0"
        >
            <div className="mb-3 overflow-hidden">
                <TabList className="flex min-w-max gap-1 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const count = counts[tab.id];
                        return (
                            <Tab
                                key={tab.id}
                                id={tab.id}
                                className="group relative flex h-10 shrink-0 cursor-pointer items-center gap-2 border-x-0 border-y-0 bg-transparent px-3 text-xs font-medium text-[var(--text-muted)] shadow-none outline-none transition data-[hovered]:text-[var(--text)] data-[selected]:border-x-0 data-[selected]:border-y-0 data-[selected]:bg-transparent data-[selected]:font-semibold data-[selected]:text-[var(--accent)] data-[selected]:shadow-none data-[focus-visible]:text-[var(--accent)] data-[focus-visible]:underline data-[focus-visible]:decoration-[var(--accent)] data-[focus-visible]:underline-offset-4"
                            >
                                <span className="flex size-6 items-center justify-center text-[var(--text-muted)] transition group-data-[selected]:text-[var(--accent)]">
                                    <Icon size={14} />
                                </span>
                                <span>{tab.label}</span>
                                {typeof count === 'number' ? (
                                    <span className="text-[9px] font-semibold text-[var(--text-muted)] group-data-[selected]:text-[var(--accent)]">{count}</span>
                                ) : null}
                            </Tab>
                        );
                    })}
                </TabList>
            </div>
            {children}
        </Tabs>
    );
}
