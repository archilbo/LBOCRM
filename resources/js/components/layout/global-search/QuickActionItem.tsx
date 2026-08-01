import { type CSSProperties } from 'react';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { ListBox } from '@heroui/react';
import { useTranslation } from '@/lib/i18n';

export type QuickAction = {
    id: string;
    labelKey: string;
    icon: LucideIcon;
    href: string;
    /** Unique accent color for the tile (hex), used for icon + tinted backgrounds. */
    color: string;
};

export function QuickActionItem({ action }: { action: QuickAction }) {
    const { t } = useTranslation();
    const Icon = action.icon;

    return (
        <ListBox.Item
            id={action.id}
            textValue={t(action.labelKey)}
            style={{ '--qa-color': action.color } as CSSProperties}
            className="group relative flex aspect-square max-w-full min-w-0 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-2)_28%,var(--surface))] px-1 py-1.5 text-center outline-none transition-colors motion-reduce:transition-none data-[hovered]:border-[color-mix(in_srgb,var(--qa-color)_40%,transparent)] data-[hovered]:bg-[color-mix(in_srgb,var(--surface-2)_45%,var(--surface))] data-[focused]:ring-1 data-[focused]:ring-inset data-[focused]:ring-[color-mix(in_srgb,var(--qa-color)_40%,transparent)] data-[pressed]:bg-[color-mix(in_srgb,var(--surface-2)_55%,var(--surface))]"
        >
            <ArrowUpRight
                aria-hidden="true"
                className="pointer-events-none absolute right-1.5 top-1.5 shrink-0 text-[var(--text-subtle)] transition-colors motion-reduce:transition-none group-data-[hovered]:text-[var(--qa-color)]"
                size={11}
                strokeWidth={2.25}
            />
            <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg sm:size-8"
                style={{ color: action.color, backgroundColor: `color-mix(in srgb, ${action.color} 14%, transparent)` }}
            >
                <Icon size={14} />
            </span>

            <span className="w-full truncate text-[10px] font-medium leading-tight text-[var(--text)] sm:text-[10.5px]">
                {t(action.labelKey)}
            </span>
        </ListBox.Item>
    );
}
