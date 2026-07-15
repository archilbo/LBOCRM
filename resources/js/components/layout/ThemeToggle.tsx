import { Moon, Sun } from 'lucide-react';
import { Button } from 'react-aria-components';
import { useTheme } from '@/providers/ThemeProvider';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            aria-label="Toggle theme"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-white/5 hover:text-[var(--text)]"
            onPress={toggleTheme}
        >
            <Sun size={15} className="absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon size={15} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    );
}
