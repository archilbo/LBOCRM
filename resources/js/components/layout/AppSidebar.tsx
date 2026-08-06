import { router, usePage } from '@inertiajs/react';
import {
    IconBuildingSkyscraper, IconCheck, IconChevronDown, IconChevronRight, IconClipboardList,
    IconCoin, IconHelpCircle, IconLayoutKanban, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand,
    IconLogout, IconMessages, IconSettings, IconShieldCheck,
} from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { AppRoute, AppRouteKey } from '@/config/navigation';
import { appRoutes, isActivePath, isValidHref } from '@/config/navigation';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { useBranding } from '@/hooks/useBranding';
import { useTheme } from '@/providers/ThemeProvider';

const EXPANDED = 236;
const RAIL = 64;

const routeMap = new Map(appRoutes.map((r) => [r.key, r]));
function getRoute(key: string): AppRoute | undefined {
    return routeMap.get(key);
}

const workspaceItems = ['dashboard', 'clients', 'intermediaries', 'dossiers'];

const followUpItems: { key: string }[] = [
    { key: 'documents' },
    { key: 'contracts' },
    { key: 'archives' },
    { key: 'tasks' },
    { key: 'calendar' },
];

const financeChildren: { key: string; labelKey?: string }[] = [
    { key: 'finance', labelKey: 'nav.financeOverview' },
    { key: 'financeDocuments' },
    { key: 'financePayments' },
    { key: 'financeMonthly' },
    { key: 'financeTemplates' },
];

/* ── Group keys for collapsed rail popovers ── */
const operationsGroupKeys = [
    'documents', 'contracts', 'archives',
    'tasks', 'calendar',
] as const;

const financeGroupKeys = [
    'finance', 'financeDocuments', 'financePayments',
    'financeMonthly', 'financeTemplates',
] as const;

function isGroupActive(keys: readonly string[], isActive: (r: AppRoute) => boolean): boolean {
    return keys.some((key) => {
        const route = routeMap.get(key);
        return route && route.enabled && isActive(route);
    });
}

function NavigationSection({
    label,
    icon,
    children,
}: {
    label: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="mt-4">
            <div className="flex h-6 items-center gap-2 px-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-subtle">
                <span className="flex size-4 items-center justify-center text-accent/80">
                    {icon}
                </span>
                <span className="min-w-0 flex-1 truncate">{label}</span>
            </div>
            <div className="mt-1 space-y-0.5">{children}</div>
        </section>
    );
}

function NavItem({ route, isActive, goTo, t }: {
    route: AppRoute;
    isActive: (r: AppRoute) => boolean;
    goTo: (href: string, enabled: boolean) => void;
    t: (key: string) => string;
}) {
    const Icon = route.icon;
    const active = isActive(route);

    return (
        <button type="button"
            onClick={() => goTo(route.href, route.enabled)}
            className={cn(
                'flex h-8 w-full items-center gap-[10px] rounded-lg px-2 text-left text-[12px] font-medium transition',
                active
                    ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-foreground'
                    : 'text-muted hover:bg-surface-2 hover:text-foreground',
            )}>
            <span className="flex size-4 shrink-0 items-center justify-center">
                <Icon size={16} />
            </span>
            <span className="min-w-0 flex-1 truncate">{t(route.labelKey)}</span>
            {route.shortcut ? (
                <kbd className="shrink-0 rounded border border-border bg-surface-2 px-1 py-0.5 text-[9px] font-medium text-subtle">
                    {route.shortcut}
                </kbd>
            ) : null}
        </button>
    );
}

function renderNavItem(routeKey: string, opts: {
    isActive: (r: AppRoute) => boolean;
    canView: (r: AppRoute) => boolean;
    goTo: (href: string, enabled: boolean) => void;
    t: (key: string) => string;
}) {
    const route = getRoute(routeKey);
    if (!route || !route.enabled || !opts.canView(route)) return null;
    return <NavItem key={routeKey} route={route} {...opts} />;
}

