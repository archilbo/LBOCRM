import { Moon, Sun } from 'lucide-react';
import { Button } from 'react-aria-components';
import { useTheme } from '@/providers/ThemeProvider';
import { useTranslation } from '@/lib/i18n';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation();

    return (
        <Button
            aria-label={t('actions.toggleTheme')}
            className="react-aria-Button"
            onPress={toggleTheme}
        >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{t('app.theme')}</span>
        </Button>
    );
}
