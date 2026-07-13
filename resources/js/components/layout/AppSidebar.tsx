import { router, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign, Building2, ChevronDown, ChevronRight, FolderKanban,
    HelpCircle, LogOut, PanelLeftClose, PanelLeftOpen, Search, Settings, Check,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { AppRoute } from '@/config/navigation';
import { appRoutes, isActivePath, isValidHref } from '@/config/navigation';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from '@/providers/ThemeProvider';

const EXPANDED = 236;
const RAIL = 64;

const routeMap = new Map(appRoutes.map((r) => [r.key, r]));
function getRoute(key: string): AppRoute | undefined {
    return routeMap.get(key);
}

const mainItems = [
    { key: 'dashboard' as const },
    { key: 'clients' as const, shortcut: '#1' },
    { key: 'intermediaries' as const, shortcut: '#2' },
    { key: 'dossiers' as const, shortcut: '#3' },
];

const followUpItems: { key: string }[] = [
    { key: 'documents' },
    { key: 'contracts' },
    { key: 'authorizations' },
    { key: 'tasks' },
    { key: 'calendar' },
    { key: 'taskRequests' },
    { key: 'workload' },
    { key: 'operationsReports' },
];

const financeChildren: { key: string; labelKey?: string }[] = [
    { key: 'finance', labelKey: 'nav.financeOverview' },
    { key: 'financeDocuments' },
    { key: 'financePayments' },
    { key: 'financeMonthly' },
    { key: 'financeTemplates' },
    { key: 'financeSettings' },
];

const statusDots = [
    { label: 'Active dossiers', color: '#22c55e' },
    { label: 'Finance', color: '#f59e0b' },
    { label: 'Blocked', color: '#ef4444' },
    { label: 'Archive', color: '#8b5cf6' },
];

/* ── Group keys for collapsed rail popovers ── */
const operationsGroupKeys = [
    'documents', 'contracts', 'authorizations', 'tasks',
    'calendar', 'taskRequests', 'workload', 'operationsReports',
] as const;

const financeGroupKeys = [
    'finance', 'financeDocuments', 'financePayments',
    'financeMonthly', 'financeTemplates', 'financeSettings',
] as const;

function isGroupActive(keys: readonly string[], isActive: (r: AppRoute) => boolean): boolean {
    return keys.some((key) => {
        const route = routeMap.get(key);
        return route && route.enabled && isActive(route);
    });
}

function SectionLabel({ label }: { label: string }) {
    return (
        <p className="mb-1 mt-[18px] px-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-subtle">
            {label}
        </p>
    );
}

function NavItem({ route, shortcut, isActive, goTo, t }: {
    route: AppRoute;
    shortcut?: string;
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
                'flex h-8 w-full items-center gap-[10px] rounded-lg px-2 text-left text-[13px] font-medium transition',
                active
                    ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-foreground'
                    : 'text-muted hover:bg-surface-2 hover:text-foreground',
            )}>
            <span className="flex size-4 shrink-0 items-center justify-center">
                <Icon size={16} />
            </span>
            <span className="min-w-0 flex-1 truncate">{t(route.labelKey)}</span>
            {shortcut ? (
                <span className="shrink-0 text-[10px] font-medium text-subtle">{shortcut}</span>
            ) : null}
        </button>
    );
}

function renderNavItem(routeKey: string, opts: {
    isActive: (r: AppRoute) => boolean;
    goTo: (href: string, enabled: boolean) => void;
    t: (key: string) => string;
    shortcut?: string;
}) {
    const route = getRoute(routeKey);
    if (!route || !route.enabled) return null;
    return <NavItem key={routeKey} route={route} {...opts} />;
}

