export const projectDesignKeys = {
    all: (dossierId: number) => ['project-design', dossierId] as const,
    summary: (dossierId: number) => [...projectDesignKeys.all(dossierId), 'summary'] as const,
    folders: (dossierId: number) => [...projectDesignKeys.all(dossierId), 'folders'] as const,
    files: (dossierId: number, params?: Record<string, unknown>) =>
        [...projectDesignKeys.all(dossierId), 'files', params] as const,
    file: (dossierId: number, fileId: number) =>
        [...projectDesignKeys.all(dossierId), 'file', fileId] as const,
    versions: (dossierId: number, fileId: number) =>
        [...projectDesignKeys.all(dossierId), 'versions', fileId] as const,
    annotations: (dossierId: number, versionId: number) =>
        [...projectDesignKeys.all(dossierId), 'annotations', versionId] as const,
    reviews: (dossierId: number) => [...projectDesignKeys.all(dossierId), 'reviews'] as const,
    remarks: (dossierId: number, params?: Record<string, unknown>) =>
        [...projectDesignKeys.all(dossierId), 'remarks', params] as const,
    activity: (dossierId: number) => [...projectDesignKeys.all(dossierId), 'activity'] as const,
};
