We are working on ARCHI LBO OS / LBOCRM.

Project path:
D:\ARCHI LBO\LBOSM\LBOCRM

Main goal:
Rebuild/improve the frontend architecture and Projects UI using a modern SaaS design system inspired by the provided references. The AI cannot read images, so follow this written analysis.

Do not rewrite backend.
Do not change routes/controllers/models/database.
Do not use fake data.
Do not break existing Inertia props.
Do not break chat realtime.
Work in phases, not all project at once.
Use shared components, not page-by-page handmade UI.

TECH TARGET:
- Laravel + Inertia + React TypeScript.
- Tailwind as the main styling system.
- HeroUI v3 components where useful: Button, Input, Table, Tabs, Modal, Drawer, Popover, Tooltip, Chip, Avatar, Dropdown.
- Minimal custom CSS only for base app height, scrollbar helper, and theme tokens if needed.
- No big manual CSS files.
- Centralized theme/config so future style edits happen in one place.

DESIGN INSPIRATION ANALYSIS

Reference 1: Untitled UI Customers page
Main ideas:
- Clean SaaS workspace with left sidebar, page title, tabs, KPI cards, filter chips, search, and table.
- Page header is simple: title on left, actions on right.
- Tabs under title: Overview, Table, List view, Segment, Custom.
- KPI cards are compact, white/elevated, 3 per row.
- Table has checkboxes, company identity, status chips, avatar stacks, usage progress bars, and row actions.
- This should inspire our Projects page:
  - Header: Projects
  - Tabs: Overview, Workspace, Table, Board, Timeline, Reports
  - KPI cards: Total projects, Active, Blocked, Missing documents, Finance remaining
  - Filter chips: All, Active, Contract, Documents, Finance, Archive
  - Search and action buttons
  - Table/list uses real project data only.

Reference 2: Relate/Microdose Tasks report
Main ideas:
- Sidebar is compact and product-like.
- Page has breadcrumb, title, subtitle, top actions.
- Dashboard cards combine metrics and mini charts.
- Under metrics there are view tabs: Spreadsheet, Board, Calendar, Timeline.
- Board columns are compact, with small task cards.
- For our Projects:
  - Add project status overview cards.
  - Add view switcher: Table, Board, Timeline, Reports.
  - Board should group by workflow step/status.
  - Cards should be compact with badges, due dates, assigned user, missing docs/finance indicators.

Reference 3: Timeline/Gantt page
Main ideas:
- Timeline is not a normal table.
- Top controls: Day/Week/Month, date range, show done toggle, sort, filter.
- Horizontal date grid with project/task bars.
- Bars have colors, avatars, and status marks.
- For our Projects:
  - Timeline view should show projects by workflow dates/stages.
  - Use real dates if available; otherwise use created/updated/project step dates.
  - No fake timeline items.
  - If data is missing, show empty state explaining timeline needs dates.

Reference 4: Deal/detail workspace
Main ideas:
- Detail page has two-zone layout:
  - left activity/sidebar column
  - main detail workspace with tabs
- Tabs: Activity, Details, Position, Documents, Notes, Tasks, Emails, Calls.
- Main content shows upcoming tasks as clean cards.
- For our project detail drawer/page:
  - selected project panel should have tabs:
    Overview, Workflow, Documents, Finance, Tasks, Activity
  - Show project identity, client, location, status, workflow readiness.
  - Show upcoming tasks and missing documents.
  - Keep actions top-right: Message client, Upload document, Create contract, Finance.

Reference 5: Lead preview drawer
Main ideas:
- Large side drawer preview, not full page.
- Background page is dimmed.
- Drawer has title, identity card, quick actions, status pipeline, activity, notes.
- For our project:
  - Clicking a project row should open a Project Preview drawer.
  - Drawer should include:
    project title/code/client
    quick actions
    status pipeline chips
    key details
    upcoming activity
    notes/activity
    button “View full project”
  - Do not navigate away unless user clicks full details.

Reference 6/7: ChartMogul reports
Main ideas:
- Minimal top nav, strong content hierarchy, left report subnav, chart area, data table.
- Very clean typography and spacing.
- Black text/lines in reference, but our app stays dark/gold.
- For our reports:
  - Projects reports should have left mini report nav:
    Overview, Workflow, Documents, Finance, Delays
  - Main area can show charts/bars/tables.
  - Keep visual noise low.

