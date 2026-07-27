# ARCHI LBO Drawer Repair

This repair targets the `finance-template-editor` branch inspected on GitHub.

It replaces the shared `AppDrawer` with HeroUI v3's required compound structure:

`Drawer → Drawer.Backdrop → Drawer.Content → Drawer.Dialog`

It also fixes `DrawerField` class merging and repairs the Project create/edit drawer width and grid density.

## Run

```powershell
Set-Location 'D:\ARCHI LBO\LBOSM\LBOCRM'
PowerShell.exe -ExecutionPolicy Bypass -File .\repair-drawers.ps1
```

The installer:

- verifies the branch;
- refuses to overwrite uncommitted target files;
- fetches and verifies the latest remote branch;
- creates a timestamped backup;
- runs a baseline build;
- applies only three source-file changes;
- runs typecheck, lint, build, and `git diff --check`;
- restores the backup automatically if the production build fails or changed-file errors are detected.

## Roll back

```powershell
PowerShell.exe -ExecutionPolicy Bypass -File .\rollback-drawers.ps1
```

## Manual QA

Test these drawers before committing:

- Project create/edit
- Client create/edit
- Finance document and payment
- Task
- Project Design file browser
- Project Design inspector
- Global upload center

Check body scrolling, fixed header/footer, left/right placement, Escape, backdrop close, and select/popover stacking.
