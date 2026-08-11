# Roles And Permissions

## Authorization Model

ARCHI LBO OS uses `config/archilbo_permissions.php` as its single permission catalogue.

Every protected operation has three layers: React hides unavailable controls; `permission.route` protects mapped routes; policies check the exact action and company/branch scope. Hiding a button is not the security boundary.

## Standard Roles

Roles are seeded by `RolesAndPermissionsSeeder` and configured in `config/archilbo_roles.php`.

- Super Admin: full system access. Only a Super Admin can create or assign this role.
- Finance Admin: full Finance access.
- Manager: operational access and Finance read-only access.
- Operations Manager: operational modules without Finance visibility.
- Staff: limited operational access.
- Viewer: read-only access.

`admin` and `super_admin` are protected system roles and cannot be suspended through User Management.

## Custom User Access

The User Management matrix saves direct Spatie permissions for a user through `PermissionRegistry`. It is not a frontend-only setting.

- View grants read permissions.
- Edit grants read, create, and update permissions.
- Delete grants read, edit, and delete permissions.

The stored matrix (`users.module_permissions`) is **authoritative at runtime**: `PermissionRegistry::effectiveNames()` and `allows()` resolve custom accounts from the matrix alone — inherited base-role permissions (e.g. the Manager role's Finance read) never leak into a custom account, and protected roles (`admin`, `super_admin`) are never narrowed by a stale matrix. The matrix levels are cumulative and match the access levels rendered by the editor, so the editor, the sidebar, and route enforcement always agree.

Changing a user to a standard role clears direct permissions so prior custom access cannot leak into the new role.

The editor receives its module list and role baselines from the backend permission catalogue. Requests accept only configured module keys and the `none` or `all` scope values, preventing stale frontend definitions or unsupported scopes from being stored.

## Tenant Scope

Policies use `CompanyContext` to constrain records to the signed-in user's company and branch. Knowing another tenant's ID does not grant access to its records.

User-management mutations use the same ownership check. A branch-scoped administrator cannot modify a user from another branch, even when the account ID is known.

## Account Lifecycle And Recovery

New users are created through an email invitation and stay pending until they choose a password through the expiring acceptance link. Invitation tokens are hashed at rest and cleared once used.

User status is explicit: pending invitation, accepted, or blocked. Online/offline is a separate presence signal.

Passwords are never recoverable or visible to administrators. Only `admin` and `super_admin` accounts can send a password-reset link for another account, and only a Super Admin may reset a Super Admin account. These actions are tenant-scoped, rate-limited, and audited.

## Current Scope Boundary

The current matrix grants module actions within a company and branch. An `assigned dossiers only` scope requires a dedicated user-to-dossier assignment model and is deliberately not claimed as implemented.

## Operations Reporting Workspace

Charge de travail and Rapport d'activité now live as permission-gated tabs inside `/admin/users`.

- `users.view` grants the Utilisateurs and Sécurité et audit tabs.
- `reports.workload.view` grants only Charge de travail.
- `reports.operations.view` grants only Rapport d'activité.
- A user with a reporting permission but without `users.view` cannot receive user records or audit logs from the Users controller.
- Legacy `/workload` and `/operations/reports` URLs verify their original permission first, then redirect to the corresponding Users tab.

## Collaboration Modules

Dashboard, global search, project design, tasks, calendar, inbox, notifications, invitations, and QA routes are mapped through `permission.route`. The combined Users workspace performs its explicit multi-permission check in `AdminUserController`; its mutation and audit routes remain individually route-protected. Controllers and policies enforce the exact operation rather than trusting a hidden frontend control.

Tasks and calendar events currently carry tenant scope through their `created_by` user because their current schema does not yet store `company_id` and `branch_id` directly. Queries, policies, related-record validation, participants, reminders, workload, and operations reporting all resolve that creator scope before returning or mutating a record. Cross-company links and user IDs are rejected.

`inbox.view` permits reading authorised conversations; `inbox.manage` is required to create conversations, send messages, manage participants, or change a conversation. This keeps read-only access genuinely read-only.
