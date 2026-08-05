import { useEffect, useMemo, useState } from 'react';
import {
    Check as CheckIcon,
    ChevronDown as ChevronDownIcon,
    ChevronUp as ChevronUpIcon,
    CircleAlert as CircleAlertIcon,
    Copy as CopyIcon,
    FileText as FileTextIcon,
    Loader2 as Loader2Icon,
    Search as SearchIcon,
} from 'lucide-react';
import { Input } from '@heroui/react';

import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/i18n';
import { JSON_PRETTY_PRINT_MAX_BYTES } from '../documentViewerConstants';
import type { DocumentExplorerItem } from '../documentExplorerTypes';
import { findTextMatches, type TextMatch } from './textSearch';
import { useDocumentTextContent, type DocumentTextErrorReason } from './useDocumentTextContent';
import type { DocumentViewerProps } from './viewerTypes';

/**
 * JSON is pretty-printed for display only when it is valid and reasonably
 * sized; a parse failure falls back to the original text. The downloaded
 * source is never modified.
 */
function maybePrettyPrintJson(document: DocumentExplorerItem, content: string): string {
    const mimeType = document.mimeType?.trim().toLowerCase() ?? '';
    const isJson = mimeType === 'application/json' || document.extension === 'json';

    if (!isJson || content.length > JSON_PRETTY_PRINT_MAX_BYTES) {
        return content;
    }

    try {
        return JSON.stringify(JSON.parse(content) as unknown, null, 2);
    } catch {
        return content;
    }
}

/**
 * Splits the loaded text into plain segments and highlighted <mark> matches.
 * Every match is rendered as a text node — no raw HTML is ever injected.
 */
function renderSegments(content: string, matches: TextMatch[], currentMatch: number): React.ReactNode {
    if (matches.length === 0) {
        return content;
    }

    const segments: React.ReactNode[] = [];
    let cursor = 0;

    matches.forEach((match, index) => {
        if (match.start > cursor) {
            segments.push(content.slice(cursor, match.start));
        }

        segments.push(
            <mark
                key={index}
                className={cn(
                    'rounded-[2px] px-px',
                    index === currentMatch ? 'bg-amber-400/60 text-black' : 'bg-amber-300/30',
                )}
            >
                {content.slice(match.start, match.end)}
            </mark>,
        );

        cursor = match.end;
    });

    if (cursor < content.length) {
        segments.push(content.slice(cursor));
    }

    return segments;
}

function errorMessageKey(reason: DocumentTextErrorReason): string {
    switch (reason) {
        case 'authorization':
            return 'documentsExplorer.viewer.text.accessDenied';
        case 'missing':
            return 'documentsExplorer.viewer.text.notFound';
        case 'unsupported':
            return 'documentsExplorer.viewer.text.unsupported';
        case 'binary':
            return 'documentsExplorer.viewer.text.binary';
        case 'encoding':
            return 'documentsExplorer.viewer.text.encodingError';
        case 'generic':
            return 'documentsExplorer.viewer.text.loadFailed';
    }
}

/**
 * Secure plain-text preview: the authorized content endpoint is loaded once
 * (AbortController-cancelled on change/unmount) and rendered as text nodes in
 * a monospace, whitespace-preserving region with line-wrap toggle, in-preview
 * search with match navigation, and copy of the visible preview. HTML source
 * stays inert — nothing is ever parsed as markup.
 */