PROJECTS UI TARGET

Projects should become a modern “Project Workspace” with these views:

1. Overview
- Header:
  Projects
  subtitle: Track architecture files from client request to authorization, closure, archive, and finance.
  actions: New project, Import/export if existing, filters.
- KPI cards:
  Total projects
  Active
  Blocked
  Missing documents
  Finance remaining
  Completed/archived
- Insight panels:
  Workflow distribution
  Attention needed
  Recent activity
  Upcoming deadlines
- Compact and useful, not huge empty cards.

2. Workspace/Table
- Modern SaaS table like reference.
- Toolbar:
  Search
  Update
  Filter
  Sort
  New project
- Columns:
  checkbox
  Project
  Client
  Location
  Step
  Readiness/progress
  Missing docs
  Finance remaining
  Status
  Updated
  Actions
- Row details:
  project icon/color
  project code
  client small text
  step badge
  progress mini bar
  status pill
  kebab actions
- Clicking row opens preview drawer.

3. Board
- Columns by workflow step/status.
- Compact project cards.
- Card:
  project name/code
  client
  step/status
  missing docs count
  finance due/remaining
  readiness
  assigned/owner avatar if exists
- Empty column state small.

4. Timeline
- Week/month toggle.
- Horizontal timeline for project deadlines or workflow stages.
- If no enough dates, show clear empty state.

5. Reports
- Workflow distribution.
- Missing documents by step.
- Finance exposure.
- Blocked/overdue projects.
- Simple charts/bars, not fake data.

6. Project Preview Drawer
- Opens from row/card.
- Right side drawer 420-520px.
- Header with project name/code/status.
- Quick actions.
- Details grid.
- Workflow pipeline.
- Documents summary.
- Finance summary.
- Tasks/activity.
- View full project button.
MORE INSPIRATION ANALYSIS FOR ARCHI LBO OS FRONTEND

The AI cannot read images well, so use this written analysis.

Reference A: Settings workspace
Key ideas:
- Very clean app shell with left vertical icon rail plus main sidebar.
- Topbar has search, notification, avatar.
- Settings page uses two-level navigation:
  - global sidebar on far left
  - settings category sidebar inside content
  - details panel on right
- Form controls are clean and minimal:
  - checkboxes
  - toggles
  - select pills
  - section dividers
- Typography is small and calm.
ARCHI usage:
- Settings/Users/Permissions pages should not be huge tables only.
- Use settings workspace pattern:
  left subnav + right settings forms.
- Finance settings should use this layout.
- Notification preferences should use this layout.

Reference B: Finance dashboard
Key ideas:
- Soft SaaS dashboard with sidebar, topbar, balance card, quick links, charts, right card panel, compact table.
- Quick action cards are square and simple.
- Dashboard uses cards but not too heavy.
- Charts are soft with pastel accents.
ARCHI usage:
- Finance overview should be dashboard-like:
  Total invoiced, paid, remaining, overdue.
  Quick actions: New invoice, Register payment, New quote, Export.
  Chart panels: monthly collected, remaining balance.
  Table: overdue invoices.
  Right panel: finance status / recent payments.

Reference C: Chat workspace
Key ideas:
- Three-pane chat:
  left conversations
  center messages
  right shared files/details
- Soft bubbles and compact list.
- Left vertical icon rail.
- User availability/status visible.
ARCHI usage:
- Inbox should keep three-pane desktop.
- Mobile should be one pane at a time.
- Right panel should summarize members, shared images, linked project/client, archive action.
- Composer always visible.
- No bottom nav covering composer.

Reference D: Contract/payment step wizard
Key ideas:
- Horizontal progress stepper at top.
- Centered form column.
- Fields are minimal and large enough.
- Upload zone has dashed border.
- Primary action bottom full width.
ARCHI usage:
- Contract creation, invoice creation, document generation should use wizard/stepper pattern.
- Steps:
  Project/client
  Calculation/details
  Documents/files
  Review/sign
  Complete
- Use shared StepWizard component.

Reference E: Tasks board
Key ideas:
- Left rail + sidebar.
- Page title with tabs.
- Kanban board with columns.
- Cards have badges, priority, assignees, date, footer metadata.
- Columns have count badges and plus/menu actions.
ARCHI usage:
- Tasks and Projects Board should use similar structure:
  tabs: Overview, Board, List, Table, Timeline.
  columns by status.
  compact cards.
  color-coded badges.

