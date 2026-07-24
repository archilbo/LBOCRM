import { useState, useCallback, useRef } from 'react';
import type { AnnotationTool } from '@/features/project-design/components/ProjectDesignEditorToolbar';
import type { ViewerFrame } from '@/features/dossiers/components/DesignAnnotationLayer';

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;
const ZOOM_STEP = 0.1;

export interface ViewerControllerState {
    zoom: number;
    panX: number;
    panY: number;
    rotation: number;
    activeTool: AnnotationTool;
    pageNumber: number;
    totalPages: number;
    fullscreen: boolean;
    continuous: boolean;
}

export interface ViewerController {
    state: ViewerControllerState;
    setZoom: (z: number) => void;
    panTo: (x: number, y: number) => void;
    panBy: (dx: number, dy: number) => void;
    rotate: () => void;
    setActiveTool: (t: AnnotationTool) => void;
    setPageNumber: (p: number) => void;
    setTotalPages: (n: number) => void;
    toggleFullscreen: () => void;
    toggleContinuous: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    zoomAroundPoint: (delta: number, cx: number, cy: number) => void;
    frameRef: React.MutableRefObject<ViewerFrame>;
    updateFrame: (f: ViewerFrame) => void;
    viewerAPIRef: React.MutableRefObject<{ fitWidth: () => void; fitPage: () => void }>;
}

const defaultFrame: ViewerFrame = { scale: 1, rotation: 0, pageX: 0, pageY: 0, pageWidth: 0, pageHeight: 0 };

export function useProjectDesignViewerController(): ViewerController {
    const [zoom, setZoom] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [activeTool, setActiveTool] = useState<AnnotationTool>('select');
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [fullscreen, setFullscreen] = useState(false);
    const [continuous, setContinuous] = useState(false);

    const frameRef = useRef<ViewerFrame>(defaultFrame);
    const viewerAPIRef = useRef<{ fitWidth: () => void; fitPage: () => void }>({ fitWidth: () => {}, fitPage: () => {} });

    const updateFrame = useCallback((f: ViewerFrame) => {
        frameRef.current = f;
    }, []);

    const clampZoom = useCallback((z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z)), []);

    const setZoomSafe = useCallback((z: number) => {
        setZoom(clampZoom(z));
    }, [clampZoom]);

    const zoomIn = useCallback(() => {
        setZoom((prev) => clampZoom(prev + ZOOM_STEP));
    }, [clampZoom]);

    const zoomOut = useCallback(() => {
        setZoom((prev) => clampZoom(prev - ZOOM_STEP));
    }, [clampZoom]);

    const zoomAroundPoint = useCallback((delta: number, cx: number, cy: number) => {
        const factor = delta > 0 ? 1.1 : 0.9;
        setZoom((prev) => {
            const newZoom = clampZoom(prev * factor);
            const eff = newZoom / prev;
            setPanX((px) => px * eff + cx * (1 - eff));
            setPanY((py) => py * eff + cy * (1 - eff));
            return newZoom;
        });
    }, [clampZoom]);

    const panTo = useCallback((x: number, y: number) => {
        setPanX(x);
        setPanY(y);
    }, []);

    const panBy = useCallback((dx: number, dy: number) => {
        setPanX((prev) => prev + dx);
        setPanY((prev) => prev + dy);
    }, []);

    const rotate = useCallback(() => {
        setRotation((r) => (r + 90) % 360);
    }, []);

    const toggleFullscreen = useCallback(() => {
        setFullscreen((f) => !f);
    }, []);

    const toggleContinuous = useCallback(() => {
        setContinuous((c) => !c);
    }, []);

    return {
        state: { zoom, panX, panY, rotation, activeTool, pageNumber, totalPages, fullscreen, continuous },
        setZoom: setZoomSafe,
        panTo,
        panBy,
        rotate,
        setActiveTool,
        setPageNumber,
        setTotalPages,
        toggleFullscreen,
        toggleContinuous,
        zoomIn,
        zoomOut,
        zoomAroundPoint,
        frameRef,
        updateFrame,
        viewerAPIRef,
    };
}
