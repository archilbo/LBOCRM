import { Toaster } from 'sonner';

export function AppToastProvider() {
    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
                className: 'text-sm',
            }}
        />
    );
}
