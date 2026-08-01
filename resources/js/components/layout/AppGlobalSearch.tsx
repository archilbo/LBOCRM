import { router } from '@inertiajs/react';
import {
    Button,
    Header,
    Kbd,
    ListBox,
    ScrollShadow,
    SearchField,
    Skeleton,
    Spinner,
    Surface,
    Tooltip,
} from '@heroui/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Building2,
    CalendarDays,
    ClipboardList,
    CornerDownLeft,
    FileSignature,
    FileText,
    FolderKanban,
    ReceiptText,
    Search,
    SearchX,
    Settings as SettingsIcon,
    UserRound,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent as ReactKeyboardEvent,
    type Key as ReactKey,
} from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { isValidHref } from '@/config/navigation';
import { useTranslation } from '@/lib/i18n';
import { AppFilterTabs } from '@/components/ui/AppFilterTabs';
import { GlobalSearchResultItem } from './global-search/GlobalSearchResultItem';
import { QuickActionItem, type QuickAction } from './global-search/QuickActionItem';
import {
    CATEGORY_COLORS,
    CATEGORY_SINGULAR_KEYS,
    SEARCH_CATEGORIES,
    TYPE_ICONS,
    categoryOf,
    type BackendSearchResult,
    type SearchCategory,
} from './global-search/globalSearchTypes';

const DEBOUNCE_MS = 220;
const CACHE_TTL_MS = 45_000;
const CACHE_MAX_ENTRIES = 20;

const QUICK_ACTIONS: QuickAction[] = [
    { id: 'action:clients', labelKey: 'nav.clients', icon: UserRound, href: '/clients', color: '#3b82f6' },
    { id: 'action:intermediaries', labelKey: 'nav.intermediaries', icon: Building2, href: '/intermediaries', color: '#14b8a6' },
    { id: 'action:dossiers', labelKey: 'nav.dossiers', icon: FolderKanban, href: '/dossiers', color: '#8b5cf6' },
    { id: 'action:documents', labelKey: 'nav.documents', icon: FileText, href: '/documents', color: '#f59e0b' },
    { id: 'action:contracts', labelKey: 'nav.contracts', icon: FileSignature, href: '/contracts', color: '#f43f5e' },
    { id: 'action:finance', labelKey: 'nav.finance', icon: ReceiptText, href: '/finance', color: '#10b981' },
    { id: 'action:calendar', labelKey: 'nav.calendar', icon: CalendarDays, href: '/calendar', color: '#0ea5e9' },
    { id: 'action:tasks', labelKey: 'nav.tasks', icon: ClipboardList, href: '/tasks', color: '#f97316' },
    { id: 'action:settings', labelKey: 'nav.settings', icon: SettingsIcon, href: '/settings', color: '#64748b' },
];

const SHORTCUT_LABEL = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform) ? '⌘K' : 'Ctrl K';

type SearchGroup = {
    id: string;
    label: string;
    count: number;
    showHeader: boolean;
    items: BackendSearchResult[];
};

type CacheEntry = {
    results: BackendSearchResult[];
    timestamp: number;
};

function computePaletteStyle(): CSSProperties {
    const viewportWidth = window.innerWidth;
    const mobile = viewportWidth < 768;

    return {
        position: 'fixed',
        top: mobile ? '10px' : '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: mobile ? 'calc(100vw - 12px)' : '700px',
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: mobile ? 'calc(100vh - 20px)' : 'min(640px, calc(100vh - 96px))',
        zIndex: 9999,
        visibility: 'visible',
    };
}

