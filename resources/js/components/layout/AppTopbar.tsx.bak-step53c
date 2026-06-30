import { router } from '@inertiajs/react';
import { LogOut, Menu, X } from 'lucide-react';
import { AppGlobalSearch } from '@/components/layout/AppGlobalSearch';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useTheme } from '@/providers/ThemeProvider';

type AppTopbarProps = {
    title?: string;
    subtitle?: string;
};

export function AppTopbar({ title, subtitle }: AppTopbarProps) {
    const { toggleSidebar, sidebarCollapsed } = useTheme();
    function handleLogout() {
        router.post('/logout');
    }

    return (
        <header className="sticky top-0 z-40 border-b bg-[var(--surface)]/95 backdrop-blur-xl">
            <div className="flex min-h-16 items-center gap-4 px-4 lg:px-6">
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="hidden lg:inline-flex size-10 items-center justify-center rounded-2xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
                    aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
                </button>
                
                <div className="hidden min-w-0 flex-1 lg:block">
                    {title ? (
                        <div>
                            <h1 className="truncate text-sm font-semibold text-[var(--text)]">
                                {title}
                            </h1>

                            {subtitle ? (
                                <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                                    {subtitle}
                                </p>
                            ) : null}
                        </div>
                    ) : (
                        <AppGlobalSearch />
                    )}
                </div>

                <div className="min-w-0 flex-1 lg:hidden">
                    <AppGlobalSearch />
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <ThemeToggle />

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex size-10 items-center justify-center rounded-2xl border bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}