import { appRoutes } from '@/lib/appRoutes';

export type NavigationItem = {
    key: string;
    labelKey: string;
    href?: string;
    icon?: any;
    enabled?: boolean;
    badgeKey?: string;
    children?: NavigationItem[];
};

export type NavigationGroup = {
    labelKey: string;
    items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
    {
        labelKey: 'nav.groups.principal',
        items: appRoutes
            .filter((route) => route.group === 'principal')
            .map((route) => ({ ...route })),
    },
    {
        labelKey: 'nav.groups.followUp',
        items: appRoutes
            .filter((route) => route.group === 'followUp')
            .map((route) => ({ ...route })),
    },
    {
        labelKey: 'nav.groups.management',
        items: appRoutes
            .filter((route) => route.group === 'management' && !['financeDocuments', 'financeSettings'].includes(route.key))
            .map((route) => ({ ...route })),
    },
    {
        labelKey: 'nav.groups.administration',
        items: appRoutes.filter((route) => route.group === 'administration'),
    },
];
