import { Dropdown } from '@heroui/react';
import { IconDots } from '@tabler/icons-react';

import type { ReactNode } from 'react';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';

export type FinanceRowActionTone = 'default' | 'accent' | 'success' | 'danger';

export type FinanceRowAction = {
    id: string;
    label: string;
    icon: ReactNode;
    onPress: () => void;
    tone?: FinanceRowActionTone;
    isDisabled?: boolean;
    dividerBefore?: boolean;
};

type Props = {
    actions: Array<FinanceRowAction | false | null | undefined>;
    visibleCount?: number;
    className?: string;
    buttonClassName?: string;
};

const actionToneClass: Record<FinanceRowActionTone, string> = {
    default: 'text-[var(--text-muted)] hover:text-[var(--accent)]',
    accent: 'text-[var(--accent)] hover:text-[var(--accent-hover)]',
    success: 'text-[var(--success)] hover:brightness-110',
    danger: 'text-[var(--danger)] hover:brightness-110',
};

export function FinanceRowActions({ actions, visibleCount = 2, className, buttonClassName }: Props) {
    const { t } = useTranslation();
    const available = actions.filter((action): action is FinanceRowAction => Boolean(action));
    const visible = available.slice(0, visibleCount);
    const overflow = available.slice(visibleCount);

    if (available.length === 0) return <span className="text-[var(--text-muted)]">-</span>;

    function runAction(id: string) {
        overflow.find((action) => action.id === id)?.onPress();
    }

    return (
        <div
            className={cn('finance-table-actions', className)}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
        >
            <AppTableActions>
                {visible.map((action) => (
                    <AppButton
                        key={action.id}
                        isIconOnly
                        compact
                        size="sm"
                        variant="quiet"
                        tooltip={action.label}
                        aria-label={action.label}
                        onPress={action.onPress}
                        isDisabled={action.isDisabled}
                        className={cn(
                            'size-7 min-h-7 min-w-7 border-0 bg-transparent p-0 shadow-none hover:bg-[var(--surface-2)]',
                            actionToneClass[action.tone || 'default'],
                            buttonClassName,
                        )}
                    >
                        {action.icon}
                    </AppButton>
                ))}

                {overflow.length > 0 ? (
                    <Dropdown>
                        <Dropdown.Trigger
                            aria-label={t('finance.actions.moreActions')}
                        >
                            <AppButton isIconOnly compact variant="quiet" size="sm" aria-label={t('finance.actions.moreActions')} className={cn('size-7 min-h-7 min-w-7 border-0 bg-transparent shadow-none', buttonClassName)}>
                                <IconDots size={14} />
                            </AppButton>
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom end" className="min-w-52 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                            <Dropdown.Menu aria-label={t('finance.actions.actionMenu')} onAction={(key) => runAction(String(key))} className="outline-none">
                                {overflow.map((action) => (
                                    <Dropdown.Item
                                        key={action.id}
                                        id={action.id}
                                        textValue={action.label}
                                        isDisabled={action.isDisabled}
                                        className={cn(
                                            'rounded-md px-2.5 py-2 text-xs font-medium outline-none transition data-[hover]:bg-[var(--surface-2)] data-[disabled]:opacity-40',
                                            action.dividerBefore && 'mt-1 border-t border-[var(--border)]',
                                            action.tone === 'danger' ? 'text-[var(--danger)] data-[hover]:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]' : 'text-[var(--text)]',
                                            action.tone === 'success' && 'text-[var(--success)]',
                                            action.tone === 'accent' && 'text-[var(--accent)]',
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-current">{action.icon}</span>
                                            <span>{action.label}</span>
                                        </div>
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                ) : null}
            </AppTableActions>
        </div>
    );
}
