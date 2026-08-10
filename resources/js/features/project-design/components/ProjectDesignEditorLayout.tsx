import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Group, Panel, Separator, useGroupRef, usePanelCallbackRef } from 'react-resizable-panels';
import { IconMaximize, IconMinimize, IconDeviceDesktop, IconSettings2, IconX } from '@tabler/icons-react';

import { Drawer, Dropdown } from '@heroui/react';
import { cn } from '@/lib/cn';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ProjectDesignLayoutControls } from './ProjectDesignLayoutContext';

const BROWSER_MIN = 240;
const BROWSER_MAX_XL = 360;
const BROWSER_MAX_LG = 340;
const BROWSER_DEFAULT = 268;
const INSPECTOR_MIN = 340;
const INSPECTOR_MAX = 480;
const INSPECTOR_DEFAULT = 372;
const CENTER_MIN = 560;

const BROWSER_LAYOUT = BROWSER_DEFAULT;
const VIEWER_LAYOUT = CENTER_MIN;
const INSPECTOR_LAYOUT = INSPECTOR_DEFAULT;
const PERSISTENCE_KEY_PREFIX = 'pd-editor-layout';

type Breakpoint = 'xl' | 'lg' | 'md' | 'sm';
type DrawerState = { breakpoint: Breakpoint; browser: boolean; inspector: boolean };
type PersistedLayout = { browserCollapsed: boolean; inspectorCollapsed: boolean };

function useBreakpoint(): Breakpoint {
    const isXl = useMediaQuery('(min-width: 1280px)');
    const isLg = useMediaQuery('(min-width: 1024px)');
    const isMd = useMediaQuery('(min-width: 768px)');

    if (isXl) return 'xl';
    if (isLg) return 'lg';
    if (isMd) return 'md';
    return 'sm';
}

function persistenceKey(companyId: number | null, userId: number | null): string | null {
    if (!userId) return null;
    return companyId
        ? `${PERSISTENCE_KEY_PREFIX}:${companyId}:${userId}:v3`
        : `${PERSISTENCE_KEY_PREFIX}:${userId}:v3`;
}

function defaultPersistedLayout(): PersistedLayout {
    return { browserCollapsed: false, inspectorCollapsed: false };
}

function loadLayout(companyId: number | null, userId: number | null): PersistedLayout {
    if (typeof window === 'undefined') return defaultPersistedLayout();

    const key = persistenceKey(companyId, userId);
    if (!key) return defaultPersistedLayout();

    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return defaultPersistedLayout();

        const parsed = JSON.parse(raw) as Partial<PersistedLayout> & { version?: number };
        if (parsed.version !== 3) return defaultPersistedLayout();

        return {
            browserCollapsed: parsed.browserCollapsed === true,
            inspectorCollapsed: parsed.inspectorCollapsed === true,
        };
    } catch {
        return defaultPersistedLayout();
    }
}

function saveLayout(companyId: number | null, userId: number | null, data: PersistedLayout): void {
    if (typeof window === 'undefined') return;

    const key = persistenceKey(companyId, userId);
    if (!key) return;

    try {
        window.localStorage.setItem(key, JSON.stringify({ version: 3, ...data }));
    } catch {
        // Layout persistence is optional and must never block the editor.
    }
}

function PanelSurface({ children, edge }: { children: ReactNode; edge: 'left' | 'center' | 'right' }) {
    return (
        <div
            className={[
                'h-full min-h-0 overflow-hidden bg-[var(--surface)]',
                edge === 'center' ? 'bg-[var(--surface-2)]/35' : '',
            ].join(' ')}
        >
            {children}
        </div>
    );
}

function ResizeHandle() {
    return (
        <Separator
            className="group relative w-1 shrink-0 cursor-col-resize bg-[var(--border)]/55 outline-none transition-colors hover:bg-[var(--accent)]/35 data-[resize-handle-active]:bg-[var(--accent)]/55 focus-visible:bg-[var(--accent)]/40 focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
        >
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent group-hover:bg-[var(--accent)]/60" />
        </Separator>
    );
}

