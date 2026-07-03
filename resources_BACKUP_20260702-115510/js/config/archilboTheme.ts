export const archilboTheme = {
    layout: {
        sidebarWidth: 216,
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
    colors: {
        bg: '#070808',
        bgElevated: '#0b0c0d',
        surface: '#101111',
        surface2: '#151513',
        surface3: '#1b1a16',
        border: '#2b2921',
        borderStrong: '#3a3528',
        text: '#f5f1e8',
        textMuted: '#a9a294',
        textSoft: '#756f64',
        accent: '#f6b725',
        accent2: '#d79516',
        success: '#4ade80',
        warning: '#f6b725',
        danger: '#fb5c5c',
        info: '#7fb0ff',
        violet: '#a78bfa',
    },
} as const;

export type ArchilboTheme = typeof archilboTheme;

export function applyArchilboTheme(root: HTMLElement = document.documentElement) {
    const { colors, layout, radius, spacing } = archilboTheme;

    const variables: Record<string, string> = {
        '--crm-bg': colors.bg,
        '--crm-bg-2': colors.bgElevated,
        '--crm-bg-3': colors.bgElevated,
        '--crm-surface': colors.surface,
        '--crm-surface-2': colors.surface2,
        '--crm-surface-3': colors.surface3,
        '--crm-border': colors.border,
        '--crm-border-strong': colors.borderStrong,
        '--crm-text': colors.text,
        '--crm-text-muted': colors.textMuted,
        '--crm-text-soft': colors.textSoft,
        '--crm-gold': colors.accent,
        '--crm-gold-2': colors.accent2,
        '--crm-success': colors.success,
        '--crm-danger': colors.danger,
        '--crm-info': colors.info,
        '--crm-violet': colors.violet,
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
