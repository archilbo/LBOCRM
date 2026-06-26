import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const stored = window.localStorage.getItem('archilbo-theme');

    if (stored === 'light' || stored === 'dark') {
        return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialSidebarCollapsed(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    const stored = window.localStorage.getItem('archilbo-sidebar-collapsed');
    return stored === 'true';
}

export function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(getInitialSidebarCollapsed);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        window.localStorage.setItem('archilbo-theme', theme);
    }, [theme]);

    useEffect(() => {
        window.localStorage.setItem('archilbo-sidebar-collapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            setTheme,
            toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
            sidebarCollapsed,
            setSidebarCollapsed,
            toggleSidebar: () => setSidebarCollapsed((current) => !current),
        }),
        [theme, sidebarCollapsed],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }

    return context;
}