Reference F: LunarDesk grouped list table
Key ideas:
- Tasks page with sidebar, topbar, view switcher.
- Grouped sections by status:
  To Do, In Progress, In Review, Completed.
- Each group is collapsible.
- Each group has table rows.
- View all button.
- Toolbar: search, filter, list/kanban/calendar, add.
ARCHI usage:
- Tasks List view should use grouped sections exactly.
- Projects can also group by workflow step.
- This is better than one long flat table for operational work.

Reference G: Calendar monthly view
Key ideas:
- Card shell with sidebar.
- Calendar has top controls: search, Today, previous/next, view select, Add event.
- Calendar cells contain colored event pills.
- Left sidebar has nav/team list.
ARCHI usage:
- Calendar page should be full modern month grid.
- Event colors by type:
  task, meeting, deadline, payment, document, authorization.
- On mobile, calendar becomes agenda list.

Reference H: Schedule/day grid
Key ideas:
- Staff/resource columns across top.
- Time grid left.
- Cards positioned by time.
- Hover popover shows overlapping appointments.
ARCHI usage:
- Later workload/schedule can use resource timeline.
- Do not implement now unless backend supports it.
- Use as inspiration for future workload calendar.

Reference I: Roles & permissions simple table
Key ideas:
- Simple admin table, very clean.
- Search top.
- Role dropdown in table cells.
- Access chips for folders/assistants.
ARCHI usage:
- Users page should become clean admin permissions table.
- Role change dropdown must work.
- Permission chips compact.
- Selected user side panel optional.

Reference J: Large permissions matrix
Key ideas:
- Permission matrix with categories grouped vertically.
- Roles across columns.
- Checkbox cells.
- Sticky left permission names.
- Active selected role column highlighted.
ARCHI usage:
- Future permissions page can use matrix.
- Do not build matrix now unless backend permission data exists.
- Use as design reference for admin capability control.

GLOBAL UI PRINCIPLES FROM ALL REFERENCES

FRONTEND ARCHITECTURE PHASES

PHASE 0: Backup and Audit
- Backup resources folder first.
- Audit package.json, Tailwind config, resources/js/app.tsx, layout, pages, shared components.
- Report only concise summary.
- Do not edit yet except backup.

PHASE 1: Design Foundation
Create/clean:
- Tailwind theme tokens.
- HeroUIProvider.
- AppProviders.
- shared cn() helper.
- config/statuses.ts.
- config/navigation.ts.
- Minimal global CSS only.

PHASE 2: App Shell
Create stable shared layout:
- AppShell
- Sidebar
- Topbar
- BottomNav
- PageHeader
Rules:
- fixed viewport
- no body scroll
- content scrolls internally
- sidebar collapse works
- mobile bottom nav does not cover content

PHASE 3: Shared Components
Create reusable components:
- AppButton
- AppInput
- AppSelect
- AppBadge/StatusPill
- AppCard
- AppTabs
- AppDrawer
- AppModal
- AppDropdown
- AppTooltip
- DataTable
- DataTableToolbar
- RowActions
- AvatarPill
- EmptyState
- MetricCard

Do not style each page manually.

PHASE 4: Projects Pilot
Only migrate Projects page first.
Do not touch all pages yet.
Build:
- Projects Overview
- Projects Table/Workspace
- Project Preview Drawer
- Basic Board view if existing data supports it
Use real data from existing Inertia props.

PHASE 5: Validate Projects
Run:
php artisan optimize:clear
npm run build

Manual QA:
- Projects loads
- actions still work
- drawer opens
- filters/search work
- responsive desktop/tablet/mobile
- no console errors

PHASE 6: Migrate Other Pages
After Projects is accepted, apply shared system to:
1. Clients
2. Documents
3. Contracts
4. Finance
5. Tasks
6. Inbox last, because realtime is sensitive

RULES FOR FAST WORK / LOW TOKENS

Very important:
- Do not output huge explanations.
- Before editing, say only: “I will inspect these files: …”
- After editing, report only changed files and test result.
- Do not paste full files in chat unless requested.
- Do not repeat the full plan every response.
- Work one phase at a time.
- Do not read the whole project if only Projects page is being changed.
- Do not create new abstractions unless used immediately.
- Do not install packages without checking package.json first.
- Do not change backend unless user explicitly asks.
- If a route/action does not exist, do not fake it.
- If data does not exist, show empty state.
- If build fails, fix build before continuing.
- Prefer shared components over duplicated page markup.
- Use HeroUI components instead of handmade modal/dropdown/table/tooltip where practical.
- Use Tailwind config/classes, not large manual CSS.
- Keep code TypeScript-safe.

