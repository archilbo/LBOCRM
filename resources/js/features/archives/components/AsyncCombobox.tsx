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
        <div className={cn('flex min-w-0 flex-col gap-1', isDisabled && 'opacity-60')}>
            {label ? (
                <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{label}</label>
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
                        'flex h-8 w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border px-2.5 text-xs text-[var(--foreground)] outline-none transition',
                        'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]',
                        'focus-visible:border-[var(--accent)]',
                        isDisabled && 'pointer-events-none opacity-60',
                    )}
                >
                    <Search size={14} className="shrink-0 text-[var(--text-muted)]" />
                    <span className={cn('flex-1 truncate text-left', !selectedLabel && 'text-[var(--text-subtle)]')}>
                        {selectedLabel || placeholder}
                    </span>
                    {selectedLabel ? (
                        <span
                            role="button"
                            tabIndex={-1}
                            onClick={(e) => { e.stopPropagation(); handleClear(); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleClear(); }}
                            className="flex size-5 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                            aria-label="Clear selection"
                        >
                            <X size={13} />
                        </span>
                    ) : null}
                    <ChevronsUpDown size={14} className="shrink-0 text-[var(--text-muted)]" />
                </div>

                {isOpen && createPortal(
                    <div
                        ref={dropdownRef}
                        style={getDropdownStyle()}
                        className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg"
                    >
                        <div className="border-b border-[var(--border)] px-2 py-2">
                            <Input
                                ref={searchRef}
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                placeholder="Rechercher..."
                                startContent={<Search size={14} className="text-[var(--text-muted)]" />}
                                isClearable
                                onClear={() => setSearchQuery('')}
                                className="[&>div]:h-9 [&>div]:rounded-lg [&_input]:text-xs"
                                classNames={{
                                    inputWrapper: [
                                        'h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)]',
                                        'hover:border-[var(--accent)]',
                                        'focus-within:border-[var(--accent)]',
                                        'group-data-[focus-within]:border-[var(--accent)]',
                                    ].join(' '),
                                    input: 'text-xs text-[var(--foreground)] placeholder:text-[var(--text-subtle)]',
                                }}
                            />
                        </div>

                        {isFetching ? (
                            <div className="flex items-center gap-2 px-3 py-5 text-xs text-[var(--text-muted)]">
                                <Loader2 size={14} className="animate-spin" />
                                Recherche...
                            </div>
                        ) : items.length === 0 ? (
                            <p className="px-3 py-5 text-center text-xs text-[var(--text-muted)]">{emptyMessage}</p>
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
                                        className="rounded-lg px-2.5 py-2 text-xs text-[var(--foreground)] data-[hover=true]:bg-[var(--surface-2)] data-[selected=true]:bg-[var(--accent)]/10 data-[selected=true]:text-[var(--accent)]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="flex-1 truncate">{highlightMatch(item.label, searchQuery)}</span>
                                            {item.id === value ? (
                                                <Check size={14} className="shrink-0 text-[var(--accent)]" />
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
                <p className="text-[10px] font-medium text-[var(--danger)]">{error}</p>
            ) : null}
        </div>
    );
}
