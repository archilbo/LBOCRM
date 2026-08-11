
MASTER IMPLEMENTATION PROMPT — BUILD “PROJECT DESIGN” INSIDE THE EXISTING PROJECT SHOW PAGE

PROJECT

Name:
ARCHI LBO OS / LBOCRM

Local path:
D:\ARCHI LBO\LBOSM\LBOCRM

Stack:

- Laravel 13
- Inertia
- React TypeScript
- Tailwind CSS
- HeroUI v3 and existing shared App components
- MySQL
- Laravel Reverb
- Laravel Echo
- Database queues
- Private Laravel storage

Act as:

- Senior Laravel architect
- Senior React/TypeScript engineer
- Senior database engineer
- Senior security engineer
- Senior SaaS UI/UX designer
- Senior performance engineer
- Senior QA engineer

Do not only create a visual mockup.

Implement the real feature with:

- database
- backend services
- authorization
- API resources
- frontend
- file upload
- working actions
- tests
- build verification
- security checks
- performance safeguards

==================================================
MAIN PRODUCT DECISION
=====================

“Project Design” must be a new tab inside the existing Project Show page.

It is NOT:

- a sidebar module
- a standalone page
- a duplicated project page
- another generic Documents module

Current project tabs:

Overview
Workflow
Documents
Contract
Finance
Authorizations
Notes
Activity

Required final tab order:

Overview
Workflow
Project Design
Documents
Contract
Finance
Authorizations
Notes
Activity

Keep the user inside the same project workspace.

The existing:

- project title
- project status
- client information
- workflow header
- main project tabs
- project context

must remain visible and reused.

Do not duplicate the Project Show header inside Project Design.

Suggested tab key:

project-design

Suggested URL behavior:

/projects/{project}?tab=project-design

Deep links must support:

/projects/{project}?tab=project-design&mode=files
/projects/{project}?tab=project-design&file=38
/projects/{project}?tab=project-design&file=38&version=3
/projects/{project}?tab=project-design&file=38&version=3&remark=24
/projects/{project}?tab=project-design&mode=reviews
/projects/{project}?tab=project-design&mode=remarks

The selected tab and important workspace state must survive:

- refresh
- browser Back
- browser Forward
- notification links
- task links
- copied URLs

Do not create a new top-level page for these routes.

==================================================
FEATURE PURPOSE
===============

Project Design is a professional design-file review and revision workspace.

It allows workers, architects, engineers, managers, and administrators to:

- upload native project design files
- upload PDF/image/IFC review files
- organize files by discipline and folder
- create immutable revisions
- preview supported files
- review drawings
- add visual annotations
- create remarks
- assign corrections
- comment and mention users
- upload corrected revisions
- compare revisions
- verify corrections
- approve exact versions
- create tasks from remarks
- preserve full audit history

Examples of files:

Native/source:

- DWG
- DXF
- PLN
- PLA
- RVT
- SKP

Reviewable:

- PDF
- IFC
- PNG
- JPG
- JPEG
- WebP

Supporting:

- DOCX
- XLSX
- CSV
- ZIP
- technical reports
- calculation files
- reference images
- renders

Important:

ARCHI LBO OS is not a replacement for AutoCAD, Archicad, Revit, or SketchUp.

Native files are edited in desktop applications.

Project Design provides:

- secure storage
- revision history
- browser review
- annotations
- remarks
- collaboration
- approvals
- traceability

==================================================
DO NOT CONFUSE WITH DOCUMENTS
=============================

Existing Documents manages administrative and workflow documents such as:

- CIN
- property certificates
- contracts
- authorization documents
- permits
- certificates
- archive documents

Project Design manages production/design files such as:

- architectural plans
- structural plans
- CAD files
- BIM models
- execution drawings
- details
- renders
- technical revisions

Do not merge both domains into one table or one generic file list.

Shared storage and upload infrastructure may be reused, but domain records must remain separate.

==================================================
MANDATORY WORKING RULES
=======================

1. Inspect the existing code before changing anything.
2. Do not assume filenames or architecture.
3. Do not rewrite unrelated modules.
4. Do not create fake buttons.
5. Every displayed action must work.
6. Do not create static filters.
7. Search, sorting, pagination, upload, download, archive, review, remarks, and approval must call real backend operations.
8. Reuse existing shared components.
9. Do not create one giant ProjectDesign.tsx component.
10. Do not create large manual CSS files.
11. Use Tailwind utilities, theme tokens, and shared variants.
12. Keep the existing dark/gold theme.
13. Improve layout and usability without redesigning the entire app.
14. Do not hardcode translated text inside many components.
15. Add translation keys using the current i18n system.
16. Do not expose private storage paths.
17. Do not allow cross-company access.
18. Do not overwrite submitted or approved revisions.
19. Approval applies to an exact version.
20. Annotations apply to an exact version.
21. Worker “Addressed” is not reviewer “Verified”.
22. Do not load heavy viewer libraries when the Project Design tab is closed.
23. Do not place the complete Project Design dataset in the initial Project Show Inertia payload.
24. Use lazy API requests, pagination, and dynamic imports.
25. Run tests and builds before reporting success.