FIRST TASK TO DO NOW:
Start with Phase 0 and Phase 1 only.

Commands:
cd "D:\ARCHI LBO\LBOSM\LBOCRM"

Backup:
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item "resources" "resources_BACKUP_$stamp" -Recurse

Audit:
- package.json
- tailwind config
- resources/js/app.tsx
- current AppShell/sidebar/topbar files
- resources/js/pages/Projects/Index.tsx
- project-related components

Then report:
- current frontend structure
- whether HeroUI is installed
- Tailwind status
- exact files that should be changed in Phase 1
- do not migrate pages yet

Acceptance for first response:
- concise audit
- no giant code paste
- no backend changes

IMPORTANT ABOUT OLD FRONTEND

The old/current `resources` frontend must be used as a functional reference only.

Use old frontend to understand:
- what pages exist
- what props/data each page receives
- what buttons/actions exist
- what routes are used
- what modals/drawers/forms exist
- what filters/search/sort logic exists
- what backend endpoints are called
- what permissions/role checks exist
- what translations/labels are currently used
- what workflows each page supports

Do NOT copy the old UI style.
Do NOT keep the old layout if it is ugly/broken.
Do NOT duplicate old page-specific styling.
Do NOT rebuild the same bad sidebar/tables/cards.
Do NOT remove existing functionality.

The new frontend should keep the same functionality and data flow, but with a new shared design system:
- shared layout
- shared sidebar/topbar
- shared DataTable
- shared drawers/modals
- shared form fields
- shared status badges
- shared page headers/toolbars
- shared responsive behavior

Migration rule:
For each page, first inspect the old page and write a tiny map:

Page: Projects
Old data props:
- ...
Old actions:
- ...
Old routes/fetch calls:
- ...
Old modals/drawers:
- ...
Must preserve:
- ...

Then rebuild the page using new shared components and modern SaaS layout.

Never guess functionality. If old page has an action, preserve it. If old page does not have an action, do not invent it.

FUNCTIONALITY MUST WORK, NOT STATIC UI

Every visible UI control must either work or be intentionally hidden/disabled.

For every page migrated, verify:

Search:
- Search input must filter real page data or call the existing backend search/filter route.
- Do not add a fake search box that does nothing.
- Keep current search behavior from old frontend if it exists.

Filters:
- Filter chips/dropdowns must update real data.
- Use existing filter state/routes/query params where available.
- Active filters must show visually.
- Reset filters must work.
- Do not show filter options that are not supported by real data.

Sort:
- Sort controls must sort real data client-side or use existing backend sort query.
- Sort direction must be visible if possible.
- Do not add fake Sort buttons.

Buttons:
- Primary action buttons must call existing actions:
  - New project
  - New client
  - Upload document
  - New contract
  - Create task
  - New invoice/payment
- If the old frontend opened a drawer/modal, new button should open the new drawer/modal.
- If the old frontend used router.post/put/delete/fetch, preserve that logic.

Row actions:
- Kebab/menu actions must work:
  - Open/View
  - Edit
  - Delete
  - Archive/Restore
  - Download
  - Generate
  - Mark verified/paid/signed
- Only show actions that exist for that entity.
- Destructive actions must use confirm dialog.

Tabs:
- Tabs must switch real views/state.
- If a tab has no real data yet, show a useful empty state, not fake rows.

Drawers/modals:
- Forms must submit to existing backend routes.
- Validation errors must display.
- Loading/submitting state must display.
- Success/error toasts must still work.

Tables:
- Row click/open must work if old frontend had it.
- Checkboxes must select rows if bulk actions exist.
- If no bulk actions exist, do not show bulk selection unless it is planned and disabled clearly.

Pagination:
- Existing pagination must still work.
- Do not remove pagination.
- Mobile/card view must also support pagination.

Realtime:
- Inbox realtime send/typing must keep working.
- Do not touch Echo/Reverb logic unless explicitly fixing it.

Rule:
Do not create decorative/static buttons just to match screenshots. If an action cannot work with existing backend/frontend logic, hide it or show it disabled with a tooltip explaining why.