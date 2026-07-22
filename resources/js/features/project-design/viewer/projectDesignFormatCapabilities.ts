/**
 * Frontend design format capability registry.
 *
 * Mirrors config/project_design_formats.php.
 * Both must be kept in sync — this is the authoritative frontend source.
 */

export type SourceApplication =
    | 'archicad'
    | 'autocad'
    | 'revit'
    | 'sketchup'
    | 'navisworks'
    | 'ifc'
    | 'other';

export type AssetCategory = 'source' | 'review_pdf' | 'image' | 'ifc' | 'viewer_derivative' | 'supporting';

export type PreviewStrategy =
    | 'pdf'
    | 'image'
    | 'ifc'
    | 'autodesk-aps'
    | 'server-conversion'
    | 'download-only';

export type SupportedViewer = 'pdf' | 'image' | 'ifc' | 'three' | 'autodesk' | null;

export type DesignFormatCapability = {
    extension: string;
    label: string;
    mimeTypes: string[];
    application: SourceApplication;
    category: AssetCategory;
    assetType: AssetCategory;
    previewStrategy: PreviewStrategy;
    directBrowserPreview: boolean;
    conversionProvider: string | null;
    supportedViewer: SupportedViewer;
    supports2d: boolean;
    supports3d: boolean;
    supportsSheets: boolean;
    supportsLayers: boolean;
    supportsProperties: boolean;
    supportsMeasurement: boolean;
    supportsAnnotations: boolean;
    supportsComparison: boolean;
    maxSizeBytes: number;
    icon: string;
    fallbackMessage: string | null;
};

export type DesignFormatRegistry = Record<string, DesignFormatCapability>;

