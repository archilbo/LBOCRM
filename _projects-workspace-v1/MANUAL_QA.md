# Projects Workspace V1 — Manual QA

After the installer reports success:

```powershell
php artisan optimize:clear
npm run dev
```

Hard-refresh with `Ctrl + Shift + R`.

## 1. Projects index

Open:

```text
/dossiers
```

Verify:

- KPI cards match tenant-scoped backend data.
- Monthly project activity displays real data.
- Search matches project, dossier number, client, CIN, city, province, and commune.
- Workflow filtering works.
- Icon headers sort text, dates, document counts, and finance counts correctly.
- Dragged column order survives refresh.
- Exactly 10 rows appear per page.
- Previous/Next icon buttons clamp correctly after search/filter changes.
- New Project, View, Edit, Documents, Finance, Archives, and Delete actions work.
- View is not duplicated in the overflow menu.
- The overflow menu is not clipped and supports keyboard navigation.
- Mobile rows remain usable and actions do not trigger the row accidentally.
- The Location view still renders province/commune groups.

Storage key:

```text
archilbo.projects.table.columns.v1
```

## 2. Create and edit

- Create a project and confirm the backend saves the selected city.
- Edit a project, change city and notes, and confirm they persist.
- Validation errors remain inside the drawer.
- Delete confirmation targets the correct project.

## 3. Project Show tabs

Open a project containing documents, a contract, finance data, payments, archive data, and
workflow history.

Test direct URLs:

```text
/dossiers/{id}?tab=overview
/dossiers/{id}?tab=workflow
/dossiers/{id}?tab=project-design
/dossiers/{id}?tab=documents
/dossiers/{id}?tab=contract
/dossiers/{id}?tab=finance
/dossiers/{id}?tab=notes
/dossiers/{id}?tab=activity
```

Verify every tab:

- **Overview:** project, client, property, archive, status, and workflow data are real.
- **Workflow:** progress and requirement actions still work.
- **Project Design:** file explorer, editor, zoom/pan, remarks, URL state, and fullscreen
  behavior remain unchanged.
- **Documents:** backend documents and contract downloads appear; upload works.
- **Contract:** current contract values appear; DOCX/PDF generation, signing, download, and
  Contracts navigation work.
- **Finance:** current finance documents and payments appear; Total/Paid/Remaining agree
  with invoice ledgers.
- **Notes:** real notes appear and Edit opens the project drawer.
- **Activity:** project/workflow/document/contract/finance/payment/archive events appear and
  pagination works.

## 4. URL and navigation behavior

- Selecting a tab updates `?tab=` without a full reload.
- Refresh preserves the selected tab.
- Browser Back/Forward changes the selected tab.
- Invalid tab values fall back safely.
- Project Design query keys `mode`, `file`, `version`, `asset`, `page`, `remark`, and
  `inspector` remain functional.

## 5. Console and network

There should be no:

```text
ReferenceError
Maximum update depth exceeded
nested button warning
hydration error
failed Inertia prop access
404 from a visible tab action
```
