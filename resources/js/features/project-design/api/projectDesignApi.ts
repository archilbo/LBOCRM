import type {
    ProjectDesignSummary, ProjectDesignFolder, ProjectDesignFile, ProjectDesignVersion,
    ProjectDesignReview, ProjectDesignRemark, ProjectDesignActivity,
} from '../types/projectDesign';

export class ProjectDesignApiError extends Error {
    status: number;
    body: unknown;
    constructor(message: string, status: number, body?: unknown) {
        super(message);
        this.name = 'ProjectDesignApiError';
        this.status = status;
        this.body = body;
    }
}

function getCsrfToken(): string {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    return meta?.content ?? '';
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');
    headers.set('X-CSRF-TOKEN', getCsrfToken());

    if (options.body instanceof FormData) {
    } else if (options.body && typeof options.body === 'string') {
        headers.set('Content-Type', 'application/json');
    } else if (options.body && typeof options.body === 'object') {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, { ...options, headers, credentials: 'same-origin' });

    if (!response.ok) {
        let body: unknown;
        try { body = await response.json(); } catch { body = await response.text().catch(() => null); }

        const messages: Record<number, string> = {
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not found',
            409: 'Conflict',
            413: 'Payload too large',
            419: 'Session expired',
            422: 'Validation failed',
            429: 'Too many requests',
            500: 'Server error',
        };

        throw new ProjectDesignApiError(
            messages[response.status] ?? `Request failed (${response.status})`,
            response.status,
            body,
        );
    }

    if (response.status === 204) return undefined as T;

    return response.json();
}

function pdUrl(dossierId: number, path: string): string {
    return `/dossiers/${dossierId}/project-design/${path}`;
}

export const projectDesignApi = {
    getSummary(dossierId: number, signal?: AbortSignal): Promise<ProjectDesignSummary> {
        return request<ProjectDesignSummary>(pdUrl(dossierId, 'summary'), { signal });
    },

    getFolders(dossierId: number, signal?: AbortSignal): Promise<ProjectDesignFolder[]> {
        return request<ProjectDesignFolder[]>(pdUrl(dossierId, 'folders'), { signal });
    },

    createFolder(dossierId: number, name: string): Promise<ProjectDesignFolder> {
        return request<ProjectDesignFolder>(pdUrl(dossierId, 'folders'), {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    getFiles(dossierId: number, params: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<{
        data: ProjectDesignFile[];
        current_page: number;
        last_page: number;
        total: number;
    }> {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v));
        }
        const url = `${pdUrl(dossierId, 'files')}?${qs.toString()}`;
        return request(url, { signal });
    },

    getFile(dossierId: number, fileId: number, signal?: AbortSignal): Promise<ProjectDesignFile> {
        return request<ProjectDesignFile>(pdUrl(dossierId, `files/${fileId}`), { signal });
    },

    archiveFile(dossierId: number, fileId: number): Promise<void> {
        return request<void>(pdUrl(dossierId, `files/${fileId}`), { method: 'DELETE' });
    },

    restoreFile(dossierId: number, fileId: number): Promise<void> {
        return request<void>(pdUrl(dossierId, `files/${fileId}/restore`), { method: 'POST', body: '{}' });
    },

    getVersions(dossierId: number, fileId: number, signal?: AbortSignal): Promise<{ data: ProjectDesignVersion[] }> {
        return request(pdUrl(dossierId, `files/${fileId}/versions`), { signal });
    },

    getReviews(dossierId: number, signal?: AbortSignal): Promise<{ data: ProjectDesignReview[] }> {
        return request(pdUrl(dossierId, 'reviews'), { signal });
    },

    startReview(dossierId: number, versionId: number, reviewId: number): Promise<ProjectDesignReview> {
        return request<ProjectDesignReview>(
            pdUrl(dossierId, `versions/${versionId}/reviews/${reviewId}/start`),
            { method: 'POST', body: '{}' },
        );
    },

    decideReview(dossierId: number, versionId: number, reviewId: number, decision: string, generalNote?: string): Promise<ProjectDesignReview> {
        return request<ProjectDesignReview>(
            pdUrl(dossierId, `versions/${versionId}/reviews/${reviewId}/decision`),
            { method: 'POST', body: JSON.stringify({ decision, general_note: generalNote ?? null }) },
        );
    },

    getRemarks(dossierId: number, params: Record<string, string | undefined>, signal?: AbortSignal): Promise<{
        data: ProjectDesignRemark[];
        meta: { total: number; page: number; lastPage: number };
    }> {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== '') qs.set(k, String(v));
        }
        return request(`${pdUrl(dossierId, 'remarks')}?${qs.toString()}`, { signal });
    },

    getActivity(dossierId: number, signal?: AbortSignal): Promise<{ data: ProjectDesignActivity[] }> {
        return request(pdUrl(dossierId, 'activity'), { signal });
    },

    uploadVersion(dossierId: number, formData: FormData, signal?: AbortSignal): Promise<ProjectDesignVersion> {
        return request<ProjectDesignVersion>(pdUrl(dossierId, 'versions'), {
            method: 'POST',
            body: formData,
            signal,
        });
    },

    // ─── Annotations ─────────────────────────────────────────────────

    getAnnotations(dossierId: number, versionId: number, signal?: AbortSignal): Promise<{ data: any[] }> {
        return request(pdUrl(dossierId, `versions/${versionId}/annotations`), { signal });
    },

    storeAnnotation(dossierId: number, versionId: number, data: { type: string; geometry: Record<string, unknown> }): Promise<{ id: number }> {
        return request(pdUrl(dossierId, `versions/${versionId}/annotations`), {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateAnnotation(dossierId: number, versionId: number, annotationId: number, data: { type: string; geometry: Record<string, unknown> }): Promise<void> {
        return request<void>(pdUrl(dossierId, `versions/${versionId}/annotations/${annotationId}`), {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    destroyAnnotation(dossierId: number, versionId: number, annotationId: number): Promise<void> {
        return request<void>(pdUrl(dossierId, `versions/${versionId}/annotations/${annotationId}`), {
            method: 'DELETE',
        });
    },

    // ─── Remarks ─────────────────────────────────────────────────────

    createRemark(dossierId: number, versionId: number, annotationId: number, data: {
        severity: string; title: string; description?: string;
    }): Promise<ProjectDesignRemark> {
        return request<ProjectDesignRemark>(
            pdUrl(dossierId, `versions/${versionId}/remarks`),
            { method: 'POST', body: JSON.stringify({ ...data, annotation_id: annotationId }) },
        );
    },

    updateRemark(dossierId: number, remarkId: number, data: Partial<{
        severity: string; status: string; title: string; description: string; assigned_to: number; due_date: string;
    }>): Promise<ProjectDesignRemark> {
        return request<ProjectDesignRemark>(
            pdUrl(dossierId, `remarks/${remarkId}`),
            { method: 'PUT', body: JSON.stringify(data) },
        );
    },

    deleteRemark(dossierId: number, remarkId: number): Promise<void> {
        return request<void>(pdUrl(dossierId, `remarks/${remarkId}`), { method: 'DELETE' });
    },
};
