import { ReactNode } from 'react';
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

export function AppShell({
    eyebrowKey,
    titleKey,
    subtitleKey,
    action,
    children,
}: AppShellProps) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
            <div className="flex min-h-screen">
                <AppSidebar />

                <div className="min-w-0 flex-1">
                    <AppTopbar />

                    <main className="mx-auto flex w-full max-w-[1560px] flex-col gap-5 px-4 py-5 pb-28 sm:px-5 lg:px-6 lg:pb-8">
                        <header className="flex flex-col gap-4 rounded-3xl border bg-[var(--surface)] p-4 shadow-sm sm:p-5 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0">
                                {eyebrowKey ? (
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                                        {t(eyebrowKey)}
                                    </p>
                                ) : null}

                                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                    {t(titleKey)}
                                </h1>

                                {subtitleKey ? (
                                    <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--text-muted)]">
                                        {t(subtitleKey)}
                                    </p>
                                ) : null}
                            </div>

                            {action ? (
                                <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 xl:justify-end">
                                    {action}
                                </div>
                            ) : null}
                        </header>

                        {children}
                    </main>
                </div>
            </div>

            <AppMobileNav />
        </div>
    );
}
