import { router, usePage } from '@inertiajs/react';
import {
    Archive, Bell, Building2, CalendarDays, ChevronRight, FileCheck2, FilePlus2, FileText,
    LayoutDashboard, ListChecks, LogOut, MessageSquare, PanelLeftClose, PanelLeftOpen,
    Search, Settings, ShieldCheck, SlidersHorizontal, UserRound, Users, FolderKanban,
    BadgeDollarSign, Check,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { AppRoute } from '@/lib/appRoutes';
import { appRoutes, isActivePath, isValidHref } from '@/lib/appRoutes';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from '@/providers/ThemeProvider';

type NavItem = AppRoute & { section?: string };

const navSections: { label: string; items: AppRoute[] }[] = [
    {
        label: 'nav.groups.principal',
        items: appRoutes.filter((r) => r.group === 'principal'),
    },
    {
        label: 'nav.groups.followUp',
        items: appRoutes.filter((r) => r.group === 'followUp'),
    },
    {
        label: 'nav.groups.management',
        items: appRoutes.filter((r) => r.group === 'management'),
    },
    {
        label: 'nav.groups.administration',
        items: appRoutes.filter((r) => r.group === 'administration'),
    },
];

const wsDots: { labelKey: string; label: string; color: string; href: string }[] = [
    { labelKey: 'ws-operations', label: 'Operations', color: 'var(--crm-gold)', href: '/dossiers' },
    { labelKey: 'ws-finance', label: 'Finance', color: '#34d399', href: '/finance' },
    { labelKey: 'ws-documents', label: 'Documents', color: '#60a5fa', href: '/documents' },
    { labelKey: 'ws-tasks', label: 'Tasks', color: '#a78bfa', href: '/tasks' },
];

export function AppSidebar() {
    const { t } = useTranslation();
    const { sidebarCollapsed, toggleSidebar } = useTheme();
    const page = usePage();
    const currentPath = page.url;
    const authUser = ((page.props as any).auth?.user || {}) as { id?: number; name?: string; email?: string };
    const unreadCount = ((page.props as any).auth?.user?.unread_messages as number) || 0;

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

    function goTo(href: string, enabled: boolean) {
        if (!enabled || !isValidHref(href)) {
            toast.info('This module is not ready yet.');
            return;
        }
        router.visit(href);
    }

    function isActive(item: AppRoute) {
        return item.enabled && isActivePath(currentPath, item.href);
    }

    /* ---------- Collapsed Rail ---------- */
    if (sidebarCollapsed) {
        const allItems = appRoutes.filter((r) => r.enabled && r.icon);
        return (
            <aside className="crm-sidebar crm-sidebar-rail hidden h-full shrink-0 flex-col overflow-hidden md:flex">
                <div className="flex shrink-0 flex-col items-center gap-2 border-b border-[var(--crm-border)] py-3">
                    <button type="button" onClick={() => goTo('/', true)}
                        className="flex size-8 items-center justify-center rounded-[9px] bg-[var(--crm-gold)] text-black"
                        aria-label="ARCHI LBO OS">
                        <Building2 size={15} />
                    </button>

                    <div className="group relative">
                        <button type="button" onClick={toggleSidebar}
                            className="flex size-8 items-center justify-center rounded-lg border border-[var(--crm-border)] text-[var(--crm-text-muted)] transition hover:border-[var(--crm-gold)] hover:text-[var(--crm-gold)]"
                            aria-label="Expand sidebar">
                            <PanelLeftOpen size={15} />
                        </button>
                        <div className="crm-sidebar-tooltip">Expand sidebar</div>
                    </div>
                </div>

                {/* Nav icons */}
                <nav className="flex-1 overflow-y-auto scrollbar-none py-3 space-y-1">
                    {allItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        const showDot = item.key === 'inbox' && unreadCount > 0;
                        return (
                            <div key={item.key} className="relative flex items-center justify-center group">
                                <button type="button" onClick={() => goTo(item.href, item.enabled)}
                                    className={`crm-nav-item-rail ${active ? 'crm-nav-item-rail-active' : ''}`}
                                    aria-label={t(item.labelKey)}>
                                    <Icon size={16} />
                                    {showDot ? (
                                        <span className="absolute right-[6px] top-[4px] size-2 rounded-full bg-red-500" />
                                    ) : null}
                                </button>
                                <div className="crm-sidebar-tooltip">{t(item.labelKey)}</div>
                            </div>
                        );
                    })}

                    {/* Workspace color dots */}
                    <div className="border-t border-[var(--crm-border)] my-2 mx-3" />
                    {wsDots.map((w) => (
                        <div key={w.labelKey} className="relative flex items-center justify-center group">
                            <button type="button"
                                onClick={() => goTo(w.href, true)}
                                className="flex h-8 w-8 items-center justify-center mx-auto rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition"
                                aria-label={w.label}>
                                <span className="crm-ws-dot" style={{ background: w.color }} />
                            </button>
                            <div className="crm-sidebar-tooltip">{w.label}</div>
                        </div>
                    ))}
                </nav>

                {/* User avatar bottom */}
                <div className="shrink-0 border-t border-[var(--crm-border)] py-2">
                    <div className="flex flex-col items-center gap-2">
                        <div className="group relative">
                            <button type="button" onClick={() => setUserOpen((o) => !o)}
                                className="flex size-8 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-bold text-[var(--crm-gold)]"
                                aria-label={authUser?.name || 'User'}>
                                {(authUser?.name || 'U').charAt(0).toUpperCase()}
                            </button>
                            <div className="crm-sidebar-tooltip">{authUser?.name || 'User'}</div>
                        </div>

                        <div className="group relative">
                            <button type="button" onClick={() => router.visit('/settings')}
                                className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-2)] hover:text-[var(--crm-gold)]"
                                aria-label="Settings">
                                <Settings size={15} />
                            </button>
                            <div className="crm-sidebar-tooltip">Settings</div>
                        </div>

                        <div className="group relative">
                            <button type="button" onClick={() => router.post('/logout')}
                                className="flex size-8 items-center justify-center rounded-lg text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-2)] hover:text-[var(--crm-danger)]"
                                aria-label="Logout">
                                <LogOut size={15} />
                            </button>
                            <div className="crm-sidebar-tooltip">Logout</div>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center group">
                    <button type="button" onClick={() => setUserOpen((o) => !o)}
                        className="hidden"
                        aria-label={authUser?.name || 'User'}>
                        User
                    </button>

                    {/* User popover */}
                    {userOpen ? (
                        <div ref={userRef} className="absolute bottom-12 left-2 z-[60] crm-popover-card">
                            <div className="flex items-center gap-3 border-b border-[var(--crm-border)] px-3 py-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-xs font-bold text-[var(--crm-gold)]">
                                    {(authUser?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-[var(--crm-text)] truncate">{authUser?.name || 'User'}</p>
                                    <p className="text-[9px] text-[var(--crm-text-muted)] truncate">{authUser?.email || ''}</p>
                                </div>
                            </div>
                            <div className="p-1.5 space-y-0.5">
                                <button type="button" onClick={() => { router.visit('/settings'); setUserOpen(false); }}
                                    className="crm-popover-item">
                                    <Settings size={14} /> {t('nav.settings')}
                                </button>
                                <button type="button" onClick={() => { router.post('/logout'); setUserOpen(false); }}
                                    className="crm-popover-item">
                                    <LogOut size={14} /> {t('nav.logout')}
                                </button>
                            </div>
                        </div>
                    ) : null}
                    </div>
                </div>
            </aside>
        );
    }

    /* ---------- Expanded Sidebar ---------- */
    return (
        <aside className="crm-sidebar crm-sidebar-expanded hidden h-full shrink-0 flex-col overflow-hidden md:flex">
            {/* Brand top */}
            <div className="flex h-12 items-center justify-between border-b border-[var(--crm-border)] px-3">
                <div className="relative" ref={wsRef}>
                    <button type="button" onClick={() => setWsOpen((o) => !o)}
                        className="flex items-center gap-2.5 text-left group">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--crm-gold)] text-black">
                            <Building2 size={14} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold leading-tight text-[var(--crm-text)]">ARCHI LBO <span className="text-[var(--crm-gold)]">OS</span></p>
                            <p className="text-[9px] text-[var(--crm-text-muted)] leading-tight">{t('app.description')}</p>
                        </div>
                        <ChevronRight size={12} className="shrink-0 text-[var(--crm-text-soft)] ml-auto group-hover:text-[var(--crm-text)] transition" />
                    </button>

                    {wsOpen ? (
                        <div className="absolute left-0 top-full mt-1 z-[60] crm-popover-card">
                            <div className="p-1.5 space-y-0.5">
                                <div className="flex items-center gap-2.5 px-3 py-2">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--crm-gold)] text-black">
                                        <Building2 size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-[var(--crm-text)]">ARCHI LBO OS</p>
                                        <p className="text-[9px] text-[var(--crm-text-muted)]">{t('app.description')}</p>
                                    </div>
                                    <Check size={14} className="shrink-0 text-[var(--crm-gold)]" />
                                </div>
                            </div>
                            <div className="crm-popover-divider" />
                            <div className="p-1.5 space-y-0.5">
                                {wsDots.map((w) => (
                                    <button key={w.labelKey} type="button" onClick={() => { goTo(w.href, true); setWsOpen(false); }}
                                        className="crm-popover-item">
                                        <span className="crm-ws-dot" style={{ background: w.color }} />
                                        {w.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                <button type="button" onClick={toggleSidebar}
                    className="flex size-6 items-center justify-center rounded-md text-[var(--crm-text-soft)] hover:text-[var(--crm-text)] transition"
                    title="Collapse sidebar" aria-label="Collapse sidebar">
                    <PanelLeftClose size={14} />
                </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2.5">
                <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--crm-text-soft)] pointer-events-none" />
                    <input type="text" placeholder={`${t('nav.search')}...`}
                        className="crm-sb-search pl-7 pr-2" />
                </div>
            </div>

            {/* Nav sections */}
            <nav className="flex-1 overflow-y-auto scrollbar-none px-2 pb-2">
                {navSections.map((section) => {
                    const items = section.items.filter((r) => r.enabled && r.icon);
                    if (items.length === 0) return null;
                    return (
                        <div key={section.label} className="mb-3">
                            <p className="crm-sidebar-section">{t(section.label)}</p>
                            <div className="space-y-0.5">
                                {items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item);
                                    const showDot = item.key === 'inbox' && unreadCount > 0;
                                    return (
                                        <button key={item.key} type="button" onClick={() => goTo(item.href, item.enabled)}
                                            className={`crm-nav-item w-full ${active ? 'crm-nav-item-active' : ''} ${!item.enabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                            <span className="relative">
                                                <Icon size={15} />
                                                {showDot ? (
                                                    <span className="absolute -right-1 -top-1 size-2 rounded-full bg-red-500" />
                                                ) : null}
                                            </span>
                                            <span className="min-w-0 flex-1 truncate text-left">{t(item.labelKey)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

{/* Quick Spaces */}
                <p className="crm-sidebar-section">Quick Spaces</p>
                <div className="space-y-0.5">
                    {wsDots.map((w) => (
                        <button key={w.labelKey} type="button" onClick={() => goTo(w.href, true)}
                            className="crm-nav-item w-full">
                        <span className="crm-ws-dot" style={{ background: w.color }} />
                        <span className="min-w-0 flex-1 truncate text-left">{w.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* User footer */}
            <div className="relative shrink-0 border-t border-[var(--crm-border)] px-3 py-2.5" ref={userRef}>
                <button type="button" onClick={() => setUserOpen((o) => !o)}
                    className="flex w-full items-center gap-2.5 text-left group">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-[10px] font-bold text-[var(--crm-gold)]">
                        {(authUser?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-[var(--crm-text)] leading-tight truncate">{authUser?.name || 'User'}</p>
                        <p className="text-[9px] text-[var(--crm-text-muted)] leading-tight truncate">{authUser?.email || ''}</p>
                    </div>
                    <ChevronRight size={12} className="shrink-0 text-[var(--crm-text-soft)] group-hover:text-[var(--crm-text)] transition" />
                </button>

                {userOpen ? (
                    <div className="absolute bottom-full left-2 mb-1 z-[60] crm-popover-card" style={{ minWidth: '190px' }}>
                        <div className="flex items-center gap-3 border-b border-[var(--crm-border)] px-3 py-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-gold-soft)] text-xs font-bold text-[var(--crm-gold)]">
                                {(authUser?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-[var(--crm-text)] truncate">{authUser?.name || 'User'}</p>
                                <p className="text-[9px] text-[var(--crm-text-muted)] truncate">{authUser?.email || ''}</p>
                            </div>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                            <button type="button" onClick={() => { router.visit('/settings'); setUserOpen(false); }}
                                className="crm-popover-item">
                                <Settings size={14} /> {t('nav.settings')}
                            </button>
                            <button type="button" onClick={() => { router.post('/logout'); setUserOpen(false); }}
                                className="crm-popover-item">
                                <LogOut size={14} /> {t('nav.logout')}
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </aside>
    );
}
