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
 * - open()  -> pushState   (one entry per open)
 * - prev/next -> replaceState (no extra entries)
 * - close after local open -> history.back() (popstate closes the modal)
 * - close after URL restore -> replaceState removing the parameter
 *
 * popstate is the single listener for Back/Forward; pushState/replaceState
 * never fire popstate, so there is no URL/state loop.
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
    const openedByPushRef = useRef(false);
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

            // A pop restore is history-driven: closing later must remove the
            // parameter with replaceState instead of calling back() again.
            openedByPushRef.current = false;

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
        openedByPushRef.current = true;
        setOpenDocumentId(id);
        window.history.pushState({ previewDocument: id }, '', buildViewerUrl(window.location.href, id));
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

        const wasPushOpened = openedByPushRef.current;

        openedByPushRef.current = false;

        if (wasPushOpened) {
            // Pop the entry created by open(): the popstate listener closes
            // the modal and restores focus.
            window.history.back();
        } else {
            openIdRef.current = null;
            window.history.replaceState({ previewDocument: null }, '', removeViewerParam(window.location.href));
            setOpenDocumentId(null);
            window.setTimeout(restoreFocus, 0);
        }
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
