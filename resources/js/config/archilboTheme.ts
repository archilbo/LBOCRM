export const archilboTheme = {
    layout: {
        sidebarWidth: 248,
        sidebarRailWidth: 56,
        topbarHeight: 64,
        mobileBottomNavHeight: 72,
        pagePadding: 32,
        pagePaddingCompact: 16,
        rightPanelWidth: 360,
        maxContentWidth: 1600,
    },
    radius: {
        xs: 6,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        pill: 999,
    },
    spacing: {
        pageGap: 18,
        panelGap: 14,
        cardPadding: 16,
        compactCardPadding: 12,
        tableRowHeight: 52,
        sidebarItemHeight: 42,
    },
} as const;

export type ArchilboTheme = typeof archilboTheme;

export function applyArchilboTheme(root: HTMLElement = document.documentElement) {
    const { layout, radius, spacing } = archilboTheme;

    const variables: Record<string, string> = {
        '--crm-sidebar-w': `${layout.sidebarWidth}px`,
        '--crm-sidebar-rail-w': `${layout.sidebarRailWidth}px`,
        '--crm-topbar-h': `${layout.topbarHeight}px`,
        '--app-topbar-h': `${layout.topbarHeight}px`,
        '--mobile-bottom-nav-h': `${layout.mobileBottomNavHeight}px`,
        '--crm-right-panel-w': `${layout.rightPanelWidth}px`,
        '--crm-page-pad': `${layout.pagePadding}px`,
        '--crm-page-gap': `${spacing.pageGap}px`,
        '--crm-panel-gap': `${spacing.panelGap}px`,
        '--crm-card-pad': `${spacing.cardPadding}px`,
        '--crm-card-pad-sm': `${spacing.compactCardPadding}px`,
        '--crm-radius-xs': `${radius.xs}px`,
        '--crm-radius-sm': `${radius.sm}px`,
        '--crm-radius-md': `${radius.md}px`,
        '--crm-radius-lg': `${radius.lg}px`,
        '--crm-radius-xl': `${radius.xl}px`,
    };

    Object.entries(variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
}
