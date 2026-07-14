import { useCallback, type ReactNode } from 'react';
import { RouterProvider } from 'react-aria-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from '@inertiajs/react';
import { AppFlashToasts } from '@/components/layout/AppFlashToasts';
import { AppToastProvider } from '@/providers/AppToastProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

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
    const navigate = useCallback((href: string, options?: any) => {
        router.visit(href, options ?? {});
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider navigate={navigate}>
                <ThemeProvider>
                    <AppFlashToasts />
                    <AppToastProvider />
                    {children}
                </ThemeProvider>
            </RouterProvider>
        </QueryClientProvider>
    );
}