export const designFormatCapabilities: DesignFormatRegistry = {
    pdf: {
        extension: 'pdf',
        label: 'PDF Document',
        mimeTypes: ['application/pdf'],
        application: 'other',
        category: 'review_pdf',
        assetType: 'review_pdf',
        previewStrategy: 'pdf',
        directBrowserPreview: true,
        conversionProvider: null,
        supportedViewer: 'pdf',
        supports2d: true,
        supports3d: false,
        supportsSheets: true,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 500 * 1024 * 1024,
        icon: 'file-text',
        fallbackMessage: null,
    },
    png: {
        extension: 'png',
        label: 'PNG Image',
        mimeTypes: ['image/png'],
        application: 'other',
        category: 'image',
        assetType: 'image',
        previewStrategy: 'image',
        directBrowserPreview: true,
        conversionProvider: null,
        supportedViewer: 'image',
        supports2d: true,
        supports3d: false,
        supportsSheets: false,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 200 * 1024 * 1024,
        icon: 'image',
        fallbackMessage: null,
    },
    jpg: {
        extension: 'jpg',
        label: 'JPEG Image',
        mimeTypes: ['image/jpeg', 'image/jpg'],
        application: 'other',
        category: 'image',
        assetType: 'image',
        previewStrategy: 'image',
        directBrowserPreview: true,
        conversionProvider: null,
        supportedViewer: 'image',
        supports2d: true,
        supports3d: false,
        supportsSheets: false,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 200 * 1024 * 1024,
        icon: 'image',
        fallbackMessage: null,
    },
    webp: {
        extension: 'webp',
        label: 'WebP Image',
        mimeTypes: ['image/webp'],
        application: 'other',
        category: 'image',
        assetType: 'image',
        previewStrategy: 'image',
        directBrowserPreview: true,
        conversionProvider: null,
        supportedViewer: 'image',
        supports2d: true,
        supports3d: false,
        supportsSheets: false,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 200 * 1024 * 1024,
        icon: 'image',
        fallbackMessage: null,
    },
    tiff: {
        extension: 'tiff',
        label: 'TIFF Image',
        mimeTypes: ['image/tiff', 'image/tif'],
        application: 'other',
        category: 'image',
        assetType: 'image',
        previewStrategy: 'server-conversion',
        directBrowserPreview: false,
        conversionProvider: 'internal',
        supportedViewer: 'image',
        supports2d: true,
        supports3d: false,
        supportsSheets: false,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 200 * 1024 * 1024,
        icon: 'image',
        fallbackMessage: 'TIFF images are converted to a browser-compatible format for preview.',
    },
    ifc: {
        extension: 'ifc',
        label: 'IFC Model',
        mimeTypes: ['application/x-step', 'application/x-ifc', 'application/ifc'],
        application: 'ifc',
        category: 'ifc',
        assetType: 'ifc',
        previewStrategy: 'ifc',
        directBrowserPreview: false,
        conversionProvider: 'internal',
        supportedViewer: 'ifc',
        supports2d: false,
        supports3d: true,
        supportsSheets: false,
        supportsLayers: true,
        supportsProperties: true,
        supportsMeasurement: true,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 500 * 1024 * 1024,
        icon: 'cube',
        fallbackMessage: 'IFC models are converted to fragments for 3D browser preview.',
    },
    dwg: {
        extension: 'dwg',
        label: 'AutoCAD Drawing',
        mimeTypes: ['application/acad', 'application/x-acad', 'image/vnd.dwg'],
        application: 'autocad',
        category: 'source',
        assetType: 'source',
        previewStrategy: 'autodesk-aps',
        directBrowserPreview: false,
        conversionProvider: 'autodesk_aps',
        supportedViewer: 'autodesk',
        supports2d: true,
        supports3d: true,
        supportsSheets: true,
        supportsLayers: true,
        supportsProperties: true,
        supportsMeasurement: true,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 1024 * 1024 * 1024,
        icon: 'drafting-compass',
        fallbackMessage: 'The DWG source is stored safely. Use PDF review or generate an Autodesk viewer derivative.',
    },
    dxf: {
        extension: 'dxf',
        label: 'AutoCAD Interchange',
        mimeTypes: ['application/dxf', 'image/vnd.dxf'],
        application: 'autocad',
        category: 'source',
        assetType: 'source',
        previewStrategy: 'autodesk-aps',
        directBrowserPreview: false,
        conversionProvider: 'autodesk_aps',
        supportedViewer: 'autodesk',
        supports2d: true,
        supports3d: true,
        supportsSheets: true,
        supportsLayers: true,
        supportsProperties: true,
        supportsMeasurement: true,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 1024 * 1024 * 1024,
        icon: 'drafting-compass',
        fallbackMessage: 'The DXF source is stored safely. Use PDF review or generate an Autodesk viewer derivative.',
    },
    rvt: {
        extension: 'rvt',
        label: 'Revit Project',
        mimeTypes: ['application/x-revit'],
        application: 'revit',
        category: 'source',
        assetType: 'source',
        previewStrategy: 'autodesk-aps',
        directBrowserPreview: false,
        conversionProvider: 'autodesk_aps',
        supportedViewer: 'autodesk',
        supports2d: true,
        supports3d: true,
        supportsSheets: true,
        supportsLayers: true,
        supportsProperties: true,
        supportsMeasurement: true,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 1024 * 1024 * 1024,
        icon: 'building',
        fallbackMessage: 'The RVT source is stored safely. Generate an Autodesk viewer derivative or upload PDF/IFC review assets.',
    },
    pln: {
        extension: 'pln',
        label: 'Archicad Project',
        mimeTypes: ['application/x-pln', 'application/x-archicad-project'],
        application: 'archicad',
        category: 'source',
        assetType: 'source',
        previewStrategy: 'download-only',
        directBrowserPreview: false,
        conversionProvider: null,
        supportedViewer: null,
        supports2d: false,
        supports3d: false,
        supportsSheets: false,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: false,
        supportsComparison: false,
        maxSizeBytes: 1024 * 1024 * 1024,
        icon: 'building',
        fallbackMessage: 'This is a native Archicad source file. Preview requires associated PDF layouts or IFC export.',
    },
    pla: {
        extension: 'pla',
        label: 'Archicad Project Archive',
        mimeTypes: ['application/x-pla', 'application/x-archicad-archive'],
        application: 'archicad',
        category: 'source',
        assetType: 'source',
        previewStrategy: 'download-only',
        directBrowserPreview: false,
        conversionProvider: null,
        supportedViewer: null,
        supports2d: false,
        supports3d: false,
        supportsSheets: false,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: false,
        supportsComparison: false,
        maxSizeBytes: 1024 * 1024 * 1024,
        icon: 'archive',
        fallbackMessage: 'This is a native Archicad archive. Preview requires associated PDF layouts or IFC export.',
    },
    skp: {
        extension: 'skp',
        label: 'SketchUp Model',
        mimeTypes: ['application/x-sketchup', 'application/vnd.sketchup.skp'],
        application: 'sketchup',
        category: 'source',
        assetType: 'source',
        previewStrategy: 'server-conversion',
        directBrowserPreview: false,
        conversionProvider: 'internal',
        supportedViewer: 'ifc',
        supports2d: false,
        supports3d: true,
        supportsSheets: false,
        supportsLayers: true,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: false,
        supportsComparison: false,
        maxSizeBytes: 500 * 1024 * 1024,
        icon: 'cube',
        fallbackMessage: 'The SKP source is stored safely. Export to IFC for 3D browser preview.',
    },
    nwd: {
        extension: 'nwd',
        label: 'Navisworks Presenter',
        mimeTypes: ['application/x-navisworks', 'application/nwd'],
        application: 'navisworks',
        category: 'source',
        assetType: 'source',
        previewStrategy: 'autodesk-aps',
        directBrowserPreview: false,
        conversionProvider: 'autodesk_aps',
        supportedViewer: 'autodesk',
        supports2d: false,
        supports3d: true,
        supportsSheets: false,
        supportsLayers: true,
        supportsProperties: true,
        supportsMeasurement: true,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 1024 * 1024 * 1024,
        icon: 'box',
        fallbackMessage: 'The NWD source is stored safely. Generate an Autodesk viewer derivative.',
    },
    nwc: {
        extension: 'nwc',
        label: 'Navisworks Cache',
        mimeTypes: ['application/x-navisworks-cache', 'application/nwc'],
        application: 'navisworks',
        category: 'source',
        assetType: 'source',
        previewStrategy: 'autodesk-aps',
        directBrowserPreview: false,
        conversionProvider: 'autodesk_aps',
        supportedViewer: 'autodesk',
        supports2d: false,
        supports3d: true,
        supportsSheets: false,
        supportsLayers: true,
        supportsProperties: true,
        supportsMeasurement: true,
        supportsAnnotations: true,
        supportsComparison: false,
        maxSizeBytes: 1024 * 1024 * 1024,
        icon: 'box',
        fallbackMessage: 'The NWC source is stored safely. Generate an Autodesk viewer derivative.',
    },
    dgn: {
        extension: 'dgn',
        label: 'MicroStation Design',
        mimeTypes: ['application/x-dgn', 'image/x-dgn'],
        application: 'other',
        category: 'source',
        assetType: 'source',
        previewStrategy: 'server-conversion',
        directBrowserPreview: false,
        conversionProvider: 'internal',
        supportedViewer: 'autodesk',
        supports2d: true,
        supports3d: false,
        supportsSheets: true,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: false,
        supportsComparison: false,
        maxSizeBytes: 500 * 1024 * 1024,
        icon: 'file',
        fallbackMessage: 'The DGN source is stored safely. Convert to PDF or DWG for browser preview.',
    },
    glb: {
        extension: 'glb',
        label: 'GLB 3D Model',
        mimeTypes: ['model/gltf-binary', 'model/gltf+json'],
        application: 'other',
        category: 'viewer_derivative',
        assetType: 'viewer_derivative',
        previewStrategy: 'ifc',
        directBrowserPreview: false,
        conversionProvider: null,
        supportedViewer: 'three',
        supports2d: false,
        supports3d: true,
        supportsSheets: false,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: false,
        supportsComparison: false,
        maxSizeBytes: 500 * 1024 * 1024,
        icon: 'cube',
        fallbackMessage: null,
    },
    bcf: {
        extension: 'bcf',
        label: 'BIM Collaboration Format',
        mimeTypes: ['application/x-bcf', 'application/vnd.bcf'],
        application: 'other',
        category: 'supporting',
        assetType: 'supporting',
        previewStrategy: 'download-only',
        directBrowserPreview: false,
        conversionProvider: null,
        supportedViewer: null,
        supports2d: false,
        supports3d: false,
        supportsSheets: false,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: false,
        supportsComparison: false,
        maxSizeBytes: 100 * 1024 * 1024,
        icon: 'message-square',
        fallbackMessage: 'BCF files contain BIM issues and viewpoints. They are not 3D models.',
    },
    bcfzip: {
        extension: 'bcfzip',
        label: 'BIM Collaboration Package',
        mimeTypes: ['application/x-bcfzip', 'application/vnd.bcfzip', 'application/zip'],
        application: 'other',
        category: 'supporting',
        assetType: 'supporting',
        previewStrategy: 'download-only',
        directBrowserPreview: false,
        conversionProvider: null,
        supportedViewer: null,
        supports2d: false,
        supports3d: false,
        supportsSheets: false,
        supportsLayers: false,
        supportsProperties: false,
        supportsMeasurement: false,
        supportsAnnotations: false,
        supportsComparison: false,
        maxSizeBytes: 100 * 1024 * 1024,
        icon: 'message-square',
        fallbackMessage: 'BCF files contain BIM issues and viewpoints. They are not 3D models.',
    },
};

