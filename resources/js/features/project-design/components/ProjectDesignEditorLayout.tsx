import { useState, useCallback, useEffect, useRef, useMemo, type ReactNode } from 'react';
import { Group, Panel, Separator, useGroupRef, usePanelCallbackRef } from 'react-resizable-panels';
import { PanelRightClose, PanelRight, Settings2, Monitor } from 'lucide-react';
import { Button, Dropdown } from '@heroui/react';
import { AppDrawer } from '@/components/ui/AppDrawer';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ProjectDesignLayoutControls } from './ProjectDesignLayoutContext';

const BROWSER_MIN = 240;
const BROWSER_MAX_XL = 360;
const BROWSER_MAX_LG = 340;
const BROWSER_DEFAULT = 260;
const INSPECTOR_MIN = 330;
const INSPECTOR_MAX = 480;
const INSPECTOR_DEFAULT = 360;
const CENTER_MIN = 560;

type Breakpoint = 'xl' | 'lg' | 'md' | 'sm';

function useBreakpoint(): Breakpoint {
    const isXl = useMediaQuery('(min-width: 1280px)');
    const isLg = useMediaQuery('(min-width: 1024px)');
    const isMd = useMediaQuery('(min-width: 768px)');
    if (isXl) return 'xl';
    if (isLg) return 'lg';
    if (isMd) return 'md';
    return 'sm';
}

const PERSISTENCE_KEY_PREFIX = 'pd-editor-layout';

function persistenceKey(companyId: number | null, userId: number | null): string | null {
    if (!userId) return null;
    return companyId ? `${PERSISTENCE_KEY_PREFIX}:${companyId}:${userId}:v2` : `${PERSISTENCE_KEY_PREFIX}:${userId}:v2`;
}

const BROWSER_FLEX = 3;
const VIEWER_FLEX = 7;
const INSPECTOR_FLEX = 4;

function loadLayout(companyId: number | null, userId: number | null): { browserCollapsed: boolean; inspectorCollapsed: boolean } {
    const key = persistenceKey(companyId, userId);
    if (!key) return { browserCollapsed: false, inspectorCollapsed: false };
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return { browserCollapsed: false, inspectorCollapsed: false };
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.version === 2) {
            return {
                browserCollapsed: typeof parsed.browserCollapsed === 'boolean' ? parsed.browserCollapsed : false,
                inspectorCollapsed: typeof parsed.inspectorCollapsed === 'boolean' ? parsed.inspectorCollapsed : false,
            };
        }
        return { browserCollapsed: false, inspectorCollapsed: false };
    } catch {
        return { browserCollapsed: false, inspectorCollapsed: false };
    }
}

function saveLayout(companyId: number | null, userId: number | null, data: { browserCollapsed: boolean; inspectorCollapsed: boolean }) {
    const key = persistenceKey(companyId, userId);
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify({ version: 2, ...data })); } catch { /* storage full */ }
}

