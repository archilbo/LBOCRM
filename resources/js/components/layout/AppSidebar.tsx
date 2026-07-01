import { router, usePage } from '@inertiajs/react';
import { Building2, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppTooltip } from '@/components/ui/AppTooltip';
import { navigationGroups } from '@/components/layout/navigation';
import type { NavigationItem } from '@/components/layout/navigation';
import { isActivePath, isValidHref } from '@/lib/appRoutes';
import { useTranslation } from '@/lib/i18n';
import { useTheme } from '@/providers/ThemeProvider';

export function AppSidebar() {
    const { t } = useTranslation();
    const { sidebarCollapsed, toggleSidebar } = useTheme();
    const page = usePage();
    const currentPath = page.url;
    const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set(['financeParent']));

    function goTo(href: string, enabled: boolean) {
        if (!enabled || !isValidHref(href)) {
            toast.info('This module is not ready yet.');
            return;
        }

        router.visit(href);
    }

    function toggleExpand(key: string) {
        setExpandedParents((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }

    function renderItem(item: NavigationItem, level = 0) {
        const hasChildren = Boolean(item.children?.length);
        const isExpanded = expandedParents.has(item.key);
        const Icon = item.icon;
        const label = t(item.labelKey);
        const itemEnabled = item.enabled ?? true;
        const isItemActive = Boolean(item.href && item.enabled && isActivePath(currentPath, item.href));
        const active = hasChildren ? false : isItemActive;

        const buttonContent = (
            <button
                key={item.key}
                type="button"
                onClick={() => {
                    if (hasChildren) toggleExpand(item.key);
                    else if (item.href) goTo(item.href, itemEnabled);
                }}
                className={[
                    'crm-nav-item group w-full text-sm font-semibold',
                    active ? 'crm-nav-item-active' : '',
                    !active && itemEnabled ? '' : '',
                    !itemEnabled ? 'cursor-not-allowed opacity-45' : '',
                    sidebarCollapsed ? 'mx-auto h-10 w-10 justify-center px-0' : 'justify-start',
                    level > 0 && !sidebarCollapsed ? 'text-[13px]' : '',
                ].join(' ')}
                style={{ paddingLeft: !sidebarCollapsed ? `${12 + level * 14}px` : undefined }}
            >
                {Icon ? <Icon size={level > 0 ? 16 : 18} className="shrink-0 text-current" /> : null}

                {!sidebarCollapsed ? (
                    <>
                        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
                        {item.badgeKey ? <AppBadge tone="neutral">{t(item.badgeKey)}</AppBadge> : null}
                        {hasChildren ? (
                            <ChevronRight
                                size={15}
                                className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            />
                        ) : null}
                    </>
                ) : null}
            </button>
        );

        return (
            <div key={item.key}>
                {sidebarCollapsed && item.icon ? (
                    <AppTooltip label={label} position="right">
                        {buttonContent}
                    </AppTooltip>
                ) : buttonContent}

                {hasChildren && !sidebarCollapsed ? (
                    <div className={[
                        'ml-2 mt-1 space-y-1 overflow-hidden border-l border-[var(--crm-border)] pl-2 transition-all duration-300',
                        isExpanded ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0',
                    ].join(' ')}>
                        {item.children!.map((child) => renderItem(child, level + 1))}
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <aside className={[
            'crm-sidebar hidden h-full shrink-0 overflow-hidden lg:flex lg:flex-col transition-all duration-300',
            sidebarCollapsed ? 'w-[72px]' : 'w-[264px]',
        ].join(' ')}>
            <div className={[
                'flex h-[72px] items-center border-b border-[var(--crm-border)] transition-all duration-300',
                sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-5',
            ].join(' ')}>
                <button
                    type="button"
                    onClick={() => goTo('/', true)}
                    className="flex min-w-0 items-center gap-3 text-left"
                >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--crm-radius-md)] bg-[var(--crm-gold)] text-black shadow-[var(--crm-shadow-gold)]">
                        <Building2 size={19} />
                    </div>

                    {!sidebarCollapsed ? (
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black tracking-[-0.02em] text-[var(--crm-text)]">ARCHI LBO <span className="text-[var(--crm-gold)]">OS</span></p>
                            <p className="truncate text-[11px] text-[var(--crm-text-muted)]">{t('app.description')}</p>
                        </div>
                    ) : null}
                </button>

                {!sidebarCollapsed ? (
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="crm-action-button h-8 w-8 px-0 text-[var(--crm-text-muted)]"
                        title="Collapse sidebar"
                    >
                        <PanelLeftClose size={15} />
                    </button>
                ) : null}
            </div>

            {sidebarCollapsed ? (
                <div className="flex justify-center border-b border-[var(--crm-border)] py-3">
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="crm-action-button h-9 w-9 px-0 text-[var(--crm-text-muted)]"
                        title="Expand sidebar"
                    >
                        <PanelLeftOpen size={15} />
                    </button>
                </div>
            ) : null}

            <nav className="crm-scroll-thin scrollbar-none flex-1 space-y-6 overflow-y-auto px-3 py-4">
                {navigationGroups.map((group) => (
                    <section key={group.labelKey}>
                        {!sidebarCollapsed ? (
                            <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--crm-text-soft)]">
                                {t(group.labelKey)}
                            </p>
                        ) : null}

                        <div className="space-y-1">
                            {group.items.map((item) => renderItem(item))}
                        </div>
                    </section>
                ))}
            </nav>
        </aside>
    );
}