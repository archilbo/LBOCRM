import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Input, ListBox, ListBoxItem } from '@heroui/react';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: items = [], isFetching } = useQuery({
        queryKey: [...queryKey, debouncedQuery],
        queryFn: () => queryFn(debouncedQuery),
        enabled: isOpen,
        staleTime: 30_000,
    });

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), debounceMs);
        return () => clearTimeout(timer);
    }, [searchQuery, debounceMs]);

    useEffect(() => {
        if (!value) {
            setSelectedLabel(null);
        } else if (defaultLabel) {
            setSelectedLabel(defaultLabel);
        }
    }, [value, defaultLabel]);

    useEffect(() => {
        if (isOpen && searchRef.current) {
            searchRef.current.focus();
        }
        if (!isOpen) {
            setSearchQuery('');
            setDebouncedQuery('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        function handleClick(e: MouseEvent) {
            const target = e.target as Node;
            const isOutside =
                triggerRef.current && !triggerRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target);
            if (isOutside) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClick, true);
        return () => document.removeEventListener('mousedown', handleClick, true);
    }, [isOpen]);

    const handleSelect = useCallback((item: ComboboxOption) => {
        onChange(item.id);
        setSelectedLabel(item.label);
        setIsOpen(false);
    }, [onChange]);

    const handleClear = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        onChange(null);
        setSelectedLabel(null);
        setIsOpen(false);
    }, [onChange]);

    function getDropdownStyle(): React.CSSProperties {
        if (!triggerRef.current) return {};
        const rect = triggerRef.current.getBoundingClientRect();
        return {
            position: 'fixed',
            top: `${rect.bottom + 4}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            zIndex: 99999,
        };
    }

    return (
        <div className={cn('flex min-w-0 flex-col gap-1.5', isDisabled && 'opacity-60')}>
            {label ? (
                <label className="text-xs font-medium text-white/50">{label}</label>
            ) : null}

            <div ref={triggerRef} className="relative">
                <div
                    role="button"
                    tabIndex={isDisabled ? -1 : 0}
                    aria-label={label}
                    aria-disabled={isDisabled}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    onClick={() => { if (!isDisabled) setIsOpen((o) => !o); }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!isDisabled) setIsOpen((o) => !o);
                        }
                        if (e.key === 'Escape') setIsOpen(false);
                    }}
                    className={cn(
                        'flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border px-3 text-[13px] text-white outline-none transition',
                        'border-white/10 bg-white/[0.04] hover:border-white/20',
                        'focus-visible:border-white/30',
                        isDisabled && 'pointer-events-none opacity-60',
                    )}
                >
                    <Search size={14} className="shrink-0 text-white/40" />
                    <span className={cn('flex-1 truncate text-left', !selectedLabel && 'text-white/40')}>
                        {selectedLabel || placeholder}
                    </span>
                    {selectedLabel ? (
                        <span
                            role="button"
                            tabIndex={-1}
                            onClick={(e) => { e.stopPropagation(); handleClear(); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleClear(); }}
                            className="flex size-5 items-center justify-center rounded-full hover:bg-white/10"
                            aria-label="Clear selection"
                        >
                            <X size={13} className="text-white/50" />
                        </span>
                    ) : null}
                    <ChevronsUpDown size={14} className="shrink-0 text-white/40" />
                </div>

                {isOpen && createPortal(
                    <div
                        ref={dropdownRef}
                        style={getDropdownStyle()}
                        className="overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a] shadow-xl"
                    >
                        <div className="border-b border-white/5 px-3 py-2">
                            <Input
                                ref={searchRef}
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                placeholder="Type to search..."
                                startContent={<Search size={14} className="text-white/40" />}
                                isClearable
                                onClear={() => setSearchQuery('')}
                                className="[&>div]:h-9 [&>div]:rounded-md [&_input]:text-[13px]"
                                classNames={{
                                    inputWrapper: [
                                        'h-9 rounded-md border border-white/10 bg-white/[0.04]',
                                        'hover:border-white/20',
                                        'focus-within:border-white/30',
                                        'group-data-[focus-within]:border-white/30',
                                    ].join(' '),
                                    input: 'text-[13px] text-white placeholder:text-white/40',
                                }}
                            />
                        </div>

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
                                            <span className="flex-1 truncate">{highlightMatch(item.label, searchQuery)}</span>
                                            {item.id === value ? (
                                                <Check size={14} className="shrink-0 text-amber-400" />
                                            ) : null}
                                        </div>
                                    </ListBoxItem>
                                )}
                            </ListBox>
                        )}
                    </div>,
                    document.body,
                )}
            </div>

            {error ? (
                <p className="text-xs font-medium text-red-400">{error}</p>
            ) : null}
        </div>
    );
}
