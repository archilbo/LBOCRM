import { useCallback, useMemo, useReducer, useRef } from 'react';
import type { AnnotationTool } from '@/features/project-design/components/ProjectDesignEditorToolbar';
import type { ViewerFrame } from '@/features/dossiers/components/DesignAnnotationLayer';

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;
const ZOOM_STEP = 0.1;

export interface ViewerViewport {
    zoom: number;
    panX: number;
    panY: number;
}

export interface ViewerControllerState extends ViewerViewport {
    rotation: number;
    activeTool: AnnotationTool;
    pageNumber: number;
    totalPages: number;
    fullscreen: boolean;
    /** Continuous mode remains disabled until each PDF page owns an independent overlay. */
    continuous: false;
}

export interface ViewerAPI {
    fitWidth: () => void;
    fitPage: () => void;
}

export interface ViewerController {
    state: ViewerControllerState;
    setZoom: (zoom: number) => void;
    setViewport: (viewport: ViewerViewport) => void;
    panTo: (x: number, y: number) => void;
    panBy: (dx: number, dy: number) => void;
    resetViewport: () => void;
    rotate: () => void;
    setActiveTool: (tool: AnnotationTool) => void;
    setPageNumber: (page: number) => void;
    setTotalPages: (total: number) => void;
    setFullscreen: (fullscreen: boolean) => void;
    toggleFullscreen: () => void;
    /** Compatibility no-op while continuous mode is intentionally unavailable. */
    toggleContinuous: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    zoomAroundPoint: (delta: number, cx: number, cy: number) => void;
    frameRef: React.MutableRefObject<ViewerFrame>;
    updateFrame: (frame: ViewerFrame) => void;
    registerViewerAPI: (api: ViewerAPI) => void;
    fitWidth: () => void;
    fitPage: () => void;
}

type ViewerAction =
    | { type: 'set-zoom'; zoom: number }
    | { type: 'set-viewport'; viewport: ViewerViewport }
    | { type: 'pan-to'; x: number; y: number }
    | { type: 'pan-by'; dx: number; dy: number }
    | { type: 'reset-viewport' }
    | { type: 'rotate' }
    | { type: 'set-tool'; tool: AnnotationTool }
    | { type: 'set-page'; page: number }
    | { type: 'set-total-pages'; total: number }
    | { type: 'set-fullscreen'; fullscreen: boolean }
    | { type: 'toggle-fullscreen' };

const defaultFrame: ViewerFrame = {
    scale: 1,
    rotation: 0,
    pageX: 0,
    pageY: 0,
    pageWidth: 0,
    pageHeight: 0,
};

const initialState: ViewerControllerState = {
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    activeTool: 'select',
    pageNumber: 1,
    totalPages: 1,
    fullscreen: false,
    continuous: false,
};

function clampZoom(zoom: number): number {
    if (!Number.isFinite(zoom)) return 1;
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
}

function normalizeViewport(viewport: ViewerViewport): ViewerViewport {
    return {
        zoom: clampZoom(viewport.zoom),
        panX: Number.isFinite(viewport.panX) ? viewport.panX : 0,
        panY: Number.isFinite(viewport.panY) ? viewport.panY : 0,
    };
}

function reducer(state: ViewerControllerState, action: ViewerAction): ViewerControllerState {
    switch (action.type) {
        case 'set-zoom':
            return { ...state, zoom: clampZoom(action.zoom) };
        case 'set-viewport':
            return { ...state, ...normalizeViewport(action.viewport) };
        case 'pan-to':
            return { ...state, panX: action.x, panY: action.y };
        case 'pan-by':
            return { ...state, panX: state.panX + action.dx, panY: state.panY + action.dy };
        case 'reset-viewport':
            return { ...state, zoom: 1, panX: 0, panY: 0, rotation: 0 };
        case 'rotate':
            return { ...state, rotation: (state.rotation + 90) % 360 };
        case 'set-tool':
            return { ...state, activeTool: action.tool };
        case 'set-page': {
            const upper = Math.max(1, state.totalPages);
            return { ...state, pageNumber: Math.max(1, Math.min(action.page, upper)) };
        }
        case 'set-total-pages': {
            const totalPages = Math.max(1, action.total);
            return { ...state, totalPages, pageNumber: Math.min(state.pageNumber, totalPages) };
        }
        case 'set-fullscreen':
            return { ...state, fullscreen: action.fullscreen };
        case 'toggle-fullscreen':
            return { ...state, fullscreen: !state.fullscreen };
        default:
            return state;
    }
}

