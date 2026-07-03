import type { ReactNode } from 'react';
import { AppMobileNav } from '@/components/layout/AppMobileNav';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';
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
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                        {eyebrowKey ? <p className="crm-eyebrow">{t(eyebrowKey)}</p> : null}
                        <h1 className="mt-2 text-[24px] font-bold leading-none tracking-[-0.02em] text-[var(--crm-text)]">
                            {t(titleKey ?? '')}
                        </h1>
                        {subtitleKey ? (
                            <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--crm-text-muted)]">
                                {t(subtitleKey)}
                            </p>
                        ) : null}
                    </div>

                    {action ? (
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                            {action}
                        </div>
                    ) : null}
                </div>
            </header>

            {children}
        </main>
    );
}
