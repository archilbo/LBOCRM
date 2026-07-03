import type { FinanceDocumentType, TemplatePlaceholder } from '@/features/finance/types';

export type TemplateValidationResult = {
    warnings: string[];
    errors: string[];
    unsupported: string[];
};

export function validateTemplateContent(type: FinanceDocumentType, bodyHtml: string, allPlaceholders: TemplatePlaceholder[]): TemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const supported = new Set(allPlaceholders.flatMap((group) => group.items));
    const unsupported = Array.from(new Set(Array.from(bodyHtml.matchAll(/{{\s*[^}]+\s*}}/g)).map((match) => match[0]))).filter((placeholder) => !supported.has(placeholder));

    if (!bodyHtml.trim()) {
        warnings.push('Le corps du template est vide.');
    }

    if (/<\s*script\b/i.test(bodyHtml) || /\son[a-z]+\s*=/i.test(bodyHtml)) {
        errors.push('Les scripts et attributs JavaScript ne sont pas autorises.');
    }

    if ((type === 'quote' || type === 'invoice') && !bodyHtml.includes('{{items_table}}') && !bodyHtml.includes('{{items_rows}}')) {
        warnings.push('Le template ne contient pas {{items_table}}.');
    }

    if (unsupported.length > 0) {
        warnings.push('Certains placeholders ne sont pas reconnus.');
    }

    return { errors, warnings, unsupported };
}
