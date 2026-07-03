import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { appRoutes, isActivePath, isValidHref } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n';

const mobileRouteKeys = ['dashboard', 'clients', 'dossiers', 'documents', 'finance', 'archives', 'tasks', 'inbox'];

export function AppMobileNav() {
    const { t } = useTranslation();
    const page = usePage();
    const currentPath = page.url;
    const mobileItems = appRoutes.filter((route) => mobileRouteKeys.includes(route.key));

    function goTo(href: string, enabled: boolean) {
        if (!enabled || !isValidHref(href)) {
            toast.info('This module is not ready yet.');
            return;
        }

        router.visit(href);
    }

    return (
        <nav id="app-bottom-nav">
            <div className="scrollbar-none flex h-full items-center gap-1 overflow-x-auto px-2 pt-1">
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
                            className={[
                                'flex h-11 min-w-[68px] shrink-0 flex-col items-center justify-center rounded-[var(--crm-radius-md)] px-2 py-1.5 text-[10px] font-bold transition',
                                active
                                    ? 'bg-[var(--crm-gold)] text-black'
                                    : 'text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-2)] hover:text-[var(--crm-text)]',
                            ].join(' ')}
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
