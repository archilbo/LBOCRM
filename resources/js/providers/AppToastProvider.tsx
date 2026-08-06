import { Toaster } from 'sonner';
import { useTheme } from '@/providers/ThemeProvider';

export function AppToastProvider() {
    const { theme } = useTheme();

    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            theme={theme}
            toastOptions={{
                className: 'text-sm',
            }}
        />
    );
}
