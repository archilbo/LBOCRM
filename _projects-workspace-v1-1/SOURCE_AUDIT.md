# Projects Workspace — Source Audit

Audited source snapshot:

```text
9557060ab1d224c43993d6a1c6c7a8925749fe40
```

## Index findings

- `AppWorkspaceTable` was only used as an outer shell while the page duplicated a raw
  HTML table internally.
- Page size was 15 rather than the current 10-row list pattern.
- Column order was not persisted.
- Numeric counts were sorted as strings.
- The selected page could exceed the filtered result page count.
- View appeared both as a direct action and in the overflow menu.
- The overflow implementation used old component APIs and could be clipped.
- `monthlyProjects` was returned by the backend but not used by the page.
- Current finance data was exposed under a legacy `financeRecordsCount` name.
- Labels were mixed French and English.

## Show findings

- Eight tab labels existed, but Activity was a frontend empty state without a backend
  activity dataset.
- Finance displayed legacy records rather than current `financeDocuments` and payments.
- Project data and action logic were distributed across a large page with inconsistent
  empty states and hard-coded text.
- The Project Design URL/editor behavior had to be preserved exactly.

## Backend findings

- The index counted the legacy finance relation and could fall back to per-row queries.
- The Show controller did not supply current finance documents, payments, archive data, or
  a consolidated activity stream for every tab.
- `UpdateDossierRequest` did not validate `city_id`, so changing a project city from the
  drawer did not reliably persist.
- Mutations had no validated tab-preserving return path.

## Repair strategy

The repair replaces only the focused controller/resource/request and Projects frontend
files, adds focused regression tests, and keeps route/policy boundaries unchanged. It does
not modify database migrations, models, permissions, Project Design controllers, Finance
controllers, Contract controllers, or Archive controllers.


## Commit compatibility verification

The package was originally audited at `4284dbf343e10fda511a81e565ba0d8fac03dfe1`. Commit `9557060ab1d224c43993d6a1c6c7a8925749fe40` has that
commit as its direct parent and changes only:

```text
app/Http/Controllers/IntermediaryController.php
resources/js/features/intermediaries/types.ts
resources/js/locales/en.ts
resources/js/locales/fr/intermediaries.ts
resources/js/pages/Intermediaries/Show.tsx
tests/Feature/IntermediaryShowWorkspaceTest.php
```

These paths do not overlap any Projects workspace target path. The V1.1 installer is
therefore locked to `9557060ab1d224c43993d6a1c6c7a8925749fe40` while preserving the same Projects payload hashes.
