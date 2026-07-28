import { useCallback, useState, type ReactNode } from 'react';
import { RouterProvider } from 'react-aria-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from '@inertiajs/react';
import { AppFlashToasts } from '@/components/layout/AppFlashToasts';
import { AppToastProvider } from '@/providers/AppToastProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { I18nProvider } from '@/lib/i18n';
import { GlobalUploadProvider } from '@/features/uploads/GlobalUploadProvider';
import { GlobalUploadDock } from '@/features/uploads/GlobalUploadDock';
import { GlobalUploadCenterDrawer } from '@/features/uploads/GlobalUploadCenterDrawer';
import { UploadConnectionStatus } from '@/features/uploads/UploadConnectionStatus';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 1,
        },
    },
});

type AppProvidersProps = {
    children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
    const [uploadCenterOpen, setUploadCenterOpen] = useState(false);
    const navigate = useCallback((href: string, options?: any) => {
        router.visit(href, options ?? {});
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider navigate={navigate}>
                <I18nProvider>
                    <ThemeProvider>
                        <AppFlashToasts />
                        <AppToastProvider />
                        <GlobalUploadProvider onOpenUploadCenter={() => setUploadCenterOpen(true)}>
                            {children}
                            <UploadConnectionStatus />
                            <GlobalUploadDock />
                            <GlobalUploadCenterDrawer isOpen={uploadCenterOpen} onOpenChange={setUploadCenterOpen} />
                        </GlobalUploadProvider>
                    </ThemeProvider>
                </I18nProvider>
            </RouterProvider>
        </QueryClientProvider>
    );
}
