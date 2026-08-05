import { Component, type ErrorInfo, type ReactNode } from 'react';
import { IconFileText } from '@tabler/icons-react';


type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary] Caught:', error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                    <IconFileText size={40} className="text-[var(--text-muted)]" />
                    <p className="text-sm font-semibold text-[var(--text)]">Something went wrong</p>
                    <p className="max-w-md text-center text-xs text-[var(--text-muted)]">
                        {this.state.error.message}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
