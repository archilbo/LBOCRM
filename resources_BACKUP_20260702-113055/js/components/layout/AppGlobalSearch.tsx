import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import {
    KeyboardEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { toast } from 'sonner';
import { isValidHref } from '@/lib/appRoutes';

type BackendSearchResult = {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    href: string;
    badge: string | null;
};

export function AppGlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<BackendSearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const hasQuery = query.trim().length >= 2;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const cleanQuery = query.trim();

        if (cleanQuery.length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        const timeout = window.setTimeout(() => {
            controllerRef.current?.abort();

            const controller = new AbortController();
            controllerRef.current = controller;

            setIsLoading(true);

            fetch(`/global-search?q=${encodeURIComponent(cleanQuery)}`, {
                headers: {
                    Accept: 'application/json',
                },
                signal: controller.signal,
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Search request failed.');
                    }

                    return response.json();
                })
                .then((payload: { results: BackendSearchResult[] }) => {
                    setResults(payload.results ?? []);
                    setIsOpen(true);
                    setActiveIndex(0);
                })
                .catch((error) => {
                    if (error.name !== 'AbortError') {
                        toast.error('Search failed.');
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, 180);

        return () => window.clearTimeout(timeout);
    }, [query]);

    const visibleResults = useMemo(() => results.slice(0, 10), [results]);

    function openResult(result: BackendSearchResult | undefined) {
        if (!result || !isValidHref(result.href)) {
            toast.error('Search result has invalid route.');
            return;
        }

        setIsOpen(false);
        router.visit(result.href);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (!isOpen && event.key !== 'Enter') {
            setIsOpen(true);
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((current) =>
                visibleResults.length === 0 ? 0 : Math.min(current + 1, visibleResults.length - 1),
            );
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            openResult(visibleResults[activeIndex] ?? visibleResults[0]);
        }

        if (event.key === 'Escape') {
            setIsOpen(false);
        }
    }

    function clearSearch() {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        setActiveIndex(0);
    }

    return (
        <div ref={wrapperRef} className="relative w-full max-w-xl">
            <div className="relative">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />

                <input
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (hasQuery) {
                            setIsOpen(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search clients, projects, contracts, finance..."
                    className="h-10 w-full rounded-2xl border bg-[var(--surface)] px-9 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]"
                />

                {query ? (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                        aria-label="Clear search"
                    >
                        <X size={14} />
                    </button>
                ) : null}
            </div>

            {isOpen && hasQuery ? (
                <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-3xl border bg-[var(--surface)] shadow-2xl">
                    <div className="border-b px-4 py-3">
                        <p className="text-xs font-medium text-[var(--text-muted)]">
                            {isLoading
                                ? 'Searching database...'
                                : `${visibleResults.length} result${visibleResults.length === 1 ? '' : 's'}`}
                        </p>
                    </div>

                    {visibleResults.length > 0 ? (
                        <div className="max-h-[420px] overflow-y-auto p-2">
                            {visibleResults.map((result, index) => (
                                <button
                                    key={result.id}
                                    type="button"
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => openResult(result)}
                                    className={[
                                        'flex w-full items-start gap-3 rounded-2xl p-3 text-left transition',
                                        index === activeIndex
                                            ? 'bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]'
                                            : 'hover:bg-[var(--surface-2)]',
                                    ].join(' ')}
                                >
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-xs font-semibold text-[var(--accent)]">
                                        {result.type.slice(0, 2).toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="truncate text-sm font-semibold">{result.title}</p>
                                            <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                                                {result.type}
                                            </span>
                                        </div>

                                        <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                                            {result.subtitle}
                                        </p>

                                        {result.badge ? (
                                            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                                {result.badge}
                                            </p>
                                        ) : null}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-sm font-semibold">No database result</p>
                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Try client name, CIN, dossier number, invoice number, or archive number.
                            </p>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}