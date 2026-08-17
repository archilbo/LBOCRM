import type { ReactNode } from 'react';
import { ScrollShadow } from '@heroui/react';
import { AppMobileNav } from '@/components/layout/AppMobileNav';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';
import { AppPageContainer } from '@/components/ui/AppPageContainer';
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

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)]">
            <div className="hidden shrink-0 lg:flex flex-col p-3">
                <AppSidebar />
            </div>

            <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
                <AppTopbar />

                {fullBleed ? (
                    <main className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                        {children}
                    </main>
                ) : (
                    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <ScrollShadow className="flex-1 overflow-y-auto">
                            <AppPageContainer>
                                {eyebrowKey || titleKey ? (
                                    <header className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
                                        <AppPageHeader
                                            eyebrow={eyebrowKey ? t(eyebrowKey) : undefined}
                                            title={t(titleKey ?? '')}
                                            subtitle={subtitleKey ? t(subtitleKey) : undefined}
                                            actions={action}
                                        />
                                    </header>
                                ) : null}

                                {children}
                            </AppPageContainer>
                        </ScrollShadow>
                    </main>
                )}
            </div>

            {!hideMobileNav ? <AppMobileNav /> : null}
        </div>
    );
}