export function TextDocumentViewer({ document }: DocumentViewerProps) {
    const { t } = useTranslation();
    const contentState = useDocumentTextContent(document.contentUrl);

    const [query, setQuery] = useState('');
    const [currentMatch, setCurrentMatch] = useState(0);
    const [wrap, setWrap] = useState(true);
    const [copyFeedback, setCopyFeedback] = useState<'idle' | 'copied' | 'failed'>('idle');

    // Search operates on the displayed (possibly pretty-printed) text so the
    // match positions always align with what the user sees.
    const searchableText = useMemo(
        () => (contentState.status === 'success' ? maybePrettyPrintJson(document, contentState.content) : ''),
        [contentState, document],
    );

    const matches = useMemo(() => findTextMatches(searchableText, query), [searchableText, query]);
    const effectiveCurrent = matches.length === 0 ? -1 : Math.min(currentMatch, matches.length - 1);

    useEffect(() => {
        if (copyFeedback === 'idle') {
            return;
        }

        const timer = window.setTimeout(() => setCopyFeedback('idle'), 2000);

        return () => window.clearTimeout(timer);
    }, [copyFeedback]);

    const handleQueryChange = (value: string) => {
        setQuery(value);
        setCurrentMatch(0);
    };

    const goToNextMatch = () => {
        if (matches.length === 0) {
            return;
        }

        setCurrentMatch((current) => (current + 1) % matches.length);
    };

    const goToPreviousMatch = () => {
        if (matches.length === 0) {
            return;
        }

        setCurrentMatch((current) => (current - 1 + matches.length) % matches.length);
    };

    const handleCopy = async () => {
        try {
            if (!navigator.clipboard) {
                throw new Error('clipboard unavailable');
            }

            await navigator.clipboard.writeText(searchableText);
            setCopyFeedback('copied');
        } catch {
            setCopyFeedback('failed');
        }
    };

    const searchLabel = t('documentsExplorer.viewer.text.search');
    const previousMatchLabel = t('documentsExplorer.viewer.text.previousMatch');
    const nextMatchLabel = t('documentsExplorer.viewer.text.nextMatch');
    const copyLabel = t('documentsExplorer.viewer.text.copy');
    const wrapLabel = wrap
        ? t('documentsExplorer.viewer.text.doNotWrapLines')
        : t('documentsExplorer.viewer.text.wrapLines');

    const matchPositionLabel = t('documentsExplorer.viewer.text.matchPosition')
        .replace('{current}', String(effectiveCurrent + 1))
        .replace('{total}', String(matches.length));

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-[var(--border)] bg-[var(--surface)] px-2 py-1.5">
                <SearchIcon size={13} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                <Input
                    value={query}
                    onChange={(event) => handleQueryChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            if (event.shiftKey) {
                                goToPreviousMatch();
                            } else {
                                goToNextMatch();
                            }
                        }
                    }}
                    placeholder={searchLabel}
                    aria-label={searchLabel}
                    variant="secondary"
                    className="h-7 w-44 min-w-0 text-[10px]"
                />
                <AppButton
                    isIconOnly
                    compact
                    size="sm"
                    variant="quiet"
                    isDisabled={matches.length === 0}
                    tooltip={previousMatchLabel}
                    aria-label={previousMatchLabel}
                    onPress={goToPreviousMatch}
                >
                    <ChevronUpIcon size={14} />
                </AppButton>
                <AppButton
                    isIconOnly
                    compact
                    size="sm"
                    variant="quiet"
                    isDisabled={matches.length === 0}
                    tooltip={nextMatchLabel}
                    aria-label={nextMatchLabel}
                    onPress={goToNextMatch}
                >
                    <ChevronDownIcon size={14} />
                </AppButton>
                <span
                    aria-live="polite"
                    className="min-w-[60px] text-center text-[10px] tabular-nums text-[var(--text-muted)]"
                >
                    {query.trim() ? (matches.length > 0 ? matchPositionLabel : t('documentsExplorer.viewer.text.noMatches')) : ''}
                </span>

                <span className="mx-auto" aria-hidden="true" />

                <AppButton
                    compact
                    size="sm"
                    variant="quiet"
                    className={cn(wrap && 'bg-[var(--surface-2)] text-[var(--foreground)]')}
                    aria-pressed={wrap}
                    tooltip={wrapLabel}
                    onPress={() => setWrap((current) => !current)}
                >
                    {wrap
                        ? t('documentsExplorer.viewer.text.wrapLines')
                        : t('documentsExplorer.viewer.text.doNotWrapLines')}
                </AppButton>
                <AppButton
                    compact
                    size="sm"
                    variant="quiet"
                    tooltip={copyLabel}
                    onPress={handleCopy}
                >
                    {copyFeedback === 'copied' ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                    {copyFeedback === 'copied'
                        ? t('documentsExplorer.viewer.text.copied')
                        : copyFeedback === 'failed'
                            ? t('documentsExplorer.viewer.text.copyFailed')
                            : copyLabel}
                </AppButton>
            </div>

            {contentState.status === 'success' && contentState.truncated ? (
                <div
                    role="status"
                    className="flex shrink-0 items-center gap-1.5 border-b border-[var(--border)] bg-amber-500/10 px-3 py-1.5 text-[10px] text-amber-700 dark:text-amber-400"
                >
                    <CircleAlertIcon size={12} className="shrink-0" aria-hidden="true" />
                    {t('documentsExplorer.viewer.text.truncated')}
                </div>
            ) : null}

            <div className="relative min-h-0 flex-1 overflow-auto bg-[var(--surface-2)]/30">
                {contentState.status === 'loading' ? (
                    <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Loader2Icon size={18} className="animate-spin text-[var(--text-muted)]" />
                        <p className="text-[10px] text-[var(--text-muted)]">
                            {t('documentsExplorer.viewer.text.loading')}
                        </p>
                    </div>
                ) : null}

                {contentState.status === 'error' ? (
                    <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--text-muted)]">
                            <FileTextIcon size={18} />
                        </span>
                        <p className="max-w-md text-center text-[11px] text-[var(--text-muted)]">
                            {t(errorMessageKey(contentState.reason))}
                        </p>
                    </div>
                ) : null}

                {contentState.status === 'success' ? (
                    <pre
                        className={cn(
                            'min-h-full px-4 py-3 font-mono text-[11px] leading-relaxed text-[var(--foreground)]',
                            wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre',
                        )}
                    >
                        {renderSegments(searchableText, matches, effectiveCurrent)}
                    </pre>
                ) : null}
            </div>
        </div>
    );
}
