# Archives Redesign v2 — System Design Document

## 1. Architecture Overview

### Data Flow
```
Backend (ArchiveController@index)
  ├── archives[] (paginated, filtered, sorted ArchiveRecord rows)
  ├── cells[]    (Room > Box > City grouping for sidebar)
  ├── kpis{}     (counts for each status)
  ├── cities[]   (all active cities for filter dropdown)
  └── filters{}  (current URL state)

Frontend (Archives/Index.tsx)
  ├── KpiStrip        → click sets ?status= or ?overdueOnly=1
  ├── ToolbarRow
  │   ├── SearchInput → ?q=
  │   ├── FilterChips → active badges with × to remove
  │   └── Actions     → Refresh, Grid, Reports, Cities, New
  ├── CitySidebar     → Room > Box(Cell) > City hierarchy
  │                    → click city sets ?city=MRK
  │                    → click box sets ?room=A1&box=B
  ├── ArchiveTable    → filtered by city/room/box/status/q
  ├── PreviewPanel    → right detail card
  └── Pagination
```

### URL State (search params)

| Param | Example | Source |
|-------|---------|--------|
| `q` | `villa` | Search input |
| `city` | `MRK` | CitySidebar click (single) |
| `status` | `checked_out` | KPI click / not used (KPI sets view) |
| `overdueOnly` | `1` | Overdue KPI click |
| `room` | `A1` | CitySidebar box click |
| `box` | `B` | CitySidebar box click |
| `sort` | `archive_number:asc` | Sort dropdown |
| `page` | `2` | Pagination |
| `perPage` | `25` | Per-page select |
| `viewMode` | `list` / `map` | View toggle |

**Removed**: `view` (no more tabs), `shelf` (not needed at archive level)

---

## 2. Wireframe — `/archives` (Main Page)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ Archives                                                                  [+ New]  │
│                                                                                     │
│ ┌────────┬────────┬────────┬────────┬─────────┬───────────┐                          │
│ │ Total  │ Ready  │ Stored │ Out    │ Overdue │ Lost      │    ← KPI strip          │
│ │ 33     │ 12     │ 10     │ 8      │ 2       │ 1         │    ← click = filter     │
│ └────────┴────────┴────────┴────────┴─────────┴───────────┘                          │
│                                                                                     │
│ ┌───────────────────────────────────────────────────────────────────────────────┐  │
│ │ 🔍 Search ARC, project, box…         │ ✓ MRK ×  ✓ Overdue ×  │ 🔄 ⬓ ⊞ 🏙 📊 │  │
│ └───────────────────────────────────────────────────────────────────────────────┘  │
│   ▲ search input (250ms debounce)        ▲ active filter chips         ▲ actions   │
│                                                                                     │
│ ┌────────────┬────────────────────────────────────────────┬────────────────────────┐│
│ │  Cities    │ Table                                      │ Preview                ││
│ │            │                                            │                        ││
│ │ Room A1    │ ☐  ARC#     City │ Project           │ Loc │ Project                ││
│ │ ▼ Box B    │ ────────────────────────────────────────   │ Villa avec jardin      ││
│ │  ■ MRK (3) │ ☐  1001     ■MRK │ Villa jardin     │ A/B │ Dossier                ││
│ │  ■ CSB (2) │ ☐  1002     ■CSB │ Comm. facade     │ A/B │ MRK007-2026-07        ││
│ │ ▼ Box C    │ ☐  1003     ■RBT │ Residence        │ A/C │ Client                 ││
│ │  □ RBT (1) │                                            │ Mohamed Ouknin         ││
│ │ Room A2    │  ☐  1004     ■MRK │ Villa jardin     │ A/B │ City                   ││
│ │ ▼ Box A    │  ☐  1005     ■TNG │ Office update    │ A/A │ ■ Marrakech (MRK)     ││
│ │  ■ MRK (5) │                                            │ Location               ││
│ │  ■ TNG (2) │                                            │ A1 / B                 ││
│ │ ▼ Box B    │                                            │ Requester              ││
│ │  □ TNG (1) │                                            │ N. Alaoui              ││
│ │            │                                            │ In / Out               ││
│ │            │              ◀ 1 2 3 ▶                     │ 2026-06-01 / 2026-07-10││
│ │            │                                            │                        ││
│ │            │                                            │ [Open full project]    ││
│ └────────────┴────────────────────────────────────────────┴────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### CitySidebar Interactions

