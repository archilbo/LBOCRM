import { useCallback, type ReactNode } from 'react';
import { RouterProvider } from 'react-aria-components';
import { router } from '@inertiajs/react';
import { AppFlashToasts } from '@/components/layout/AppFlashToasts';
import { AppToastProvider } from '@/providers/AppToastProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

/*
 * HeroUI v3 does not export a global HeroUIProvider.
 * Components manage their own context internally.
 * RouterProvider from react-aria-components is the closest equivalent,
 * providing client-side navigation support for HeroUI/RAC components.
 */

type AppProvidersProps = {
    children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
    const navigate = useCallback((href: string, options?: any) => {
        router.visit(href, options ?? {});
    }, []);

    return (
        <RouterProvider navigate={navigate}>
            <ThemeProvider>
                <AppFlashToasts />
                <AppToastProvider />
                {children}
            </ThemeProvider>
        </RouterProvider>
    );
}
