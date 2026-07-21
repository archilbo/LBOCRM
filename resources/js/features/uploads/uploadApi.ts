function getCsrfToken(): string {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    return meta?.content ?? '';
}

function pdUrl(dossierId: number, path: string): string {
    return `/dossiers/${dossierId}/project-design/${path}`;
}

export interface CreateSessionPayload {
    client_upload_id: string;
    operation: string;
    submission_intent?: string;
    design_file_id?: number | null;
    name?: string;
    discipline?: string;
    code?: string;
    description?: string;
    change_summary?: string;
    revision_code?: string;
    note?: string;
    files: {
        client_file_upload_id: string;
        asset_type: string;
        original_filename: string;
        size_bytes: number;
    }[];
}

export async function createUploadSession(dossierId: number, payload: CreateSessionPayload): Promise<Response> {
    return fetch(pdUrl(dossierId, 'upload-sessions'), {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

export async function finalizeUploadSession(dossierId: number, sessionId: number): Promise<Response> {
    return fetch(pdUrl(dossierId, `upload-sessions/${sessionId}/finalize`), {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
    });
}

export async function getUploadSessionStatus(dossierId: number, sessionId: number, signal?: AbortSignal): Promise<Response> {
    return fetch(pdUrl(dossierId, `upload-sessions/${sessionId}`), {
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
        signal,
    });
}

export async function cancelUploadSession(dossierId: number, sessionId: number): Promise<Response> {
    return fetch(pdUrl(dossierId, `upload-sessions/${sessionId}/cancel`), {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrfToken(),
        },
    });
}
