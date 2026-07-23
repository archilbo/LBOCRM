import type { ViewerFrame } from '../components/DesignAnnotationLayer';

export function screenPointToNormalizedPagePoint(
    screenX: number, screenY: number,
    containerRect: DOMRect,
    frame: ViewerFrame,
): { nx: number; ny: number } {
    const doc = screenToDoc(screenX, screenY, containerRect, frame);
    return {
        nx: frame.pageWidth > 0 ? doc.x / frame.pageWidth : 0,
        ny: frame.pageHeight > 0 ? doc.y / frame.pageHeight : 0,
    };
}

export function normalizedPagePointToScreenPoint(
    nx: number, ny: number,
    containerRect: DOMRect,
    frame: ViewerFrame,
): { x: number; y: number } {
    const docX = nx * frame.pageWidth;
    const docY = ny * frame.pageHeight;
    return docToScreen(docX, docY, containerRect, frame);
}

export function screenRectToNormalizedPageRect(
    screenX: number, screenY: number, screenW: number, screenH: number,
    containerRect: DOMRect,
    frame: ViewerFrame,
): { nx: number; ny: number; nw: number; nh: number } {
    const topLeft = screenPointToNormalizedPagePoint(screenX, screenY, containerRect, frame);
    const bottomRight = screenPointToNormalizedPagePoint(screenX + screenW, screenY + screenH, containerRect, frame);
    return {
        nx: topLeft.nx,
        ny: topLeft.ny,
        nw: bottomRight.nx - topLeft.nx,
        nh: bottomRight.ny - topLeft.ny,
    };
}

export function normalizedPageRectToScreenRect(
    nx: number, ny: number, nw: number, nh: number,
    containerRect: DOMRect,
    frame: ViewerFrame,
): { x: number; y: number; width: number; height: number } {
    const topLeft = normalizedPagePointToScreenPoint(nx, ny, containerRect, frame);
    const bottomRight = normalizedPagePointToScreenPoint(nx + nw, ny + nh, containerRect, frame);
    return {
        x: topLeft.x,
        y: topLeft.y,
        width: bottomRight.x - topLeft.x,
        height: bottomRight.y - topLeft.y,
    };
}

export function screenToDoc(
    screenX: number, screenY: number,
    containerRect: DOMRect,
    f: ViewerFrame,
): { x: number; y: number } {
    let x = screenX - containerRect.left - f.pageX;
    let y = screenY - containerRect.top - f.pageY;
    if (f.rotation === 90) { const t = x; x = -y; y = t; }
    else if (f.rotation === 180) { x = -x; y = -y; }
    else if (f.rotation === 270) { const t = x; x = y; y = -t; }
    return { x: x / f.scale, y: y / f.scale };
}

export function docToScreen(
    docX: number, docY: number,
    containerRect: DOMRect,
    f: ViewerFrame,
): { x: number; y: number } {
    let x = docX * f.scale;
    let y = docY * f.scale;
    if (f.rotation === 90) { const t = x; x = y; y = -t; }
    else if (f.rotation === 180) { x = -x; y = -y; }
    else if (f.rotation === 270) { const t = x; x = -y; y = t; }
    return { x: x + f.pageX + containerRect.left, y: y + f.pageY + containerRect.top };
}