==================================================
LIBRARIES
=========

Before installing:

- inspect package.json
- inspect package-lock.json
- skip packages already installed
- verify compatibility with the current React/Vite stack
- install packages only when their implementation phase begins

MVP libraries:

npm install @tanstack/react-query react-hook-form zod @hookform/resolvers @uppy/core @uppy/react @uppy/xhr-upload react-pdf pdfjs-dist konva react-konva react-resizable-panels @tanstack/react-virtual

Library responsibilities:

@tanstack/react-query

Use for:

- folders
- files
- versions
- remarks
- review queue
- activity
- pagination
- cache
- request cancellation
- optimistic updates
- Reverb cache updates

Do not use it for temporary viewer UI state.

react-hook-form + zod + @hookform/resolvers

Use for:

- upload wizard
- folder form
- file metadata
- version metadata
- remark form
- review decision
- filters

Laravel Form Requests remain authoritative.

@uppy/core + @uppy/react + @uppy/xhr-upload

Use for:

- upload queue
- progress
- cancellation
- retry
- restrictions
- metadata
- multiple asset groups

Use headless Uppy.

Do not use the default Uppy Dashboard design.

Build the visible upload UI using HeroUI/Tailwind shared components.

react-pdf + pdfjs-dist

Use for:

- PDF plan rendering
- page thumbnails
- page navigation
- lazy page rendering
- zoom
- rotate
- fit width
- fit page

Do not install @react-pdf/renderer.

konva + react-konva

Use for:

- pins
- arrows
- rectangles
- revision clouds
- freehand
- text
- highlights
- measurements
- annotation selection

Do not install Fabric.js.

react-resizable-panels

Use for:

File browser | Viewer | Inspector

@tanstack/react-virtual

Use for large:

- file trees
- remark lists
- activity
- thumbnails
- PDF page lists

Later libraries:

Folder drag/drop:

npm install @dnd-kit/react

Resumable uploads:

npm install @uppy/tus

IFC/BIM phase only:

npm install three web-ifc @thatopen/fragments @thatopen/components @thatopen/components-front

Do not install all later libraries during the MVP.

Do not add:

- Redux
- Zustand
- Material UI
- Chakra UI
- Bootstrap
- Socket.IO
- another toast library
- another table library
- another upload engine
- another PDF viewer
- Fabric.js
- react-dropzone
- FilePond

Use existing:

- HeroUI
- Tailwind
- Lucide React
- Sonner
- TanStack Table
- Inertia
- Laravel Echo
- Reverb

==================================================
FRONTEND FEATURE STRUCTURE
==========================

Create a focused feature area.

Suggested structure:

resources/js/features/project-design/
    api/
        projectDesignApi.ts
        projectDesignKeys.ts

```
components/
        ProjectDesignTab.tsx
        ProjectDesignToolbar.tsx
        ProjectDesignSummary.tsx
        ProjectDesignModeTabs.tsx
```


```
browser/
            DesignBrowser.tsx
            DesignFolderTree.tsx
            DesignFolderRow.tsx
            DesignFileRow.tsx
            DesignVersionRow.tsx
```


```
files/
            DesignFilesMode.tsx
            DesignFilesTable.tsx
            DesignFileActions.tsx
            DesignFileInspector.tsx
            DesignVersionHistory.tsx
            DesignAssetList.tsx
```


```
upload/
            DesignUploadDrawer.tsx
            DesignUploadWizard.tsx
            UploadOperationStep.tsx
            UploadMetadataStep.tsx
            UploadAssetsStep.tsx
            UploadRevisionStep.tsx
            UploadConfirmationStep.tsx
            DesignUploadProgress.tsx
```


```
viewer/
            ProjectDesignViewer.tsx
            DesignViewerToolbar.tsx
            PdfDesignViewer.tsx
            ImageDesignViewer.tsx
            UnsupportedDesignViewer.tsx
            ViewerLoadingState.tsx
            ViewerErrorState.tsx
```


```
annotations/
            DesignAnnotationLayer.tsx
            DesignAnnotationToolbar.tsx
            DesignAnnotationComposer.tsx
            DesignAnnotationShape.tsx
            DesignAnnotationSelection.tsx
```


```
remarks/
            DesignRemarksMode.tsx
            DesignRemarksTable.tsx
            DesignRemarkInspector.tsx
            DesignRemarkComments.tsx
            DesignRemarkActions.tsx
```


```
reviews/
            DesignReviewQueueMode.tsx
            DesignReviewTable.tsx
            DesignReviewDecisionDialog.tsx
```


```
comparison/
            DesignVersionComparison.tsx
            DesignComparisonToolbar.tsx
```


```
activity/
            DesignActivityMode.tsx
            DesignActivityItem.tsx
```


```
hooks/
        useProjectDesignWorkspace.ts
        useProjectDesignFiles.ts
        useProjectDesignViewer.ts
        useProjectDesignRemarks.ts
        useProjectDesignUpload.ts
        useProjectDesignRealtime.ts
```


```
schemas/
        projectDesignSchemas.ts
```


```
types/
        projectDesign.ts
```


```
utils/
        projectDesignStatus.ts
        projectDesignPermissions.ts
        annotationGeometry.ts
        fileFormatters.ts
```


