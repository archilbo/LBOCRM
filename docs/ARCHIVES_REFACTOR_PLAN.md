# Archives Page Refactor Plan

## Current Problems

| Issue | Description |
|---|---|
| **No fixed-height layout** | Page scrolls forever; header + 5 stat cards consume ~280px before content |
| **AppPageContainer constraints** | `max-w-none` but with `px-4 sm:px-6` padding — not a full-bleed workspace |
| **Two inconsistent modes** | `workspace` (table + detail) vs `storage` (browser) are completely different layouts |
| **Table action overload** | 5 icon-buttons per row (Preview, Edit, Stored, Checked out, Returned) — noisy dense |
| **Detail panel redundancy** | Side panel shows location info; preview drawer duplicates nearly identical content |
| **Storage browser height-capped** | All 3 columns have `max-h-[560px]` — nested scroll, doesn't fill viewport |
| **No `min-h-0` on flex chains** | Same bug as Templates — inner scroll areas won't fill properly |
| **Stat cards waste space** | Like the old Templates stat cards — useful summary but too much vertical real estate |
| **Date format risk** | Backend sends `"YYYY-MM-DD HH:mm:ss"` without timezone → `NaN` relative time |

---

## Proposed Layout

### 1. Compact Header Bar

Replaces: page title/subtitle + 5 stat cards + search/filter/toolbar row.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Archives    [All▾|Ready|Stored|Checked out|Returned]   125·23·3·8    [↻]   │
│ [Search archives…]                                    [Workspace▾] [+ New]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Single `h-14` row, `fullBleed` AppShell, no page scroll
- Status filter: segmented control with count badges (like Templates type tabs)
- Micro-stats: inline muted text (no cards)
- View mode: dropdown toggle (Workspace / Storage browser)
- "New" + Refresh buttons always visible
- Search input fills available width

---

### 2. Workspace Mode — 2-Pane Layout

```
┌────────────────────────────────────────┬─────────────────────────────┐
│ ARCHIVE TABLE (flex-1, scrolls inside) │ DETAIL PANEL (w-[380px])    │
│                                        │                             │
│ #  │ Project     │ Loc    │ Status │   │ Archive #  [Stored]         │
│ ───┼─────────────┼────────┼────────┼   │ Project: Villa XYZ          │
│ A4 │ Villa X     │ Rm 2   │ Stored │ ⋯ │ Client: Dupont              │
│ A5 │ Immeuble Y  │ Rm 1   │ CO     │ ⋯ │ Dossier: DOS-2026-0012      │
│ A6 │ Pont Z      │ Rm 3   │ Ready  │ ⋯ │                             │
│    │             │        │        │   │ Location                     │
│ Rows click → select                  │   │ Room 2 / Shelf B / Box 3   │
│                                      │   │                             │
│ Action col: [⋯] dropdown per row:    │   │ Dates:                      │
│   Edit | Mark stored | Check out     │   │ In: 12/06/2026             │
│   | Returned | Delete                │   │ Out: 20/06/2026            │
│                                      │   │ Returned: -                │
│                                      │   │                             │
│                                      │   │ Archive flow (timeline)    │
│                                      │   │ ✓ Ready · ✓ Stored         │
│                                      │   │ ○ Checked out · ○ Returned │
│                                      │   │                             │
│                                      │   │ Notes: ...                  │
│                                      │   │                             │
│                                      │   │ [Mark stored] [Check out]  │
│                                      │   │  [Edit]        [Delete]    │
│                                      │   │                             │
│                                      │   │ Collapsible ◀ (persisted)  │
└────────────────────────────────────────┴─────────────────────────────┘
```

**Changes from current:**
- Removes 5 icon-buttons per row → single `⋯` dropdown (cleaner)
- Row click selects + populates detail panel (no separate preview drawer needed)
- Detail panel replaces both the right-column `ArchiveDetailPanel` and the `ArchivePreviewContent` drawer — **one source of truth**
- Detail panel has action buttons at bottom
- Collapsible (chevron), width persisted in `localStorage`

