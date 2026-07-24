import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { AnnotationTool } from '@/features/project-design/components/ProjectDesignEditorToolbar';

export type FitMode = 'none' | 'width' | 'page';

export interface ViewerState {
    pageNumber: number;
    totalPages: number;
    zoom: number;
    panX: number;
    panY: number;
    rotation: number;
    fitMode: FitMode;
    activeTool: AnnotationTool;
    isPanning: boolean;
    isDocumentReady: boolean;
    sourceWidth: number;
    sourceHeight: number;
    renderedWidth: number;
    renderedHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    fullscreen: boolean;
    hasUnsaved: boolean;
    saving: boolean;
}

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;

export const initialViewerState: ViewerState = {
    pageNumber: 1,
    totalPages: 0,
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    fitMode: 'none',
    activeTool: 'select',
    isPanning: false,
    isDocumentReady: false,
    sourceWidth: 0,
    sourceHeight: 0,
    renderedWidth: 0,
    renderedHeight: 0,
    viewportWidth: 0,
    viewportHeight: 0,
    fullscreen: false,
    hasUnsaved: false,
    saving: false,
};

export type ViewerAction =
    | { type: 'DOCUMENT_READY'; totalPages: number; sourceWidth: number; sourceHeight: number }
    | { type: 'VIEWPORT_RESIZED'; width: number; height: number }
    | { type: 'RENDERED_DIMENSIONS'; width: number; height: number }
    | { type: 'PAGE_CHANGED'; pageNumber: number }
    | { type: 'ZOOM_CHANGED'; zoom: number }
    | { type: 'ZOOM_AROUND_POINTER'; delta: number; pointerX: number; pointerY: number }
    | { type: 'PAN_STARTED' }
    | { type: 'PAN_MOVED'; panX: number; panY: number }
    | { type: 'PAN_ENDED' }
    | { type: 'PAN_BY'; dx: number; dy: number }
    | { type: 'ROTATED' }
    | { type: 'FIT_PAGE' }
    | { type: 'FIT_WIDTH' }
    | { type: 'ACTUAL_SIZE' }
    | { type: 'RESET_VIEW' }
    | { type: 'FULLSCREEN_CHANGED'; fullscreen: boolean }
    | { type: 'TOOL_CHANGED'; activeTool: AnnotationTool }
    | { type: 'TOTAL_PAGES_CHANGED'; totalPages: number }
    | { type: 'SAVING_STATE_CHANGED'; saving: boolean }
    | { type: 'UNSAVED_CHANGED'; hasUnsaved: boolean };

function clampZoom(z: number): number {
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
}

function effectiveDimensions(r: number, w: number, h: number): { w: number; h: number } {
    return r % 180 === 0 ? { w, h } : { w: h, h: w };
}

function computeFitPage(s: ViewerState): { zoom: number; panX: number; panY: number } {
    const { w: rw, h: rh } = effectiveDimensions(s.rotation, s.sourceWidth, s.sourceHeight);
    if (rw <= 0 || rh <= 0 || s.viewportWidth <= 0 || s.viewportHeight <= 0) {
        return { zoom: s.zoom, panX: s.panX, panY: s.panY };
    }
    const zoom = Math.min(s.viewportWidth / rw, s.viewportHeight / rh);
    return { zoom: clampZoom(zoom), panX: (s.viewportWidth - rw * zoom) / 2, panY: (s.viewportHeight - rh * zoom) / 2 };
}

function computeFitWidth(s: ViewerState): { zoom: number; panX: number; panY: number } {
    const { w: rw, h: rh } = effectiveDimensions(s.rotation, s.sourceWidth, s.sourceHeight);
    if (rw <= 0 || s.viewportWidth <= 0) {
        return { zoom: s.zoom, panX: s.panX, panY: s.panY };
    }
    const zoom = s.viewportWidth / rw;
    return { zoom: clampZoom(zoom), panX: 0, panY: Math.max(0, (s.viewportHeight - rh * zoom) / 2) };
}

