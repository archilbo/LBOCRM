import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input, ListBox, ListBoxItem, Popover, Button } from '@heroui/react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ComboboxOption = {
    id: string;
    label: string;
};

type AsyncComboboxProps = {
    label: string;
    placeholder?: string;
    value: string | null | undefined;
    onChange: (value: string | null) => void;
    queryKey: string[];
    queryFn: (q: string) => Promise<ComboboxOption[]>;
    emptyMessage?: string;
    debounceMs?: number;
    isDisabled?: boolean;
    error?: string;
    defaultLabel?: string;
};

function highlightMatch(text: string, query: string): ReactNode {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="rounded-sm bg-amber-500/20 px-0.5 text-amber-300">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    );
}

export function AsyncCombobox({
    label,
    placeholder = 'Search...',
    value,
    onChange,
    queryKey,
    queryFn,
    emptyMessage = 'No results found',
    debounceMs = 200,
    isDisabled = false,
    error,
    defaultLabel,
}: AsyncComboboxProps) {
    const [inputValue, setInputValue] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const { data: items = [], isFetching } = useQuery({
        queryKey: [...queryKey, debouncedQuery],
        queryFn: () => queryFn(debouncedQuery),
        enabled: debouncedQuery.length > 0 || (isOpen && !debouncedQuery && !selectedLabel),
        staleTime: 30_000,
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(inputValue), debounceMs);
        return () => clearTimeout(timer);
    }, [inputValue, debounceMs]);

    useEffect(() => {
        if (!value) {
            setSelectedLabel(null);
            setInputValue('');
        } else if (defaultLabel) {
            setSelectedLabel(defaultLabel);
        }
    }, [value, defaultLabel]);

    const selectedItem = items.find((i) => i.id === value);

    function handleSelect(item: ComboboxOption) {
        onChange(item.id);
        setSelectedLabel(item.label);
        setInputValue('');
        setIsOpen(false);
    }

    function handleClear() {
        onChange(null);
        setSelectedLabel(null);
        setInputValue('');
        setIsOpen(false);
    }

    function handleOpenChange(open: boolean) {
        setIsOpen(open);
        if (!open && !value) {
            setInputValue('');
        }
    }

    function handleInputChange(val: string) {
        setInputValue(val);
        if (!isOpen) setIsOpen(true);
    }

    return (
        <div className={cn('flex min-w-0 flex-col gap-1.5', isDisabled && 'opacity-60')}>
            {label ? (
                <label className="text-xs font-medium text-white/50">{label}</label>
            ) : null}

            <Popover isOpen={isOpen} onOpenChange={handleOpenChange} placement="bottom" triggerType="listbox">
                <Popover.Trigger>
                    <div ref={triggerRef} className="relative">
                        {selectedLabel ? (
                            <div
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter') setIsOpen(true); }}
                                onClick={() => setIsOpen(true)}
                                className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] text-white outline-none transition hover:border-white/20"
                            >
                                <span className="flex-1 truncate">{selectedLabel}</span>
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={(e) => { e.stopPropagation(); handleClear(); }}
                                    className="flex size-5 items-center justify-center rounded-full hover:bg-white/10"
                                    aria-label="Clear selection"
                                >
                                    <X size={13} className="text-white/50" />
                                </button>
                                <ChevronsUpDown size={14} className="shrink-0 text-white/40" />
                            </div>
                        ) : (
                            <Input
                                isDisabled={isDisabled}
                                value={inputValue}
                                onValueChange={handleInputChange}
                                placeholder={placeholder}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen((o) => !o)}
                                        tabIndex={-1}
                                        aria-label="Toggle dropdown"
                                        className="flex size-5 items-center justify-center"
                                    >
                                        <ChevronsUpDown size={14} className="text-white/40" />
                                    </button>
                                }
                                className="[&>div]:h-10 [&>div]:rounded-lg [&_input]:text-[13px]"
                                classNames={{
                                    inputWrapper: [
                                        'h-10 rounded-lg border border-white/10 bg-white/[0.04]',
                                        'hover:border-white/20',
                                        'focus-within:border-white/30',
                                        'group-data-[focus-within]:border-white/30',
                                    ].join(' '),
                                    input: 'text-[13px] text-white placeholder:text-white/40',
                                }}
                            />
                        )}
                    </div>
                </Popover.Trigger>

                <Popover.Content className="w-[var(--trigger-width)] min-w-0 rounded-lg border border-white/10 bg-[#1a1a1a] p-0 shadow-xl">
                    {isFetching ? (
                        <div className="flex items-center gap-2 px-3 py-5 text-[13px] text-white/50">
                            <Loader2 size={14} className="animate-spin" />
                            Searching...
                        </div>
                    ) : items.length === 0 ? (
                        <p className="px-3 py-5 text-center text-[13px] text-white/50">{emptyMessage}</p>
                    ) : (
                        <ListBox
                            items={items}
                            onAction={(key) => {
                                const item = items.find((i) => i.id === key);
                                if (item) handleSelect(item);
                            }}
                            className="max-h-60 overflow-y-auto border-0 bg-transparent p-1"
                            classNames={{
                                list: 'gap-0.5',
                            }}
                        >
                            {(item: ComboboxOption) => (
                                <ListBoxItem
                                    key={item.id}
                                    textValue={item.label}
                                    className="rounded-md px-3 py-2 text-[13px] text-white data-[hover=true]:bg-white/[0.06] data-[selected=true]:bg-amber-500/[0.1] data-[selected=true]:text-amber-300"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="flex-1 truncate">{highlightMatch(item.label, inputValue || debouncedQuery)}</span>
                                        {item.id === value ? (
                                            <Check size={14} className="shrink-0 text-amber-400" />
                                        ) : null}
                                    </div>
                                </ListBoxItem>
                            )}
                        </ListBox>
                    )}
                </Popover.Content>
            </Popover>

            {error ? (
                <p className="text-xs font-medium text-red-400">{error}</p>
            ) : null}
        </div>
    );
}
