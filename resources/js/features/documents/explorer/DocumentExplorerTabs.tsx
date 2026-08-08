import { AppFilterTabs, type AppFilterTabOption } from '@/components/ui/AppFilterTabs';
import { useTranslation } from '@/lib/i18n';
import type { DocumentExplorerTab } from './documentExplorerTypes';

type DocumentExplorerTabsProps = {
    /** Config-driven tab list; labels are already translated. */
    tabs: DocumentExplorerTab[];
    activeId: string;
    onChange: (id: string) => void;
};

/**
 * Tab strip of the shared explorer. Pure configuration rendering: the tabs
 * array decides both the options and (via each tab's filter) what the shell
 * shows. No component is ever swapped by a tab — the shell only filters the
 * normalized document collection.
 */
export function DocumentExplorerTabs({ tabs, activeId, onChange }: DocumentExplorerTabsProps) {
    const { t } = useTranslation();

    const options: AppFilterTabOption[] = tabs.map((tab) => ({
        id: tab.id,
        label: tab.label,
    }));

    return (
        <AppFilterTabs
            label={t('documentsExplorer.title')}
            hideLabel
            value={activeId}
            options={options}
            onChange={(value) => onChange(value)}
        />
    );
}