```
State: no selection
┌─ Cities ──────────────────┐
│ Room A1                   │    ← click row → expands
│ ▶ Box B (5 folders)       │    ← shows total folder count
│ ▶ Box C (1 folder)        │
│ Room A2                   │
│ ▶ Box A (7 folders)       │
│ ▶ Box B (1 folder)        │
└───────────────────────────┘

State: Box B expanded, MRK selected (active filter)
┌─ Cities ──────────────────┐
│ Room A1                   │
│ ▼ Box B (5)               │    ← selected box highlighted
│  ● MRK (3)    ← selected  │    ← ● filled circle = selected
│  ○ CSB (2)                │    ← ○ empty circle = not selected
│ ▶ Box C (1)               │
│ Room A2                   │
│ ▶ Box A (7)               │
│ ▶ Box B (1)               │
└───────────────────────────┘
```

- **City click** → sets `?city=MRK` → reload table filtered by city
- **Box click** → sets `?room=A1&box=B` → shows all folders in that box regardless of city
- **Room click** → toggles expand/collapse
- **City dot** = 8px circle filled with city.color; filled circle when active, empty when not

---

## 3. Component Tree

```
Archives/Index.tsx
├── KpiStrip
│   └── KpiChip × 6 (clickable → sets filter)
│
├── ToolbarRow (flex row, items-center)
│   ├── SearchInput (with magnifying glass icon)
│   ├── FilterChips (map of active filters)
│   │   └── FilterChip × N (label + X button)
│   └── ActionButtons
│       ├── RefreshBtn
│       ├── SortBtn (dropdown)
│       ├── GridBtn (→ /archives/grid)
│       ├── ReportsBtn (→ /archives/reports)
│       └── NewBtn (opens drawer)
│
├── 3-Column Layout (grid lg:grid-cols-[240px_1fr_320px])
│   ├── CitySidebar (left panel)
│   │   ├── RoomGroup × N
│   │   │   ├── RoomHeader (expandable)
│   │   │   └── BoxGroup × N
│   │   │       ├── BoxHeader (click → filter by box)
│   │   │       └── CityItem × N (click → filter by city)
│   │   │           └── CityDot + CityCode + Count
│   │
│   ├── TableArea (center)
│   │   ├── ArchiveTable (tanstack/react-table)
│   │   │   ├── SelectCol (checkbox)
│   │   │   ├── ArcCol (ARC# monospace)
│   │   │   ├── CityCol (dot + code, colored)
│   │   │   ├── ProjectCol (truncated)
│   │   │   ├── LocationCol (room/box breadcrumb)
│   │   │   ├── StatusCol (StatusPill)
│   │   │   └── ActionsCol (row menu)
│   │   └── Pagination
│   │
│   └── PreviewPanel (right, sticky)
│       ├── ProjectTitle
│       ├── DossierNumber
│       ├── ClientName
│       ├── CityBadge (colored pill with dot)
│       ├── LocationBreadcrumb
│       ├── Requester
│       ├── InDate / OutDate
│       └── ActionButton
│
├── ArchiveDrawer (create/edit)
├── BulkActionBar
├── ScanModal
├── CheatsheetModal
└── DeleteConfirmModal
```

---

## 4. Backend Contract Changes

### New: `cells` prop on /archives response

