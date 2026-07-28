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
