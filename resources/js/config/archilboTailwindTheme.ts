export const archilboTailwindTheme = {
    colors: {
        crm: {
            bg: 'var(--crm-bg)',
            surface: 'var(--crm-surface)',
            surface2: 'var(--crm-surface-2)',
            border: 'var(--crm-border)',
            text: 'var(--crm-text)',
            muted: 'var(--crm-text-muted)',
            gold: 'var(--crm-gold)',
            success: 'var(--crm-success)',
            danger: 'var(--crm-danger)',
            info: 'var(--crm-info)',
            violet: 'var(--crm-violet)',
        },
    },
    borderRadius: {
        crmXs: 'var(--crm-radius-xs)',
        crmSm: 'var(--crm-radius-sm)',
        crmMd: 'var(--crm-radius-md)',
        crmLg: 'var(--crm-radius-lg)',
        crmXl: 'var(--crm-radius-xl)',
    },
    spacing: {
        crmSidebar: 'var(--crm-sidebar-w)',
        crmTopbar: 'var(--crm-topbar-h)',
        crmPage: 'var(--crm-page-pad)',
        crmGap: 'var(--crm-page-gap)',
    },
} as const;