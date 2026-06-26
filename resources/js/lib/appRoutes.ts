import {
    Archive,
    BadgeDollarSign,
    Building2,
    FileCheck2,
    FileSpreadsheet,
    FileText,
    FolderKanban,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type AppRouteKey =
    | 'dashboard'
    | 'clients'
    | 'dossiers'
    | 'documents'
    | 'contracts'
    | 'authorizations'
    | 'finance'
    | 'financeDocuments'
    | 'financeSettings'
    | 'archives'
    | 'branches'
    | 'settings';

export type AppRouteGroup = 'principal' | 'followUp' | 'management' | 'administration';

export type AppRoute = {
    key: AppRouteKey;
    labelKey: string;
    href: string;
    icon: LucideIcon;
    enabled: boolean;
    searchable: boolean;
    group: AppRouteGroup;
    badgeKey?: string;
};

export const appRoutes: AppRoute[] = [
    {
        key: 'dashboard',
        labelKey: 'nav.dashboard',
        href: '/',
        icon: LayoutDashboard,
        enabled: true,
        searchable: true,
        group: 'principal',
    },
    {
        key: 'clients',
        labelKey: 'nav.clients',
        href: '/clients',
        icon: Users,
        enabled: true,
        searchable: true,
        group: 'principal',
    },
    {
        key: 'dossiers',
        labelKey: 'nav.dossiers',
        href: '/dossiers',
        icon: FolderKanban,
        enabled: true,
        searchable: true,
        group: 'principal',
    },
    {
        key: 'documents',
        labelKey: 'nav.documents',
        href: '/documents',
        icon: FileCheck2,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'contracts',
        labelKey: 'nav.contracts',
        href: '/contracts',
        icon: FileText,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'authorizations',
        labelKey: 'nav.authorizations',
        href: '/authorizations',
        icon: ShieldCheck,
        enabled: true,
        searchable: true,
        group: 'followUp',
    },
    {
        key: 'finance',
        labelKey: 'nav.finance',
        href: '/finance',
        icon: BadgeDollarSign,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'archives',
        labelKey: 'nav.archives',
        href: '/archives',
        icon: Archive,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'financeDocuments',
        labelKey: 'nav.financeDocuments',
        href: '/finance/documents',
        icon: FileSpreadsheet,
        enabled: false,
        searchable: false,
        group: 'management',
    },
    {
        key: 'financeSettings',
        labelKey: 'nav.financeSettings',
        href: '/finance/settings',
        icon: SlidersHorizontal,
        enabled: false,
        searchable: false,
        group: 'management',
    },
    {
        key: 'users',
        labelKey: 'nav.users',
        href: '/admin/users',
        icon: Users,
        enabled: true,
        searchable: true,
        group: 'administration',
    },
    {
        key: 'branches',
        labelKey: 'nav.branches',
        href: '#',
        icon: Building2,
        enabled: false,
        searchable: false,
        group: 'administration',
        badgeKey: 'app.soon',
    },
    {
        key: 'settings',
        labelKey: 'nav.settings',
        href: '#',
        icon: Settings,
        enabled: false,
        searchable: false,
        group: 'administration',
        badgeKey: 'app.soon',
    },
];

export function isValidHref(href: unknown): href is string {
    return typeof href === 'string' && href.trim().length > 0 && href !== '#';
}

export function isActivePath(currentPath: string, itemPath: string) {
    if (!isValidHref(itemPath)) {
        return false;
    }

    if (itemPath === '/') {
        return currentPath === '/';
    }

    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

