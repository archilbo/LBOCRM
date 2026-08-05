import {
    IconArchive,
    IconBell,
    IconBuilding,
    IconCalendar,
    IconCalendarMonth,
    IconChecklist,
    IconCoin,
    IconContract,
    IconFileCheck,
    IconFileDollar,
    IconFolder,
    IconInbox,
    IconLayoutDashboard,
    IconReceipt2,
    IconSettings,
    IconTemplate,
    IconUser,
    IconUsers,
    IconUsersGroup,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

/** Icon component contract — any lib providing `size`/`className` props (Tabler, Lucide). */
export type RouteIcon = ComponentType<{ size?: number; className?: string }>;

export type AppRouteKey =
    | 'dashboard'
    | 'clients'
    | 'intermediaries'
    | 'dossiers'
    | 'documents'
    | 'contracts'
    | 'finance'
    | 'financeDocuments'
    | 'financePayments'
    | 'financeMonthly'
    | 'financeTemplates'
    | 'archives'
    | 'branches'
    | 'settings'
    | 'users'
    | 'tasks'
    | 'calendar'
    | 'workload'
    | 'operationsReports'
    | 'inbox'
    | 'notifications';

export type AppRouteGroup = 'principal' | 'followUp' | 'management' | 'administration';

export type AppRoute = {
    key: AppRouteKey;
    labelKey: string;
    href: string;
    icon: RouteIcon;
    enabled: boolean;
    searchable: boolean;
    group: AppRouteGroup;
    badgeKey?: string;
    requiredPermission?: string;
    requiredAnyPermissions?: string[];
    shortcut?: string;
};

export const appRoutes: AppRoute[] = [
    {
        key: 'dashboard',
        labelKey: 'nav.dashboard',
        href: '/',
        icon: IconLayoutDashboard,
        enabled: true,
        searchable: true,
        group: 'principal',
        requiredPermission: 'dashboard.view',
        shortcut: 'Alt+H',
    },
    {
        key: 'clients',
        labelKey: 'nav.clients',
        href: '/clients',
        icon: IconUsers,
        enabled: true,
        searchable: true,
        group: 'principal',
        requiredPermission: 'clients.view',
        shortcut: 'Alt+C',
    },
    {
        key: 'intermediaries',
        labelKey: 'nav.intermediaries',
        href: '/intermediaries',
        icon: IconUser,
        enabled: true,
        searchable: true,
        group: 'principal',
        requiredPermission: 'intermediaries.view',
        shortcut: 'Alt+I',
    },
    {
        key: 'dossiers',
        labelKey: 'nav.dossiers',
        href: '/dossiers',
        icon: IconFolder,
        enabled: true,
        searchable: true,
        group: 'principal',
        requiredPermission: 'dossiers.view',
        shortcut: 'Alt+P',
    },
    {
        key: 'documents',
        labelKey: 'nav.documents',
        href: '/documents',
        icon: IconFileCheck,
        enabled: true,
        searchable: true,
        group: 'followUp',
        requiredPermission: 'documents.view',
        shortcut: 'Alt+D',
    },
    {
        key: 'contracts',
        labelKey: 'nav.contracts',
        href: '/contracts',
        icon: IconContract,
        enabled: true,
        searchable: true,
        group: 'followUp',
        requiredPermission: 'contracts.view',
        shortcut: 'Alt+K',
    },
    {
        key: 'finance',
        labelKey: 'nav.finance',
        href: '/finance',
        icon: IconCoin,
        enabled: true,
        searchable: true,
        group: 'management',
        requiredPermission: 'finance.view',
        shortcut: 'Alt+F',
    },
    {
        key: 'financeDocuments',
        labelKey: 'nav.financeDocuments',
        href: '/finance/documents',
        icon: IconFileDollar,
        enabled: true,
        searchable: true,
        group: 'management',
        requiredPermission: 'finance.view',
    },
    {
        key: 'financePayments',
        labelKey: 'nav.financePayments',
        href: '/finance/payments',
        icon: IconReceipt2,
        enabled: true,
        searchable: true,
        group: 'management',
        requiredPermission: 'finance.payments.view',
    },
    {
        key: 'financeMonthly',
        labelKey: 'nav.financeMonthly',
        href: '/finance/documents?tab=monthly',
        icon: IconCalendarMonth,
        enabled: true,
        searchable: true,
        group: 'management',
        requiredPermission: 'finance.view',
    },

    {
        key: 'financeTemplates',
        labelKey: 'nav.financeTemplates',
        href: '/finance/templates',
        icon: IconTemplate,
        enabled: true,
        searchable: true,
        group: 'management',
        requiredPermission: 'finance.templates.view',
    },
    {
        key: 'archives',
        labelKey: 'nav.archives',
        href: '/archives',
        icon: IconArchive,
        enabled: true,
        searchable: true,
        group: 'management',
        requiredPermission: 'archive.view',
        shortcut: 'Alt+A',
    },
    {
        key: 'tasks',
        labelKey: 'nav.tasks',
        href: '/tasks',
        icon: IconChecklist,
        enabled: true,
        searchable: true,
        group: 'followUp',
        requiredPermission: 'tasks.view',
        shortcut: 'Alt+T',
    },
    {
        key: 'calendar',
        labelKey: 'nav.calendar',
        href: '/calendar',
        icon: IconCalendar,
        enabled: true,
        searchable: true,
        group: 'followUp',
        requiredPermission: 'calendar.view',
        shortcut: 'Alt+L',
    },
    {
        key: 'inbox',
        labelKey: 'nav.inbox',
        href: '/inbox',
        icon: IconInbox,
        enabled: true,
        searchable: true,
        group: 'management',
        requiredPermission: 'inbox.view',
        shortcut: 'Alt+M',
    },
    {
        key: 'notifications',
        labelKey: 'nav.notifications',
        href: '/notifications',
        icon: IconBell,
        enabled: true,
        searchable: true,
        group: 'administration',
        requiredPermission: 'notifications.view',
        shortcut: 'Alt+N',
    },
    {
        key: 'users',
        labelKey: 'nav.users',
        href: '/admin/users',
        icon: IconUsersGroup,
        enabled: true,
        searchable: true,
        group: 'administration',
        requiredAnyPermissions: ['users.view', 'reports.workload.view', 'reports.operations.view'],
        shortcut: 'Alt+U',
    },
    {
        key: 'branches',
        labelKey: 'nav.branches',
        href: '#',
        icon: IconBuilding,
        enabled: false,
        searchable: false,
        group: 'administration',
        badgeKey: 'app.soon',
    },
    {
        key: 'settings',
        labelKey: 'nav.settings',
        href: '/settings',
        icon: IconSettings,
        enabled: true,
        searchable: false,
        group: 'administration',
        requiredPermission: 'archive.view',
    },
];

export function isValidHref(href: unknown): href is string {
    return typeof href === 'string' && href.trim().length > 0 && href !== '#';
}

function splitRoutePath(path: string) {
    const [pathname, query = ''] = path.split('?');

    return {
        pathname,
        query,
        params: new URLSearchParams(query),
    };
}

export function isActivePath(currentPath: string, itemPath: string) {
    if (!isValidHref(itemPath)) {
        return false;
    }

    const current = splitRoutePath(currentPath);
    const item = splitRoutePath(itemPath);

    if (item.pathname === '/') {
        return current.pathname === '/';
    }

    if (item.query) {
        if (current.pathname !== item.pathname) {
            return false;
        }

        return Array.from(item.params.entries()).every(
            ([key, value]) => current.params.get(key) === value,
        );
    }

    if (item.pathname === '/finance') {
        return current.pathname === '/finance' && !current.query;
    }

    return current.pathname === item.pathname || current.pathname.startsWith(`${item.pathname}/`);
}