export function viewerReducer(state: ViewerState, action: ViewerAction): ViewerState {
    switch (action.type) {
        case 'DOCUMENT_READY':
            return {
                ...state,
                isDocumentReady: true,
                totalPages: action.totalPages,
                sourceWidth: action.sourceWidth,
                sourceHeight: action.sourceHeight,
                pageNumber: Math.min(state.pageNumber, action.totalPages),
            };
        case 'VIEWPORT_RESIZED': {
            if (action.width === state.viewportWidth && action.height === state.viewportHeight) return state;
            const next = { ...state, viewportWidth: action.width, viewportHeight: action.height };
            if (state.fitMode === 'page') {
                const fp = computeFitPage(next);
                return { ...next, zoom: fp.zoom, panX: fp.panX, panY: fp.panY };
            }
            if (state.fitMode === 'width') {
                const fw = computeFitWidth(next);
                return { ...next, zoom: fw.zoom, panX: fw.panX, panY: fw.panY };
            }
            return next;
        }
        case 'RENDERED_DIMENSIONS':
            return { ...state, renderedWidth: action.width, renderedHeight: action.height };
        case 'PAGE_CHANGED': {
            const clamped = Math.max(1, Math.min(action.pageNumber, state.totalPages || Infinity));
            return { ...state, pageNumber: clamped, fitMode: 'none', panX: 0, panY: 0, zoom: 1 };
        }
        case 'ZOOM_CHANGED':
            return { ...state, zoom: clampZoom(action.zoom), fitMode: 'none' };
        case 'ZOOM_AROUND_POINTER': {
            const factor = action.delta > 0 ? 1.1 : 0.9;
            const newZoom = clampZoom(state.zoom * factor);
            const wx = (action.pointerX - state.panX) / state.zoom;
            const wy = (action.pointerY - state.panY) / state.zoom;
            return {
                ...state,
                zoom: newZoom,
                panX: action.pointerX - wx * newZoom,
                panY: action.pointerY - wy * newZoom,
                fitMode: 'none',
            };
        }
        case 'PAN_STARTED':
            return { ...state, isPanning: true };
        case 'PAN_MOVED':
            return { ...state, panX: action.panX, panY: action.panY, fitMode: 'none' };
        case 'PAN_ENDED':
            return { ...state, isPanning: false };
        case 'PAN_BY':
            return { ...state, panX: state.panX + action.dx, panY: state.panY + action.dy, fitMode: 'none' };
        case 'ROTATED': {
            const nextRotation = (state.rotation + 90) % 360;
            return { ...state, rotation: nextRotation, fitMode: 'none', panX: 0, panY: 0, zoom: 1 };
        }
        case 'FIT_PAGE': {
            const fp = computeFitPage(state);
            return { ...state, zoom: fp.zoom, panX: fp.panX, panY: fp.panY, fitMode: 'page' };
        }
        case 'FIT_WIDTH': {
            const fw = computeFitWidth(state);
            return { ...state, zoom: fw.zoom, panX: fw.panX, panY: fw.panY, fitMode: 'width' };
        }
        case 'ACTUAL_SIZE': {
            const cw = state.viewportWidth;
            const ch = state.viewportHeight;
            const rw = state.sourceWidth;
            const rh = state.sourceHeight;
            return {
                ...state,
                zoom: 1,
                panX: Math.max(0, (cw - rw) / 2),
                panY: Math.max(0, (ch - rh) / 2),
                fitMode: 'none',
            };
        }
        case 'RESET_VIEW':
            return { ...state, zoom: 1, panX: 0, panY: 0, fitMode: 'none' };
        case 'FULLSCREEN_CHANGED':
            return { ...state, fullscreen: action.fullscreen };
        case 'TOOL_CHANGED':
            return { ...state, activeTool: action.activeTool };
        case 'TOTAL_PAGES_CHANGED': {
            const clamped = Math.min(state.pageNumber, action.totalPages);
            return { ...state, totalPages: action.totalPages, pageNumber: clamped };
        }
        case 'SAVING_STATE_CHANGED':
            return { ...state, saving: action.saving };
        case 'UNSAVED_CHANGED':
            return { ...state, hasUnsaved: action.hasUnsaved };
        default:
            return state;
    }
}

export interface ViewerInteractionHandlers {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
    onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
}

