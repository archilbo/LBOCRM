# Archives Frontend — Full Redesign Plan

## 1. Data Model (How data flows)

```
City (id, name, code, color)
  └── Dossier (id, city_id, dossier_number = "MRK007-2026-07", sequence_number, period)
        └── ArchiveRecord (id, dossier_id, archive_number = "ARC-2026-1001", status, room, shelf, box, ...)
              └── ArchiveEvent (type, payload, actor)
```

**Key rule**: A dossier's city comes from `dossier.city` (not from archive). The archive inherits city visibility through `archiveRecord.dossier.city`.

**Frontend consumes `ArchiveRecordRow`** which now includes:
```ts
city: { id, name, code, color } | null  // from dossier.city
```

---

## 2. Page Map & Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/archives` | Archives/Index | Main list + filters + preview panel |
| `/archives/grid` | Archives/Grid | Physical 4×2 room grid view |
| `/archives/cities` | Archives/Cities | Admin CRUD for cities/colors |
| `/archives/reports` | Archives/Reports | Overdue, monthly, lost reports |
| `/archives/{id}` | Archives/Show | Detail page (already exists) |

---

## 3. Wireframes

### 3a. `/archives` — Main list page

```
┌─────────────────────────────────────────────────────────────────────┐
│ Archives                                              [New v] [Grid]│
│                                                                     │
│ ┌─────────┬──────────┬──────────┬──────────┬─────────┬───────────┐ │
│ │ Total 33│Ready 12  │Stored 10 │Out 8     │Overdue 2│Lost 1     │ │
│ └─────────┴──────────┴──────────┴──────────┴─────────┴───────────┘ │
│   ▲ click each = filter the list                                     │
│                                                                     │
│ [All | Out | Overdue | Lost | Empty boxes]    [🔍 Search...] [🧹]  │
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ ☐  ARC#       City│Project           │Loc.     │Status│Due    │ │
│ ├──────────────────────────────────────────────────────────────────┤│
│ │ ☐  ARC-2026-1001 ■ MRK Villa jardin   A1/S02/B  🟢stored  —    │ │
│ │ ☐  ARC-2026-1002 ■ RBT Comm. facade   A1/S01/A  🟡checked_out 3d│ │
│ │ ☐  ARC-2026-1003 ■ CSB Residence      B2/S03/C  🔴overdue  15d │ │
│ │ ...                                                              │ │
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Page 1 of 3  ◀ 1 2 3 ▶                                            │
│                                                                     │
│ ┌─────────────────────────┐ ┌────────────── Preview Panel ────────┐│
│ │     Storage Tree        │ │ ARC-2026-1001                       ││
│ │ ┌ Room A1 (Main) ─────┐│ │ Status: 🟢 Stored                   ││
│ │ │ ▼ Shelf 01          ││ │ Dossier: MRK007-2026-07             ││
│ │ │   ▶ Box A (3/12)    ││ │ City: ■ Marrakech (MRK)             ││
│ │ │   ▶ Box B (5/12)    ││ │ Client: Mohamed Ouknin              ││
│ │ │   ▶ Box C (1/12)    ││ │ Location: A1 / S02 / B              ││
│ │ │ ▼ Shelf 02          ││ │ In: 2026-06-01 / Out: —             ││
│ │ └─────────────────────┘│ │ Requester: —                        ││
│ └─────────────────────────┘ └────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**City chip**: 8px square `<span>` with `background: city.color`, displays `city.code` next to it.

**Overdue days**: shown as `(15d)` suffix on due date, colored red.

**KPI chips**: click any → sets `status` filter + `overdueOnly` for Overdue.

**URL state**: `?city=MRK&status=out&period=2026-07&q=villa&page=1&sort=arc`

---

### 3b. `/archives/grid` — Physical 4×2 grid

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Archives  Physical Grid  "Room A1 - Main"                        │
│                                                                     │
│ [Room A1 - Main] [Room A2 - Storage]   ← room selector tabs        │
│                                                                     │
│ ┌──────────────────┐ ┌──────────────────┐                           │
│ │ Shelf 01         │ │ Shelf 02         │                           │
│ │ ┌──────┐┌──────┐ │ │ ┌──────┐┌──────┐ │                           │
│ │ │Box A ││Box B │ │ │ │Box A ││Box B │ │                           │
│ │ │3/12  ││5/12  │ │ │ │2/12  ││4/12  │ │                           │
│ │ │■■■░░░││■■■■■│ │ │ │■■░░░││■■■■░│ │                           │
│ │ │MRK   ││CSB   │ │ │ │RBT   ││MKN   │ │                           │
│ │ │RBT   ││MRK   │ │ │ │      ││      │ │                           │
│ │ │      ││      │ │ │ │      ││      │ │                           │
│ │ └──────┘└──────┘ │ │ └──────┘└──────┘ │                           │
│ └──────────────────┘ └──────────────────┘                           │
│ ┌──────────────────┐ ┌──────────────────┐                           │
│ │ Shelf 03         │ │ Shelf 04         │                           │
│ │ ┌──────┐┌──────┐ │ │ ┌──────┐┌──────┐ │                           │
│ │ │Box A ││Box B │ │ │ │Box A ││Box B │ │                           │
│ │ │0/12  ││1/12  │ │ │ │6/12  ││3/12  │ │                           │
│ │ │░░░░░░││■░░░░░│ │ │ │■■■■■■││■■■░░░│ │                           │
│ │ │Empty ││AGD   │ │ │ │TNG   ││FES   │ │                           │
│ │ │      ││      │ │ │ │OUJ   ││      │ │                           │
│ │ └──────┘└──────┘ │ │ └──────┘└──────┘ │                           │
│ └──────────────────┘ └──────────────────┘                           │
│                                                                     │
│ █ City legend: ■ MRK #DC2626  ■ CSB #2563EB  ■ RBT #059669  ...    │
└─────────────────────────────────────────────────────────────────────┘
```

