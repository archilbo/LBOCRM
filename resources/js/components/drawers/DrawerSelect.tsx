import { IconChevronDown } from '@tabler/icons-react';

import { Select, ListBox } from '@heroui/react';
import { cn } from '@/lib/cn';
import { drawerStyles, type SelectOption } from './shared';

type DrawerSelectProps<T extends string = string> = {
  value: T | '';
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  error?: string;
  isDisabled?: boolean;
};

export function DrawerSelect<T extends string = string>({
  value, onChange, options, placeholder = 'Selectionner...', error, isDisabled,
}: DrawerSelectProps<T>) {
  return (
    <Select
      selectedKey={value || null}
      onSelectionChange={(k) => onChange((k ?? '') as T)}
      placeholder={placeholder}
      isDisabled={isDisabled}
      shouldCloseOnBlur={false}
    >
      <Select.Trigger className={cn(drawerStyles.trigger, error && 'border-[var(--danger)]')}>
        <Select.Value className="flex-1 truncate text-left text-xs" />
        <Select.Indicator>
          <IconChevronDown size={14} className="text-[var(--text-muted)]" />
        </Select.Indicator>
      </Select.Trigger>
      <Select.Popover isNonModal className={drawerStyles.popover}>
        <ListBox className="max-h-56 overflow-y-auto p-1">
          {options.map((opt) => (
            <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label} className={drawerStyles.item}>
              {opt.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
