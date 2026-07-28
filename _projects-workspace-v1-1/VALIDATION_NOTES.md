# Validation Notes

Before packaging, the generated payload was checked with:

- PHP syntax validation for all modified PHP files.
- TypeScript/TSX syntax transpilation for every generated TypeScript file.
- Static assertions for all eight tabs, shared table use, 10-row pagination, persistent
  column order, current finance relations, real activity, Project Design URL state,
  tenant test coverage, city update validation, and translation-key completeness.
- Payload hash generation and package copy/restore simulation.

The packaging environment does not contain Windows PowerShell or the project's complete
`node_modules`, database, and `.env`, so it cannot truthfully execute the final PowerShell,
Laravel integration tests, focused ESLint, or Vite build here. The installer performs
those checks in the user's actual repository and automatically rolls back on any failure.


## V1.1 re-lock validation

- Expected commit updated to `9557060ab1d224c43993d6a1c6c7a8925749fe40`.
- Projects payload bytes and payload SHA-256 values are unchanged.
- Installer payload-hash verification remains mandatory.
- Exact branch and exact commit guards remain mandatory.
- Intervening commit target-path overlap: none.
