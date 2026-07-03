import { en } from '@/locales/en';

const messages = en;

type ReplaceValues = Record<string, string | number>;

function getByPath(source: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((current, part) => {
        if (!current || typeof current !== 'object') {
            return undefined;
        }

        return (current as Record<string, unknown>)[part];
    }, source);
}

export function t(key: string, values?: ReplaceValues): string {
    const value = getByPath(messages, key);
    const text = typeof value === 'string' ? value : key;

    if (!values) {
        return text;
    }

    return text.replace(/\{(\w+)\}/g, (_, name: string) => {
        const replacement = values[name];
        return replacement === undefined ? `{${name}}` : String(replacement);
    });
}

export function useTranslation() {
    return { t };
}