export function useProjectDesignViewerController(): {
    state: ViewerState;
    dispatch: React.Dispatch<ViewerAction>;
    setZoom: (z: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    zoomAroundPoint: (delta: number, pointerX: number, pointerY: number) => void;
    panTo: (x: number, y: number) => void;
    rotate: () => void;
    resetView: () => void;
    fitWidth: () => void;
    fitPage: () => void;
    actualSize: () => void;
    setActiveTool: (t: AnnotationTool) => void;
    setPageNumber: (p: number) => void;
    setTotalPages: (n: number) => void;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
    toggleFullscreen: () => void;
    setSaving: (s: boolean) => void;
    setHasUnsaved: (u: boolean) => void;
    interactionHandlers: ViewerInteractionHandlers;
    spaceHeldRef: React.MutableRefObject<boolean>;
    viewportRef: React.RefObject<HTMLDivElement | null>;
} {
    const [state, dispatch] = useReducer(viewerReducer, initialViewerState);
    const spaceHeldRef = useRef(false);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const panStartRef = useRef({ px: 0, py: 0, panX: 0, panY: 0 });
    const isPanningRef = useRef(false);
    const stateRef = useRef(state);
    useEffect(() => { stateRef.current = state; }, [state]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' && !e.repeat) {
                e.preventDefault();
                spaceHeldRef.current = true;
            }
        };
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === ' ') {
                spaceHeldRef.current = false;
                if (isPanningRef.current) {
                    isPanningRef.current = false;
                    dispatch({ type: 'PAN_ENDED' });
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    useEffect(() => {
        const onChange = () => {
            dispatch({ type: 'FULLSCREEN_CHANGED', fullscreen: !!document.fullscreenElement });
        };
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    useEffect(() => {
        const onBlur = () => {
            if (spaceHeldRef.current || isPanningRef.current) {
                spaceHeldRef.current = false;
                isPanningRef.current = false;
                dispatch({ type: 'PAN_ENDED' });
            }
        };
        window.addEventListener('blur', onBlur);
        return () => window.removeEventListener('blur', onBlur);
    }, []);

    useEffect(() => {
        const onDocPointerDown = (e: PointerEvent) => {
            if (e.button === 1) {
                e.preventDefault();
                const el = viewportRef.current;
                if (el && el.contains(e.target as Node)) {
                    el.setPointerCapture(e.pointerId);
                    const s = stateRef.current;
                    isPanningRef.current = true;
                    panStartRef.current = { px: e.clientX, py: e.clientY, panX: s.panX, panY: s.panY };
                    dispatch({ type: 'PAN_STARTED' });
                }
            }
        };
        const onDocPointerMove = (e: PointerEvent) => {
            if (!isPanningRef.current) return;
            if ((e.buttons & 4) === 0 && (e.buttons & 1) === 0) {
                isPanningRef.current = false;
                dispatch({ type: 'PAN_ENDED' });
                return;
            }
            const npx = panStartRef.current.panX + (e.clientX - panStartRef.current.px);
            const npy = panStartRef.current.panY + (e.clientY - panStartRef.current.py);
            dispatch({ type: 'PAN_MOVED', panX: npx, panY: npy });
        };
        const onDocPointerUp = (e: PointerEvent) => {
            if (!isPanningRef.current) return;
            if (e.button === 1) {
                isPanningRef.current = false;
                dispatch({ type: 'PAN_ENDED' });
            }
        };
        document.addEventListener('pointerdown', onDocPointerDown);
        document.addEventListener('pointermove', onDocPointerMove);
        document.addEventListener('pointerup', onDocPointerUp);
        return () => {
            document.removeEventListener('pointerdown', onDocPointerDown);
            document.removeEventListener('pointermove', onDocPointerMove);
            document.removeEventListener('pointerup', onDocPointerUp);
        };
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const isPanAction = state.activeTool === 'pan' || spaceHeldRef.current || e.button === 1;
        if (!isPanAction) return;
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        isPanningRef.current = true;
        panStartRef.current = { px: e.clientX, py: e.clientY, panX: state.panX, panY: state.panY };
        dispatch({ type: 'PAN_STARTED' });
    }, [state.activeTool, state.panX, state.panY]);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!isPanningRef.current) return;
        if ((e.buttons & 1) === 0 && (e.buttons & 4) === 0) {
            isPanningRef.current = false;
            dispatch({ type: 'PAN_ENDED' });
            return;
        }
        const npx = panStartRef.current.panX + (e.clientX - panStartRef.current.px);
        const npy = panStartRef.current.panY + (e.clientY - panStartRef.current.py);
        dispatch({ type: 'PAN_MOVED', panX: npx, panY: npy });
    }, []);

    const handlePointerUp = useCallback((_e: React.PointerEvent<HTMLDivElement>) => {
        if (!isPanningRef.current) return;
        isPanningRef.current = false;
        dispatch({ type: 'PAN_ENDED' });
    }, []);

    const handlePointerCancel = useCallback(() => {
        isPanningRef.current = false;
        dispatch({ type: 'PAN_ENDED' });
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            dispatch({
                type: 'ZOOM_AROUND_POINTER',
                delta: e.deltaY > 0 ? -1 : 1,
                pointerX: e.clientX - rect.left,
                pointerY: e.clientY - rect.top,
            });
        } else if (e.shiftKey) {
            e.preventDefault();
            dispatch({ type: 'PAN_BY', dx: -e.deltaY, dy: 0 });
        }
    }, []);

    const setZoom = useCallback((z: number) => dispatch({ type: 'ZOOM_CHANGED', zoom: z }), []);
    const zoomIn = useCallback(() => dispatch({ type: 'ZOOM_AROUND_POINTER', delta: 1, pointerX: 0, pointerY: 0 }), []);
    const zoomOut = useCallback(() => dispatch({ type: 'ZOOM_AROUND_POINTER', delta: -1, pointerX: 0, pointerY: 0 }), []);
    const zoomAroundPoint = useCallback(
        (delta: number, pointerX: number, pointerY: number) => dispatch({ type: 'ZOOM_AROUND_POINTER', delta, pointerX, pointerY }),
        [],
    );
    const panTo = useCallback((x: number, y: number) => dispatch({ type: 'PAN_MOVED', panX: x, panY: y }), []);
    const rotate = useCallback(() => dispatch({ type: 'ROTATED' }), []);
    const resetView = useCallback(() => dispatch({ type: 'RESET_VIEW' }), []);
    const fitWidth = useCallback(() => dispatch({ type: 'FIT_WIDTH' }), []);
    const fitPage = useCallback(() => dispatch({ type: 'FIT_PAGE' }), []);
    const actualSize = useCallback(() => dispatch({ type: 'ACTUAL_SIZE' }), []);
    const setActiveTool = useCallback((t: AnnotationTool) => dispatch({ type: 'TOOL_CHANGED', activeTool: t }), []);
    const setPageNumber = useCallback((p: number) => dispatch({ type: 'PAGE_CHANGED', pageNumber: p }), []);
    const setTotalPages = useCallback((n: number) => dispatch({ type: 'TOTAL_PAGES_CHANGED', totalPages: n }), []);
    const enterFullscreen = useCallback(() => {
        const el = viewportRef.current?.closest('[data-editor-host]') as HTMLElement | null;
        if (el) el.requestFullscreen();
    }, []);
    const exitFullscreen = useCallback(() => {
        if (document.fullscreenElement) document.exitFullscreen();
    }, []);
    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) document.exitFullscreen();
        else {
            const el = viewportRef.current?.closest('[data-editor-host]') as HTMLElement | null;
            if (el) el.requestFullscreen();
        }
    }, []);
    const setSaving = useCallback((s: boolean) => dispatch({ type: 'SAVING_STATE_CHANGED', saving: s }), []);
    const setHasUnsaved = useCallback((u: boolean) => dispatch({ type: 'UNSAVED_CHANGED', hasUnsaved: u }), []);

    return {
        state,
        dispatch,
        setZoom,
        zoomIn,
        zoomOut,
        zoomAroundPoint,
        panTo,
        rotate,
        resetView,
        fitWidth,
        fitPage,
        actualSize,
        setActiveTool,
        setPageNumber,
        setTotalPages,
        enterFullscreen,
        exitFullscreen,
        toggleFullscreen,
        setSaving,
        setHasUnsaved,
        interactionHandlers: {
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            onPointerCancel: handlePointerCancel,
            onWheel: handleWheel,
        },
        spaceHeldRef,
        viewportRef,
    };
}
