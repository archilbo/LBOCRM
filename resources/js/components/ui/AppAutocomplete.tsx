import { useFilter } from '@heroui/react';
import {
  Autocomplete,
  EmptyState,
  ListBox,
  SearchField,
} from '@heroui/react';
import { cn } from '@/lib/cn';
import type { SelectOption } from '@/components/drawers/shared';

export type AppAutocompleteProps<T extends string = string> = {
  value: T | '';
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  error?: string;
  isDisabled?: boolean;
};

export function AppAutocomplete<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Rechercher...',
  label,
  error,
  isDisabled = false,
}: AppAutocompleteProps<T>) {
  const { contains } = useFilter({ sensitivity: 'base' });

  return (
    <Autocomplete
      selectedKey={value || null}
      onSelectionChange={(k) => onChange((k ?? '') as T)}
      isDisabled={isDisabled}
      aria-label={label ?? placeholder}
      popoverProps={{
        classNames: {
          content: 'z-50 min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg',
        },
      }}
    >
      <Autocomplete.Trigger
        className={cn(
          'flex h-8 w-full items-center gap-0 rounded-[var(--radius-md)] border bg-[var(--surface)] px-2.5 text-xs outline-none transition',
          error ? 'border-[var(--danger)]' : 'border-[var(--border)]',
          !isDisabled && !error && 'hover:border-[var(--accent)]',
          isDisabled && 'cursor-not-allowed bg-[var(--surface-2)] opacity-60',
        )}
      >
        <Autocomplete.Value className="flex-1 text-xs text-[var(--foreground)] placeholder-shown:text-[var(--text-muted)]" />
        <Autocomplete.Indicator>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)]">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </Autocomplete.Indicator>
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                placeholder={placeholder}
                className="text-xs"
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox
            className="max-h-56 overflow-y-auto p-1"
            renderEmptyState={() => (
              <EmptyState className="py-4 text-xs text-[var(--text-muted)]">
                Aucun résultat
              </EmptyState>
            )}
          >
            {options.map((opt) => (
              <ListBox.Item
                key={opt.id}
                id={opt.id}
                textValue={opt.label}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs transition',
                  'text-[var(--foreground)] hover:bg-[var(--surface-2)]',
                  'data-[selected=true]:bg-[var(--accent)]/10 data-[selected=true]:text-[var(--accent)]',
                )}
              >
                {opt.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
