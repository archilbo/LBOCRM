export type DesignMode = 'files' | 'reviews' | 'remarks' | 'activity';

export type ProjectDesignSummary = {
    folders: number;
    files: number;
    versions: number;
    activities: number;
    awaitingReview: number;
    openRemarks: number;
    overdueRemarks: number;
    approvedFiles: number;
    approvalProgress: number;
    canUpload: boolean;
};

export type ProjectDesignFolder = {
    id: number; dossierId: number; parentId: number | null; name: string; slug: string; filesCount: number;
};

export type FormatCapability = {
    label: string;
    application: string;
    category: string;
    previewStrategy: string;
    directBrowserPreview: boolean;
    conversionProvider: string | null;
    supportedViewer: string | null;
    supports2d: boolean;
    supports3d: boolean;
    supportsAnnotations: boolean;
    requiresConversion: boolean;
    fallbackMessage: string | null;
};

export type ProjectDesignAsset = {
    id: number; assetType: string; sourceApplication?: string;
    originalFilename: string; mimeType: string; extension: string;
    sizeBytes: number; previewable: boolean; sortOrder: number;
    previewUrl: string | null; downloadUrl: string | null; thumbnailUrl: string | null;
    scanStatus: string | null; conversionStatus?: string | null;
    formatCapability: FormatCapability | null;
    createdAt: string;
};

export type ProjectDesignVersion = {
    id: number; fileId: number; versionNumber: number; label: string;
    status: string; uploadStatus: string; previewStatus: string; reviewStatus: string;
    revisionCode: string | null; changeSummary: string | null; uploadNote: string | null;
    uploadedBy: { id: number; name: string } | null;
    assets: ProjectDesignAsset[];
    previewError: string | null;
    submittedAt: string | null; approvedAt: string | null; rejectedAt: string | null;
    supersededAt: string | null; recordVersion: number; createdAt: string;
};

export type ProjectDesignFile = {
    id: number; dossierId: number; folderId: number | null;
    name: string; code: string | null; description: string | null;
    discipline: string | null; category: string | null; status: string;
    requiresApproval: boolean;
    responsibleUser: { id: number; name: string } | null;
    reviewer: { id: number; name: string } | null;
    currentVersionId: number | null; latestApprovedVersionId: number | null;
    reviewDueAt: string | null; archivedAt: string | null; recordVersion: number;
    latestVersion: ProjectDesignVersion | null;
    versionsCount: number; openRemarksCount: number;
    createdAt: string; updatedAt: string;
};

export type ProjectDesignReview = {
    id: number; fileId: number; versionId: number;
    status: string; decision: string | null; notes: string | null; generalNote: string | null;
    requestedBy: { id: number; name: string } | null;
    reviewer: { id: number; name: string } | null;
    file: { id: number; name: string; discipline: string } | null;
    version: { id: number; versionNumber: number; label: string; status: string; assets: ProjectDesignAsset[] } | null;
    requestedAt: string | null; startedAt: string | null; dueAt: string | null;
    completedAt: string | null; createdAt: string | null;
};

export type ProjectDesignRemark = {
    id: number; versionId: number; annotationId: number | null;
    severity: string; status: string; title: string; description: string | null;
    createdBy: { id: number; name: string } | null;
    assignedTo: { id: number; name: string } | null;
    file: { id: number; name: string; discipline: string } | null;
    versionNumber: number | null;
    dueDate: string | null; createdAt: string | null;
};

export type ProjectDesignActivity = {
    id: number; action: string; description: string | null;
    metadata: Record<string, unknown> | null;
    user: { id: number; name: string } | null;
    createdAt: string;
};

export type DesignFileRow = ProjectDesignFile & {
    _assetCount?: number;
};

export type ProjectDesignAnnotation = {
    id: number;
    companyId: number;
    dossierId: number;
    fileId: number;
    versionId: number;
    assetId: number | null;
    remarkId: number | null;
    annotationType: string;
    pageNumber: number | null;
    coordinateSpace: string;
    geometry: Record<string, unknown>;
    style: Record<string, unknown> | null;
    viewport: Record<string, unknown> | null;
    referenceWidth: number | null;
    referenceHeight: number | null;
    sourceRotation: number;
    authoredBy: { id: number; name: string } | null;
    createdBy: { id: number; name: string } | null;
    hasRemark: boolean | null;
    remark: ProjectDesignRemark | null;
    createdAt: string | null;
    updatedAt: string | null;
    recordVersion: number;
};

export type PaginationMeta = {
    total: number; currentPage: number; lastPage: number; perPage: number;
};
