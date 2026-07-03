import type { ReactNode } from 'react';
import { AppFlashToasts } from '@/components/layout/AppFlashToasts';
import { AppToastProvider } from '@/providers/AppToastProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

type AppProvidersProps = {
    children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ThemeProvider>
            <AppFlashToasts />
            <AppToastProvider />
            {children}
        </ThemeProvider>
    );
}