export function AppSidebar() {
    const { t } = useTranslation();
    const branding = useBranding();
    const appName = branding.appName || 'ARCHI LBO OS';
    const shortName = branding.shortName || 'LBO OS';
    const { sidebarCollapsed, toggleSidebar } = useTheme();
    const { url: currentPath, props } = usePage();
    const authUser = ((props as any).auth?.user || {}) as { id?: number; name?: string; email?: string; permissions?: string[] };
    const unreadCount = ((props as any).auth?.user?.unread_messages as number) || 0;

    const [wsOpen, setWsOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const wsRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function close(e: MouseEvent) {
            if (wsRef.current && !wsRef.current.contains(e.target as Node)) setWsOpen(false);
            if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
        }
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    useEffect(() => {
        function esc(e: KeyboardEvent) { if (e.key === 'Escape') { setWsOpen(false); setUserOpen(false); } }
        document.addEventListener('keydown', esc);
        return () => document.removeEventListener('keydown', esc);
    }, []);

    const goTo = useCallback((href: string, enabled: boolean) => {
        if (!enabled || !isValidHref(href)) {
            toast.info(t('app.soon'));
            return;
        }
        router.visit(href);
    }, [t]);

    const isActive = useCallback((item: AppRoute) => {
        return item.enabled && isActivePath(currentPath, item.href);
    }, [currentPath]);

    const canView = useCallback((route: AppRoute) => {
        if (route.requiredAnyPermissions?.length) {
            return route.requiredAnyPermissions.some((permission) => authUser.permissions?.includes(permission) === true);
        }

        return !route.requiredPermission || authUser.permissions?.includes(route.requiredPermission) === true;
    }, [authUser.permissions]);

    const navOpts = { isActive, canView, goTo, t };

    /* Only render a group section when at least one of its items is visible,
       otherwise a permission-restricted user sees a bare group label. */
    const visibleItems = useCallback((keys: readonly string[]): string[] => (
        keys.filter((key) => {
            const route = routeMap.get(key as AppRouteKey);
            return route && route.enabled && canView(route);
        })
    ), [canView]);

    const visibleWorkspace = visibleItems(workspaceItems);
    const visibleFollowUp = visibleItems(followUpItems.map((item) => item.key));
    const visibleFinance = visibleItems(financeChildren.map((item) => item.key));
    const visibleCommunication = visibleItems(['inbox', 'notifications']);
    const visibleAdministration = visibleItems(['users']);

    useEffect(() => {
        const shortcutToRoute: Record<string, string> = Object.fromEntries(
            appRoutes
                .filter((route) => route.shortcut)
                .map((route) => [route.shortcut!.replace('Alt+', '').toLowerCase(), route.key]),
        );

        function handleNavigationShortcut(event: KeyboardEvent) {
            if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return;

            const target = event.target as HTMLElement | null;
            if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) return;

            const route = getRoute(shortcutToRoute[event.key.toLowerCase()]);
            if (!route || !route.enabled || !canView(route)) return;

            event.preventDefault();
            event.stopPropagation();
            goTo(route.href, route.enabled);
        }

        window.addEventListener('keydown', handleNavigationShortcut, true);
        return () => window.removeEventListener('keydown', handleNavigationShortcut, true);
    }, [canView, goTo]);

    const userInitial = (authUser?.name || 'U').charAt(0).toUpperCase();

    /* ── Collapsed rail: fixed flyout/tooltip state ── */
    const flyoutTimerRef = useRef<number | null>(null);
    const flyoutRef = useRef<HTMLDivElement>(null);
    const [flyout, setFlyout] = useState<{
        type: 'tooltip' | 'flyout';
        label: string;
        icon?: React.ReactNode;
        x: number;
        y: number;
        items?: { key: string; labelKey?: string }[];
    } | null>(null);

    function cancelHide() { if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current); }

    function hideFlyout(delay = 120) {
        cancelHide();
        flyoutTimerRef.current = window.setTimeout(() => setFlyout(null), delay);
    }

    useEffect(() => {
        if (!flyout) return;
        function esc(e: KeyboardEvent) { if (e.key === 'Escape') setFlyout(null); }
        document.addEventListener('keydown', esc);
        return () => document.removeEventListener('keydown', esc);
    }, [flyout]);

    /* ================================================================
       COLLAPSED RAIL
       ================================================================ */
    if (sidebarCollapsed) {
        const opsActive = isGroupActive(operationsGroupKeys, isActive);
        const financeActive = isGroupActive(financeGroupKeys, isActive);

        const railBtn = (active: boolean) =>
            cn(
                'mx-auto flex size-9 items-center justify-center rounded-xl transition',
                active
                    ? 'bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-accent'
                    : 'text-muted hover:bg-surface-2 hover:text-foreground',
            );

        function handleEnter(e: React.MouseEvent<HTMLButtonElement>, label: string, opts?: {
            icon?: React.ReactNode;
            items?: { key: string; labelKey?: string }[];
        }) {
            if (flyoutTimerRef.current) clearTimeout(flyoutTimerRef.current);
            const rect = e.currentTarget.getBoundingClientRect();
            setFlyout({
                type: opts?.items ? 'flyout' : 'tooltip',
                label,
                icon: opts?.icon,
                x: rect.right + 10,
                y: rect.top,
                items: opts?.items,
            });
        }

        function handleLeave() {
            hideFlyout(120);
        }

        function renderFlyoutItem({ key, labelKey }: { key: string; labelKey?: string }) {
            const route = routeMap.get(key);
            if (!route || !route.enabled || !canView(route)) return null;
            const Icon = route.icon;
            const active = isActive(route);
            return (
                <button key={key} type="button"
                    onClick={() => { goTo(route.href, route.enabled); setFlyout(null); }}
                    className={cn(
                        'flex h-[34px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[12px] font-medium transition',
                        active
                            ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-foreground'
                            : 'text-muted hover:bg-surface-2 hover:text-foreground',
                    )}>
                    <span className="flex size-[15px] shrink-0 items-center justify-center">
                        <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{t(labelKey || route.labelKey)}</span>
                </button>
            );
        }

        function renderRailItem(routeKey: string, opts?: { badge?: ReactNode }) {
            const route = getRoute(routeKey);
            if (!route || !route.enabled || !canView(route)) return null;
            const Icon = route.icon;
            const active = isActive(route);
            return (
                <button type="button"
                    onClick={() => goTo(route.href, route.enabled)}
                    onMouseEnter={(e) => handleEnter(e, t(route.labelKey))}
                    onMouseLeave={handleLeave}
                    className={railBtn(active)}
                    aria-label={t(route.labelKey)}>
                    <Icon size={16} />
                    {opts?.badge}
                </button>
            );
        }

        return (
            <>
                <aside
                    className="flex flex-1 flex-col overflow-visible rounded-[14px] border bg-surface shadow-sm"
                    style={{ width: RAIL }}
                >
                    {/* ── Top: logo + expand ── */}
                    <div className="flex shrink-0 flex-col items-center gap-[6px] border-b border-border px-2 py-3">
                        <button type="button" onClick={() => goTo('/', true)}
                            onMouseEnter={(e) => handleEnter(e, shortName)}
                            onMouseLeave={handleLeave}
                            className="flex size-9 items-center justify-center rounded-[10px] bg-accent text-accent-fg"
                            aria-label={shortName}>
                            <IconBuildingSkyscraper size={18} />
                        </button>
                        <button type="button" onClick={toggleSidebar}
                            onMouseEnter={(e) => handleEnter(e, 'Expand')}
                            onMouseLeave={handleLeave}
                            className="flex size-8 items-center justify-center rounded-lg border border-border text-subtle transition hover:border-accent hover:text-accent"
                            aria-label="Expand sidebar">
                            <IconLayoutSidebarLeftExpand size={15} />
                        </button>
                    </div>

                    {/* ── Primary nav ── */}
                    <nav className="flex-1 space-y-[6px] overflow-y-auto px-2 py-3 scrollbar-none">
                        {/* Dashboard */}
                        {renderRailItem('dashboard')}

                        {/* Clients */}
                        {renderRailItem('clients')}

                        {/* Intermediaries */}
                        {renderRailItem('intermediaries')}

                        {/* Dossiers */}
                        {renderRailItem('dossiers')}

                        {/* Operations group flyout */}
                        {operationsGroupKeys.some((key) => {
                            const route = routeMap.get(key);
                            return route && route.enabled && canView(route);
                        }) ? <button type="button"
                            onMouseEnter={(e) => handleEnter(e, 'Operations', {
                                icon: <IconLayoutKanban size={16} />,
                                items: operationsGroupKeys.map((k) => ({ key: k })),
                            })}
                            onMouseLeave={handleLeave}
                            className={railBtn(opsActive)}
                            aria-label="Operations">
                            <IconLayoutKanban size={16} />
                        </button> : null}

                        {/* Finance group flyout */}
                        {financeGroupKeys.some((key) => {
                            const route = routeMap.get(key);
                            return route && route.enabled && canView(route);
                        }) ? <button type="button"
                            onMouseEnter={(e) => handleEnter(e, 'Finance', {
                                icon: <IconCoin size={16} />,
                                items: financeGroupKeys.map((k) => ({
                                    key: k,
                                    labelKey: k === 'finance' ? 'nav.financeOverview' : undefined,
                                })),
                            })}
                            onMouseLeave={handleLeave}
                            className={railBtn(financeActive)}
                            aria-label="Finance">
                            <IconCoin size={16} />
                        </button> : null}

                        {/* Inbox */}
                        {renderRailItem('inbox', {
                            badge: unreadCount > 0 ? (
                                <span className="absolute right-[5px] top-[3px] size-2 rounded-full bg-danger" />
                            ) : null,
                        })}

                        {/* Notifications */}
                        {renderRailItem('notifications')}

                        {/* Users (administration) */}
                        {renderRailItem('users')}
                    </nav>

                    {/* ── Bottom: settings, user, logout ── */}
                    <div className="shrink-0 border-t border-border px-2 py-2">
                        <div className="flex flex-col items-center gap-[6px]">
                            <button type="button" onClick={() => goTo('/settings', true)}
                                onMouseEnter={(e) => handleEnter(e, t('nav.settings'))}
                                onMouseLeave={handleLeave}
                                className="flex size-9 items-center justify-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-foreground"
                                aria-label={t('nav.settings')}>
                                <IconSettings size={16} />
                            </button>

                            <button type="button" onClick={() => setUserOpen((o) => !o)}
                                onMouseEnter={(e) => handleEnter(e, authUser?.name || 'User')}
                                onMouseLeave={handleLeave}
                                className="flex size-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-xs font-bold text-accent"
                                aria-label={authUser?.name || 'User'}>
                                {userInitial}
                            </button>

                            <button type="button" onClick={() => router.post('/logout')}
                                onMouseEnter={(e) => handleEnter(e, t('nav.logout'))}
                                onMouseLeave={handleLeave}
                                className="flex size-9 items-center justify-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-danger"
                                aria-label={t('nav.logout')}>
                                <IconLogout size={16} />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ── Fixed tooltip ── */}
                {flyout?.type === 'tooltip' ? (
                    <div
                        style={{ position: 'fixed', left: flyout.x, top: flyout.y + 6, zIndex: 99999 }}
                        className="pointer-events-none whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-xl"
                    >
                        {flyout.label}
                    </div>
                ) : null}

                {/* ── Fixed flyout menu ── */}
                {flyout?.type === 'flyout' && flyout.items?.length ? (
                    <div
                        ref={flyoutRef}
                        style={{ position: 'fixed', left: flyout.x, top: flyout.y + 4, zIndex: 99999 }}
                        className="w-[240px] rounded-xl border border-border bg-surface p-2 shadow-xl"
                        onMouseEnter={cancelHide}
                        onMouseLeave={() => hideFlyout()}
                    >
                        <div className="mb-1 flex items-center gap-2.5 border-b border-border px-1 pb-2">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
                                {flyout.icon || null}
                            </span>
                            <div>
                                <p className="text-[12px] font-semibold text-foreground">{flyout.label}</p>
                                <p className="text-[9px] text-muted">Quick access</p>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            {flyout.items.map(renderFlyoutItem)}
                        </div>
                    </div>
                ) : null}
            </>
        );
    }

    /* ================================================================
       EXPANDED SIDEBAR
       ================================================================ */
    return (
        <aside
            className="flex flex-1 flex-col overflow-hidden rounded-[14px] border bg-surface shadow-sm"
            style={{ width: EXPANDED }}
        >
            {/* ── Workspace header ── */}
            <div className="relative shrink-0 border-b border-border" ref={wsRef}>
                <button type="button" onClick={() => setWsOpen((o) => !o)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-surface-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-accent text-accent-fg">
                        <IconBuildingSkyscraper size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold leading-tight text-foreground">
                            {appName === 'ARCHI LBO OS' ? (<>
                                ARCHI LBO <span className="text-accent">OS</span>
                            </>) : appName}
                        </p>
                        <p className="truncate text-[10px] leading-tight text-muted">
                            {t('app.description')}
                        </p>
                    </div>
                    <IconChevronDown size={13} className={cn('shrink-0 text-subtle transition', wsOpen && 'rotate-180')} />
                </button>

                <button type="button" onClick={toggleSidebar}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-foreground"
                    title="Collapse" aria-label="Collapse">
                    <IconLayoutSidebarLeftCollapse size={13} />
                </button>

                {wsOpen ? (
                    <div className="absolute left-3 right-3 top-full z-[60] mt-1 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
                        <div className="flex items-center gap-2.5 border-b border-border px-2.5 py-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-accent text-accent-fg">
                                <IconBuildingSkyscraper size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-foreground">{appName}</p>
                                <p className="truncate text-[9px] text-muted">{t('app.description')}</p>
                            </div>
                            <IconCheck size={13} className="shrink-0 text-accent" />
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-none">
                {visibleWorkspace.length > 0 ? (
                    <NavigationSection label={t('nav.groups.principal')} icon={<IconLayoutKanban size={13} />}>
                        {visibleWorkspace.map((key) => renderNavItem(key, navOpts))}
                    </NavigationSection>
                ) : null}

                {visibleFollowUp.length > 0 ? (
                    <NavigationSection label={t('nav.groups.followUp')} icon={<IconClipboardList size={13} />}>
                        {visibleFollowUp.map((key) => renderNavItem(key, navOpts))}
                    </NavigationSection>
                ) : null}

                {visibleFinance.length > 0 ? (
                    <NavigationSection label={t('nav.finance')} icon={<IconCoin size={13} />}>
                        <div className="ml-2 border-l border-border/70 pl-2">
                            {visibleFinance.map((key) => {
                                const child = financeChildren.find((item) => item.key === key);
                                const route = getRoute(key);
                                if (!route) return null;
                                return <NavItem key={key} route={{ ...route, labelKey: child?.labelKey ?? route.labelKey }} {...navOpts} />;
                            })}
                        </div>
                    </NavigationSection>
                ) : null}

                {visibleCommunication.length > 0 ? (
                    <NavigationSection label={t('nav.groups.communication')} icon={<IconMessages size={13} />}>
                        {visibleCommunication.map((key) => renderNavItem(key, navOpts))}
                    </NavigationSection>
                ) : null}

                {visibleAdministration.length > 0 ? (
                    <NavigationSection label={t('nav.groups.administration')} icon={<IconShieldCheck size={13} />}>
                        {visibleAdministration.map((key) => renderNavItem(key, navOpts))}
                    </NavigationSection>
                ) : null}

                {/* ── Projects / Status dots ── */}
            </nav>

            {/* ── Bottom: settings, help, user ── */}
            <div className="relative shrink-0 border-t border-border" ref={userRef}>
                <div className="flex items-center gap-0.5 border-b border-border px-2 py-1">
                    <button type="button" onClick={() => goTo('/settings', true)}
                        className="flex h-7 flex-1 items-center gap-2 rounded-md px-2 text-[11px] font-medium text-muted transition hover:bg-surface-2 hover:text-foreground">
                        <IconSettings size={14} />
                        {t('nav.settings')}
                    </button>
                    <button type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-foreground"
                        title="Help" aria-label="Help">
                        <IconHelpCircle size={14} />
                    </button>
                </div>

                <button type="button" onClick={() => setUserOpen((o) => !o)}
                    className="flex h-11 w-full items-center gap-2.5 px-3 transition hover:bg-surface-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[9px] font-bold text-accent">
                        {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold leading-tight text-foreground">
                            {authUser?.name || 'User'}
                        </p>
                        <p className="truncate text-[10px] leading-tight text-muted">
                            {authUser?.email || ''}
                        </p>
                    </div>
                    <IconChevronRight size={12} className={cn('shrink-0 text-subtle transition', userOpen && 'rotate-90')} />
                </button>

                {userOpen ? (
                    <div className="absolute bottom-full left-2 right-2 z-[60] mb-1 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
                        <div className="flex items-center gap-2.5 border-b border-border px-2.5 py-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[9px] font-bold text-accent">
                                {userInitial}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-foreground">{authUser?.name || 'User'}</p>
                                <p className="truncate text-[9px] text-muted">{authUser?.email || ''}</p>
                            </div>
                        </div>
                        <div className="mt-1 space-y-0.5">
                            <button type="button" onClick={() => { router.visit('/settings'); setUserOpen(false); }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-foreground">
                                <IconSettings size={14} /> {t('nav.settings')}
                            </button>
                            <button type="button" onClick={() => { router.post('/logout'); setUserOpen(false); }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-danger">
                                <IconLogout size={14} /> {t('nav.logout')}
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </aside>
    );
}
