import { ReactNode } from 'react';
import { useTranslation } from '@/lib/i18n';

type AppPageHeaderProps = {
    eyebrowKey?: string;
    titleKey: string;
    subtitleKey?: string;
    action?: ReactNode;
};

export function AppPageHeader({
    eyebrowKey,
    titleKey,
    subtitleKey,
    action,
}: AppPageHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                {eyebrowKey ? (
                    <p className="text-sm font-medium text-[var(--accent)]">
                        {t(eyebrowKey)}
                    </p>
                ) : null}

                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                    {t(titleKey)}
                </h1>

                {subtitleKey ? (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                        {t(subtitleKey)}
                    </p>
                ) : null}
            </div>

            {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
    );
}
