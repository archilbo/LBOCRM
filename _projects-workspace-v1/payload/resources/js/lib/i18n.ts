import {
    createContext,
    createElement,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';
import { en } from '@/locales/en';
import { enProjects } from '@/locales/en/projects';
import { fr } from '@/locales/fr';
import { frProjects } from '@/locales/fr/projects';

type ReplaceValues = Record<string, string | number>;
type TranslationTree = Record<string, unknown>;

export const supportedLocales = ['fr', 'en'] as const;
export type AppLocale = (typeof supportedLocales)[number];

const defaultLocale: AppLocale = 'fr';
const storageKey = 'archilbo-locale';
const dictionaries: Record<AppLocale, TranslationTree> = {
    fr: { ...fr, ...frProjects },
    en: { ...en, ...enProjects },
};

type TranslationContextValue = {
    locale: AppLocale;
    setLocale: (locale: AppLocale) => void;
    t: (key: string, values?: ReplaceValues) => string;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

function initialLocale(): AppLocale {
    if (typeof window === 'undefined') {
        return defaultLocale;
    }

    const stored = window.localStorage.getItem(storageKey);
    return supportedLocales.includes(stored as AppLocale) ? (stored as AppLocale) : defaultLocale;
}

function getByPath(source: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((current, part) => {
        if (!current || typeof current !== 'object') {
            return undefined;
        }

        return (current as Record<string, unknown>)[part];
    }, source);
}

function translate(locale: AppLocale, key: string, values?: ReplaceValues): string {
    const value = getByPath(dictionaries[locale], key);
    const fallbackValue = locale === 'en' ? undefined : getByPath(dictionaries.en, key);
    const text = typeof value === 'string'
        ? value
        : (typeof fallbackValue === 'string' ? fallbackValue : key);

    if (!values) {
        return text;
    }

    return text.replace(/\{(\w+)\}/g, (_, name: string) => {
        const replacement = values[name];
        return replacement === undefined ? `{${name}}` : String(replacement);
    });
}

export function t(key: string, values?: ReplaceValues): string {
    return translate(defaultLocale, key, values);
}

export function I18nProvider({ children }: PropsWithChildren) {
    const [locale, setLocale] = useState<AppLocale>(initialLocale);

    useEffect(() => {
        window.localStorage.setItem(storageKey, locale);
        document.documentElement.lang = locale;
    }, [locale]);

    const value = useMemo<TranslationContextValue>(() => ({
        locale,
        setLocale,
        t: (key, values) => translate(locale, key, values),
    }), [locale]);

    return createElement(TranslationContext.Provider, { value }, children);
}

export function useTranslation() {
    const context = useContext(TranslationContext);

    if (context) {
        return context;
    }

    return { locale: defaultLocale, setLocale: () => undefined, t };
}