Do not create unnecessary files only to match this tree.

Follow existing project conventions where they are better.

==================================================
PROJECT TAB INTEGRATION
=======================

Find the real Project Show page and shared tab registry.

Likely locations may include:

resources/js/pages/Projects/Show.tsx
resources/js/features/projects/
resources/js/components/projects/

Inspect before editing.

Add one shared tab definition:

{
    key: 'project-design',
    label: t('projects.tabs.projectDesign'),
    icon: appropriate Lucide icon,
    permission: 'project-design.view'
}

Do not duplicate the tab definition in mobile and desktop components.

The tab should render:

<ProjectDesignTab
    projectId={project.id}
    permissions={projectDesignPermissions}
/>

Only mount heavy workspace content when active.

Use dynamic imports where appropriate.

==================================================
PROJECT DESIGN INTERNAL MODES
=============================

Inside the Project Design tab, add:

- Files
- Review Queue
- Remarks
- Activity

Files is the default.

These are internal modes, not main project tabs.

Use compact tabs under the Project Design toolbar.

Suggested URL state:

mode=files
mode=reviews
mode=remarks
mode=activity

==================================================
UI LAYOUT
=========

Do not make the tab look like a dashboard containing many large metric cards.

Use a compact professional workspace.

Top structure:

1. Toolbar
2. Compact summary strip
3. Internal mode tabs
4. Workspace

Toolbar desktop:

Left:

- “Project Design”
- small contextual subtitle
- selected file breadcrumb when applicable

Center:

- search
- discipline filter
- status filter
- responsible/reviewer filter

Right:

- Upload design
- New folder
- Compare
- More

Recommended control height:

36–40px

Recommended toolbar height:

54–64px

Avoid excessive padding.

==================================================
SUMMARY STRIP
=============

Display compact real values:

- Total files
- Awaiting review
- Open remarks
- Overdue
- Approved
- Latest revision

Use one responsive strip rather than six large cards.

Each metric can be clickable.

Examples:

Click Awaiting review:

- switch to Review Queue
- apply awaiting-review filter

Click Open remarks:

- switch to Remarks
- apply unresolved filter

Click Overdue:

- switch to Remarks
- apply overdue filter

Add one thin approval progress indicator.

Define its calculation on the backend.

Initial formula:

approved logical files requiring approval
/
active logical files requiring approval

Exclude archived and reference-only files.

==================================================
FILES MODE
==========

Default desktop list layout:

┌──────────────────────┬────────────────────────────────────────┐
│ Folder browser       │ Files table / selected file details    │
└──────────────────────┴────────────────────────────────────────┘

Review workspace layout:

┌──────────────────┬─────────────────────────┬──────────────────┐
│ File browser     │ Viewer                  │ Inspector        │
└──────────────────┴─────────────────────────┴──────────────────┘

Recommended desktop widths:

- browser: 250–280px
- inspector: 340–390px
- viewer: remaining width
- viewer minimum: 520px

At narrower widths:

- browser collapses
- inspector becomes drawer

Tablet:

- browser + viewer
- inspector as drawer

Mobile:

Internal view switcher:

- Files
- Viewer
- Remarks

Do not render three narrow columns on mobile.

==================================================
FOLDER AND FILE BROWSER
=======================

Group by:

- discipline
- folder
- logical file
- version

Example:

ARCHITECTURE

▾ Plans
   Ground floor plan       V03    4 remarks
   First floor plan        V02    Approved
   Section A-A             V01    In review

▸ Details
▸ Renders
▸ 3D Models

STRUCTURE

▸ Foundations
▸ Concrete plans

Rows must be compact.

Recommended heights:

- discipline heading: 30–34px
- folder row: 38–42px
- file row: 46–52px
- version row: 38–44px

Selected row:

- subtle gold background
- visible left indicator
- readable contrast

Each file row can show:

- icon
- title
- latest revision
- status
- unresolved remark count

Do not show all metadata in the tree.

==================================================
FILES TABLE
===========

When no file is opened, display the shared AppDataTable.

Columns:

- File
- Discipline
- Category
- Latest revision
- Status
- Responsible
- Reviewer
- Open remarks
- Review due
- Updated
- Actions

Required working features:

- search
- sorting
- pagination
- filters
- open file
- upload revision
- submit review
- download source
- version history
- edit metadata
- archive

Use server-side pagination.

Do not load every record.

Reuse the same table design used by Clients, Projects, Documents, and Contracts.

==================================================
UPLOAD DRAWER
=============

Upload must happen inside the Project Show page.

Do not navigate away.

Use a professional multi-step drawer.

Operation types:

- New design file
- New version
- Add supporting assets

Step 1 — Destination

Fields:

- operation type
- existing file when creating revision
- discipline
- folder
- category

Step 2 — Information

Fields:

- title
- code
- description
- responsible worker
- reviewer
- review due date
- requires approval

Step 3 — Assets

Separate zones:

Source/native:

- DWG
- DXF
- PLN
- PLA
- RVT
- SKP

Review:

- PDF
- IFC
- PNG
- JPG
- WebP

Supporting:

