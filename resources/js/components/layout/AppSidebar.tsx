import { router, usePage } from '@inertiajs/react';
import { Building2, ChevronRight } from 'lucide-react';
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
    const { sidebarCollapsed } = useTheme();
    const page = usePage();
    const currentPath = page.url.split('?')[0];
    const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set(['financeParent']));

    function goTo(href: string, enabled: boolean) {
        if (!enabled || !isValidHref(href)) {
            toast.info('This module is not ready yet.');
            return;
        }

        router.visit(href);
    }

    function toggleExpand(key: string) {
        setExpandedParents(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }

    function renderItem(item: NavigationItem, level: number = 0) {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedParents.has(item.key);
        const Icon = item.icon;
        const label = t(item.labelKey);
        const itemEnabled = item.enabled ?? true;
        
        // Only mark an item as active if it itself is the current page
        const isItemActive = item.href && item.enabled && isActivePath(currentPath, item.href);
        const active = isItemActive;

        const buttonContent = (
            <button
                key={item.key}
                type="button"
                onClick={() => {
                    if (hasChildren) {
                        toggleExpand(item.key);
                    } else if (item.href) {
                        goTo(item.href, itemEnabled);
                    }
                }}
                className={[
                    'group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 w-full',
                    active
                        ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm'
                        : itemEnabled
                          ? 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                          : 'cursor-not-allowed text-[var(--text-subtle)] opacity-70',
                    sidebarCollapsed 
                        ? 'h-10 w-10 justify-center mx-auto' 
                        : 'h-10 px-3'
                ].join(' ')}
                style={{
                    paddingLeft: !sidebarCollapsed ? `${12 + level * 8}px` : undefined
                }}
            >
                {Icon && (
                    <Icon
                        size={18}
                        className={active ? 'text-[var(--accent-foreground)]' : 'text-current'}
                    />
                )}

                {!sidebarCollapsed && (
                    <>
                        <span className="min-w-0 flex-1 truncate">{label}</span>

                        {item.badgeKey ? (
                            <AppBadge tone="neutral">{t(item.badgeKey)}</AppBadge>
                        ) : null}

                        {hasChildren && (
                            <ChevronRight 
                                size={16}
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            />
                        )}
                    </>
                )}
            </button>
        );

        return (
            <div key={item.key}>
                {sidebarCollapsed && item.icon ? (
                    <AppTooltip label={label} position="right">
                        {buttonContent}
                    </AppTooltip>
                ) : buttonContent}

                {hasChildren && !sidebarCollapsed && (
                    <div className={[
                        'mt-0.5 space-y-1 overflow-hidden transition-all duration-300',
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    ].join(' ')}>
                        {item.children!.map(child => renderItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <aside className={[
            'hidden h-screen shrink-0 border-r bg-[var(--surface)] lg:sticky lg:top-0 lg:flex lg:flex-col transition-all duration-300 overflow-hidden',
            sidebarCollapsed ? 'w-[64px]' : 'w-[256px]'
        ].join(' ')}>
            <div className={[
                'flex items-center gap-3 border-b transition-all duration-300',
                sidebarCollapsed ? 'h-16 justify-center px-0' : 'h-16 px-5'
            ].join(' ')}>
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm">
                    <Building2 size={19} />
                </div>

                {!sidebarCollapsed && (
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{t('app.name')}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">{t('app.description')}</p>
                    </div>
                )}
            </div>

            <nav className="app-scrollbar flex-1 space-y-6 overflow-y-auto px-2 py-4">
                {navigationGroups.map((group) => (
                    <section key={group.labelKey}>
                        {!sidebarCollapsed && (
                            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                                {t(group.labelKey)}
                            </p>
                        )}

                        <div className="space-y-1">
                            {group.items.map((item) => renderItem(item))}
                        </div>
                    </section>
                ))}
            </nav>
        </aside>
    );
}
