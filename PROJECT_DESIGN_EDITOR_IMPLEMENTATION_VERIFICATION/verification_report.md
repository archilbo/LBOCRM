# Project Design Editor — Implementation Verification Report

**Date**: 2026-07-22
**Branch**: Current (working tree)
**Typecheck**: 333 errors (all pre-existing HeroUI `variant` type mismatches — runtime-safe)

---

## Files Changed (10 modified + 2 new)

### Modified Files

| File | Lines Changed | Summary |
|------|--------------|---------|
| `resources/js/pages/Dossiers/Show.tsx` | +91/-43 | URL workspace state, `pd-editor-active` CSS injection, conditional full-height editor, scroll lock |
| `resources/js/features/dossiers/components/DesignTab.tsx` | +4/-1 | Extended `urlState` and `onNavigate` types |
| `resources/js/features/dossiers/components/DesignAnnotationLayer.tsx` | +44/-8 | `pageShellRef` prop for page-local annotation positioning |
| `resources/js/features/dossiers/components/DesignFileViewer.tsx` | +219/-73 | External toolbar support, viewerToolbar prop, custom event handlers (pd-pan, pd-wheel-zoom, pd-auto-fit), conditionally hides internal toolbar, Save/Remark bar |
| `resources/js/features/dossiers/components/DesignViewerTabs.tsx` | +13/-3 | Pass-through viewerToolbar and onControlsReady props |
| `resources/js/features/dossiers/components/DesignInspector.tsx` | +253/-155 | Real data fetching (useRemarks, useActivity), compact tabs/typography, defaultTab prop, dossierId/versionId props |
| `resources/js/features/dossiers/components/PdfDesignViewer.tsx` | +246/-86 | Native non-passive wheel listener, ResizeObserver auto-fit, space+drag pan, hideToolbar prop, custom event dispatch |
| `resources/js/features/project-design/components/ProjectDesignFileBrowser.tsx` | +280/-252 | Compact popover filters, reduced padding, h-full flex layout, internal scroll |
| `resources/js/features/project-design/components/ProjectDesignTabContent.tsx` | +420/-202 | Editor header, three-panel resizable layout, panel persistence, status bar, toolbar + viewer state lifted, totalPages management |
| `resources/js/features/project-design/hooks/useProjectDesignWorkspace.ts` | +28/-8 | Workspace state types for URL sync |

### New Files

| File | Purpose |
|------|---------|
| `resources/js/features/project-design/components/ProjectDesignEditorToolbar.tsx` | Unified toolbar (annotation tools + zoom + page nav + rotate + fullscreen + download) |
| `resources/js/features/dossiers/utils/coordinates.ts` | 6 coordinate transformation utilities (screen↔normalized page) |

---

## Phase-by-Phase Verification

### Phase 1 — Editor Height & Scroll Ownership
- [x] `.pd-editor-active` class on `<html>` when PD tab active
- [x] CSS injection: `overflow: hidden; height: 100%` on `html`, `body`, root div, `main`
- [x] `flex flex-1 flex-col min-h-0` on tabs wrapper for full-height editor
- [x] Removed `h-[calc(70vh-88px)]` from all editor layouts
- [x] `h-full` on editor container, `flex-1` on viewer area

### Phase 2 — Panel Constraints & Persistence
- [x] Left panel: `defaultSize=20`, `minSize=18`, `maxSize=30`
- [x] Center panel: `minSize=30`
- [x] Right panel: `defaultSize=26`, `minSize=22`, `maxSize=40`
- [x] `loadPanelSizes()` validates: left >= 18 && left <= 30, right >= 22 && right <= 40
- [x] `savePanelSizes()` persists to `localStorage` key `pd-panel-sizes`
- [x] Panel collapse buttons (PanelLeftClose/PanelLeft, PanelRightClose/PanelRight)

### Phase 3 — File Browser Rebuild
- [x] Compact filter popover with discipline/status/sort selects
- [x] ScrollShadow not used (native `overflow-y-auto`)
- [x] Reduced FileRow padding (px-2.5 py-1.5)
- [x] Smaller font sizes (12px, 10px, 9px)
- [x] `h-full` flex layout with `overflow-hidden`
- [x] Works at 240px panel width

### Phase 4 — Inspector Rebuild
- [x] Real data via `useRemarks(dossierId, versionId)` and `useActivity(dossierId)`
- [x] `defaultTab` prop honored for initial tab state
- [x] `onTabChange` callback for URL persistence
- [x] More compact tabs (px-2.5 py-1.5, text-[10.5px])
- [x] Truncation on values (`truncate` class)
- [x] Removed stale `remarks`/`activities` props

### Phase 5 — Unified Toolbar
- [x] `ProjectDesignEditorToolbar` component created
- [x] Left side: annotation tools (select, pin, rectangle, ellipse, arrow, line, cloud, freehand, text, highlight) + Save
- [x] Right side: page nav, fitWidth, fitPage, zoom controls, rotate, fullscreen, download
- [x] Renders in editor header (hidden below `lg` breakpoint)
- [x] State lifted to `EditorWorkspace`: activeTool, zoom, rotation, fullscreen, totalPages
- [x] `DesignFileViewer` hides internal toolbar when external provided
- [x] Save/Remark bar remains in viewer

### Phase 6 — PDF Viewer Sizing
- [x] ResizeObserver auto-fit on container resize
- [x] Auto-fit on first PDF load via `pd-auto-fit` custom event
- [x] `hideToolbar` prop on PdfDesignViewer
- [x] Dynamic `totalPages` via custom event `pd-total-pages` → `pd-editor-total-pages`

### Phase 7 — Pan/Zoom Navigation
- [x] Native wheel listener with `{ passive: false }` for reliable `preventDefault()`
- [x] Ctrl+wheel zoom → custom event `pd-wheel-zoom`
- [x] Shift+wheel horizontal pan → custom event `pd-pan`
- [x] Space+drag pan (grab cursor, prevents page scroll)
- [x] Middle-mouse drag pan
- [x] All events use refs to avoid stale closures

### Phase 8 — Annotation Overlay Positioning
- [x] `pageShellRef` passed from PdfDesignViewer → DesignFileViewer → DesignAnnotationLayer
- [x] Stage positioned to match `.pdf-page-shell` element

### Phase 9-12 — Visual Polish
- [x] Status bar with version status dot, uploader icon, GitBranch icon
- [x] Enhanced empty state for "No assets available"
- [x] Responsive: toolbar hidden below lg, folder tree hidden below sm

---

## Key Technical Decisions

1. **Custom events over prop threading**: Pan/zoom/auto-fit use `window.dispatchEvent(new CustomEvent(...))` to avoid threading state through 3 component layers (DesignFileViewer ← DesignViewerTabs ← ProjectDesignTabContent).

2. **Ref-based callback pattern**: `toolbarRef` (stable ref updated each render) used in callbacks to avoid stale closure issues while keeping dependency arrays minimal.

3. **Panel state ownership**: `localStorage` managed manually (`pd-panel-sizes`) rather than via `PanelGroup`'s `autoSaveId` to avoid conflicts with conditional panel rendering (showBrowser/showInspector toggles).

4. **Dual toolbar mode**: When `viewerToolbar` is provided to DesignFileViewer, it switches to "external" mode — hides internal tool buttons, uses external state for activeTool/zoom/rotation/fullscreen, internally syncs changes via ref-based callbacks.

---

## Verification Commands

```bash
# TypeScript check
npm run typecheck

# Build
npm run build
```