export function useProjectDesignViewerController(initial?: Partial<ViewerControllerState>): ViewerController {
    const [state, dispatch] = useReducer(
        reducer,
        initial,
        (value): ViewerControllerState => ({
            ...initialState,
            ...value,
            zoom: clampZoom(value?.zoom ?? initialState.zoom),
            pageNumber: Math.max(1, value?.pageNumber ?? initialState.pageNumber),
            totalPages: Math.max(1, value?.totalPages ?? initialState.totalPages),
            continuous: false,
        }),
    );
    const frameRef = useRef<ViewerFrame>(defaultFrame);
    const viewerAPIRef = useRef<ViewerAPI>({
        fitWidth: () => undefined,
        fitPage: () => undefined,
    });

    const updateFrame = useCallback((frame: ViewerFrame) => {
        frameRef.current = frame;
    }, []);

    const registerViewerAPI = useCallback((api: ViewerAPI) => {
        viewerAPIRef.current = api;
    }, []);

    const fitWidth = useCallback(() => {
        viewerAPIRef.current.fitWidth();
    }, []);

    const fitPage = useCallback(() => {
        viewerAPIRef.current.fitPage();
    }, []);

    const setZoom = useCallback((zoom: number) => {
        dispatch({ type: 'set-zoom', zoom });
    }, []);

    const setViewport = useCallback((viewport: ViewerViewport) => {
        dispatch({ type: 'set-viewport', viewport });
    }, []);

    const panTo = useCallback((x: number, y: number) => {
        dispatch({ type: 'pan-to', x, y });
    }, []);

    const panBy = useCallback((dx: number, dy: number) => {
        dispatch({ type: 'pan-by', dx, dy });
    }, []);

    const resetViewport = useCallback(() => {
        dispatch({ type: 'reset-viewport' });
    }, []);

    const rotate = useCallback(() => {
        dispatch({ type: 'rotate' });
    }, []);

    const setActiveTool = useCallback((tool: AnnotationTool) => {
        dispatch({ type: 'set-tool', tool });
    }, []);

    const setPageNumber = useCallback((page: number) => {
        dispatch({ type: 'set-page', page });
    }, []);

    const setTotalPages = useCallback((total: number) => {
        dispatch({ type: 'set-total-pages', total });
    }, []);

    const setFullscreen = useCallback((fullscreen: boolean) => {
        dispatch({ type: 'set-fullscreen', fullscreen });
    }, []);

    const toggleFullscreen = useCallback(() => {
        dispatch({ type: 'toggle-fullscreen' });
    }, []);

    const toggleContinuous = useCallback(() => {
        // Disabled deliberately. A continuous stack cannot share one annotation overlay safely.
    }, []);

    const zoomIn = useCallback(() => {
        dispatch({ type: 'set-zoom', zoom: state.zoom + ZOOM_STEP });
    }, [state.zoom]);

    const zoomOut = useCallback(() => {
        dispatch({ type: 'set-zoom', zoom: state.zoom - ZOOM_STEP });
    }, [state.zoom]);

    const zoomAroundPoint = useCallback((delta: number, cx: number, cy: number) => {
        const current = state;
        const factor = delta > 0 ? 1.1 : 0.9;
        const zoom = clampZoom(current.zoom * factor);
        const effectiveFactor = zoom / current.zoom;

        dispatch({
            type: 'set-viewport',
            viewport: {
                zoom,
                panX: current.panX * effectiveFactor + cx * (1 - effectiveFactor),
                panY: current.panY * effectiveFactor + cy * (1 - effectiveFactor),
            },
        });
    }, [state]);

    return useMemo(() => ({
        state,
        setZoom,
        setViewport,
        panTo,
        panBy,
        resetViewport,
        rotate,
        setActiveTool,
        setPageNumber,
        setTotalPages,
        setFullscreen,
        toggleFullscreen,
        toggleContinuous,
        zoomIn,
        zoomOut,
        zoomAroundPoint,
        frameRef,
        updateFrame,
        registerViewerAPI,
        fitWidth,
        fitPage,
    }), [
        state,
        setZoom,
        setViewport,
        panTo,
        panBy,
        resetViewport,
        rotate,
        setActiveTool,
        setPageNumber,
        setTotalPages,
        setFullscreen,
        toggleFullscreen,
        toggleContinuous,
        zoomIn,
        zoomOut,
        zoomAroundPoint,
        updateFrame,
        registerViewerAPI,
        fitWidth,
        fitPage,
    ]);
}
