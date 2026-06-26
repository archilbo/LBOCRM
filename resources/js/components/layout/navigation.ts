import { appRoutes } from '@/lib/appRoutes';
import type { AppRoute } from '@/lib/appRoutes';
import { Users } from 'lucide-react';

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
        items: [
            ...appRoutes
                .filter((route) => route.group === 'management' && !['finance', 'financeDocuments', 'financeSettings'].includes(route.key))
                .map((route) => ({ ...route })),
            {
                key: 'financeParent',
                labelKey: 'nav.finance',
                icon: appRoutes.find(r => r.key === 'finance')!.icon,
                enabled: true,
                children: [
                    appRoutes.find((r) => r.key === 'finance')!,
                    appRoutes.find((r) => r.key === 'financeDocuments')!,
                    appRoutes.find((r) => r.key === 'financeSettings')!,
                ].filter(Boolean) as AppRoute[],
            },
        ],
    },
    {
        labelKey: 'nav.groups.administration',
        items: appRoutes.filter((route) => route.group === 'administration'),
    },
];