export function AppSidebar() {
    const { t } = useTranslation();
    const { sidebarCollapsed, toggleSidebar } = useTheme();
    const { url: currentPath, props } = usePage();
    const authUser = ((props as any).auth?.user || {}) as { id?: number; name?: string; email?: string };
    const unreadCount = ((props as any).auth?.user?.unread_messages as number) || 0;

    const [wsOpen, setWsOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [financeOpen, setFinanceOpen] = useState(false);
    const wsRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);
    const prevPath = useRef(currentPath);

    const isFinanceRoute = currentPath === '/finance' || currentPath.startsWith('/finance/');
    useEffect(() => {
        if (prevPath.current !== currentPath) {
            if (isFinanceRoute) setFinanceOpen(true);
            prevPath.current = currentPath;
        }
    }, [currentPath, isFinanceRoute]);

    const showFinanceChildren = financeOpen || isFinanceRoute;

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

    const navOpts = { isActive, goTo, t };

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
            if (!route || !route.enabled) return null;
            const Icon = route.icon;
            const active = isActive(route);
            return (
                <button key={key} type="button"
                    onClick={() => { goTo(route.href, route.enabled); setFlyout(null); }}
                    className={cn(
                        'flex h-[34px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] font-medium transition',
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

        return (
            <>
                <aside
                    className="flex flex-1 flex-col overflow-visible rounded-[14px] border bg-surface shadow-sm"
                    style={{ width: RAIL }}
                >
                    {/* ── Top: logo + expand ── */}
                    <div className="flex shrink-0 flex-col items-center gap-[6px] border-b border-border px-2 py-3">
                        <button type="button" onClick={() => goTo('/', true)}
                            onMouseEnter={(e) => handleEnter(e, t('app.name'))}
                            onMouseLeave={handleLeave}
                            className="flex size-9 items-center justify-center rounded-[10px] bg-accent text-accent-fg"
                            aria-label={t('app.name')}>
                            <Building2 size={18} />
                        </button>
                        <button type="button" onClick={toggleSidebar}
                            onMouseEnter={(e) => handleEnter(e, 'Expand')}
                            onMouseLeave={handleLeave}
                            className="flex size-8 items-center justify-center rounded-lg border border-border text-subtle transition hover:border-accent hover:text-accent"
                            aria-label="Expand sidebar">
                            <PanelLeftOpen size={15} />
                        </button>
                    </div>

                    {/* ── Primary nav ── */}
                    <nav className="flex-1 space-y-[6px] overflow-y-auto px-2 py-3 scrollbar-none">
                        {/* Dashboard */}
                        {(() => {
                            const route = getRoute('dashboard');
                            if (!route || !route.enabled) return null;
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
                                </button>
                            );
                        })()}

                        {/* Clients */}
                        {(() => {
                            const route = getRoute('clients');
                            if (!route || !route.enabled) return null;
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
                                </button>
                            );
                        })()}

                        {/* Dossiers */}
                        {(() => {
                            const route = getRoute('dossiers');
                            if (!route || !route.enabled) return null;
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
                                </button>
                            );
                        })()}

                        {/* Operations group flyout */}
                        <button type="button"
                            onMouseEnter={(e) => handleEnter(e, 'Operations', {
                                icon: <FolderKanban size={16} />,
                                items: operationsGroupKeys.map((k) => ({ key: k })),
                            })}
                            onMouseLeave={handleLeave}
                            className={railBtn(opsActive)}
                            aria-label="Operations">
                            <FolderKanban size={16} />
                        </button>

                        {/* Finance group flyout */}
                        <button type="button"
                            onMouseEnter={(e) => handleEnter(e, 'Finance', {
                                icon: <BadgeDollarSign size={16} />,
                                items: financeGroupKeys.map((k) => ({
                                    key: k,
                                    labelKey: k === 'finance' ? 'nav.financeOverview' : undefined,
                                })),
                            })}
                            onMouseLeave={handleLeave}
                            className={railBtn(financeActive)}
                            aria-label="Finance">
                            <BadgeDollarSign size={16} />
                        </button>

                        {/* Inbox */}
                        {(() => {
                            const route = getRoute('inbox');
                            if (!route || !route.enabled) return null;
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
                                    {unreadCount > 0 ? (
                                        <span className="absolute right-[5px] top-[3px] size-2 rounded-full bg-danger" />
                                    ) : null}
                                </button>
                            );
                        })()}

                        {/* Notifications */}
                        {(() => {
                            const route = getRoute('notifications');
                            if (!route || !route.enabled) return null;
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
                                </button>
                            );
                        })()}
                    </nav>

                    {/* ── Bottom: settings, user, logout ── */}
                    <div className="shrink-0 border-t border-border px-2 py-2">
                        <div className="flex flex-col items-center gap-[6px]">
                            <button type="button" onClick={() => goTo('/settings', false)}
                                onMouseEnter={(e) => handleEnter(e, t('nav.settings'))}
                                onMouseLeave={handleLeave}
                                className="flex size-9 items-center justify-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-foreground"
                                aria-label={t('nav.settings')}>
                                <Settings size={16} />
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
                                <LogOut size={16} />
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
                                <p className="text-[13px] font-semibold text-foreground">{flyout.label}</p>
                                <p className="text-[10px] text-muted">Quick access</p>
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
                        <Building2 size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
                            ARCHI LBO <span className="text-accent">OS</span>
                        </p>
                        <p className="truncate text-[11px] leading-tight text-muted">
                            {t('app.description')}
                        </p>
                    </div>
                    <ChevronDown size={13} className={cn('shrink-0 text-subtle transition', wsOpen && 'rotate-180')} />
                </button>

                <button type="button" onClick={toggleSidebar}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-foreground"
                    title="Collapse" aria-label="Collapse">
                    <PanelLeftClose size={13} />
                </button>

                {wsOpen ? (
                    <div className="absolute left-3 right-3 top-full z-[60] mt-1 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
                        <div className="flex items-center gap-2.5 border-b border-border px-2.5 py-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-accent text-accent-fg">
                                <Building2 size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-foreground">ARCHI LBO OS</p>
                                <p className="truncate text-[10px] text-muted">{t('app.description')}</p>
                            </div>
                            <Check size={13} className="shrink-0 text-accent" />
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ── Search ── */}
            <div className="shrink-0 px-3 py-2.5">
                <div className="relative">
                    <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
                    <input type="text" placeholder={t('nav.search')}
                        className="h-8 w-full rounded-lg border border-border bg-surface-2 pl-7 pr-2 text-[12px] text-foreground outline-none transition placeholder:text-subtle focus:border-accent/50" />
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2 scrollbar-none">
                {/* Main */}
                <SectionLabel label={t('nav.groups.principal')} />
                {mainItems.map(({ key, shortcut }) => (
                    <NavItem key={key} route={getRoute(key)!} shortcut={shortcut} {...navOpts} />
                ))}

                {/* Follow-up */}
                <SectionLabel label={t('nav.groups.followUp')} />
                {followUpItems.map(({ key }) => renderNavItem(key, navOpts))}

                {/* Management */}
                <SectionLabel label={t('nav.groups.management')} />

                {/* Finance expandable */}
                {(() => {
                    const fr = routeMap.get('finance');
                    if (!fr || !fr.enabled) return null;
                    const Icon = fr.icon;
                    const active = isActive(fr);
                    return (
                        <div key="finance-group">
                            <button type="button"
                                onClick={() => goTo(fr.href, fr.enabled)}
                                className={cn(
                                    'flex h-8 w-full items-center gap-[10px] rounded-lg px-2 text-left text-[13px] font-medium transition',
                                    active
                                        ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-foreground'
                                        : 'text-muted hover:bg-surface-2 hover:text-foreground',
                                )}>
                                <span className="flex size-4 shrink-0 items-center justify-center">
                                    <Icon size={16} />
                                </span>
                                <span className="min-w-0 flex-1 truncate">{t(fr.labelKey)}</span>
                                <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); setFinanceOpen((o) => !o); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setFinanceOpen((o) => !o); } }}
                                    className="flex size-5 cursor-pointer items-center justify-center rounded text-subtle hover:text-foreground"
                                    aria-label="Toggle finance">
                                    <ChevronRight size={12} className={cn('transition', showFinanceChildren && 'rotate-90')} />
                                </span>
                            </button>
                            {showFinanceChildren ? (
                                <div className="ml-0.5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                                    {financeChildren.map(({ key, labelKey }) => {
                                        const cr = routeMap.get(key);
                                        if (!cr || !cr.enabled) return null;
                                        const ChildIcon = cr.icon;
                                        const childActive = isActive(cr);
                                        return (
                                            <button key={key} type="button"
                                                onClick={() => goTo(cr.href, cr.enabled)}
                                                className={cn(
                                                    'flex h-7 w-full items-center gap-2 rounded-lg pl-2 pr-2 text-left text-[12px] font-medium transition',
                                                    childActive
                                                        ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-foreground'
                                                        : 'text-muted hover:bg-surface-2 hover:text-foreground',
                                                )}>
                                                <span className="flex size-3.5 shrink-0 items-center justify-center">
                                                    <ChildIcon size={13} />
                                                </span>
                                                <span className="min-w-0 flex-1 truncate">
                                                    {t(labelKey || cr.labelKey)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    );
                })()}

                {/* Archives */}
                {(() => {
                    const route = routeMap.get('archives');
                    if (!route || !route.enabled) return null;
                    return <NavItem key="archives" route={route} {...navOpts} />;
                })()}

                {/* Inbox */}
                {(() => {
                    const route = routeMap.get('inbox');
                    if (!route || !route.enabled) return null;
                    const Icon = route.icon;
                    const active = isActive(route);
                    const showDot = unreadCount > 0;
                    return (
                        <button key="inbox" type="button"
                            onClick={() => goTo(route.href, route.enabled)}
                            className={cn(
                                'flex h-8 w-full items-center gap-[10px] rounded-lg px-2 text-left text-[13px] font-medium transition',
                                active
                                    ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-foreground'
                                    : 'text-muted hover:bg-surface-2 hover:text-foreground',
                            )}>
                            <span className="relative flex size-4 shrink-0 items-center justify-center">
                                <Icon size={16} />
                                {showDot ? <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-danger" /> : null}
                            </span>
                            <span className="min-w-0 flex-1 truncate">{t(route.labelKey)}</span>
                            {showDot ? (
                                <span className="shrink-0 rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            ) : null}
                        </button>
                    );
                })()}

                {/* Administration */}
                <SectionLabel label={t('nav.groups.administration')} />
                {['notifications', 'users'].map((k) => renderNavItem(k, navOpts))}

                {/* ── Projects / Status dots ── */}
                <SectionLabel label="PROJECTS" />
                <div className="space-y-0.5">
                    {statusDots.map((dot) => (
                        <div key={dot.label}
                            className="flex h-7 items-center gap-[10px] rounded-lg px-2 text-[12px] font-medium text-muted">
                            <span className="block size-2 shrink-0 rounded-sm" style={{ background: dot.color }} />
                            <span className="min-w-0 flex-1 truncate">{dot.label}</span>
                        </div>
                    ))}
                </div>
            </nav>

            {/* ── Bottom: settings, help, user ── */}
            <div className="relative shrink-0 border-t border-border" ref={userRef}>
                <div className="flex items-center gap-0.5 border-b border-border px-2 py-1">
                    <button type="button" onClick={() => goTo('/settings', false)}
                        className="flex h-7 flex-1 items-center gap-2 rounded-md px-2 text-[12px] font-medium text-muted transition hover:bg-surface-2 hover:text-foreground">
                        <Settings size={14} />
                        {t('nav.settings')}
                    </button>
                    <button type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-subtle transition hover:bg-surface-2 hover:text-foreground"
                        title="Help" aria-label="Help">
                        <HelpCircle size={14} />
                    </button>
                </div>

                <button type="button" onClick={() => setUserOpen((o) => !o)}
                    className="flex h-11 w-full items-center gap-2.5 px-3 transition hover:bg-surface-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[10px] font-bold text-accent">
                        {userInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold leading-tight text-foreground">
                            {authUser?.name || 'User'}
                        </p>
                        <p className="truncate text-[11px] leading-tight text-muted">
                            {authUser?.email || ''}
                        </p>
                    </div>
                    <ChevronRight size={12} className={cn('shrink-0 text-subtle transition', userOpen && 'rotate-90')} />
                </button>

                {userOpen ? (
                    <div className="absolute bottom-full left-2 right-2 z-[60] mb-1 rounded-xl border border-border bg-surface p-1.5 shadow-lg">
                        <div className="flex items-center gap-2.5 border-b border-border px-2.5 py-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[10px] font-bold text-accent">
                                {userInitial}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-foreground">{authUser?.name || 'User'}</p>
                                <p className="truncate text-[10px] text-muted">{authUser?.email || ''}</p>
                            </div>
                        </div>
                        <div className="mt-1 space-y-0.5">
                            <button type="button" onClick={() => { router.visit('/settings'); setUserOpen(false); }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-foreground">
                                <Settings size={14} /> {t('nav.settings')}
                            </button>
                            <button type="button" onClick={() => { router.post('/logout'); setUserOpen(false); }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted transition hover:bg-surface-2 hover:text-danger">
                                <LogOut size={14} /> {t('nav.logout')}
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </aside>
    );
}