function ResponsiveDrawer({
    isOpen,
    onOpenChange,
    title,
    description,
    children,
    portalContainer,
    maxWidth,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    children: ReactNode;
    portalContainer?: HTMLElement | null;
    maxWidth: string;
}) {
    return (
        <Drawer>
            <Drawer.Backdrop
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                variant="blur"
                isDismissable
                UNSTABLE_portalContainer={portalContainer ?? undefined}
                className="z-[170] bg-black/65"
            >
                <Drawer.Content placement="right" className="z-[171] p-0">
                    <Drawer.Dialog
                        aria-label={title}
                        className={cn(
                            'flex h-dvh w-screen flex-col overflow-hidden rounded-none border-l border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[-24px_0_70px_rgb(0_0_0_/_0.38)]',
                            maxWidth,
                        )}
                    >
                        <Drawer.Header className="relative shrink-0 border-b border-[var(--border)] px-4 py-3 pr-12">
                            <Drawer.Heading className="text-sm font-semibold text-[var(--foreground)]">{title}</Drawer.Heading>
                            <p className="mt-0.5 text-[9px] leading-4 text-[var(--text-muted)]">{description}</p>
                            <Drawer.CloseTrigger
                                aria-label={`Close ${title}`}
                                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg text-[var(--text-muted)] outline-none transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                            >
                                <IconX size={15} />
                            </Drawer.CloseTrigger>
                        </Drawer.Header>
                        <Drawer.Body className="min-h-0 flex-1 overflow-hidden p-0">
                            {children}
                        </Drawer.Body>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
        </Drawer>
    );
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
    portalContainer,
}: {
    browser: ReactNode;
    viewer: ReactNode;
    inspector: ReactNode;
    onFullscreenToggle?: () => void;
    fullscreen?: boolean;
    userId?: number | null;
    companyId?: number | null;
    onControlsChange?: (controls: ProjectDesignLayoutControls) => void;
    portalContainer?: HTMLElement | null;
}) {
    const breakpoint = useBreakpoint();
    const isXl = breakpoint === 'xl';
    const isLg = breakpoint === 'lg';
    const persisted = useMemo(
        () => loadLayout(companyId ?? null, userId ?? null),
        [companyId, userId],
    );

    const [drawerState, setDrawerState] = useState<DrawerState>({
        breakpoint,
        browser: false,
        inspector: false,
    });

    const browserDrawerOpen = drawerState.breakpoint === breakpoint && drawerState.browser;
    const inspectorDrawerOpen = drawerState.breakpoint === breakpoint && drawerState.inspector;

    const groupRef = useGroupRef();
    const [browserPanelHandle, setBrowserPanelHandle] = usePanelCallbackRef();
    const [inspectorPanelHandle, setInspectorPanelHandle] = usePanelCallbackRef();

    const setBrowserDrawerOpen = useCallback((open: boolean) => {
        setDrawerState((current) => ({
            breakpoint,
            browser: open,
            inspector: open ? false : current.breakpoint === breakpoint && current.inspector,
        }));
    }, [breakpoint]);

    const setInspectorDrawerOpen = useCallback((open: boolean) => {
        setDrawerState((current) => ({
            breakpoint,
            browser: open ? false : current.breakpoint === breakpoint && current.browser,
            inspector: open,
        }));
    }, [breakpoint]);

    const toggleBrowser = useCallback(() => {
        if (isXl || isLg) {
            if (browserPanelHandle?.isCollapsed()) browserPanelHandle.expand();
            else browserPanelHandle?.collapse();
            return;
        }

        setBrowserDrawerOpen(!browserDrawerOpen);
    }, [isXl, isLg, browserPanelHandle, browserDrawerOpen, setBrowserDrawerOpen]);

    const toggleInspector = useCallback(() => {
        if (isXl) {
            if (inspectorPanelHandle?.isCollapsed()) inspectorPanelHandle.expand();
            else inspectorPanelHandle?.collapse();
            return;
        }

        setInspectorDrawerOpen(!inspectorDrawerOpen);
    }, [isXl, inspectorPanelHandle, inspectorDrawerOpen, setInspectorDrawerOpen]);

    const openBrowser = useCallback(() => {
        if (isXl || isLg) browserPanelHandle?.expand();
        else setBrowserDrawerOpen(true);
    }, [isXl, isLg, browserPanelHandle, setBrowserDrawerOpen]);

    const openInspector = useCallback(() => {
        if (isXl) inspectorPanelHandle?.expand();
        else setInspectorDrawerOpen(true);
    }, [isXl, inspectorPanelHandle, setInspectorDrawerOpen]);

    const closeBrowser = useCallback(() => {
        if (isXl || isLg) browserPanelHandle?.collapse();
        else setBrowserDrawerOpen(false);
    }, [isXl, isLg, browserPanelHandle, setBrowserDrawerOpen]);

    const closeInspector = useCallback(() => {
        if (isXl) inspectorPanelHandle?.collapse();
        else setInspectorDrawerOpen(false);
    }, [isXl, inspectorPanelHandle, setInspectorDrawerOpen]);

    const controls = useMemo<ProjectDesignLayoutControls>(() => ({
        toggleBrowser,
        toggleInspector,
        openBrowser,
        openInspector,
        closeBrowser,
        closeInspector,
        browserAvailable: isXl || isLg,
        inspectorAvailable: isXl,
    }), [
        toggleBrowser,
        toggleInspector,
        openBrowser,
        openInspector,
        closeBrowser,
        closeInspector,
        isXl,
        isLg,
    ]);

    useEffect(() => {
        onControlsChange?.(controls);
    }, [controls, onControlsChange]);

    const handleLayoutChange = useCallback((layout: { [panelId: string]: number }) => {
        saveLayout(companyId ?? null, userId ?? null, {
            browserCollapsed: (layout.browser ?? 0) <= 0,
            inspectorCollapsed: (layout.inspector ?? 0) <= 0,
        });
    }, [companyId, userId]);

    const resetLayout = useCallback(() => {
        const key = persistenceKey(companyId ?? null, userId ?? null);
        if (key && typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem(key);
            } catch {
                // Reset still continues even when storage is unavailable.
            }
        }

        setDrawerState({ breakpoint, browser: false, inspector: false });

        if (isXl) {
            groupRef.current?.setLayout({
                browser: BROWSER_LAYOUT,
                viewer: VIEWER_LAYOUT,
                inspector: INSPECTOR_LAYOUT,
            });
            browserPanelHandle?.expand();
            inspectorPanelHandle?.expand();
        } else if (isLg) {
            groupRef.current?.setLayout({ browser: BROWSER_LAYOUT, viewer: VIEWER_LAYOUT });
            browserPanelHandle?.expand();
        }
    }, [
        breakpoint,
        companyId,
        userId,
        isXl,
        isLg,
        groupRef,
        browserPanelHandle,
        inspectorPanelHandle,
    ]);

    let panels: ReactNode;

    if (isXl) {
        panels = (
            <Group
                key="project-design-xl"
                orientation="horizontal"
                defaultLayout={{
                    browser: persisted.browserCollapsed ? 0 : BROWSER_LAYOUT,
                    viewer: VIEWER_LAYOUT,
                    inspector: persisted.inspectorCollapsed ? 0 : INSPECTOR_LAYOUT,
                }}
                onLayoutChanged={handleLayoutChange}
                className="h-full"
                groupRef={groupRef}
            >
                <Panel
                    id="browser"
                    defaultSize={persisted.browserCollapsed ? 0 : BROWSER_DEFAULT}
                    minSize={BROWSER_MIN}
                    maxSize={BROWSER_MAX_XL}
                    collapsible
                    collapsedSize={0}
                    panelRef={setBrowserPanelHandle}
                >
                    <PanelSurface edge="left">{browser}</PanelSurface>
                </Panel>
                <ResizeHandle />
                <Panel id="viewer" defaultSize={CENTER_MIN} minSize={CENTER_MIN} className="min-w-0">
                    <PanelSurface edge="center">{viewer}</PanelSurface>
                </Panel>
                <ResizeHandle />
                <Panel
                    id="inspector"
                    defaultSize={persisted.inspectorCollapsed ? 0 : INSPECTOR_DEFAULT}
                    minSize={INSPECTOR_MIN}
                    maxSize={INSPECTOR_MAX}
                    collapsible
                    collapsedSize={0}
                    panelRef={setInspectorPanelHandle}
                >
                    <PanelSurface edge="right">{inspector}</PanelSurface>
                </Panel>
            </Group>
        );
    } else if (isLg) {
        panels = (
            <Group
                key="project-design-lg"
                orientation="horizontal"
                defaultLayout={{
                    browser: persisted.browserCollapsed ? 0 : BROWSER_LAYOUT,
                    viewer: VIEWER_LAYOUT,
                }}
                onLayoutChanged={handleLayoutChange}
                className="h-full"
                groupRef={groupRef}
            >
                <Panel
                    id="browser"
                    defaultSize={persisted.browserCollapsed ? 0 : BROWSER_DEFAULT}
                    minSize={BROWSER_MIN}
                    maxSize={BROWSER_MAX_LG}
                    collapsible
                    collapsedSize={0}
                    panelRef={setBrowserPanelHandle}
                >
                    <PanelSurface edge="left">{browser}</PanelSurface>
                </Panel>
                <ResizeHandle />
                <Panel id="viewer" defaultSize={CENTER_MIN} minSize={CENTER_MIN} className="min-w-0">
                    <PanelSurface edge="center">{viewer}</PanelSurface>
                </Panel>
            </Group>
        );
    } else {
        panels = <PanelSurface edge="center">{viewer}</PanelSurface>;
    }

    return (
        <div className="project-design-editor-host relative h-full overflow-hidden border-x border-[var(--border)] bg-[var(--surface)]">
            {panels}

            <div className="absolute right-2 top-2 z-30">
                <Dropdown>
                    <Dropdown.Trigger
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]/95 text-[var(--text-muted)] shadow-sm backdrop-blur transition hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
                        aria-label="Editor layout settings"
                    >
                        <IconSettings2 size={13} />
                    </Dropdown.Trigger>
                    <Dropdown.Popover
                        placement="bottom end"
                        className="z-[100] min-w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-2xl"
                    >
                        <Dropdown.Menu
                            aria-label="Project Design layout"
                            onAction={(key) => {
                                if (key === 'reset') resetLayout();
                                if (key === 'fullscreen') onFullscreenToggle?.();
                            }}
                        >
                            <Dropdown.Item key="reset">
                                <IconDeviceDesktop size={13} />
                                <span>Reset panel layout</span>
                            </Dropdown.Item>
                            <Dropdown.Item key="fullscreen">
                                {fullscreen ? <IconMinimize size={13} /> : <IconMaximize size={13} />}
                                <span>{fullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            </div>

            {!isXl && !isLg ? (
                <ResponsiveDrawer
                    isOpen={browserDrawerOpen}
                    onOpenChange={setBrowserDrawerOpen}
                    title="Project Design files"
                    description="Browse folders, revisions and design assets."
                    portalContainer={portalContainer}
                    maxWidth="max-w-[420px]"
                >
                    {browser}
                </ResponsiveDrawer>
            ) : null}

            {!isXl ? (
                <ResponsiveDrawer
                    isOpen={inspectorDrawerOpen}
                    onOpenChange={setInspectorDrawerOpen}
                    title="Design inspector"
                    description="Details, remarks, versions and activity."
                    portalContainer={portalContainer}
                    maxWidth="max-w-[440px]"
                >
                    {inspector}
                </ResponsiveDrawer>
            ) : null}
        </div>
    );
}
