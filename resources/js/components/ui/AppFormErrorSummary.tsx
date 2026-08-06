import { IconAlertTriangle } from '@tabler/icons-react';

import { useTranslation } from '@/lib/i18n';
import type { FormErrors } from '@/lib/formErrors';
import { hasErrors } from '@/lib/formErrors';

type AppFormErrorSummaryProps = {
    errors?: FormErrors;
};

export function AppFormErrorSummary({ errors }: AppFormErrorSummaryProps) {
    const { t } = useTranslation();

    if (!hasErrors(errors)) {
        return null;
    }

    // Show current messages only, deduped: never repeat the same message
    // under multiple fields, and never expose the raw field key.
    const messages = Array.from(new Set(Object.values(errors ?? {}).filter(Boolean)));

    if (messages.length === 0) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]">
                    <IconAlertTriangle size={16} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--danger)]">
                        {t('common.common.checkForm')}
                    </p>

                    <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                        {messages.slice(0, 8).map((message, index) => (
                            <li key={`${message}-${index}`}>{message}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