```php
// ArchiveController@index
$cells = ArchiveRecord::whereNotNull('room')
    ->with('dossier.city')
    ->get()
    ->groupBy(fn ($r) => $r->room)
    ->map(fn ($byRoom, $roomCode) => [
        'code' => $roomCode,
        'boxes' => $byRoom->groupBy('box')
            ->map(fn ($byBox, $boxCode) => [
                'code' => $boxCode,
                'total' => $byBox->count(),
                'cities' => $byBox->groupBy(fn ($r) => $r->dossier?->city?->code ?? '__none')
                    ->map(fn ($byCity) => [
                        'code' => $byCity->first()->dossier?->city?->code ?? 'N/A',
                        'name' => $byCity->first()->dossier?->city?->name ?? 'Unknown',
                        'color' => $byCity->first()->dossier?->city?->color ?? '#64748B',
                        'count' => $byCity->count(),
                    ])->values()->all(),
            ])->values()->all(),
    ])->values()->all();
```

### New: `city` filter

```php
if ($city = $request->input('city')) {
    $query->whereHas('dossier', fn ($q) => $q->whereHas('city', fn ($cq) => $cq->where('code', $city)));
}
```

### Frontend Types (`types.ts`)

```ts
type CellCity = {
    code: string;
    name: string;
    color: string;
    count: number;
};

type CellBox = {
    code: string;
    total: number;
    cities: CellCity[];
};

type CellRoom = {
    code: string;
    boxes: CellBox[];
};
```

Add to `ArchivesPageProps`:
```ts
cells: CellRoom[];
```

Remove `tree: TreeNode[]` (replaced by cells).

---

## 5. Implementation Order

### Step 1: Backend — cells data + city filter
- Add `city` filter to `ArchiveController@index`
- Add `cells` computed data to response
- Remove `tree` from response (or keep both temporarily)
- Update `ArchiveRecordResource` if needed

### Step 2: Frontend types
- Add `CellCity`, `CellBox`, `CellRoom` to `types.ts`
- Update `ArchivesPageProps` to include `cells`

### Step 3: CitySidebar component
- New component at `features/archives/components/CitySidebar.tsx`
- Recursive expand/collapse for Room > Box > City
- City click → sets `?city=`
- Box click → sets `?room=&box=`
- Active selection highlighting

### Step 4: PreviewPanel rewrite
- Rewrite to show: project title, dossier, client, city badge, location, requester, in/out, button
- Use new `city` field from `ArchiveRecordRow`

### Step 5: ArchiveTable simplification
- Remove requester column (shown in preview)
- Keep: checkbox, ARC#, city dot+code, project, location, status
- Add overdue days to status or due column

### Step 6: Index page reorganization
- Replace `StorageTree` with `CitySidebar`
- Remove `AppCompactTabs` (VIEW_TABS)
- Consolidate toolbar into single row
- Wire city filter through `useArchiveFilters`

### Step 7: Polish
- Delete `mockArchives.ts`
- Empty states for table, sidebar, preview
- Loading skeletons
- Error states

---

## 6. Visual Design Tokens

```
City dot:     8px circle, fill=city.color, ring=1px black/10
City badge:   pill, bg=`${color}20`, text=color, dot+name
City sidebar: ● filled=active, ○ outline=inactive
Location:     font-mono, Room/Box with / separator
Overdue:      text-red-400, (Nd) suffix
Status pill:  existing StatusPill component
```

---

## 7. Edge Cases & States

### Empty sidebar
```
┌─ Cities ────────────────┐
│ No archives stored yet. │
│ Create an archive to    │
│ see storage cells.      │
└─────────────────────────┘
```

### No results for filter
```
Table shows AppEmptyState:
"No archives match these filters. Try adjusting your search or filters."
```

### Preview with no record selected
```
┌─ Preview ───────────────┐
│ Select an archive to    │
│ preview its details.    │
└─────────────────────────┘
```

### City filter + no city in archive
Archives without a linked dossier city show as "—" with no dot. Sidebar groups them under "__none" key.