- DOCX
- XLSX
- CSV
- ZIP
- reference files

Step 4 — Revision

Fields:

- version number
- revision code
- source version
- change summary
- remarks addressed
- internal note

Step 5 — Confirmation

Display:

- selected files
- sizes
- total size
- destination
- responsible
- reviewer
- revision
- submission behavior

Final actions:

- Save draft
- Upload only
- Upload and submit for review

These buttons must have different behavior.

Do not send all three actions to the same status.

==================================================
UPLOAD BEHAVIOR
===============

Use Uppy headlessly.

Required:

- drag/drop
- file picker
- multiple files
- queue
- progress per file
- total progress
- cancellation
- retry
- remove before upload
- validation errors
- preserve failed files
- client upload UUID
- duplicate submission protection

The upload process must not freeze the entire Project Show page.

Do not clear the upload form on failure.

Do not display raw HTML errors.

Backend errors must return JSON.

Use:

- Accept: application/json
- X-Requested-With: XMLHttpRequest
- CSRF
- authenticated session credentials

Do not manually set multipart Content-Type.

==================================================
FILE AND VERSION DOMAIN
=======================

Logical file example:

Ground floor plan

Immutable versions:

V01
V02
V03

Logical file contains:

- title
- code
- project
- folder
- discipline
- category
- responsible user
- reviewer
- description
- requires approval
- current version
- latest approved version
- review due date
- archived state

Version contains:

- sequence number
- revision code
- source version
- change summary
- uploader
- uploaded date
- upload status
- preview status
- review status
- submission data
- approval data
- assets

Rules:

- new binary content creates a new version
- submitted version cannot be overwritten
- approved version cannot be overwritten
- old versions remain available
- latest version is not automatically approved
- approval belongs to one exact version
- remarks belong to one exact version

==================================================
STATUS MODEL
============

Keep these concepts separate:

Upload status:

- pending
- uploading
- completed
- failed

Preview status:

- pending
- processing
- ready
- failed
- unsupported

Review status:

- draft
- ready
- submitted
- in_review
- changes_requested
- ready_for_verification
- approved
- rejected
- superseded
- archived

Use backend enums and one frontend status mapping.

Do not scatter raw status strings.

==================================================
BACKEND TABLES
==============

Create migrations after inspecting existing naming and company scoping.

Suggested tables:

project_design_folders

Fields:

- id
- company_id
- branch_id nullable
- project_id
- parent_id nullable
- name
- discipline nullable
- sort_order
- created_by
- archived_at nullable
- timestamps

project_design_files

Fields:

- id
- company_id
- branch_id nullable
- project_id
- folder_id nullable
- title
- code nullable
- description nullable
- discipline
- category
- responsible_user_id nullable
- reviewer_id nullable
- current_version_id nullable
- latest_approved_version_id nullable
- status
- requires_approval
- review_due_at nullable
- created_by
- record_version default 1
- archived_at nullable
- timestamps

project_design_versions

Fields:

- id
- company_id
- project_id
- design_file_id
- source_version_id nullable
- version_number
- revision_code nullable
- change_summary nullable
- upload_note nullable
- uploaded_by
- upload_status
- preview_status
- review_status
- preview_error nullable
- submitted_at nullable
- submitted_by nullable
- approved_at nullable
- approved_by nullable
- rejected_at nullable
- rejected_by nullable
- superseded_at nullable
- metadata_json nullable
- timestamps

project_design_assets

Fields:

- id
- company_id
- project_id
- design_file_id
- version_id
- asset_type
- disk
- path
- original_filename
- stored_filename
- mime_type
- extension
- size_bytes
- checksum_sha256
- scan_status
- scan_error nullable
- previewable
- sort_order
- metadata_json nullable
- uploaded_by
- timestamps

project_design_reviews

Fields:

- id
- company_id
- project_id
- design_file_id
- version_id
- reviewer_id
- status
- decision nullable
- general_note nullable
- requested_at
- started_at nullable
- due_at nullable
- completed_at nullable
- created_by
- timestamps

project_design_remarks

Fields:

- id
- company_id
- project_id
- design_file_id
- version_id
- review_id nullable
- parent_remark_id nullable
- remark_number
- annotation_type
- title
- description nullable
- severity
- status
- author_id
- assigned_to nullable
- page_number nullable
- sheet_key nullable
- model_element_id nullable
- geometry_json
- viewport_json nullable
- snapshot_asset_id nullable
- due_at nullable
- addressed_at nullable
- addressed_by nullable
- addressed_by_version_id nullable
- verified_at nullable
- verified_by nullable
- resolved_at nullable
- resolved_by nullable
- linked_task_id nullable
- record_version default 1
- timestamps
- soft deletes where appropriate

project_design_remark_comments

Fields:

- id
- company_id
- project_id
- remark_id
- user_id
- body
- is_internal
- edited_at nullable
- timestamps
- soft deletes

project_design_remark_attachments

Fields:

- id
- company_id
- project_id
- remark_id
- comment_id nullable
- disk
- path
- original_filename
- stored_filename
- mime_type
- extension
- size_bytes
- checksum_sha256
- uploaded_by
- timestamps

project_design_activities

