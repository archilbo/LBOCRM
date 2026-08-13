import {
    Tab,
    TabList,
    TabPanel,
    Tabs,
    type TabsProps,
} from 'react-aria-components';
import { cn } from '@/lib/cn';

type AppCompactTabsProps = Omit<TabsProps, 'children'> & {
    tabs: { id: string; label: string }[];
    children: React.ReactNode;
};

export function AppCompactTabs({ tabs, children, className, ...props }: AppCompactTabsProps) {
    return (
        <Tabs {...props} className={cn('app-page', className)}>
            <TabList className="mb-3 flex flex-wrap items-center gap-1 border-b">
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        id={tab.id}
                        className={cn(
                            'flex items-center justify-center rounded-t-lg border-b-2 border-transparent px-4 py-2 text-sm font-medium text-[var(--text-muted)] outline-none transition',
                            'data-[selected]:border-[var(--accent)] data-[selected]:text-[var(--accent)]',
                            'data-[hovered]:text-[var(--text)]',
                            'data-[focus-visible]:ring-2 data-[focus-visible]:ring-[var(--accent)] data-[focus-visible]:ring-offset-1'
                        )}
                    >
                        {tab.label}
                    </Tab>
                ))}
            </TabList>
            {children}
        </Tabs>
    );
}
