import type { ConversationRow, MessageAttachmentRow, MessageRow } from '@/features/chat/types';

export type Paginator = { currentPage: number; lastPage: number; total: number; perPage?: number };
export type ConversationPage = { conversations: ConversationRow[]; paginator: Paginator };
export type MessagePage = { messages: MessageRow[]; paginator: Paginator };

export type SendMessageOptions = {
    clientMessageId: string;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
};

export type SendMessageResult = {
    message: MessageRow;
    clientMessageId: string;
};

const STATUS_MESSAGES: Record<number, string> = {
    401: 'Votre session a expiré. Veuillez vous reconnecter.',
    403: 'Vous n\'êtes pas autorisé à envoyer un message dans cette conversation.',
    404: 'Cette conversation ou ce message n\'existe plus.',
    413: 'Le fichier ou l\'ensemble des fichiers dépasse la taille autorisée par le serveur.',
    419: 'Votre session a expiré. Actualisez la page puis réessayez.',
    422: 'Le message ou les fichiers ne sont pas valides.',
    429: 'Trop de tentatives. Veuillez patienter.',
    500: 'Une erreur serveur a empêché l\'envoi.',
};

export class InboxApiError extends Error {
    constructor(message: string, public readonly status: number, public readonly errors: Record<string, string[]> = {}) {
        super(message);
    }
}

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content
        || (window as Window & { csrfToken?: string }).csrfToken
        || '';
}

const BASE_HEADERS: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-TOKEN': csrfToken(),
};

function getSafeHttpError(status: number): string {
    return STATUS_MESSAGES[status] || 'Connexion impossible. Vérifiez votre réseau puis réessayez.';
}

function createInboxApiError(status: number, payload: unknown): InboxApiError {
    const p = payload as Record<string, unknown> | null;
    const msg = (p?.message as string) || getSafeHttpError(status);
    const errors = (p?.errors as Record<string, string[]>) || {};
    return new InboxApiError(msg, status, errors);
}

function normalizeMessage(raw: unknown): MessageRow {
    const r = raw as Record<string, unknown> | null;
    if (!r) throw new Error('Réponse vide du serveur');
    return {
        ...r,
        createdAt: (r.createdAt as string) ?? (r.created_at as string) ?? new Date().toISOString(),
        updatedAt: (r.updatedAt as string) ?? (r.updated_at as string) ?? (r.createdAt as string) ?? (r.created_at as string) ?? new Date().toISOString(),
    } as unknown as MessageRow;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers: {
            ...BASE_HEADERS,
            ...options.headers,
        },
    });

    const contentType = response.headers.get('Content-Type') ?? '';

    if (response.redirected) {
        const redirectUrl = response.url;
        throw new InboxApiError(
            redirectUrl.includes('/login')
                ? 'Votre session a expiré. Veuillez vous reconnecter.'
                : 'Le serveur a redirigé la requête au lieu de retourner le résultat attendu.',
            response.status,
        );
    }

    if (!contentType.includes('application/json')) {
        const text = await response.text().catch(() => '');
        if (!response.ok) {
            throw createInboxApiError(response.status, null);
        }
        throw new InboxApiError(
            'Le serveur a retourné une réponse HTML au lieu du format JSON.',
            response.status,
        );
    }

    let payload: unknown = null;
    try {
        payload = await response.json();
    } catch {
        if (!response.ok) {
            throw createInboxApiError(response.status, null);
        }
        throw new InboxApiError('Réponse JSON invalide du serveur.', response.status);
    }

    if (!response.ok) {
        throw createInboxApiError(response.status, payload);
    }

    return payload as T;
}

function queryString(values: Record<string, string | number | boolean | undefined>): string {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== false) params.set(key, String(value));
    });
    return params.toString();
}

export const inboxApi = {
    conversations: (filters: { search?: string; type?: string; unread?: boolean; archived?: boolean; page?: number }, signal?: AbortSignal) =>
        request<ConversationPage>(`/inbox/conversations/list?${queryString(filters)}`, { signal }),
    messages: (conversationId: number, page = 1, signal?: AbortSignal) =>
        request<MessagePage>(`/inbox/${conversationId}?page=${page}`, { signal }),
    searchMessages: (conversationId: number, search: string, page = 1, signal?: AbortSignal) =>
        request<MessagePage>(`/inbox/${conversationId}/search?${queryString({ search, page })}`, { signal }),
    attachments: (conversationId: number, page = 1, signal?: AbortSignal) =>
        request<{ attachments: MessageAttachmentRow[]; paginator: Paginator }>(`/inbox/${conversationId}/attachments?page=${page}`, { signal }),
    sendMessage: (conversationId: number, body: string, files: File[], replyToId?: number, clientMessageId?: string) => {
        const form = new FormData();
        const normalizedBody = body.trim();
        if (normalizedBody !== '') form.append('body', normalizedBody);
        files.forEach((file) => form.append('files[]', file, file.name));
        if (replyToId) form.append('reply_to_message_id', String(replyToId));
        if (clientMessageId) form.append('client_message_id', clientMessageId);
        return request<MessageRow>(`/inbox/${conversationId}/messages`, { method: 'POST', body: form });
    },
    updateMessage: (conversationId: number, messageId: number, body: string) => request<MessageRow>(
        `/inbox/${conversationId}/messages/${messageId}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }) },
    ),
    deleteMessage: (conversationId: number, messageId: number) => request<{ success: boolean }>(
        `/inbox/${conversationId}/messages/${messageId}`,
        { method: 'DELETE' },
    ),
    archive: (conversationId: number, archived: boolean) => request<{ success: boolean; conversation: ConversationRow }>(
        `/inbox/${conversationId}/${archived ? 'archive' : 'unarchive'}`,
        { method: 'POST' },
    ),
    preferences: (conversationId: number, values: { pinned?: boolean; muted?: boolean; draft?: string | null }) => request<{ success: boolean }>(
        `/inbox/${conversationId}/preferences`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) },
    ),
    markUnread: (conversationId: number) => request<{ success: boolean }>(`/inbox/${conversationId}/mark-unread`, { method: 'POST' }),
    updateConversation: (conversationId: number, subject: string) => request<ConversationRow>(
        `/inbox/${conversationId}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject }) },
    ),
    addParticipant: (conversationId: number, userId: number) => request<{ success: boolean }>(
        `/inbox/${conversationId}/participants`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId }) },
    ),
    removeParticipant: (conversationId: number, userId: number) => request<{ success: boolean }>(
        `/inbox/${conversationId}/participants/${userId}`,
        { method: 'DELETE' },
    ),
    forward: (conversationId: number, messageId: number, conversationIds: number[]) => request<{ forwarded: boolean; messages: MessageRow[] }>(
        `/inbox/${conversationId}/messages/${messageId}/forward`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversation_ids: conversationIds }) },
    ),
};
