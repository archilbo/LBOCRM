import type { ReactNode } from 'react';
import { AppMobileNav } from '@/components/layout/AppMobileNav';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';
import { AppPageHeader } from '@/components/ui/AppPageHeader';
import { useTranslation } from '@/lib/i18n';

type AppShellProps = {
    eyebrowKey?: string;
    titleKey?: string;
    subtitleKey?: string;
    action?: ReactNode;
    children: ReactNode;
    fullBleed?: boolean;
    hideMobileNav?: boolean;
};

export function AppShell({ eyebrowKey, titleKey, subtitleKey, action, children, fullBleed, hideMobileNav }: AppShellProps) {
    const { t } = useTranslation();
    const shellClass = hideMobileNav ? 'crm-shell no-bottom-nav' : 'crm-shell';

    function renderShell(inner: ReactNode) {
        return (
            <div className={shellClass}>
                <AppSidebar />

                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <AppTopbar />

                    {inner}
                </div>

                {!hideMobileNav ? <AppMobileNav /> : null}
            </div>
        );
    }

    if (fullBleed) {
        return renderShell(
            <main className="flex-1 min-h-0 overflow-hidden">
                {children}
            </main>
        );
    }

    return renderShell(
        <main className="crm-page flex-1 min-h-0 pb-28 md:pb-[var(--crm-page-pad)]">
            <header className="crm-panel-flat px-5 py-4">
                <AppPageHeader
                    eyebrow={eyebrowKey ? t(eyebrowKey) : undefined}
                    title={t(titleKey ?? '')}
                    subtitle={subtitleKey ? t(subtitleKey) : undefined}
                    actions={action}
                />
            </header>

            {children}
        </main>
    );
}