---

### 3. Storage Browser Mode — 3-Column Explorer

```
┌───────────────┬───────────────┬─────────────────────────────────────────┐
│ ROOMS         │ SHELVES       │ ARCHIVES IN SHELF                       │
│ w-[200]       │ w-[200]       │ flex-1                                  │
│               │               │                                         │
│ Room Alpha 12 │ Shelf A   5   │ [Search in shelf…]                      │
│ Room Beta  8  │ Shelf B   3   │ ┌─────────────────────────────────────┐│
│ Room Gamma 3  │ Shelf C   4   │ │ A-004 · Villa XYZ · Dupont          ││
│               │               │ │ Stored  · Room 2 / Shelf B          ││
│               │               │ ├─────────────────────────────────────┤│
│               │               │ │ A-005 · Immeuble Y · Martin         ││
│               │               │ │ Checked out · Room 1 / Shelf B      ││
│               │               │ └─────────────────────────────────────┘│
│               │               │                                         │
└───────────────┴───────────────┴─────────────────────────────────────────┘
```

**Fixes:**
- Remove `max-h-[560px]` from all columns — use `flex-1 min-h-0 overflow-y-auto`
- Each column fills the viewport height, scrolls naturally
- Clicking an archive in the shelf list shows a popover or highlights with compact detail
- Same `min-h-0` chain fix as Templates

---

### 4. Responsive Breakpoints

| Width | Layout |
|---|---|
| ≥1280px | Full 2-pane (table + detail) or 3-pane (rooms/shelves/archives) |
| 1024–1279px | Detail panel collapsed by default (icon strip); expands as overlay |
| <1024px | Tab bar across top: "Archives \| Detail" or tabs per browser column |

---

### 5. Other Improvements

- **Date parsing guard**: Normalize `"YYYY-MM-DD HH:mm:ss"` → ISO with `T` before `new Date()`, guard with `isNaN()` (same fix as Templates)
- **Keyboard shortcuts**: `n` = new archive, `/` or `Ctrl+F` = focus search, `Esc` = close drawer/modal
- **Persist collapsed states**: Detail panel width/collapse stored in `localStorage`
- **No duplicate preview**: Remove `ArchivePreviewContent` drawer — detail panel is the single detail view
- **Status quick-actions**: Inline `⋯` dropdown offers status changes without opening the drawer

---

## Files to Create / Modify

| File | Action | Description |
|---|---|---|
| `pages/Archives/Index.tsx` | **Rewrite** | Full-bleed layout, compact header, 2-pane/3-pane, responsive, keyboard shortcuts |
| `pages/Archives/components/ArchiveToolbar.tsx` | **Create** | Compact header with status filter, micro-stats, search, view toggle, new button |
| `pages/Archives/components/ArchiveTable.tsx` | **Create** | Extracted table with `⋯` dropdown actions, click-to-select row |
| `pages/Archives/components/ArchiveDetailPanel.tsx` | **Create** | Right-side detail panel (replaces both inline detail + preview drawer) |
| `pages/Archives/components/ArchiveStorageBrowser.tsx` | **Create** | Extracted from inline with proper `min-h-0` flex sizing |
| `features/archives/drawers/ArchiveDrawer.tsx` | **Minor** | No layout changes needed (drawer content already works) |

---

## Design Principles (match Templates refactor)

1. `w-full` + `h-full` + `min-h-0` on every flex parent in the chain
2. Every scrollable area: `overflow-y-auto` with `min-h-0` on the flex parent
3. No `max-h-[560px]` or percentage-based panel widths — use fixed widths + `flex-1`
4. Compact chrome: `h-8/h-9` buttons, `text-xs/text-sm`, no oversized headers or cards
5. Existing dark theme tokens: `--surface`, `--accent`, `--border`, `--text-muted`
6. Detail panel collapsible, state persisted via `localStorage`
7. `fullBleed` AppShell — no `AppPageContainer`, no `max-w`, no `mx-auto`
