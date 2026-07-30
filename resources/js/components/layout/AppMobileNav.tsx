import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { appRoutes, isActivePath, isValidHref } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n';

const mobileRouteKeys = ['dashboard', 'clients', 'dossiers', 'documents', 'finance', 'archives', 'tasks', 'inbox'];

export function AppMobileNav() {
    const { t } = useTranslation();
    const page = usePage();
    const currentPath = page.url;
    const permissions = ((page.props as any).auth?.user?.permissions ?? []) as string[];
    const mobileItems = appRoutes.filter((route) => (
        mobileRouteKeys.includes(route.key)
        && (!route.requiredPermission || permissions.includes(route.requiredPermission))
    ));

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
            className="fixed bottom-0 left-0 right-0 z-50 hidden h-16 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_94%,transparent)] px-2 pt-1 backdrop-blur-[18px] max-md:flex pb-[env(safe-area-inset-bottom,0px)]"
        >
            <div className="scrollbar-none flex h-full w-full items-center gap-1 overflow-x-auto">
                {mobileItems.map((item) => {
                    const Icon = item.icon;
                    const active = item.key === 'finance'
                        ? currentPath.split('?')[0] === '/finance' || currentPath.startsWith('/finance/')
                        : isActivePath(currentPath, item.href);

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => goTo(item.href, item.enabled)}
                            className={`flex h-11 min-w-[68px] shrink-0 flex-col items-center justify-center rounded-lg px-2 py-1.5 text-[10px] font-bold transition ${
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
            </div>
        </nav>
    );
}