Fields:

- id
- company_id
- project_id
- design_file_id nullable
- version_id nullable
- review_id nullable
- remark_id nullable
- actor_id nullable
- event
- subject_type
- subject_id
- before_json nullable
- after_json nullable
- metadata_json nullable
- created_at

Add appropriate indexes.

Do not add unsafe cascade deletion that can destroy approved revision history.

==================================================
MODELS AND RELATIONSHIPS
========================

Suggested models:

ProjectDesignFolder
ProjectDesignFile
ProjectDesignVersion
ProjectDesignAsset
ProjectDesignReview
ProjectDesignRemark
ProjectDesignRemarkComment
ProjectDesignRemarkAttachment
ProjectDesignActivity

Add relationships from Project without loading them automatically.

Do not add all Project Design records to the Project model’s default eager loading.

Use casts for:

- enums
- JSON
- booleans
- dates

==================================================
BACKEND SERVICES
================

Keep controllers thin.

Suggested services/actions:

ProjectDesignSummaryService
ProjectDesignFileService
ProjectDesignVersionService
ProjectDesignUploadService
ProjectDesignStorageService
ProjectDesignPreviewService
ProjectDesignReviewService
ProjectDesignRemarkService
ProjectDesignActivityService

Suggested action classes:

CreateProjectDesignFolder
CreateProjectDesignFile
CreateProjectDesignVersion
StoreProjectDesignAsset
SubmitProjectDesignReview
StartProjectDesignReview
CreateProjectDesignRemark
AddressProjectDesignRemark
VerifyProjectDesignRemark
ReopenProjectDesignRemark
ApproveProjectDesignVersion
RequestProjectDesignChanges

Do not put all business logic in one controller.

==================================================
ROUTES
======

Use routes scoped through the project.

Suggested structure:

GET
/projects/{project}/project-design/summary

GET
/projects/{project}/project-design/folders

POST
/projects/{project}/project-design/folders

PATCH
/projects/{project}/project-design/folders/{folder}

DELETE
/projects/{project}/project-design/folders/{folder}

GET
/projects/{project}/project-design/files

POST
/projects/{project}/project-design/files

GET
/projects/{project}/project-design/files/{designFile}

PATCH
/projects/{project}/project-design/files/{designFile}

POST
/projects/{project}/project-design/files/{designFile}/archive

POST
/projects/{project}/project-design/files/{designFile}/restore

GET
/projects/{project}/project-design/files/{designFile}/versions

POST
/projects/{project}/project-design/files/{designFile}/versions

GET
/projects/{project}/project-design/versions/{version}

POST
/projects/{project}/project-design/versions/{version}/assets

POST
/projects/{project}/project-design/versions/{version}/submit-review

POST
/projects/{project}/project-design/versions/{version}/start-review

POST
/projects/{project}/project-design/versions/{version}/decision

GET
/projects/{project}/project-design/versions/{version}/remarks

POST
/projects/{project}/project-design/versions/{version}/remarks

PATCH
/projects/{project}/project-design/remarks/{remark}

POST
/projects/{project}/project-design/remarks/{remark}/address

POST
/projects/{project}/project-design/remarks/{remark}/verify

POST
/projects/{project}/project-design/remarks/{remark}/reopen

POST
/projects/{project}/project-design/remarks/{remark}/comments

POST
/projects/{project}/project-design/remarks/{remark}/create-task

GET
/projects/{project}/project-design/reviews

GET
/projects/{project}/project-design/remarks

GET
/projects/{project}/project-design/activity

GET
/project-design/assets/{asset}/preview

GET
/project-design/assets/{asset}/download

Adapt route naming to the current project conventions.

Use scoped model binding.

==================================================
AUTHORIZATION
=============

Create permissions:

- project-design.view
- project-design.create-folder
- project-design.create-file
- project-design.update-file
- project-design.upload
- project-design.download-source
- project-design.create-version
- project-design.submit-review
- project-design.review
- project-design.annotate
- project-design.create-remark
- project-design.assign-remark
- project-design.address-remark
- project-design.verify-remark
- project-design.reopen-remark
- project-design.approve
- project-design.request-changes
- project-design.archive
- project-design.delete
- project-design.manage

Frontend hides unavailable actions.

Backend policies remain authoritative.

Every query must validate:

- authenticated user
- current company
- project company
- project access
- action permission
- matching route project/file/version relationship

Do not use unscoped:

ProjectDesignFile::findOrFail($id)

==================================================
STORAGE
=======

Use private storage.

Suggested path:

companies/{companyId}/projects/{projectId}/project-design/files/{fileId}/versions/{versionId}/

Subfolders:

source/
review/
supporting/
thumbnails/
derivatives/
snapshots/

Store random/safe filenames.

Store original filename separately.

Never expose disk or path in API resources.

Use authorized streaming endpoints.

Use safe Content-Disposition headers supporting French and Arabic filenames.

==================================================
FILE SECURITY
=============

Backend validation must check:

- extension
- detected MIME type
- size
- total request size
- number of files
- empty file
- asset type
- current project
- permission
- company

Reject executable formats.

Do not allow:

