import type { ReactNode } from 'react';
import { AppMobileNav } from '@/components/layout/AppMobileNav';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';
import { useTranslation } from '@/lib/i18n';

type AppShellProps = {
    eyebrowKey?: string;
    titleKey: string;
    subtitleKey?: string;
    action?: ReactNode;
    children: ReactNode;
};

export function AppShell({ eyebrowKey, titleKey, subtitleKey, action, children }: AppShellProps) {
    const { t } = useTranslation();

    return (
        <div className="crm-shell min-h-screen text-[var(--crm-text)]">
            <div className="flex min-h-screen">
                <AppSidebar />

                <div className="min-w-0 flex-1">
                    <AppTopbar />

                    <main className="crm-page pb-28 lg:pb-[var(--crm-page-pad)]">
                        <header className="crm-panel-flat px-5 py-4">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div className="min-w-0">
                                    {eyebrowKey ? <p className="crm-eyebrow">{t(eyebrowKey)}</p> : null}
                                    <h1 className="mt-2 text-[24px] font-bold leading-none tracking-[-0.02em] text-[var(--crm-text)]">
                                        {t(titleKey)}
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
                </div>
            </div>

            <AppMobileNav />
        </div>
    );
}