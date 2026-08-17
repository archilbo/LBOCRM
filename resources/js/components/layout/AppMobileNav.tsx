import { router, usePage } from '@inertiajs/react';
import { Dropdown } from '@heroui/react';
import { IconDots } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { AppRoute } from '@/config/navigation';
import { appRoutes, isActivePath, isValidHref } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n';

const compactRouteKeys = ['dashboard', 'clients', 'dossiers', 'documents', 'finance', 'archives', 'tasks', 'inbox'];
const phoneRouteKeys = ['dashboard', 'clients', 'dossiers', 'finance', 'inbox'];

export function AppMobileNav() {
    const { t } = useTranslation();
    const page = usePage();
    const currentPath = page.url;
    const permissions = ((page.props as any).auth?.user?.permissions ?? []) as string[];
    const [isPhone, setIsPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches);

    useEffect(() => {
        const query = window.matchMedia('(max-width: 639px)');
        const update = () => setIsPhone(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    function canView(route: AppRoute) {
        if (route.requiredAnyPermissions?.length) {
            return route.requiredAnyPermissions.some((permission) => permissions.includes(permission));
        }

        return !route.requiredPermission || permissions.includes(route.requiredPermission);
    }

    const availableRoutes = appRoutes.filter((route) => route.enabled && canView(route));
    const visibleRouteKeys = isPhone ? phoneRouteKeys : compactRouteKeys;
    const compactItems = availableRoutes.filter((route) => visibleRouteKeys.includes(route.key));
    const overflowItems = availableRoutes.filter((route) => !visibleRouteKeys.includes(route.key));

    function isRouteActive(route: AppRoute) {
        return route.key === 'finance'
            ? currentPath.split('?')[0] === '/finance' || currentPath.startsWith('/finance/')
            : isActivePath(currentPath, route.href);
    }

    const hasActiveOverflow = overflowItems.some(isRouteActive);

    function goTo(href: string, enabled: boolean) {
        if (!enabled || !isValidHref(href)) {
            toast.info('This module is not ready yet.');
            return;
        }

        router.visit(href);
    }

    return (
        <nav
            id="app-bottom-nav"
            className="fixed bottom-0 left-0 right-0 z-50 hidden h-[var(--mobile-bottom-nav-h)] border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_94%,transparent)] px-2 pt-1 backdrop-blur-[18px] max-lg:flex pb-[env(safe-area-inset-bottom,0px)]"
        >
            <div className="flex h-full w-full items-center justify-center gap-1">
                {compactItems.map((item) => {
                    const Icon = item.icon;
                    const active = isRouteActive(item);

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => goTo(item.href, item.enabled)}
                            className={`flex h-11 min-w-0 flex-1 basis-0 flex-col items-center justify-center rounded-lg px-1 py-1.5 text-[9px] font-bold transition sm:max-w-[86px] sm:px-2 ${
                                active
                                    ? 'bg-[var(--accent)] text-black'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                            }`}
                        >
                            <Icon size={17} />
                            <span className="mt-0.5 max-w-full truncate leading-tight">{t(item.labelKey)}</span>
                        </button>
                    );
                })}

                {overflowItems.length > 0 ? (
                    <Dropdown>
                        <Dropdown.Trigger
                            aria-label={t('actions.more')}
                            className={`flex h-11 min-w-0 flex-1 basis-0 flex-col items-center justify-center rounded-lg px-1 py-1.5 text-[9px] font-bold transition sm:max-w-[86px] sm:px-2 ${
                                hasActiveOverflow
                                    ? 'bg-[var(--accent)] text-black'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                            }`}
                        >
                            <IconDots size={18} />
                            <span className="mt-0.5 max-w-full truncate leading-tight">{t('actions.more')}</span>
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="top end" className="z-[80] mb-2 max-h-[min(62dvh,540px)] w-[min(320px,calc(100vw-24px))] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-2xl">
                            <Dropdown.Menu onAction={(key) => {
                                const route = overflowItems.find((item) => item.key === String(key));
                                if (route) goTo(route.href, route.enabled);
                            }}>
                                {overflowItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isRouteActive(item);

                                    return (
                                        <Dropdown.Item
                                            key={item.key}
                                            id={item.key}
                                            textValue={t(item.labelKey)}
                                            className={`rounded-lg px-2.5 py-2 text-xs font-medium ${
                                                active
                                                    ? 'bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--foreground)]'
                                                    : 'text-[var(--text-muted)] data-[hovered]:bg-[var(--surface-2)] data-[hovered]:text-[var(--foreground)]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={15} className={active ? 'text-[var(--accent)]' : ''} />
                                                <span>{t(item.labelKey)}</span>
                                            </div>
                                        </Dropdown.Item>
                                    );
                                })}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                ) : null}
            </div>
        </nav>
    );
}
