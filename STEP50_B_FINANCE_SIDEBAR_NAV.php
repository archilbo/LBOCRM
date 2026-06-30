<?php

function path_for(string $relativePath): string
{
    return __DIR__.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
}

function write_file_text(string $relativePath, string $content): void
{
    $path = path_for($relativePath);
    $dir = dirname($path);

    if (! is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    file_put_contents($path, ltrim($content, "\xEF\xBB\xBF"));
    echo "Written: {$relativePath}".PHP_EOL;
}

function backup_file(string $relativePath): void
{
    $path = path_for($relativePath);

    if (is_file($path)) {
        copy($path, $path.'.bak-step50b');
        echo "Backup: {$relativePath}.bak-step50b".PHP_EOL;
    }
}

function run_cmd(string $command): void
{
    echo PHP_EOL."> {$command}".PHP_EOL;
    passthru($command, $exitCode);

    if ($exitCode !== 0) {
        exit($exitCode);
    }
}

echo "STEP 50-B runner started".PHP_EOL;

# ---------------------------------------------------------------------
# 1) Replace appRoutes with finance route entries enabled.
# ---------------------------------------------------------------------

backup_file('resources/js/lib/appRoutes.ts');

write_file_text('resources/js/lib/appRoutes.ts', <<<'TS'
import {
    Archive,
    BadgeDollarSign,
    Building2,
    FileCheck2,
    FileSpreadsheet,
    FileText,
    FolderKanban,
    LayoutDashboard,
    ReceiptText,
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
    | 'financePayments'
    | 'financeTemplates'
    | 'financeSettings'
    | 'archives'
    | 'branches'
    | 'settings'
    | 'users';

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
        key: 'financeDocuments',
        labelKey: 'nav.financeDocuments',
        href: '/finance/documents',
        icon: FileSpreadsheet,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'financePayments',
        labelKey: 'nav.financePayments',
        href: '/finance?tab=payments',
        icon: ReceiptText,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'financeTemplates',
        labelKey: 'nav.financeTemplates',
        href: '/finance/templates',
        icon: FileText,
        enabled: true,
        searchable: true,
        group: 'management',
    },
    {
        key: 'financeSettings',
        labelKey: 'nav.financeSettings',
        href: '/finance/settings',
        icon: SlidersHorizontal,
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

    const cleanCurrent = currentPath.split('?')[0];
    const cleanItem = itemPath.split('?')[0];

    if (cleanItem === '/') {
        return cleanCurrent === '/';
    }

    return cleanCurrent === cleanItem || cleanCurrent.startsWith(`${cleanItem}/`);
}
TS);

# ---------------------------------------------------------------------
# 2) Replace navigation groups with Finance parent + children.
# ---------------------------------------------------------------------

backup_file('resources/js/components/layout/navigation.ts');

write_file_text('resources/js/components/layout/navigation.ts', <<<'TS'
import { BadgeDollarSign } from 'lucide-react';
import { appRoutes } from '@/lib/appRoutes';
import type { AppRoute, AppRouteKey } from '@/lib/appRoutes';

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
        routeByKey('finance'),
        routeByKey('financeDocuments'),
        routeByKey('financePayments'),
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
TS);

# ---------------------------------------------------------------------
# 3) Clean and sync mobile nav keys.
# ---------------------------------------------------------------------

backup_file('resources/js/components/layout/AppMobileNav.tsx');

write_file_text('resources/js/components/layout/AppMobileNav.tsx', <<<'TSX'
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { appRoutes, isActivePath, isValidHref } from '@/lib/appRoutes';
import { useTranslation } from '@/lib/i18n';

const mobileRouteKeys = ['dashboard', 'clients', 'dossiers', 'documents', 'finance', 'archives'];

export function AppMobileNav() {
    const { t } = useTranslation();
    const page = usePage();
    const currentPath = page.url.split('?')[0];

    const mobileItems = appRoutes.filter((route) => mobileRouteKeys.includes(route.key));

    function goTo(href: string, enabled: boolean) {
        if (!enabled || !isValidHref(href)) {
            toast.info('This module is not ready yet.');
            return;
        }

        router.visit(href);
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden">
            <div className="grid grid-cols-6 gap-1">
                {mobileItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActivePath(currentPath, item.href);

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => goTo(item.href, item.enabled)}
                            className={[
                                'flex min-w-0 flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-medium transition',
                                active
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            <Icon size={17} />
                            <span className="mt-1 max-w-full truncate">{t(item.labelKey)}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
TSX);

# ---------------------------------------------------------------------
# 4) Add missing i18n keys if possible.
# ---------------------------------------------------------------------

foreach (['resources/js/locales/en.ts', 'resources/js/locales/fr.ts'] as $localePath) {
    $full = path_for($localePath);

    if (! is_file($full)) {
        continue;
    }

    backup_file($localePath);

    $content = file_get_contents($full);

    $isFrench = str_contains($localePath, '/fr.ts');
    $payments = $isFrench ? 'Paiements' : 'Payments';
    $templates = $isFrench ? 'Templates' : 'Templates';
    $financeDocuments = $isFrench ? 'Documents finance' : 'Finance documents';
    $financeSettings = $isFrench ? 'Parametres finance' : 'Finance settings';

    $insert = '';

    if (! str_contains($content, 'financeDocuments')) {
        $insert .= "        financeDocuments: '{$financeDocuments}',\n";
    }

    if (! str_contains($content, 'financePayments')) {
        $insert .= "        financePayments: '{$payments}',\n";
    }

    if (! str_contains($content, 'financeTemplates')) {
        $insert .= "        financeTemplates: '{$templates}',\n";
    }

    if (! str_contains($content, 'financeSettings')) {
        $insert .= "        financeSettings: '{$financeSettings}',\n";
    }

    if ($insert !== '') {
        $content = preg_replace(
            '/(\s*finance\s*:\s*[\'"][^\'"]+[\'"],\s*)/',
            "$1\n".$insert,
            $content,
            1,
            $count
        );

        if ($count === 1) {
            write_file_text($localePath, $content);
        } else {
            echo "Could not auto-add locale keys in {$localePath}; skipping locale patch.".PHP_EOL;
        }
    } else {
        echo "Locale already has finance submenu keys: {$localePath}".PHP_EOL;
    }
}

# ---------------------------------------------------------------------
# 5) Write report.
# ---------------------------------------------------------------------

write_file_text('docs/sidebar-finance-navigation-step50b.md', <<<'MD'
# Step 50-B Sidebar Finance Navigation

## Added

Finance now has a nested sidebar submenu:

- Finance overview: /finance
- Finance documents: /finance/documents
- Payments tab: /finance?tab=payments
- Templates: /finance/templates
- Finance settings: /finance/settings

## Kept

- Archives remains under Management.
- Branches and Settings remain disabled because no backend routes currently exist.
- Mobile nav keeps the compact six-item layout.

## Reason

Routes for finance documents, templates and settings exist, but previous sidebar config disabled/hid them.
MD);

# ---------------------------------------------------------------------
# 6) Build and QA.
# ---------------------------------------------------------------------

run_cmd('php artisan optimize:clear');

if (is_file(path_for('package.json'))) {
    run_cmd('npm run build');
}

run_cmd('php artisan archilbo:finance-ui-lock-payload-qa');
run_cmd('php artisan archilbo:finance-export-qa');
run_cmd('php artisan archilbo:finance-document-lock-guard-qa');

echo PHP_EOL.'STEP 50-B completed.'.PHP_EOL;