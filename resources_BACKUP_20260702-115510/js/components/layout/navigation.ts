import { BadgeDollarSign } from 'lucide-react';
import { appRoutes } from '@/config/navigation';
import type { AppRoute, AppRouteKey } from '@/config/navigation';

export type NavigationItem = {
    key: string;
    labelKey: string;
    href?: string;
    icon?: AppRoute['icon'];
    enabled?: boolean;
    badgeKey?: string;
    children?: NavigationItem[];
};

export type NavigationGroup = {
    labelKey: string;
    items: NavigationItem[];
};

function routeByKey(key: AppRouteKey): AppRoute {
    const route = appRoutes.find((item) => item.key === key);

    if (!route) {
        throw new Error(`Missing app route: ${key}`);
    }

    return route;
}

const financeParent: NavigationItem = {
    key: 'financeParent',
    labelKey: 'nav.finance',
    href: '/finance',
    icon: BadgeDollarSign,
    enabled: true,
    children: [
        { ...routeByKey('finance'), labelKey: 'nav.financeOverview' },
        routeByKey('financeDocuments'),
        routeByKey('financePayments'),
        routeByKey('financeMonthly'),
        routeByKey('financeTemplates'),
        routeByKey('financeSettings'),
    ],
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
        items: [
            financeParent,
            ...appRoutes
                .filter((route) => route.group === 'management' && route.key === 'archives')
                .map((route) => ({ ...route })),
        ],
    },
    {
        labelKey: 'nav.groups.administration',
        items: appRoutes
            .filter((route) => route.group === 'administration')
            .map((route) => ({ ...route })),
    },
];