/** Lookup a format capability by extension (lowercase). */
export function getFormatCapability(extension: string): DesignFormatCapability | undefined {
    return designFormatCapabilities[extension.toLowerCase()];
}

/** Lookup by MIME type. */
export function getFormatCapabilityByMime(mime: string): DesignFormatCapability | undefined {
    return Object.values(designFormatCapabilities).find((f) => f.mimeTypes.includes(mime));
}

/** Check if an extension has a known capability entry. */
export function isKnownFormat(extension: string): boolean {
    return extension.toLowerCase() in designFormatCapabilities;
}

/** Get the preview strategy for an asset based on its extension. */
export function resolvePreviewStrategy(extension: string): PreviewStrategy {
    const cap = getFormatCapability(extension);
    return cap?.previewStrategy ?? 'download-only';
}

/** Select the best viewer for a set of assets. */
export type ViewerSelection = {
    viewer: 'pdf' | 'image' | 'ifc' | 'autodesk' | 'three' | null;
    assetId: number | null;
    assetType: AssetCategory | null;
    strategy: PreviewStrategy;
    requiresConversion: boolean;
    fallbackMessage: string | null;
};

export function resolveViewerForVersion(assets: { id: number; extension: string; mimeType: string }[]): ViewerSelection {
    const caps = assets.map((a) => ({ asset: a, cap: getFormatCapability(a.extension) ?? getFormatCapabilityByMime(a.mimeType) }));

    // Priority 1: direct browser preview (PDF or image)
    const direct = caps.find((c) => c.cap?.directBrowserPreview && c.cap.supportedViewer);
    if (direct && direct.cap) {
        return {
            viewer: direct.cap.supportedViewer as ViewerSelection['viewer'],
            assetId: direct.asset.id,
            assetType: direct.cap.assetType,
            strategy: direct.cap.previewStrategy,
            requiresConversion: false,
            fallbackMessage: null,
        };
    }

    // Priority 2: IFC for 3D
    const ifc = caps.find((c) => c.cap?.previewStrategy === 'ifc' && c.cap.supportedViewer === 'ifc');
    if (ifc && ifc.cap) {
        return {
            viewer: 'ifc',
            assetId: ifc.asset.id,
            assetType: ifc.cap.assetType,
            strategy: 'ifc',
            requiresConversion: true,
            fallbackMessage: ifc.cap.fallbackMessage,
        };
    }

    // Priority 3: Autodesk-APS-convertible
    const aps = caps.find((c) => c.cap?.previewStrategy === 'autodesk-aps');
    if (aps && aps.cap) {
        return {
            viewer: 'autodesk',
            assetId: aps.asset.id,
            assetType: aps.cap.assetType,
            strategy: 'autodesk-aps',
            requiresConversion: true,
            fallbackMessage: aps.cap.fallbackMessage,
        };
    }

    // Priority 4: any convertible
    const convertible = caps.find((c) => c.cap?.previewStrategy === 'server-conversion');
    if (convertible && convertible.cap) {
        return {
            viewer: convertible.cap.supportedViewer as ViewerSelection['viewer'],
            assetId: convertible.asset.id,
            assetType: convertible.cap.assetType,
            strategy: 'server-conversion',
            requiresConversion: true,
            fallbackMessage: convertible.cap.fallbackMessage,
        };
    }

    // Fallback: no viewable asset
    return {
        viewer: null,
        assetId: null,
        assetType: null,
        strategy: 'download-only',
        requiresConversion: false,
        fallbackMessage: null,
    };
}
