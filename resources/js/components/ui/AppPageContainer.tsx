import type { ReactNode } from 'react';

type AppPageContainerProps = {
    children: ReactNode;
};

export function AppPageContainer({ children }: AppPageContainerProps) {
    return (
        <div className="w-full max-w-none flex-1 space-y-5 px-4 py-4 sm:px-6 sm:py-5">
            {children}
        </div>
    );
}
