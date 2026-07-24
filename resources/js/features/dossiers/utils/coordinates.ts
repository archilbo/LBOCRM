export function screenPointToNormalizedPagePoint(
    screenX: number, screenY: number,
    containerRect: DOMRect,
    pageWidth: number, pageHeight: number,
    rotation: number, scale: number,
): { nx: number; ny: number } {
    const doc = screenToDoc(screenX, screenY, containerRect, pageWidth, pageHeight, rotation, scale);
    return {
        nx: pageWidth > 0 ? doc.x / pageWidth : 0,
        ny: pageHeight > 0 ? doc.y / pageHeight : 0,
    };
}

export function normalizedPagePointToScreenPoint(
    nx: number, ny: number,
    containerRect: DOMRect,
    pageWidth: number, pageHeight: number,
    rotation: number, scale: number,
): { x: number; y: number } {
    const docX = nx * pageWidth;
    const docY = ny * pageHeight;
    return docToScreen(docX, docY, containerRect, pageWidth, pageHeight, rotation, scale);
}

export function screenRectToNormalizedPageRect(
    screenX: number, screenY: number, screenW: number, screenH: number,
    containerRect: DOMRect,
    pageWidth: number, pageHeight: number,
    rotation: number, scale: number,
): { nx: number; ny: number; nw: number; nh: number } {
    const topLeft = screenPointToNormalizedPagePoint(screenX, screenY, containerRect, pageWidth, pageHeight, rotation, scale);
    const bottomRight = screenPointToNormalizedPagePoint(screenX + screenW, screenY + screenH, containerRect, pageWidth, pageHeight, rotation, scale);
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
    pageWidth: number, pageHeight: number,
    rotation: number, scale: number,
): { x: number; y: number; width: number; height: number } {
    const topLeft = normalizedPagePointToScreenPoint(nx, ny, containerRect, pageWidth, pageHeight, rotation, scale);
    const bottomRight = normalizedPagePointToScreenPoint(nx + nw, ny + nh, containerRect, pageWidth, pageHeight, rotation, scale);
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
    pageWidth: number, pageHeight: number,
    rotation: number, scale: number,
): { x: number; y: number } {
    let x = screenX - containerRect.left;
    let y = screenY - containerRect.top;
    if (rotation === 90) { const t = x; x = -y; y = t; }
    else if (rotation === 180) { x = -x; y = -y; }
    else if (rotation === 270) { const t = x; x = y; y = -t; }
    return { x: x / scale, y: y / scale };
}

export function docToScreen(
    docX: number, docY: number,
    containerRect: DOMRect,
    pageWidth: number, pageHeight: number,
    rotation: number, scale: number,
): { x: number; y: number } {
    let x = docX * scale;
    let y = docY * scale;
    if (rotation === 90) { const t = x; x = y; y = -t; }
    else if (rotation === 180) { x = -x; y = -y; }
    else if (rotation === 270) { const t = x; x = -y; y = t; }
    return { x: x + containerRect.left, y: y + containerRect.top };
}