export function AppGlobalSearch() {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<BackendSearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<SearchCategory>('all');
    const [durationMs, setDurationMs] = useState<number | null>(null);
    const [panelStyle, setPanelStyle] = useState<CSSProperties>({
        position: 'fixed',
        zIndex: 9999,
        visibility: 'hidden',
    });

    const panelRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
    const openerRef = useRef<HTMLElement | null>(null);
    const [resultsQuery, setResultsQuery] = useState('');
    const [retryNonce, setRetryNonce] = useState(0);

    const trimmedQuery = query.trim();
    const hasQuery = trimmedQuery.length >= 2;
    const isFirstLoad = isLoading && (results.length === 0 || resultsQuery !== trimmedQuery);

    const counts = useMemo(() => {
        const next: Record<string, number> = {};

        for (const result of results) {
            const key = categoryOf(result.type);
            next[key] = (next[key] ?? 0) + 1;
        }

        return next;
    }, [results]);

    const filteredResults = useMemo(
        () => (category === 'all' ? results : results.filter((result) => categoryOf(result.type) === category)),
        [category, results],
    );

    const groups = useMemo<SearchGroup[]>(() => {
        if (category !== 'all') {
            return [
                {
                    id: category,
                    label: '',
                    count: filteredResults.length,
                    showHeader: false,
                    items: filteredResults,
                },
            ];
        }

        return SEARCH_CATEGORIES.filter((entry) => (counts[entry.id] ?? 0) > 0).map((entry) => ({
            id: entry.id,
            label: t(entry.labelKey),
            count: counts[entry.id] ?? 0,
            showHeader: true,
            items: results.filter((result) => categoryOf(result.type) === entry.id),
        }));
    }, [category, counts, filteredResults, results, t]);

    const tabs = useMemo(() => {
        const list: { id: SearchCategory; label: string; count: number }[] = [
            { id: 'all', label: t('globalSearch.all'), count: results.length },
        ];

        for (const entry of SEARCH_CATEGORIES) {
            const count = counts[entry.id] ?? 0;

            if (count > 0) {
                list.push({ id: entry.id, label: t(entry.labelKey), count });
            }
        }

        return list;
    }, [counts, results, t]);

    const openPalette = useCallback(() => {
        openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setIsOpen(true);

        window.requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        });
    }, []);

    const closePalette = useCallback(() => {
        setIsOpen(false);

        window.requestAnimationFrame(() => {
            openerRef.current?.focus();
        });
    }, []);

    function applyResults(next: BackendSearchResult[], clean: string, duration: number | null) {
        setResultsQuery(clean);

        setCategory((prev) =>
            prev !== 'all' && !next.some((result) => categoryOf(result.type) === prev) ? 'all' : prev,
        );

        setResults(next);
        setDurationMs(duration);
        setError(null);
        setIsLoading(false);
        setIsOpen(true);
    }

    function handleQueryChange(value: string) {
        controllerRef.current?.abort();
        setQuery(value);

        const clean = value.trim();

        if (clean.length === 0) {
            setResultsQuery('');
            setResults([]);
            setError(null);
            setIsLoading(false);
            setDurationMs(null);
            setIsOpen(true);

            return;
        }

        if (clean.length < 2) {
            setResultsQuery('');
            setResults([]);
            setError(null);
            setIsLoading(false);
            setDurationMs(null);
            setIsOpen(true);

            return;
        }

        setIsOpen(true);
    }

    useEffect(() => {
        const clean = query.trim();

        if (clean.length < 2) {
            return;
        }

        const timeout = window.setTimeout(() => {
            const cached = cacheRef.current.get(clean);

            if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
                // Refresh recency (LRU): re-inserting moves the entry to the end.
                cacheRef.current.delete(clean);
                cacheRef.current.set(clean, cached);
                applyResults(cached.results, clean, null);

                return;
            }

            controllerRef.current?.abort();

            const controller = new AbortController();
            controllerRef.current = controller;
            const startedAt = performance.now();

            setIsLoading(true);
            setError(null);

            fetch(`/global-search?q=${encodeURIComponent(clean)}`, {
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
                .then((payload: { results?: BackendSearchResult[] }) => {
                    if (controller.signal.aborted) {
                        return;
                    }

                    const next = payload.results ?? [];
                    const duration = Math.round(performance.now() - startedAt);

                    // LRU insert: delete-then-set keeps recency order correct.
                    cacheRef.current.delete(clean);
                    cacheRef.current.set(clean, { results: next, timestamp: Date.now() });

                    if (cacheRef.current.size > CACHE_MAX_ENTRIES) {
                        const oldest = cacheRef.current.keys().next().value;

                        if (oldest !== undefined) {
                            cacheRef.current.delete(oldest);
                        }
                    }

                    applyResults(next, clean, duration);
                })
                .catch(() => {
                    if (controller.signal.aborted) {
                        return;
                    }

                    setError('Search is temporarily unavailable.');
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setIsLoading(false);
                    }
                });
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(timeout);
    }, [query, retryNonce]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setPanelStyle(computePaletteStyle());

        const refresh = () => setPanelStyle(computePaletteStyle());

        window.addEventListener('resize', refresh);

        return () => window.removeEventListener('resize', refresh);
    }, [isOpen]);

    useEffect(() => {
        function handleShortcut(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.repeat) {
                event.preventDefault();
                openPalette();
            }
        }

        document.addEventListener('keydown', handleShortcut);

        return () => document.removeEventListener('keydown', handleShortcut);
    }, [openPalette]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleDocumentEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                closePalette();
            }
        }

        document.addEventListener('keydown', handleDocumentEscape);

        return () => document.removeEventListener('keydown', handleDocumentEscape);
    }, [isOpen, closePalette]);

    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
        };
    }, []);

    function openResult(result: BackendSearchResult | undefined) {
        if (!result || !isValidHref(result.href)) {
            toast.error(t('globalSearch.invalidRoute'));

            return;
        }

        setIsOpen(false);
        router.visit(result.href);
    }

    function openAction(action: QuickAction | undefined) {
        if (!action || !isValidHref(action.href)) {
            toast.error(t('globalSearch.invalidActionRoute'));

            return;
        }

        setIsOpen(false);
        router.visit(action.href);
    }

    /** Open an archive record directly from its chip inside a result row. */
    function openArchive(href: string) {
        setIsOpen(false);
        router.visit(href);
    }

    function handleAction(key: ReactKey) {
        const id = String(key);

        if (id.startsWith('action:')) {
            openAction(QUICK_ACTIONS.find((action) => action.id === id));

            return;
        }

        const result = results.find((entry) => entry.id === id);

        openResult(result);
    }

    /** Cycle the category tabs by one step (wraps in both directions). */
    function cycleCategory(direction: 1 | -1) {
        setCategory((prev) => {
            const current = Math.max(0, tabs.findIndex((tab) => tab.id === prev));
            const next = (current + direction + tabs.length) % tabs.length;

            return tabs[next].id as SearchCategory;
        });
    }

    /** Focus the first/last visible option (quick actions or results) via live DOM query. */
    function focusListBoundary(dir: 'first' | 'last') {
        window.requestAnimationFrame(() => {
            const options = panelRef.current?.querySelectorAll<HTMLElement>('[role="option"]');

            if (!options || options.length === 0) {
                return;
            }

            (dir === 'first' ? options[0] : options[options.length - 1])?.focus();
        });
    }

    /**
     * Captured keydown on the options list: left/right cycles categories,
     * printable characters return focus to the search input (and bypass RAC's typeahead).
     */
    function handleListKeyDownCapture(event: ReactKeyboardEvent) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (tabs.length > 1) {
                event.preventDefault();
                event.stopPropagation();
                cycleCategory(event.key === 'ArrowRight' ? 1 : -1);
                focusListBoundary('first');
            }

            return;
        }

        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            event.stopPropagation();
            inputRef.current?.focus();
        }
    }

    function handleFieldKeyDown(event: ReactKeyboardEvent) {
        if (event.key === 'Enter' && isOpen) {
            if (hasQuery && filteredResults.length > 0) {
                event.preventDefault();
                openResult(filteredResults[0]);
            } else if (!hasQuery && QUICK_ACTIONS.length > 0) {
                event.preventDefault();
                openAction(QUICK_ACTIONS[0]);
            }

            return;
        }

        if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && isOpen && tabs.length > 1) {
            event.preventDefault();
            cycleCategory(event.key === 'ArrowRight' ? 1 : -1);

            return;
        }

        if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && isOpen) {
            event.preventDefault();
            focusListBoundary(event.key === 'ArrowDown' ? 'first' : 'last');
        }
    }

    function handleEscapeFromPanel(event: ReactKeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            closePalette();
        }
    }

    function renderSummary() {
        let content: React.ReactNode;

        if (!hasQuery) {
            return null;
        } else if (isFirstLoad) {
            content = <span className="text-[var(--text-muted)]">{t('globalSearch.searching')}</span>;
        } else if (error) {
            content = <span className="text-[var(--text-muted)]">{t('globalSearch.unavailable')}</span>;
        } else if (results.length === 0) {
            content = <span className="text-[var(--text-muted)]">{t('globalSearch.noResults', { query: trimmedQuery })}</span>;
        } else {
            const shown = category === 'all' ? results.length : filteredResults.length;
            const categoryKey = category === 'all' ? null : (category as Exclude<SearchCategory, 'all'>);
            const summaryKey = shown === 1
                ? (categoryKey ? 'globalSearch.summaryCategoryOne' : 'globalSearch.summaryOne')
                : (categoryKey ? 'globalSearch.summaryCategoryMany' : 'globalSearch.summaryMany');
            const summaryValues: Record<string, string | number> = categoryKey
                ? { count: shown, category: t(CATEGORY_SINGULAR_KEYS[categoryKey]) }
                : { count: shown };

            content = (
                <>
                    <span className="font-medium text-[var(--text)]">{t(summaryKey, summaryValues)}</span>
                    <span className="min-w-0 truncate text-[var(--text-muted)]">
                        {t('globalSearch.summaryFor', { query: trimmedQuery })}
                    </span>
                    {durationMs !== null ? (
                        <span className="ml-auto shrink-0 text-[9px] tabular-nums text-[var(--text-subtle)]">
                            {durationMs} ms
                        </span>
                    ) : null}
                </>
            );
        }

        return (
            <div className="flex h-7 shrink-0 items-center gap-2 px-3">
                <p aria-live="polite" className="flex min-w-0 items-center gap-1.5 text-[9.5px]">
                    {content}
                </p>
                {isLoading && !isFirstLoad ? <Spinner size="sm" aria-label="Searching" /> : null}
            </div>
        );
    }

    function renderBody() {
        if (error) {
            return (
                <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]" aria-hidden="true">
                        <SearchX size={16} />
                    </span>
                    <p className="text-sm font-medium text-[var(--text)]">{t('globalSearch.errorTitle')}</p>
                    <p className="max-w-sm text-xs leading-5 text-[var(--text-muted)]">{t('globalSearch.errorDescription')}</p>
                    <Button
                        variant="secondary"
                        size="sm"
                        onPress={() => {
                            setError(null);
                            setRetryNonce((n) => n + 1);
                        }}
                    >
                        {t('globalSearch.retry')}
                    </Button>
                </div>
            );
        }

        if (!hasQuery) {
            return (
                <div className="px-1 py-3" onKeyDownCapture={handleListKeyDownCapture}>
                    <div className="mx-auto grid w-full max-w-[350px] grid-cols-3 gap-1.5 p-1.5 sm:gap-2">
                        <ListBox
                            key="quick"
                            selectionMode="none"
                            onAction={handleAction}
                            aria-label={t('globalSearch.quickActions')}
                            className="contents"
                        >
                            {QUICK_ACTIONS.map((action) => (
                                <QuickActionItem key={action.id} action={action} />
                            ))}
                        </ListBox>
                    </div>
                </div>
            );
        }

        if (isFirstLoad) {
            return (
                <div className="flex flex-col gap-2 p-2" aria-hidden="true">
                    <Skeleton className="h-[46px] w-full rounded-[9px]" />
                    <Skeleton className="h-[46px] w-full rounded-[9px]" />
                    <Skeleton className="h-[46px] w-full rounded-[9px]" />
                    <Skeleton className="h-[46px] w-full rounded-[9px]" />
                    <Skeleton className="h-[46px] w-full rounded-[9px]" />
                </div>
            );
        }

        if (results.length === 0) {
            return (
                <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]" aria-hidden="true">
                        <SearchX size={16} />
                    </span>
                    <p className="text-sm font-semibold text-[var(--text)]">{t('globalSearch.noResults', { query: trimmedQuery })}</p>
                    <ul className="max-w-sm space-y-1 text-xs text-[var(--text-muted)]">
                        <li>· {t('globalSearch.tipSpelling')}</li>
                        <li>· {t('globalSearch.tipCode')}</li>
                        <li>· {t('globalSearch.tipFewerWords')}</li>
                        <li>· {t('globalSearch.tipOtherCategory')}</li>
                    </ul>
                </div>
            );
        }

        return (
            <>
                {tabs.length > 1 ? (
                    <div className="flex h-8 shrink-0 items-center px-2">
                        <AppFilterTabs
                            variant="light"
                            label="Category"
                            hideLabel
                            value={category}
                            options={tabs}
                            allValue="all"
                            onChange={(value) => {
                                setCategory(value as SearchCategory);
                            }}
                        />
                    </div>
                ) : null}

                <ScrollShadow orientation="vertical" hideScrollBar className="min-h-0 max-h-[min(420px,calc(100vh-172px))] sm:max-h-[min(464px,calc(100vh-272px))]">
                    <div aria-busy={isLoading} onKeyDownCapture={handleListKeyDownCapture}>
                        <ListBox
                            key={category}
                            selectionMode="none"
                            onAction={handleAction}
                            aria-label={t('globalSearch.resultsAria')}
                            className="p-1.5"
                        >
                            {groups.map((group, index) => {
                                const Icon = TYPE_ICONS[group.items[0]?.type ?? ''];

                                return (
                                    <ListBox.Section key={group.id} id={group.id}>
                                        {group.showHeader ? (
                                            <Header className={`flex items-center gap-1.5 px-2 py-2 text-[9.5px] font-normal uppercase tracking-[0.1em] [color:color-mix(in_srgb,var(--foreground)_72%,transparent)] ${index > 0 ? 'mt-2' : ''}`}>
                                                {Icon ? (
                                                    <Icon
                                                        size={10}
                                                        aria-hidden="true"
                                                        style={{ color: CATEGORY_COLORS[group.id as keyof typeof CATEGORY_COLORS] }}
                                                    />
                                                ) : null}
                                                {group.label}
                                                <span className="inline-flex min-w-[14px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-1 text-[9px] font-normal leading-[14px] tabular-nums normal-case tracking-normal [color:color-mix(in_srgb,var(--foreground)_52%,transparent)]">
                                                    {group.count}
                                                </span>
                                            </Header>
                                        ) : null}
                                        {group.items.map((result) => (
                                            <GlobalSearchResultItem
                                                key={result.id}
                                                result={result}
                                                query={trimmedQuery}
                                                onOpenArchive={openArchive}
                                            />
                                        ))}
                                    </ListBox.Section>
                                );
                            })}
                        </ListBox>
                    </div>
                </ScrollShadow>
            </>
        );
    }

    return (
        <>
            <Tooltip delay={450}>
                <Tooltip.Trigger className="flex">
                    <Button
                        isIconOnly
                        aria-label={t('globalSearch.dialogLabel')}
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? 'global-search-palette' : undefined}
                        variant="ghost"
                        onPress={openPalette}
                        className="size-9 rounded-[10px] text-[var(--text-muted)]"
                    >
                        <Search aria-hidden="true" size={17} />
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                    {t('common.search')}
                </Tooltip.Content>
            </Tooltip>

            {isOpen
                ? createPortal(
                      <>
                          <div
                              aria-hidden="true"
                              onClick={closePalette}
                              className="fixed inset-0 z-[9998] bg-[rgba(8,10,14,0.55)] backdrop-blur-[2px]"
                          />
                          <Surface
                              id="global-search-palette"
                              ref={panelRef}
                              style={panelStyle}
                              role="dialog"
                              aria-modal="true"
                              aria-label={t('globalSearch.dialogLabel')}
                              className="flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 font-sans shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)] sm:p-5"
                          >
                              <div className="flex h-11 shrink-0 items-center gap-2 px-3">
                  <SearchField
                      value={query}
                      onChange={handleQueryChange}
                      onKeyDown={handleFieldKeyDown}
                      aria-label={t('globalSearch.dialogLabel')}
                      fullWidth
                      className="min-w-0"
                  >
                      <SearchField.Group className="h-9 rounded-xl pl-2 pr-2 [--field-background:transparent] [--field-border-focus:transparent] [--field-shadow:none] [--focus:transparent]">
                          <SearchField.SearchIcon className="ml-0">
                              <Search size={14} aria-hidden="true" />
                          </SearchField.SearchIcon>
                          <SearchField.Input
                              ref={inputRef}
                              onKeyDownCapture={handleEscapeFromPanel}
                              placeholder={t('globalSearch.placeholder')}
                               className="text-[10.5px] placeholder:text-[var(--text-muted)]"
                          />
                                          {query ? <SearchField.ClearButton /> : null}
                                          {!query ? (
                                              <span aria-hidden="true" className="hidden shrink-0 sm:flex">
                                                  <Kbd className="rounded-md border border-[var(--border)] px-1.5 py-0.5 text-[9px] text-[var(--text-subtle)]">
                                                      {SHORTCUT_LABEL}
                                                  </Kbd>
                                              </span>
                                          ) : null}
                                      </SearchField.Group>
                                  </SearchField>
                              </div>

                              {renderSummary()}

                              {renderBody()}

                              <div className="flex h-8 shrink-0 items-center justify-between gap-3 px-3">
                                  <span className="flex items-center gap-1.5 text-[9.5px] text-[var(--text-muted)]">
                                      <Kbd>
                                          <ArrowUp size={9} strokeWidth={2.5} aria-hidden="true" />
                                      </Kbd>
                                      <Kbd>
                                          <ArrowDown size={9} strokeWidth={2.5} aria-hidden="true" />
                                      </Kbd>
                                      {t('globalSearch.footerNavigate')}
                                  </span>
                                  <span className="hidden items-center gap-1.5 text-[9px] text-[var(--text-muted)] sm:flex">
                                      <Kbd>
                                          <ArrowLeft size={9} strokeWidth={2.5} aria-hidden="true" />
                                      </Kbd>
                                      <Kbd>
                                          <ArrowRight size={9} strokeWidth={2.5} aria-hidden="true" />
                                      </Kbd>
                                      {t('globalSearch.footerCategory')}
                                  </span>
                                  <span className="hidden items-center gap-1.5 text-[9px] text-[var(--text-muted)] sm:flex">
                                      <Kbd>
                                          <CornerDownLeft size={9} strokeWidth={2.5} aria-hidden="true" />
                                      </Kbd>
                                      {t('globalSearch.footerOpen')}
                                  </span>
                                  <span className="hidden items-center gap-1.5 text-[9px] text-[var(--text-muted)] sm:flex">
                                      <Kbd className="px-1.5">
                                          <span className="text-[9px] font-medium leading-none">esc</span>
                                      </Kbd>
                                      {t('globalSearch.footerClose')}
                                  </span>
                              </div>
                          </Surface>
                      </>,
                      document.body,
                  )
                : null}
        </>
    );
}
