export function fitWidth(
    viewerWidth: number,
    viewerHeight: number,
    pageWidth: number,
    pageHeight: number,
): { zoom: number; panX: number; panY: number } {
    if (pageWidth <= 0 || viewerWidth <= 0) return { zoom: 1, panX: 0, panY: 0 };
    const zoom = viewerWidth / pageWidth;
    return { zoom, panX: 0, panY: Math.max(0, (viewerHeight - pageHeight * zoom) / 2) };
}

export function fitPage(
    viewerWidth: number,
    viewerHeight: number,
    pageWidth: number,
    pageHeight: number,
): { zoom: number; panX: number; panY: number } {
    if (pageWidth <= 0 || pageHeight <= 0 || viewerWidth <= 0 || viewerHeight <= 0) {
        return { zoom: 1, panX: 0, panY: 0 };
    }
    const zoom = Math.min(viewerWidth / pageWidth, viewerHeight / pageHeight);
    return {
        zoom,
        panX: Math.max(0, (viewerWidth - pageWidth * zoom) / 2),
        panY: Math.max(0, (viewerHeight - pageHeight * zoom) / 2),
    };
}

export function zoomToPoint(
    zoom: number,
    factor: number,
    cx: number,
    cy: number,
    panX: number,
    panY: number,
): { zoom: number; panX: number; panY: number } {
    const newZoom = Math.max(0.1, Math.min(10, zoom * factor));
    const effectiveFactor = newZoom / zoom;
    return {
        zoom: newZoom,
        panX: panX * effectiveFactor + cx * (1 - effectiveFactor),
        panY: panY * effectiveFactor + cy * (1 - effectiveFactor),
    };
}

export function extractRotation(a: number, b: number): number {
    return Math.atan2(b, a) * (180 / Math.PI);
}

export function effectiveDimensions(rotation: number, w: number, h: number): { w: number; h: number } {
    return rotation % 180 === 0 ? { w, h } : { w: h, h: w };
}