export function ProjectDesignEditorLayout({
    browser,
    viewer,
    inspector,
    onFullscreenToggle,
    fullscreen,
    userId,
    companyId,
    onControlsChange,
}: {
    browser: ReactNode;
    viewer: ReactNode;
    inspector: ReactNode;
    onFullscreenToggle?: () => void;
    fullscreen?: boolean;
    userId?: number | null;
    companyId?: number | null;
    onControlsChange?: (controls: ProjectDesignLayoutControls) => void;
}) {
    const breakpoint = useBreakpoint();
    const isXl = breakpoint === 'xl';
    const isLg = breakpoint === 'lg';
    const isMd = breakpoint === 'md';

    const [browserDrawerOpen, setBrowserDrawerOpen] = useState(false);
    const [inspectorDrawerOpen, setInspectorDrawerOpen] = useState(false);

    const groupRef = useGroupRef();
    const [browserPanelHandle, setBrowserPanelHandle] = usePanelCallbackRef();
    const [inspectorPanelHandle, setInspectorPanelHandle] = usePanelCallbackRef();

    useEffect(() => {
        if (isXl) { setBrowserDrawerOpen(false); setInspectorDrawerOpen(false); }
        else if (isLg) { setBrowserDrawerOpen(false); setInspectorDrawerOpen(false); }
        else if (isMd) { setInspectorDrawerOpen(false); }
    }, [isXl, isLg, isMd]);

    const toggleBrowser = useCallback(() => {
        if (isXl || isLg) { browserPanelHandle?.isCollapsed() ? browserPanelHandle?.expand() : browserPanelHandle?.collapse(); }
        else { setBrowserDrawerOpen((v) => !v); }
    }, [isXl, isLg, browserPanelHandle]);

    const toggleInspector = useCallback(() => {
        if (isXl) { inspectorPanelHandle?.isCollapsed() ? inspectorPanelHandle?.expand() : inspectorPanelHandle?.collapse(); }
        else { setInspectorDrawerOpen((v) => !v); }
    }, [isXl, inspectorPanelHandle]);

    const openBrowser = useCallback(() => {
        if (isXl || isLg) { browserPanelHandle?.expand(); } else { setBrowserDrawerOpen(true); }
    }, [isXl, isLg, browserPanelHandle]);

    const openInspector = useCallback(() => {
        if (isXl) { inspectorPanelHandle?.expand(); } else { setInspectorDrawerOpen(true); }
    }, [isXl, inspectorPanelHandle]);

    const closeBrowser = useCallback(() => {
        if (isXl || isLg) { browserPanelHandle?.collapse(); } else { setBrowserDrawerOpen(false); }
    }, [isXl, isLg, browserPanelHandle]);

    const closeInspector = useCallback(() => {
        if (isXl) { inspectorPanelHandle?.collapse(); } else { setInspectorDrawerOpen(false); }
    }, [isXl, inspectorPanelHandle]);

    const browserAvailable = isXl || isLg;
    const inspectorAvailable = isXl;

    const controls = useMemo<ProjectDesignLayoutControls>(() => ({
        toggleBrowser, toggleInspector, openBrowser, openInspector, closeBrowser, closeInspector,
        browserAvailable, inspectorAvailable,
    }), [toggleBrowser, toggleInspector, openBrowser, openInspector, closeBrowser, closeInspector,
        browserAvailable, inspectorAvailable]);

    useEffect(() => {
        onControlsChange?.(controls);
    }, [onControlsChange, controls]);

    const handleLayoutChange = useCallback((layout: { [panelId: string]: number }) => {
        const uid = userId ?? null;
        if (uid) {
            saveLayout(companyId ?? null, uid, {
                browserCollapsed: layout.browser === 0,
                inspectorCollapsed: layout.inspector === 0,
            });
        }
    }, [userId, companyId]);

    const resetLayout = useCallback(() => {
        const key = persistenceKey(companyId ?? null, userId ?? null);
        if (key) { try { localStorage.removeItem(key); } catch { /* ignore */ } }
        setBrowserDrawerOpen(false);
        setInspectorDrawerOpen(false);
        if (isXl) {
            try { groupRef.current?.setLayout({ browser: BROWSER_FLEX, viewer: VIEWER_FLEX, inspector: INSPECTOR_FLEX }); } catch { /* ignore */ }
            if (browserPanelHandle?.isCollapsed()) browserPanelHandle?.expand();
            if (inspectorPanelHandle?.isCollapsed()) inspectorPanelHandle?.expand();
        } else if (isLg) {
            try { groupRef.current?.setLayout({ browser: BROWSER_FLEX, viewer: VIEWER_FLEX }); } catch { /* ignore */ }
            if (browserPanelHandle?.isCollapsed()) browserPanelHandle?.expand();
        }
    }, [userId, companyId, groupRef, browserPanelHandle, inspectorPanelHandle, isXl, isLg]);

    const renderPanels = () => {
        if (isXl) {
            return (
                <Group orientation="horizontal"
                    defaultLayout={{ browser: BROWSER_FLEX, viewer: VIEWER_FLEX, inspector: INSPECTOR_FLEX }}
                    onLayoutChange={handleLayoutChange} className="h-full" groupRef={groupRef}>
                    <Panel id="browser" defaultSize={BROWSER_DEFAULT} minSize={BROWSER_MIN} maxSize={BROWSER_MAX_XL}
                        collapsible collapsedSize={0} panelRef={(h) => setBrowserPanelHandle(h)}>
                        <div className="h-full overflow-hidden">{browser}</div>
                    </Panel>
                    <Separator className="w-[3px] shrink-0 bg-transparent transition-colors hover:bg-[var(--accent)]/30 data-[resize-handle-active]:bg-[var(--accent)]/50 cursor-col-resize" />
                    <Panel id="viewer" defaultSize={CENTER_MIN} minSize={CENTER_MIN} className="min-w-0">
                        <div className="h-full overflow-hidden">{viewer}</div>
                    </Panel>
                    <Separator className="w-[3px] shrink-0 bg-transparent transition-colors hover:bg-[var(--accent)]/30 data-[resize-handle-active]:bg-[var(--accent)]/50 cursor-col-resize" />
                    <Panel id="inspector" defaultSize={INSPECTOR_DEFAULT} minSize={INSPECTOR_MIN} maxSize={INSPECTOR_MAX}
                        collapsible collapsedSize={0} panelRef={(h) => setInspectorPanelHandle(h)}>
                        <div className="h-full overflow-hidden">{inspector}</div>
                    </Panel>
                </Group>
            );
        }
        if (isLg) {
            return (
                <Group orientation="horizontal"
                    defaultLayout={{ browser: BROWSER_FLEX, viewer: VIEWER_FLEX }}
                    onLayoutChange={handleLayoutChange} className="h-full" groupRef={groupRef}>
                    <Panel id="browser" defaultSize={BROWSER_DEFAULT} minSize={BROWSER_MIN} maxSize={BROWSER_MAX_LG}
                        collapsible collapsedSize={0} panelRef={(h) => setBrowserPanelHandle(h)}>
                        <div className="h-full overflow-hidden">{browser}</div>
                    </Panel>
                    <Separator className="w-[3px] shrink-0 bg-transparent transition-colors hover:bg-[var(--accent)]/30 data-[resize-handle-active]:bg-[var(--accent)]/50 cursor-col-resize" />
                    <Panel id="viewer" defaultSize={CENTER_MIN} minSize={CENTER_MIN} className="min-w-0">
                        <div className="h-full overflow-hidden">{viewer}</div>
                    </Panel>
                </Group>
            );
        }
        return <div className="h-full overflow-hidden">{viewer}</div>;
    };

    return (
        <div className="relative h-full project-design-editor-host">
            {renderPanels()}

            <div className="absolute top-1 right-1 z-20">
                <Dropdown>
                    <Dropdown.Trigger className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--accent)]/10">
                        <Settings2 size={12} />
                    </Dropdown.Trigger>
                    <Dropdown.Popover placement="bottom end" className="min-w-40 z-[80] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
                        <Dropdown.Menu aria-label="Panel layout" onAction={(key) => {
                            if (key === 'reset') resetLayout();
                            if (key === 'fullscreen') onFullscreenToggle?.();
                        }}>
                            <Dropdown.Item key="reset">
                                <Monitor size={13} />
                                <span>Reset panel layout</span>
                            </Dropdown.Item>
                            <Dropdown.Item key="fullscreen">
                                {fullscreen ? <><PanelRightClose size={13} /><span>Exit fullscreen</span></> : <><PanelRight size={13} /><span>Enter fullscreen</span></>}
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            </div>

            {!isXl && !isLg && (
                <AppDrawer
                    isOpen={browserDrawerOpen}
                    onOpenChange={setBrowserDrawerOpen}
                    title="File Browser"
                    panelClassName="!w-[85vw] sm:!w-[360px]"
                    isDismissable
                    placement="left"
                >
                    {browser}
                </AppDrawer>
            )}

            {!isXl && (
                <AppDrawer
                    isOpen={inspectorDrawerOpen}
                    onOpenChange={setInspectorDrawerOpen}
                    title="Inspector"
                    panelClassName="!w-[85vw] sm:!w-[420px]"
                    isDismissable
                    placement="right"
                >
                    {inspector}
                </AppDrawer>
            )}
        </div>
    );
}
