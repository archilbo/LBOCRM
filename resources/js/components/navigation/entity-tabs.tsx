import { AppWorkspaceTabs } from '@/components/ui/AppWorkspaceTabs';
import type { AppWorkspaceTab, AppWorkspaceTabsProps, WorkspaceTabIcon } from '@/components/ui/AppWorkspaceTabs';

/**
 * EntityTabs — shared, config-driven tab navigation for main entity pages.
 *
 * This is a domain-named facade over the app's single shared workspace tab
 * bar (`AppWorkspaceTabs`, already consumed by Clients, Tasks, Admin, ...).
 * Client show and Project/Dossier show both render their main page tabs
 * through THIS module, so the two pages share ONE tab renderer, one visual
 * design (icon + label, accent on selection, horizontal scroll on narrow
 * screens) and one item contract. No tab-bar JSX is duplicated.
 *
 * Contract notes:
 * - The item key is `id` on `EntityTabItem` (see below); configs map
 *   `{ id, label, icon }`.
 * - Badges/counts are supported via the `counts` prop, not per-item.
 * - `disabled` is intentionally omitted: neither entity page gates a tab
 *   with a disabled state today — visibility/permission filtering happens
 *   in each page's tab config before items are passed here.
 * - Keep this separate from `DocumentExplorerTabs` (explorer filtering),
 *   which is a different concern living in `features/documents/explorer/`.
 */
export const EntityTabs = AppWorkspaceTabs;

export type EntityTabItem = AppWorkspaceTab;
export type EntityTabIcon = WorkspaceTabIcon;
export type EntityTabsProps = AppWorkspaceTabsProps;
