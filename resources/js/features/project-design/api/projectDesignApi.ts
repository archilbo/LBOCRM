import type {
    ProjectDesignSummary, ProjectDesignFolder, ProjectDesignFile, ProjectDesignVersion,
    ProjectDesignReview, ProjectDesignRemark, ProjectDesignRemarkUpdate, ProjectDesignActivity, ProjectDesignAnnotation,
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

    async getFolders(dossierId: number, signal?: AbortSignal): Promise<ProjectDesignFolder[]> {
        const response = await request<ProjectDesignFolder[] | { data: ProjectDesignFolder[] }>(pdUrl(dossierId, 'folders'), { signal });
        return Array.isArray(response) ? response : response.data;
    },

    createFolder(dossierId: number, name: string): Promise<ProjectDesignFolder> {
        return request<ProjectDesignFolder>(pdUrl(dossierId, 'folders'), {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    updateFolder(dossierId: number, folderId: number, data: { name?: string; parent_id?: number | null }): Promise<ProjectDesignFolder> {
        return request<ProjectDesignFolder>(pdUrl(dossierId, `folders/${folderId}`), {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async getFiles(dossierId: number, params: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<{
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
        const response = await request<{
            data: ProjectDesignFile[];
            current_page?: number;
            last_page?: number;
            total?: number;
            meta?: { current_page: number; last_page: number; total: number };
        }>(url, { signal });

        return {
            data: response.data,
            current_page: response.current_page ?? response.meta?.current_page ?? 1,
            last_page: response.last_page ?? response.meta?.last_page ?? 1,
            total: response.total ?? response.meta?.total ?? response.data.length,
        };
    },

    getFile(dossierId: number, fileId: number, signal?: AbortSignal): Promise<ProjectDesignFile> {
        return request<ProjectDesignFile>(pdUrl(dossierId, `files/${fileId}`), { signal });
    },

    updateFile(dossierId: number, fileId: number, data: {
        name?: string;
        code?: string | null;
        description?: string | null;
        discipline?: string | null;
        category?: string | null;
        folder_id?: number | null;
        record_version: number;
    }): Promise<ProjectDesignFile> {
        return request<ProjectDesignFile>(pdUrl(dossierId, `files/${fileId}`), {
            method: 'PUT',
            body: JSON.stringify(data),
        });
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

    getAnnotations(dossierId: number, versionId: number, signal?: AbortSignal): Promise<{ data: ProjectDesignAnnotation[] }> {
        return request(pdUrl(dossierId, `versions/${versionId}/annotations`), { signal });
    },

    storeAnnotation(dossierId: number, versionId: number, data: {
        annotation_type: string;
        coordinate_space: string;
        asset_id: number;
        page_number?: number | null;
        geometry: Record<string, unknown>;
        style?: Record<string, unknown> | null;
        viewport?: Record<string, unknown> | null;
        reference_width?: number | null;
        reference_height?: number | null;
        source_rotation?: number;
    }): Promise<ProjectDesignAnnotation> {
        return request<ProjectDesignAnnotation>(pdUrl(dossierId, `versions/${versionId}/annotations`), {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateAnnotation(dossierId: number, versionId: number, annotationId: number, data: {
        geometry?: Record<string, unknown>;
        style?: Record<string, unknown> | null;
        record_version: number;
    }): Promise<ProjectDesignAnnotation> {
        return request<ProjectDesignAnnotation>(pdUrl(dossierId, `versions/${versionId}/annotations/${annotationId}`), {
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

    updateRemark(dossierId: number, remarkId: number, data: ProjectDesignRemarkUpdate): Promise<ProjectDesignRemark> {
        return request<ProjectDesignRemark>(
            pdUrl(dossierId, `remarks/${remarkId}`),
            { method: 'PUT', body: JSON.stringify(data) },
        );
    },

    deleteRemark(dossierId: number, remarkId: number): Promise<void> {
        return request<void>(pdUrl(dossierId, `remarks/${remarkId}`), { method: 'DELETE' });
    },
};
