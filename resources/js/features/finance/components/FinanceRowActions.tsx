import { Dropdown } from '@heroui/react';
import { MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppTableActionButton } from '@/components/ui/AppTableActionButton';
import { AppTableActions } from '@/components/ui/AppTableActions';
import { cn } from '@/lib/cn';

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

const buttonTone = {
    default: 'view',
    accent: 'documents',
    success: 'create',
    danger: 'delete',
} as const;

export function FinanceRowActions({ actions, visibleCount = 2, className, buttonClassName }: Props) {
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
                    <AppTableActionButton
                        key={action.id}
                        label={action.label}
                        tone={buttonTone[action.tone || 'default']}
                        onPress={action.onPress}
                        isDisabled={action.isDisabled}
                        className={buttonClassName}
                    >
                        {action.icon}
                    </AppTableActionButton>
                ))}

                {overflow.length > 0 ? (
                    <Dropdown>
                        <Dropdown.Trigger
                            aria-label="Plus d actions"
                            className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] outline-none transition hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] data-[open]:border-[var(--accent)] data-[open]:text-[var(--accent)]', buttonClassName)}
                        >
                            <MoreHorizontal size={14} />
                        </Dropdown.Trigger>
                        <Dropdown.Popover placement="bottom end" className="min-w-52 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-xl">
                            <Dropdown.Menu aria-label="Actions finance" onAction={(key) => runAction(String(key))} className="outline-none">
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