- exe
- msi
- bat
- cmd
- com
- php
- phar
- js
- html
- arbitrary inline SVG

Prevent:

- path traversal
- double-extension attacks
- MIME spoofing
- unauthorized preview
- unauthorized download
- cross-company access

Add scan status fields even if antivirus scanning is implemented later.

Possible statuses:

- pending
- clean
- infected
- failed
- skipped

==================================================
TRANSACTIONAL UPLOAD
====================

Uploads must not leave orphan files or records.

Required behavior:

1. Validate access.
2. Validate metadata.
3. Create or load upload operation.
4. Store file safely.
5. Create asset record.
6. Calculate checksum.
7. Finalize version.
8. Commit database transaction.
9. Dispatch preview jobs after commit.
10. Broadcast after commit.

If database insertion fails:

- delete stored files
- rollback records

If post-processing fails:

- keep source file
- mark preview failed
- allow retry

Do not delete a valid source file because PDF thumbnail generation failed.

==================================================
PREVIEW
=======

MVP preview types:

- PDF
- PNG
- JPG
- JPEG
- WebP

Native unsupported files display:

Preview unavailable

The native source file is stored safely.
Upload a PDF or IFC review file to review it in the browser.

Actions:

- Download source
- Upload review file
- Open version history

Do not render blank viewers.

==================================================
PDF PERFORMANCE
===============

Use React-PDF and PDF.js.

Required:

- dynamically imported viewer
- PDF.js worker configuration
- private authorized URL
- page thumbnails
- current page
- lazy page rendering
- nearby page preloading
- zoom
- rotate
- fit width
- fit page
- fullscreen
- loading state
- error state

Do not render all pages at once.

Use virtualization for long documents.

Cancel obsolete render requests.

==================================================
ANNOTATIONS
===========

Annotations are separate structured database records.

Do not burn annotations permanently into the source PDF.

Initial tools:

- Pin
- Rectangle
- Arrow
- Revision cloud
- Freehand
- Text
- Highlight

Later:

- Distance measurement
- Area measurement

Store normalized geometry between 0 and 1.

Example:

{
    "page": 2,
    "type": "rectangle",
    "x": 0.34,
    "y": 0.28,
    "width": 0.12,
    "height": 0.08,
    "rotation": 0
}

Do not store current browser pixels.

Validate geometry on the backend.

Limit freehand point count and payload size.

==================================================
REMARK CREATION UX
==================

Reviewer flow:

1. Select annotation tool.
2. Draw or click.
3. Show a compact anchored composer.
4. Enter title.
5. Enter description.
6. Select severity.
7. Select assignee.
8. Select due date.
9. Save.

Do not open a full-height drawer for every annotation.

After save:

- annotation appears
- remark appears in inspector
- counters update
- assignee receives notification
- activity updates
- no full project reload

==================================================
REMARK WORKFLOW
===============

Statuses:

- open
- assigned
- in_progress
- addressed
- verified
- reopened
- rejected
- resolved

Workflow:

Reviewer creates remark
→ worker starts
→ worker corrects desktop source file
→ worker uploads new version
→ worker marks Addressed
→ reviewer verifies
→ remark becomes Verified/Resolved

or:

Reviewer reopens remark

Do not allow worker Addressed to automatically become Verified.

==================================================
REMARK INSPECTOR
================

Display:

- remark number
- title
- status
- severity
- description
- file
- exact version
- page
- author
- assignee
- due date
- snapshot
- comments
- attachments
- linked task
- history

Worker actions:

- Start
- Comment
- Mention
- Add evidence
- Mark addressed
- Open task

Reviewer actions:

- Assign
- Change severity
- Change deadline
- Verify
- Reopen
- Resolve
- Create task

All actions must work.

==================================================
REVIEW QUEUE
============

Review Queue sections:

- Awaiting review
- In review
- Changes requested
- Ready for verification
- Overdue
- Recently approved

Use one grouped shared table/list.

Columns:

- File
- Version
- Discipline
- Responsible
- Reviewer
- Submitted
- Due
- Open remarks
- Status
- Action

Actions:

- Start review
- Continue review
- Verify changes
- View decision

Support real:

- search
- filter
- sorting
- pagination

==================================================
REVIEW DECISIONS
================

Decisions:

- Approve
- Approve with observations
- Request changes
- Reject

Decision dialog:

- decision
- general note
- required changes
- selected unresolved remarks
- due date
- notify users
- optional attachment

Block approval when critical remarks remain open.

Allow override only with:

- explicit permission
- confirmation
- required override reason
- activity/audit record

==================================================
TASK INTEGRATION
================

Create task from remark.

Prefill:

Title:
[R-024] Remark title

Project:
Current project

Category:
Project design review

Assignee:
Remark assignee

Priority mapping:

- critical → urgent
- major → high
- normal → medium
- minor/information → low

Due date:
Remark due date

Store links to:

- project
- design file
- version
- remark

Task action:

Open annotation

The link must restore:

- Project Design tab
- correct internal mode
- correct file
- correct version
- correct page
- selected remark
- open inspector
- highlighted annotation

Completing a task marks the remark Addressed.

It must not mark it Verified.

==================================================
REALTIME
========

