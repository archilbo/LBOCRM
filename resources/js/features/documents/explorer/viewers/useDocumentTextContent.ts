import { useEffect, useState } from 'react';

export type DocumentTextErrorReason =
    | 'authorization'
    | 'missing'
    | 'unsupported'
    | 'binary'
    | 'encoding'
    | 'generic';

export type DocumentTextContent =
    | { status: 'idle' }
    | { status: 'loading' }
    | {
          status: 'success';
          content: string;
          truncated: boolean;
          previewBytes: number;
          totalBytes: number;
          mimeType: string;
      }
    | { status: 'error'; reason: DocumentTextErrorReason };

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function errorReasonFromResponse(response: Response, payload: unknown): DocumentTextErrorReason {
    if (response.status === 403) {
        return 'authorization';
    }

    if (response.status === 404) {
        return 'missing';
    }

    if (response.status === 415) {
        return 'unsupported';
    }

    if (
        response.status === 422
        && isRecord(payload)
        && (payload.reason === 'binary' || payload.reason === 'encoding')
    ) {
        return payload.reason;
    }

    return 'generic';
}

/**
 * Fetches the authorized text/Markdown content endpoint for the open viewer.
 * The request is aborted when the URL changes or the viewer unmounts; stale
 * responses are ignored. Content and private URLs are never logged.
 */
export function useDocumentTextContent(url: string | null): DocumentTextContent {
    const [state, setState] = useState<DocumentTextContent>(() => ({
        status: url ? 'loading' : 'idle',
    }));

    useEffect(() => {
        if (!url) {
            return;
        }

        const controller = new AbortController();

        const load = async (): Promise<void> => {
            setState({ status: 'loading' });

            try {
                const response = await fetch(url, {
                    signal: controller.signal,
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' },
                });

                const payload: unknown = await response.json().catch(() => null);

                if (!response.ok) {
                    setState({ status: 'error', reason: errorReasonFromResponse(response, payload) });
                    return;
                }

                if (!isRecord(payload) || typeof payload.content !== 'string') {
                    setState({ status: 'error', reason: 'generic' });
                    return;
                }

                setState({
                    status: 'success',
                    content: payload.content,
                    truncated: payload.truncated === true,
                    previewBytes: typeof payload.previewBytes === 'number' ? payload.previewBytes : 0,
                    totalBytes: typeof payload.totalBytes === 'number' ? payload.totalBytes : 0,
                    mimeType: typeof payload.mimeType === 'string' ? payload.mimeType : '',
                });
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return; // stale response — a newer request owns the state
                }

                setState({ status: 'error', reason: 'generic' });
            }
        };

        void load();

        return () => controller.abort();
    }, [url]);

    return state;
}
