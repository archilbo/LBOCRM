import { Key, ReactNode } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    MenuTrigger,
    Popover,
} from 'react-aria-components';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';

export type AppDropdownMenuItem = {
    id: string;
    label: string;
    icon?: ReactNode;
    isDanger?: boolean;
    isDisabled?: boolean;
    onAction: () => void;
};

type AppDropdownMenuProps = {
    ariaLabel: string;
    items: AppDropdownMenuItem[];
};

export function AppDropdownMenu({ ariaLabel, items }: AppDropdownMenuProps) {
    function handleAction(key: Key) {
        const item = items.find((candidate) => candidate.id === String(key));

        if (!item || item.isDisabled) {
            return;
        }

        item.onAction();
    }

    return (
        <MenuTrigger>
            <Button aria-label={ariaLabel} className="react-aria-Button size-8 px-0">
                <MoreHorizontal size={16} />
            </Button>

            <Popover className="react-aria-Popover min-w-48">
                <Menu
                    aria-label={ariaLabel}
                    className="react-aria-Menu"
                    onAction={handleAction}
                >
                    {items.map((item) => (
                        <MenuItem
                            key={item.id}
                            id={item.id}
                            isDisabled={item.isDisabled}
                            className={cn(
                                'react-aria-MenuItem',
                                item.isDanger && 'text-[var(--danger)]',
                            )}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </MenuItem>
                    ))}
                </Menu>
            </Popover>
        </MenuTrigger>
    );
}