Use existing Laravel Echo and Reverb.

Events may include:

- ProjectDesignFileCreated
- ProjectDesignVersionUploaded
- ProjectDesignPreviewReady
- ProjectDesignPreviewFailed
- ProjectDesignReviewSubmitted
- ProjectDesignReviewStarted
- ProjectDesignRemarkCreated
- ProjectDesignRemarkUpdated
- ProjectDesignRemarkAssigned
- ProjectDesignRemarkCommented
- ProjectDesignRemarkAddressed
- ProjectDesignRemarkVerified
- ProjectDesignRemarkReopened
- ProjectDesignVersionApproved
- ProjectDesignVersionRejected

Broadcast after commit.

Use focused payloads.

Do not broadcast the full project.

Update React Query caches for:

- summary
- files
- selected file
- remarks
- review queue
- activity

Deduplicate events.

==================================================
PERFORMANCE
===========

Project Show initial payload must not contain:

- complete design file list
- complete version histories
- all remarks
- all activity
- PDF binary data
- viewer libraries

Initial Project Show may contain:

- Project Design permission
- lightweight feature availability
- optional inexpensive count summary

Load Project Design data when tab opens.

Use:

- server pagination
- cursor pagination for activity
- selective eager loading
- indexed queries
- debounced search
- AbortController
- dynamic viewer imports
- lazy thumbnails
- list virtualization
- React memoization where useful

Avoid N+1 queries.

Do not include path/disk fields in resources.

==================================================
CONCURRENCY
===========

Use optimistic concurrency for:

- file metadata
- assignments
- remarks
- review decisions

Use:

record_version

or validated updated_at.

Return HTTP 409 when stale.

Frontend message:

This record was changed by another user.
Reload the latest data before saving.

Do not silently overwrite changes.

==================================================
IMPLEMENTATION PHASES
=====================

Do not implement everything in one uncontrolled change.

Complete one phase, test it, report it, then continue.

---

PHASE 0 — DISCOVERY
--------------------

Inspect:

- Project Show page
- project tab registry
- active-tab URL logic
- ProjectController and ProjectResource
- Documents upload architecture
- storage services
- shared drawers
- shared tables
- shared tabs
- Tasks linking
- comments
- mentions
- notifications
- Reverb
- permissions
- company scopes
- branch scopes
- queue setup
- existing package.json
- PHP/web-server upload limits

Produce:

- exact files to change
- exact components to reuse
- database plan
- route plan
- permission plan
- package installation plan
- risks
- conflicts
- no-code implementation summary

Do not broadly rewrite code during discovery.

---

PHASE 1 — TAB AND WORKSPACE SHELL
----------------------------------

Implement:

- Project Design in main project tabs
- correct tab order
- URL tab state
- deep-link restoration
- internal modes
- toolbar
- empty summary
- empty files state
- lazy loading boundary
- permission visibility
- responsive workspace shell

No fake statistics.

Use real zero counts until backend data exists.

Acceptance:

- remains inside Project Show
- refresh keeps active tab
- Back/Forward works
- no sidebar item
- project header remains
- unauthorized user cannot access
- mobile does not overflow
- build passes

---

PHASE 2 — DOMAIN FOUNDATION
----------------------------

Implement:

- migrations
- enums
- models
- relationships
- policies
- requests
- resources
- summary endpoint
- activity service
- factories
- feature tests

Acceptance:

- project/company scoped
- indexes created
- no dangerous cascade
- tests pass

---

PHASE 3 — FILE REPOSITORY AND VERSIONING
-----------------------------------------

Implement:

- folders
- logical files
- file table
- file browser
- metadata drawer
- version records
- version history
- latest version
- archive/restore
- search
- filters
- sorting
- pagination

Acceptance:

- new content creates version
- submitted version immutable
- approved version immutable
- all actions work
- no N+1 query problem

---

PHASE 4 — SECURE UPLOAD
------------------------

Implement:

- Uppy headless upload
- source/review/supporting zones
- progress
- cancel
- retry
- frontend validation
- backend validation
- private storage
- idempotency
- transaction cleanup
- checksum
- error handling
- queued post-processing

Acceptance:

- no orphan files
- no orphan records
- duplicate retry does not duplicate versions
- unauthorized returns 403
- cross-company returns 403/404
- failed files remain retryable

---

PHASE 5 — PDF AND IMAGE VIEWER
-------------------------------

Implement:

- secure preview endpoint
- React-PDF viewer
- image viewer
- thumbnails
- lazy loading
- zoom/pan/rotate/fit
- fullscreen
- unsupported-file state
- source download

Acceptance:

- no public storage path
- large PDF does not freeze browser
- viewer library dynamically loaded
- unauthorized preview denied

---

PHASE 6 — ANNOTATIONS AND REMARKS
----------------------------------

Implement:

- Konva annotation layer
- pins
- rectangles
- arrows
- revision clouds
- freehand
- text
- normalized coordinates
- anchored composer
- remark inspector
- assignment
- severity
- due date
- comments
- attachments
- activity

Acceptance:

- annotations remain aligned after resize/zoom
- version relationship correct
- actions authorized
- no full page reload
- build/tests pass

---

