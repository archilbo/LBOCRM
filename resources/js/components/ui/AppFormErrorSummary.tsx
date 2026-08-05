import { IconAlertTriangle } from '@tabler/icons-react';

import type { FormErrors } from '@/lib/formErrors';
import { hasErrors } from '@/lib/formErrors';

type AppFormErrorSummaryProps = {
    errors?: FormErrors;
};

export function AppFormErrorSummary({ errors }: AppFormErrorSummaryProps) {
    if (!hasErrors(errors)) {
        return null;
    }

    const entries = Object.entries(errors ?? {});

    return (
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]">
                    <IconAlertTriangle size={16} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--danger)]">
                        Please check the form
                    </p>

                    <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                        {entries.slice(0, 8).map(([field, message]) => (
                            <li key={field}>
                                <span className="font-medium">
                                    {field.replaceAll('_', ' ')}:
                                </span>{' '}
                                {message}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}