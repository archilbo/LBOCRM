import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';

import { AppButton } from '@/components/ui/AppButton';
import { useTranslation } from '@/lib/i18n';

type DocumentViewerNavigationProps = {
    /** 1-based position in the visible collection; null when the open document is not visible. */
    position: { current: number; total: number } | null;
    canGoPrevious: boolean;
    canGoNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
};

/**
 * Bottom navigation bar of the viewer: Previous / Next follow the currently
 * visible, filtered and sorted collection. Both controls disable at the ends;
 * when the open document left the visible collection (filter change) they
 * disable entirely and no other file is silently selected.
 */
export function DocumentViewerNavigation({
    position,
    canGoPrevious,
    canGoNext,
    onPrevious,
    onNext,
}: DocumentViewerNavigationProps) {
    const { t } = useTranslation();

    const previousLabel = t('documentsExplorer.viewer.previous');
    const nextLabel = t('documentsExplorer.viewer.next');

    return (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--border)] px-3 py-2">
            <AppButton
                isIconOnly
                compact
                variant="quiet"
                isDisabled={!canGoPrevious}
                tooltip={previousLabel}
                aria-label={previousLabel}
                onPress={onPrevious}
            >
                <ChevronLeftIcon size={15} />
            </AppButton>

            <p aria-live="polite" className="text-[10px] font-medium tabular-nums text-[var(--text-muted)]">
                {position
                    ? t('documentsExplorer.viewer.position')
                          .replace('{current}', String(position.current))
                          .replace('{total}', String(position.total))
                    : '\u2014'}
            </p>

            <AppButton
                isIconOnly
                compact
                variant="quiet"
                isDisabled={!canGoNext}
                tooltip={nextLabel}
                aria-label={nextLabel}
                onPress={onNext}
            >
                <ChevronRightIcon size={15} />
            </AppButton>
        </div>
    );
}