PHASE 7 — REVIEW WORKFLOW
--------------------------

Implement:

- submit review
- assign reviewer
- start review
- review queue
- request changes
- address remark
- upload correcting revision
- verify
- reopen
- approve
- reject
- overdue logic
- audit trail

Acceptance:

- approval version-specific
- addressed is not verified
- critical remarks block approval
- override audited

---

PHASE 8 — TASKS, NOTIFICATIONS, REALTIME
-----------------------------------------

Implement:

- task creation from remark
- deep links
- notifications
- Reverb events
- React Query cache updates
- realtime counters
- activity integration
- stale update handling

Acceptance:

- second browser sees updates
- no duplicate events
- task opens exact annotation
- task completion only addresses remark

---

PHASE 9 — VERSION COMPARISON
-----------------------------

Implement:

- PDF to PDF comparison
- image to image comparison
- version selectors
- side-by-side
- synchronized pan/zoom
- overlay
- opacity

Do not claim semantic CAD comparison.

---

PHASE 10 — IFC/BIM
-------------------

Only after previous phases are stable.

Implement:

- IFC upload
- background conversion to Fragments
- private derivative storage
- dynamically imported BIM viewer
- orbit
- pan
- zoom
- selection
- properties
- isolation
- storeys
- measurements
- section planes
- saved viewpoints
- 3D pins

Do not attempt native PLN rendering.

==================================================
TESTING
=======

Backend tests must cover:

- tab permission
- company isolation
- project scoping
- folder creation
- logical file creation
- initial version
- new revision
- source upload
- review upload
- supporting upload
- invalid file type
- excessive size
- empty file
- duplicate retry
- storage cleanup
- authorized preview
- unauthorized preview
- authorized download
- unauthorized download
- archive/restore
- submit review
- create remark
- geometry validation
- assign remark
- address remark
- verify remark
- reopen remark
- approval
- critical remark approval blocking
- override approval audit
- task creation
- activity recording
- realtime event
- stale update 409

Use Storage::fake where appropriate.

Frontend tests should cover:

- tab activation
- refresh restoration
- deep links
- lazy loading
- filters
- upload validation
- progress
- cancel
- retry
- viewer fallback
- annotation geometry
- remark actions
- permission visibility
- realtime deduplication

==================================================
MANUAL QA
=========

Test widths:

- 1920
- 1440
- 1366
- 1024
- 768
- 430
- 390
- 360

Test workflow:

1. Open project.
2. Open Project Design.
3. Refresh.
4. Create Architecture folder.
5. Create Ground floor plan.
6. Upload DWG source.
7. Upload PDF review.
8. Open PDF.
9. Create revision cloud.
10. Create major remark.
11. Assign worker.
12. Open second browser as worker.
13. Receive notification.
14. Open exact annotation.
15. Comment.
16. Mark In progress.
17. Upload V02.
18. Link addressed remark.
19. Reviewer compares V01/V02.
20. Reviewer verifies.
21. Reviewer approves V02.
22. Confirm V01 remains.
23. Confirm full activity.
24. Confirm unauthorized download fails.

==================================================
COMMANDS
========

Before changes:

git status --short

After package installations:

npm run build

Run when scripts exist:

npm run typecheck
npm run lint

Backend:

php artisan optimize:clear
php artisan migrate:status
php artisan migrate
php artisan test

Run PHP syntax checks on every changed PHP file.

Realtime QA:

php artisan reverb:start --host=127.0.0.1 --port=8081 --debug

Queue QA:

php artisan queue:work --queue=default --tries=3 --timeout=300

Do not report success when build or tests fail.

==================================================
WORK REPORT AFTER EACH PHASE
============================

Return:

PHASE:
STATUS:

FILES CHANGED:
FILES CREATED:
MIGRATIONS:
ROUTES:
POLICIES:
SERVICES:
COMPONENTS:
SHARED COMPONENTS REUSED:
TESTS:
BUILD RESULT:
TEST RESULT:
SECURITY CHECKS:
PERFORMANCE CHECKS:
KNOWN ISSUES:
NEXT PHASE:

Do not spend tokens describing unrelated unchanged files.

==================================================
STARTING INSTRUCTION
====================

Start now with:

PHASE 0 — Discovery
and
PHASE 1 — Project Design tab and workspace shell

Do not begin file upload, annotations, or IFC viewer before completing and verifying these phases.

During Phase 0:

- inspect the real code
- provide the discovery report
- identify exact files

Then immediately implement Phase 1 unless a genuine blocking architectural conflict exists.

Do not ask for confirmation for normal implementation decisions.

Stop after Phase 1 only after:

- Project Design appears in the correct project tab position
- it is inside Project Show
- URL state works
- refresh works
- internal modes exist
- responsive shell exists
- permission visibility works
- empty state is clean
- npm run build passes
- relevant tests pass

FINAL PRINCIPLE:

Native CAD/BIM files are protected source files.

PDF, images, and IFC are review assets.

Logical files contain immutable versions.

Annotations and remarks belong to exact versions.

Workers address remarks.

Reviewers verify remarks.

Approval applies to one exact version.

Everything stays inside the existing Project Show page through the Project Design tab.