**Each box card** shows:
- Box code + fill progress bar
- Folder strips, each with left 3px border = city color
- Folder shows ARC# and city code
- Click folder → navigate to archive detail
- Hover → tooltip with project name + client

---

### 3c. `/archives/cities` — Cities admin

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Archives  Cities  (51 cities)                    [+ Add city]    │
│                                                                     │
│ ┌──────┬──────────────┬────────┬────────┬──────────┬──────────────┐│
│ │ Code │ Name         │ Color  │ Active │ Archives │ Actions      ││
│ ├──────┼──────────────┼────────┼────────┼──────────┼──────────────┤│
│ │ MRK  │ Marrakech    │ ■ #DC26│ 🟢     │ 12       │ ✏️ 🗑️        ││
│ │ CSB  │ Casablanca   │ ■ #2563│ 🟢     │ 8        │ ✏️ 🗑️        ││
│ │ RBT  │ Rabat        │ ■ #0596│ 🟢     │ 3        │ ✏️ 🗑️        ││
│ │ ...  │ ...          │ ...    │ ...    │ ...      │ ...          ││
│ └──────┴──────────────┴────────┴────────┴──────────┴──────────────┘│
│                                                                     │
│ Drawer (create/edit):                                               │
│ ┌───────────────────────────────────────────────┐                   │
│ │ Name: [Marrakech                    ]         │                   │
│ │ Code: [MRK              ] must be unique      │                   │
│ │ Color: [■ #DC2626       ] color picker        │                   │
│ │ Active: ☑                                    │                   │
│ │ [Cancel] [Save]                               │                   │
│ └───────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Delete guard**: city with `dossiers_count > 0` gets disabled delete button with tooltip.

---

### 3d. `/archives/reports` — Reports

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Archives  Reports                                                  │
│                                                                     │
│ ┌──────────────┬────────────────┬──────────────┐                    │
│ │ ⚠ Overdue    │ 📅 Monthly      │ ⚠ Lost       │                    │
│ │ 2             │ 33              │ 1             │                    │
│ │ Avg 12d       │ Last 12 months  │ Missing       │                    │
│ └──────────────┴────────────────┴──────────────┘                    │
│                                                                     │
│ ┌────────────────────┐  ┌────────────────────┐                      │
│ │ Monthly creation   │  │ Overdue archives   │                      │
│ │                    │  │                    │                      │
│ │ 2026-07 ████████ 12│  │ ARC-2026-1031 15d  │                      │
│ │ 2026-06 ██████   8 │  │   Villa jardin     │                      │
│ │ 2026-05 ████     5 │  │ ARC-2026-1032  8d  │                      │
│ │ 2026-04 ███████ 10 │  │   Comm. facade     │                      │
│ │ ...                │  │                    │                      │
│ └────────────────────┘  └────────────────────┘                      │
│                                                                     │
│ Lost register:                                                      │
│ ┌────────────┬──────────────┬──────────────────┬───────────┐       │
│ │ ARC        │ Project      │ Lost reason      │ Date      │       │
│ ├────────────┼──────────────┼──────────────────┼───────────┤       │
│ │ ARC-2026.. │ Residence    │ Missing inventory│ 2026-06-..│       │
│ └────────────┴──────────────┴──────────────────┴───────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3e. `/archives/{id}` — Detail page (already exists, needs city badge)

Add city badge to the existing Show.tsx page:
```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to archives                                                  │
│                                                                     │
│ ARC-2026-1001                [🟢 Stored]  [✏️] [🗑️]                │
│ Villa jardin · MRK007-2026-07 · Mohamed Ouknin (AB123456)           │
│                                                                     │
│ City: ■ Marrakech (MRK)    ← NEW city badge                         │
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ Location: A1 / S02 / B   │  In: 2026-06-01 │  Requester: —      ││
│ │                          │  Out: —          │                     ││
│ │                          │  Due: —          │                     ││
│ ├──────────────────────────────────────────────────────────────────┤│
│ │ Timeline: created → stored ✓                                     ││
│ └──────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3f. Create flow — `/archives/new` side sheet

```
┌─── Archive Drawer ─────────────────────────────────────────────────┐
│ Create archive                                                     │
│                                                                    │
│ ┌─── Client & Project ───────────────────────────────────────────┐│
│ │ Client:        [Mohamed Ouknin · CL-DEMO-001      ▾]           ││
│ │ Project:       [MRK007-2026-07 - Villa jardin     ▾]           ││
│ │                                 City shown in dossier label     ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                    │
│ ┌─── Physical Location ──────────────────────────────────────────┐│
│ │ Room:  [A1 - Main Archive Room               ▾]                ││
│ │ Shelf: [S02                                   ▾]                ││
│ │ Box:   [B                                      ▾]               ││
│ │ Folder: [________] optional                                    ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                    │
│ ┌─── Movement ───────────────────────────────────────────────────┐│
│ │ In date:  [2026-07-14 ☐]  Out date: [________ ☐]              ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                    │
│ Requester: [_________________________]                             │
│ Notes:     [_________________________]                             │
│                                                                    │
│ [Cancel]                                      [Save → ARC-2026-..]│
└────────────────────────────────────────────────────────────────────┘
```

**Key**: City is NOT in the archive form — it's inherited from the selected dossier. The dossier label already shows city code + number.

---

## 4. Component Architecture

```
Archives/Index.tsx
├── KpiStrip (clickable chips → sets filter)
├── ViewTabs (All, Out, Overdue, Lost, Empty boxes)
├── SearchBar (debounced → ?q=)
├── FilterChips (active filters with × to remove)
├── ArchiveTable  (tanstack table)
│   ├── CityDot (8px colored square + code text)
│   ├── StatusPill (colored status badge)
│   ├── LocationBreadcrumbs (Room/Shelf/Box)
│   └── RowMenu (checkout, return, edit, delete)
├── StorageTree (room → shelf → box with fill%)
├── PreviewPanel (right side detail)
├── Pagination
└── BulkActionBar (checkout, return, move)

Archives/Grid.tsx
├── RoomTabs (selector)
├── ShelfGrid (4 columns per row)
│   └── BoxCard
│       ├── FillBar (capacity %)
│       └── FolderStrip (colored by city, clickable)
└── CityLegend (color → code map)

Archives/Cities.tsx
├── CityTable
│   └── CityRow (code, name, color swatch, active, count, actions)
├── CityDrawer (create/edit form with color picker)
└── DeleteConfirmModal

Archives/Reports.tsx
├── KpiCards (overdue, monthly, lost)
├── MonthlyBarChart
├── OverdueList
└── LostRegister
```

---

## 5. URL State Contract

All filters live in URL search params (Inertia `filters` prop → `useArchiveFilters`):

| Param | Example | Source |
|-------|---------|--------|
| `q` | `villa` | Search input |
| `city` | `MRK` | City filter (multi: `MRK+CSB`) |
| `status` | `checked_out` | KPI click / filter drawer |
| `period` | `2026-07` | Month picker |
| `view` | `all`, `out`, `overdue`, `lost`, `empty_boxes` | View tabs |
| `room` | `A1` | Storage tree |
| `shelf` | `S02` | Storage tree |
| `box` | `B` | Storage tree |
| `requesterId` | `1` | Filter drawer |
| `dueFrom` / `dueTo` | `2026-07-01` | Filter drawer |
| `overdueOnly` | `1` | Overdue KPI click |
| `sort` | `archive_number:asc` | Sort dropdown |
| `page` | `2` | Pagination |
| `perPage` | `50` | Per-page select |
| `viewMode` | `list`, `map` | View toggle |

---

## 6. Implementation Order

1. **Backend**: Add `cities` prop to `ArchiveController@index` for city filter options
2. **Table**: City column (already done), overdue days (done), dense mode
3. **KPI strip**: Already clickable — verify mapping works
4. **Filter drawer**: Add city multi-select + period picker
5. **ArchiveDrawer**: Already works, city is inherited from dossier
6. **Grid page**: Already built, verify cities show correctly
7. **Cities admin**: Already built, verify CRUD works
8. **Reports**: Already built, verify data flows
9. **Detail page**: Add city badge to Show.tsx
10. **Polish**: Empty states, loading skeletons, error states

---

## 7. Key Visual Patterns

**City color chip**: `<span class="h-2.5 w-2.5 rounded-sm" style="background:{color}">` + code text
- Table row: small dot + `MRK`
- Preview/badge: pill with dot + `Marrakech`
- Grid: 3px left border on folder strip

**Status pill**: Already exists as `StatusPill` component
- `ready_to_archive` → gray
- `stored` → green
- `checked_out` → amber
- `returned` → blue
- `lost` → red
- `overdue` → red with alert icon

**Overdue display**: `(15d)` suffix in red, red border on card

**Location breadcrumb**: `A1 / S02 / B` with `/` separators
