import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { buildViewerUrl, readViewerDocumentId, removeViewerParam } from './documentViewerUrl';
import type { DocumentExplorerItem } from './documentExplorerTypes';

type UseDocumentViewerStateOptions = {
    /** Full authorized explorer dataset (unfiltered). */
    documents: DocumentExplorerItem[];
    /** Currently visible documents in filtered + sorted order (sequence navigation). */
    visibleDocuments: DocumentExplorerItem[];
    /** Element to focus when the originating item is gone (explorer heading). */
    fallbackFocusRef?: React.RefObject<HTMLElement | null> | null;
};

export type DocumentViewerState = {
    openDocumentId: string | null;
    /** Document resolved from the authorized dataset, or null (invalid id). */
    openDocument: DocumentExplorerItem | null;
    /** True when the URL references an id that is not in the authorized data. */
    isInvalid: boolean;
    /** 1-based position in the visible collection, or null when not visible. */
    position: { current: number; total: number } | null;
    canGoPrevious: boolean;
    canGoNext: boolean;
    open: (document: DocumentExplorerItem) => void;
    close: () => void;
    goToPrevious: () => void;
    goToNext: () => void;
};

/**
 * Same-page viewer state synchronized with the `preview_document` query
 * parameter.
 *
 * History strategy:
 * - open()  -> replaceState (adds preview_document parameter)
 * - prev/next -> replaceState (no extra entries)
 * - close() -> replaceState removing the parameter
 *
 * This ensures closing the preview always stays on the same page and tab.
 * popstate handles browser Back/Forward navigation.
 */
export function useDocumentViewerState({
    documents,
    visibleDocuments,
    fallbackFocusRef,
}: UseDocumentViewerStateOptions): DocumentViewerState {
    const [openDocumentId, setOpenDocumentId] = useState<string | null>(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        return readViewerDocumentId(window.location.href);
    });

    const openIdRef = useRef(openDocumentId);
    const openerRef = useRef<HTMLElement | null>(null);

    const restoreFocus = useCallback(() => {
        const opener = openerRef.current;

        if (opener && opener.isConnected) {
            opener.focus();
            return;
        }

        fallbackFocusRef?.current?.focus();
    }, [fallbackFocusRef]);

    useEffect(() => {
        const onPopState = () => {
            const nextId = readViewerDocumentId(window.location.href);

            if (nextId === null && openIdRef.current !== null) {
                window.setTimeout(restoreFocus, 0);
            }

            openIdRef.current = nextId;
            setOpenDocumentId(nextId);
        };

        window.addEventListener('popstate', onPopState);

        return () => window.removeEventListener('popstate', onPopState);
    }, [restoreFocus]);

    const open = useCallback((entry: DocumentExplorerItem) => {
        const id = String(entry.id);

        if (openIdRef.current === id) {
            return;
        }

        // Focus target for restoration. Menu items live in a portal and are
        // disconnected once the menu closes, so dropdown-originated opens
        // fall back to the explorer heading.
        const active = globalThis.document.activeElement;

        openerRef.current = active instanceof HTMLElement && !active.closest('[role="menu"]') ? active : null;

        openIdRef.current = id;
        setOpenDocumentId(id);
        window.history.replaceState({ previewDocument: id }, '', buildViewerUrl(window.location.href, id));
    }, []);

    const navigateTo = useCallback((id: string) => {
        openIdRef.current = id;
        setOpenDocumentId(id);
        window.history.replaceState({ previewDocument: id }, '', buildViewerUrl(window.location.href, id));
    }, []);

    const close = useCallback(() => {
        if (openIdRef.current === null) {
            return;
        }

        openIdRef.current = null;
        window.history.replaceState({ previewDocument: null }, '', removeViewerParam(window.location.href));
        setOpenDocumentId(null);
        window.setTimeout(restoreFocus, 0);
    }, [restoreFocus]);

    const openDocument = useMemo(
        () => documents.find((entry) => String(entry.id) === openDocumentId) ?? null,
        [documents, openDocumentId],
    );

    const visibleIndex = useMemo(
        () => (openDocumentId === null ? -1 : visibleDocuments.findIndex((entry) => String(entry.id) === openDocumentId)),
        [visibleDocuments, openDocumentId],
    );

    const canGoPrevious = visibleIndex > 0;
    const canGoNext = visibleIndex >= 0 && visibleIndex < visibleDocuments.length - 1;

    const goToPrevious = useCallback(() => {
        if (visibleIndex <= 0) {
            return;
        }

        navigateTo(String(visibleDocuments[visibleIndex - 1].id));
    }, [visibleIndex, visibleDocuments, navigateTo]);

    const goToNext = useCallback(() => {
        if (visibleIndex < 0 || visibleIndex >= visibleDocuments.length - 1) {
            return;
        }

        navigateTo(String(visibleDocuments[visibleIndex + 1].id));
    }, [visibleIndex, visibleDocuments, navigateTo]);

    return {
        openDocumentId,
        openDocument,
        isInvalid: openDocumentId !== null && openDocument === null,
        position: visibleIndex >= 0 ? { current: visibleIndex + 1, total: visibleDocuments.length } : null,
        canGoPrevious,
        canGoNext,
        open,
        close,
        goToPrevious,
        goToNext,
    };
}
