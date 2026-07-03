import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { appRoutes, isActivePath, isValidHref } from '@/lib/appRoutes';
import { useTranslation } from '@/lib/i18n';

const mobileRouteKeys = ['dashboard', 'clients', 'dossiers', 'contracts', 'finance', 'archives'];

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
