# ARCHI LBO — FINANCE V2
# COMPLETE RECEIVABLES / PAYMENTS / REMINDERS / COLLECTION WORKSPACE
# BACKEND + FRONTEND + SECURITY + PERFORMANCE + REALTIME + CALENDAR
#
# IMPLEMENT ALL PHASES IN THIS TASK,
# BUT WORK SEQUENTIALLY AND VERIFY EACH FOUNDATION BEFORE CONTINUING.

Project:
D:\ARCHI LBO\LBOSM\LBOCRM

Branch:
finance-template-editor

Read AGENT.md first.

Do not create PowerShell scripts.
Do not install packages unless absolutely unavoidable.
Do not commit.
Do not push.
Do not reset or wipe database.

==================================================
MAIN GOAL
==================================================

Transform Finance from primarily:

Devis / Factures / Paiements / Reçus

into a complete financial collection workspace for ARCHI LBO.

The final Finance module should help answer:

- Combien avons-nous facturé ?
- Combien avons-nous encaissé ?
- Combien reste-t-il à encaisser ?
- Quels clients doivent payer aujourd'hui ?
- Quels clients sont en retard ?
- Depuis combien de jours ?
- Qui doit être relancé ?
- Quand avons-nous déjà relancé ce client ?
- Le client a-t-il promis de payer ?
- Quand ?
- Quel montant ?
- Quels échéanciers arrivent bientôt ?
- Quels paiements ont été reçus ?
- Le reçu doit-il être imprimé maintenant ?
- Quelle est la situation financière du Client ?
- Quelle est la situation financière du Project ?

==================================================
CRITICAL BUSINESS PRINCIPLE
==================================================

Do NOT store manually-derived states such as:

client_not_paid = true
is_very_late = true
remaining_amount = manually maintained everywhere

These states should derive from authoritative Finance data.

Concept:

Facture / échéancier amount
-
valid payments
=
outstanding amount

Then:

due date
+
today
+
outstanding > 0
=
payment state

Examples:

PAID
DUE_TODAY
UPCOMING
OVERDUE
SEVERELY_OVERDUE

Use current Finance lifecycle and naming conventions.

==================================================
PHASE 0 — DEEP AUDIT
==================================================

Before modifying code inspect the COMPLETE existing Finance architecture.

BACKEND:

- Finance models
- document models
- Devis
- Facture
- Reçu
- Payment
- document lines
- totals/calculation service
- Finance settings
- templates
- PDF generation
- numbering
- statuses
- relationships
- Project relation
- Client relation
- routes
- requests
- policies
- PermissionRegistry
- notifications
- scheduler
- queues
- Reverb
- Calendar integration
- Activity/audit logs
- tests

FRONTEND:

- Finance Overview
- Devis
- Factures
- Paiements
- receipt UI
- Project Finance tab
- Client Finance UI
- Finance navigation
- wizard/drawers/modals
- existing charts
- existing filters
- existing HeroUI components

Report internally:

Finance models:
<paths>

Payment model:
<path>

Invoice model:
<path>

Receipt model:
<path>

Finance calculations:
<path>

Payment relationship:
<actual>

Current due-date support:
<actual>

Current reminder support:
<actual/NONE>

Current notifications:
<actual>

Current Calendar integration:
<actual/NONE>

Then implement using existing architecture.

==================================================
PART 1 — AUTHORITATIVE FINANCIAL STATE
==================================================

Create/reuse one centralized receivables service.

Possible naming:

FinanceReceivablesService

or equivalent.

Do NOT calculate balances independently across many React components.

Responsibilities:

- invoice/document total
- valid payments total
- outstanding balance
- due state
- days overdue
- next payment due
- payment schedule state
- aging bucket
- client totals
- project totals

==================================================
1. OUTSTANDING BALANCE
==================================================

Concept:

outstanding =
invoice_total_ttc
-
valid_payment_total

Use current decimal/money service.

Do not use JS floating point as financial authority.

Frontend displays backend-computed/normalized values.

==================================================
2. PAYMENT STATE
==================================================

Derive state.

Conceptual states:

paid
upcoming
due_today
overdue

Do not store redundant boolean flags unless cache/materialization is justified.

==================================================
3. DAYS OVERDUE
==================================================

If:

outstanding > 0
and due_date < today

calculate:

days_overdue

using DATE semantics.

No timezone off-by-one.

==================================================
4. AGING BUCKETS
==================================================

Support aging categories.

Suggested:

current / not due

1–7 days
8–30 days
31–60 days
61+ days

Centralize thresholds/configuration.

Do not scatter:

if days > 30

through React.

If Finance settings should eventually configure these thresholds, design cleanly,
but do not overcomplicate initial UI unnecessarily.

==================================================
PART 2 — PAYMENT → RECEIPT → PRINT MODAL
==================================================

After a Payment is successfully created:

1. save Payment
2. create/generate Reçu according to current Finance architecture
3. return authoritative Payment + receipt result
4. open success modal

==================================================
5. PAYMENT SUCCESS MODAL
==================================================

UX:

┌──────────────────────────────────────────────┐
│ ✓ Paiement enregistré                       │
│                                              │
│ Client                                      │
│ Ahmed ...                                   │
│                                              │
│ Montant reçu              5 000 MAD         │
│ Reste                     7 000 MAD         │
│                                              │
│ Reçu REC-2026-0041 prêt                     │
│                                              │
│ [Plus tard] [Ouvrir] [Imprimer maintenant] │
└──────────────────────────────────────────────┘

Use HeroUI Modal.

Actions:

Plus tard
→ close modal only.

Ouvrir
→ open real generated receipt.

Imprimer maintenant
→ open/trigger print flow for REAL receipt.

==================================================
6. CLOSING MODAL MUST BE SAFE
==================================================

Closing/modal skip must NOT:

- cancel payment
- delete receipt
- submit payment again
- regenerate duplicate receipt

Payment is already authoritative before modal appears.

==================================================
7. PRINT FAILURE
==================================================

If printing fails:

payment remains valid.

Receipt remains stored.

Show error only for print/open action.

Never roll back a successfully recorded Payment because browser printing failed.

==================================================
PART 3 — PAYMENT DUE DATE
==================================================

Audit existing Facture due-date fields.

Reuse if present.

Every receivable should have an authoritative expected/due date where appropriate.

Use existing:

payment_due_date
due_date
payment_terms

or actual architecture.

Do not duplicate fields.

==================================================
8. FINANCE SETTINGS
==================================================

Existing Finance setting:

Délai de paiement (jours)

should remain useful.

For new Facture:

document date
+
configured payment delay
=
default due date

User may edit according to existing business rules.

Existing invoices retain their saved due date.

Changing global settings must not modify historical invoices.

==================================================
PART 4 — PAYMENT REMINDERS
==================================================

Add internal Finance reminders.

A reminder relates to an actual receivable.

Possible relation:

Invoice
Project
Client

Use strongest current Finance entity relationship.

==================================================
9. REMINDER MODEL
==================================================

Create only if no suitable reminder system already exists.

Conceptual fields:

id

invoice_id / receivable_id
project_id as appropriate

remind_at

status:
pending
triggered
snoozed
completed
cancelled

created_by

triggered_at nullable
completed_at nullable

note nullable

timestamps

Use actual project conventions.

==================================================
10. REMINDER TYPES
==================================================

Support:

BEFORE_DUE
ON_DUE
AFTER_DUE
CUSTOM

But do not require four different DB models.

One model with meaningful type/date.

==================================================
11. ADD REMINDER UX
==================================================

From Invoice / À encaisser:

[ + Ajouter un rappel ]

Drawer/modal:

Rappel de paiement

Date
[ ...]

Optional quick choices:

Demain
Dans 3 jours
Dans 7 jours
Date personnalisée

Note
[ ...]

[Enregistrer]

==================================================
12. MULTIPLE REMINDERS
==================================================

Allow more than one reminder.

Example:

2 days before
due date
7 days after

Do not limit architecture to one reminder date.

==================================================
13. REMINDER SNOOZE
==================================================

Action:

Reporter

Options:

Demain
Dans 3 jours
Dans 7 jours
Date personnalisée

Snoozing must preserve history.

Do not overwrite evidence of the original reminder event if audit history already tracks it.

==================================================
14. REMINDER AUTOMATIC COMPLETION
==================================================

If outstanding becomes:

0

pending payment reminders should become:

completed/cancelled automatically according to domain semantics.

Do not continue warning that a fully paid invoice is unpaid.

==================================================
15. PARTIAL PAYMENT
==================================================

Invoice:
10 000

Payment:
3 000

Remaining:
7 000

Reminder remains relevant.

Displayed outstanding amount becomes:

7 000

not original 10 000.

==================================================
PART 5 — INTERNAL NOTIFICATIONS
==================================================

When a reminder becomes due:

create/use existing internal notification system.

Example:

Paiement à relancer

Ahmed ...
Projet MAR-0042
Facture FAC-2026-0018

7 000 MAD à encaisser aujourd'hui.

[Ouvrir]

Do NOT create a separate notification framework if one exists.

==================================================
16. SCHEDULER
==================================================

Use Laravel Scheduler for due reminder detection.

Prefer one bounded recurring job/command.

Avoid one scheduled operating-system task per reminder.

Concept:

every few minutes/hour
→ query due pending reminders
→ create notification
→ update trigger state

Use appropriate current queue/scheduler infrastructure.

==================================================
17. DUPLICATE NOTIFICATION PROTECTION
==================================================

Scheduler rerunning must NOT create duplicate reminder notifications.

Use idempotent state/uniqueness.

==================================================
PART 6 — À ENCAISSER WORKSPACE
==================================================

Add new Finance navigation item/tab:

À encaisser

Use existing Finance navigation design.

Do not create unrelated sidebar module.

==================================================
18. À ENCAISSER HEADER
==================================================

Example:

À encaisser

Suivez les échéances, retards et relances clients.

Summary:

À recevoir
128 000 MAD

En retard
43 000 MAD

Échéance aujourd'hui
12 000 MAD

Promesses à venir
18 000 MAD

==================================================
19. FILTERS
==================================================

Provide:

Search

Tous
Aujourd'hui
À venir
En retard
+30 jours
Promesses

Optional:

Client
Project

Use backend filtering/pagination.

Do not fetch every historical Invoice.

==================================================
20. RECEIVABLE ROW
==================================================

Example:

Ahmed El Mansouri
MAR-0042 · Construction R+1

FAC-2026-0019

Total
20 000 MAD

Payé
12 000 MAD

Reste
8 000 MAD

Échéance
01/08/2026

[ En retard · 9 jours ]

[Ajouter paiement] [Rappeler] [Ouvrir]

==================================================
21. OVERDUE PRIORITY
==================================================

Use clear semantic emphasis.

Do not turn the whole UI bright red.

Suggested levels:

1–7:
subtle warning

8–30:
stronger overdue

31–60:
important

61+:
critical

Use existing semantic design tokens.

==================================================
22. SORTING
==================================================

Support useful sorting:

Oldest overdue
Highest outstanding
Nearest due date
Client
Project

Backend authoritative.

==================================================
PART 7 — FINANCE OVERVIEW DASHBOARD
==================================================

Upgrade Finance Overview.

Core KPIs:

Facturé
Encaissé
À recevoir
En retard

Use actual backend aggregates.

==================================================
23. KPI PERIOD
==================================================

Respect existing Finance date filters if available.

Do not compare incompatible all-time and monthly values without labeling.

==================================================
24. COLLECTION / CASHFLOW CHART
==================================================

If existing chart library exists:

show useful period chart such as:

Encaissements
last 30 days / current period

Do not install chart package.

==================================================
25. AGING DISTRIBUTION
==================================================

Show:

À jour
1–7
8–30
31–60
61+

with amounts.

Use backend aggregation.

==================================================
26. CLIENTS À RELANCER
==================================================

Add compact section:

Clients à relancer

Top priority based on:

overdue severity
+
outstanding amount

Example:

Ahmed ...
12 000 MAD
Retard · 38 jours
[Relancer]

==================================================
PART 8 — CLIENT FINANCIAL SUMMARY
==================================================

On Client financial context/add relevant Finance section:

Situation financière

Total facturé
Total encaissé
Reste
En retard

Derived from ALL Projects belonging to this Client.

Do not store duplicated Client financial totals.

==================================================
27. CLIENT FINANCE DETAILS
==================================================

Allow opening detailed Client Finance view/list showing:

Projects
Invoices
Payments
Outstanding balances

Use existing shared Finance patterns.

==================================================
PART 9 — PROJECT FINANCIAL SUMMARY
==================================================

Improve Project Finance tab/summary.

Example:

Finance

Montant facturé       30 000 MAD
Encaissé              18 000 MAD
Reste                 12 000 MAD

60 % encaissé

Prochaine échéance:
15/08/2026 · 5 000 MAD

[Ajouter paiement]

==================================================
28. PROGRESS
==================================================

Payment progress:

paid / total

Derived.

Do not store percentage independently.

==================================================
PART 10 — PAYMENT SCHEDULE / ÉCHÉANCIER
==================================================

Add payment schedules.

This is important for architecture Projects that receive several advances.

==================================================
29. SCHEDULE MODEL
==================================================

Audit current Finance installment structure first.

If none exists, create clean structure conceptually:

FinancePaymentSchedule
FinancePaymentScheduleItem

or equivalent.

Schedule item:

id
invoice_id / project finance relation

label
amount
due_date
position

status derived where possible

timestamps

Do not store:

avance_1
avance_2
etc.

==================================================
30. SCHEDULE UI
==================================================

Example:

Échéancier

✓ Avance initiale
10 000 MAD
01/06/2026
Payée

○ Deuxième versement
10 000 MAD
01/08/2026
En retard · 9 jours

○ Solde
10 000 MAD
01/10/2026
À venir

[Modifier l'échéancier]

==================================================
31. SCHEDULE VALIDATION
==================================================

Validate total scheduled amount against invoice/negotiated amount according to Finance rules.

Do not silently allow inconsistent schedules.

If partial schedules are intentionally allowed:

represent remaining unscheduled amount clearly.

==================================================
32. PAYMENT ALLOCATION
==================================================

Audit current Payment architecture.

If possible and clean:

allocate Payment to schedule item.

Do not invent allocation complexity if current system works invoice-level only.

At minimum, derive schedule item paid state safely.

==================================================
33. SCHEDULE REMINDERS
==================================================

Reminder may target individual installment.

Example:

5 000 MAD due 15/08/2026.

This makes reminder amount accurate.

==================================================
PART 11 — PROMISE TO PAY
==================================================

Add "Promesse de paiement".

Use cases:

Client contacted:
"I will pay Friday."

==================================================
34. PROMISE MODEL
==================================================

Concept:

FinancePaymentPromise

invoice/project
amount nullable/required depending UX
promised_for
note
status
created_by
fulfilled_at
broken_at

Use current conventions.

==================================================
35. PROMISE UX
==================================================

From À encaisser:

[Promesse de paiement]

Drawer:

Date promise
[15/08/2026]

Montant
[5 000 MAD]

Note
[Passera au bureau vendredi]

[Enregistrer]

==================================================
36. PROMISE STATUS
==================================================

Derived/managed states:

active
fulfilled
broken
cancelled

If promised date passes and required outstanding remains:

Promesse non tenue

Do not manually flag it forever if the Payment subsequently satisfies it.

==================================================
37. PAYMENT FULFILLS PROMISE
==================================================

When payment comes in:

evaluate active promises.

If appropriate amount has been paid:

mark fulfilled.

Keep history.

==================================================
PART 12 — COLLECTION HISTORY
==================================================

Add useful payment follow-up history.

Example:

10/08/2026
Rappel créé par Sara

15/08/2026
Rappel arrivé à échéance

15/08/2026
Client contacté
Paiement prévu lundi

18/08/2026
Paiement 3 000 MAD

Use existing Activity system where possible.

Do NOT create redundant event history if current audit/activity log can represent it.

==================================================
38. MANUAL FOLLOW-UP ENTRY
==================================================

Allow simple:

Ajouter une note de relance

Example:

Client appelé.
Paiement prévu jeudi.

Actor/date automatic.

Useful for staff coordination.

==================================================
PART 13 — PAYMENT METHODS
==================================================

Normalize payment methods.

Audit existing enum/catalog first.

Support current useful methods such as:

Espèces
Virement
Chèque
Carte
Autre

Do not create duplicate spelling variants.

==================================================
39. CONDITIONAL REFERENCE
==================================================

Payment:

Virement
→ transaction/reference optional/relevant

Chèque
→ cheque number

Espèces
→ no unnecessary reference required

Reuse current fields or add clean generic:

reference

if appropriate.

Do not create ten payment-method-specific columns unless current architecture requires them.

==================================================
PART 14 — PAYMENT CANCELLATION / CORRECTION
==================================================

Financial Payment history should not silently disappear.

Audit existing delete behavior.

Prefer:

Annuler le paiement

with:

cancelled_at
cancelled_by
cancellation_reason

or current audit-compatible equivalent.

==================================================
40. CANCEL EFFECT
==================================================

Cancelled Payment must no longer count toward:

paid amount
outstanding
schedule fulfillment
promise fulfillment

But historical Payment remains visible appropriately.

==================================================
41. HARD DELETE
==================================================

Do not expose ordinary hard Delete for finalized financial Payments.

Follow the Company Data Recovery / Finance lifecycle principles already established.

No raw role checks.

==================================================
PART 15 — CLIENT STATEMENT / RELEVÉ CLIENT
==================================================

Add useful Client Statement.

==================================================
42. RELEVÉ CLIENT
==================================================

Example:

RELEVÉ CLIENT

Ahmed ...

Date       Document/Paiement           Débit       Crédit

01/06     FAC-001                    20 000
05/06     Paiement                               5 000
25/06     Paiement                               3 000
01/08     FAC-019                    10 000
-------------------------------------------------------
Solde                               22 000 MAD

==================================================
43. STATEMENT SOURCE
==================================================

Use real Client Projects:

Invoices
valid payments

Do not generate from activity log.

==================================================
44. STATEMENT ACTIONS
==================================================

Support:

Aperçu
PDF
Imprimer

Reuse existing PDF infrastructure where appropriate.

Do not install another PDF engine.

==================================================
45. STATEMENT DATE RANGE
==================================================

Allow:

All
Current year
Custom period

Backend validates period.

==================================================
PART 16 — CALENDAR INTEGRATION
==================================================

Finance remains authoritative.

Calendar only displays Finance dates.

Integrate:

- invoice due dates
- scheduled payment dates
- payment reminders
- payment promises

ONLY where useful.

==================================================
46. CALENDAR NORMALIZATION
==================================================

Use the existing Calendar normalized source architecture.

Do not duplicate Finance data into Calendar tables.

Concept:

Finance source
→ Calendar aggregator
→ normalized event

==================================================
47. CALENDAR EVENT EXAMPLES
==================================================

Payment due:

Paiement attendu
Ahmed ...
5 000 MAD

Reminder:

Relance paiement
MAR-0042

Promise:

Promesse de paiement
15/08/2026

==================================================
48. NO CALENDAR AUTHORITY
==================================================

Editing Calendar event must NOT directly mutate Finance fields unless explicit source action supports it.

Finance domain remains source of truth.

==================================================
PART 17 — REALTIME / REVERB
==================================================

Audit existing Finance broadcasts.

Useful cases:

Payment created
→ Project/Client/Finance summaries refresh

Payment cancelled
→ balances refresh

Reminder changes
→ relevant UI refresh

Do not create excessive broadcasts.

Correctness must not depend on Reverb.

==================================================
49. AUTHORITATIVE REFRESH
==================================================

After financial mutation:

prefer refetch/soft reload of authoritative data.

Avoid:

optimistic balance
+
Reverb balance
+
backend balance

causing duplicates/inconsistency.

==================================================
PART 18 — FINANCE SEARCH / FILTERS
==================================================

Improve Finance search.

Useful fields:

Client
Project name/code
Invoice number
Receipt number
Payment reference

Do not expose unauthorized Finance data.

==================================================
50. GLOBAL SEARCH
==================================================

Audit whether Finance items are already part of Global Search.

If yes:

improve safe searchable metadata.

Do not expose sensitive amounts if global search UI currently does not permit them.

Do not redesign Global Search unnecessarily.

==================================================
PART 19 — NOTIFICATION CENTER
==================================================

Use existing notifications.

Finance notifications:

Reminder due
Payment overdue threshold reached where useful
Promise due/broken

Do NOT create daily spam for every overdue invoice.

==================================================
51. OVERDUE NOTIFICATION THROTTLING
==================================================

Example policy:

due date
→ notification

7 days overdue
→ optional escalation

30 days overdue
→ escalation

Do not notify every single day forever.

Centralize policy.

==================================================
PART 20 — PAYMENT FORM IMPROVEMENTS
==================================================

Improve Add Payment UI.

Example:

Nouveau paiement

Client
Ahmed ...

Projet
MAR-0042

Facture
FAC-2026-0048

Total facture:
20 000 MAD

Déjà encaissé:
12 000 MAD

Reste:
8 000 MAD

Montant
[5 000]

Date
[10/08/2026]

Mode
[Espèces ▼]

Référence
[optional]

Note
[optional]

==================================================
52. PAYMENT VALIDATION
==================================================

Backend validates:

positive amount
currency compatibility
invoice/project relation
permissions
tenant
not cancelled invoice where prohibited

Audit whether overpayment is allowed.

Do not silently allow or clamp amount.

If amount > outstanding and business rule doesn't allow it:

validation error.

==================================================
PART 21 — FINANCE DASHBOARD PERFORMANCE
==================================================

Do not issue:

one query per Client
one query per Project
one query per invoice row

Use aggregate queries.

Review indexes for:

due_date
status
project_id
client relation
payment date
cancelled state

Only add justified indexes.

==================================================
53. À ENCAISSER PAGINATION
==================================================

Backend pagination.

Do not load all unpaid invoices.

==================================================
54. SUMMARY QUERY
==================================================

Finance summary may require separate efficient aggregate query.

Do not calculate totals by summing current paginated React rows.

==================================================
PART 22 — SECURITY
==================================================

Use PermissionRegistry.

No:

hasRole('admin')
hasRole('finance')
role === ...

Use actual effective Finance permissions.

==================================================
55. PERMISSION CAPABILITIES
==================================================

Audit/create only necessary granular permissions.

Potential concepts:

finance.view
finance.payments.create
finance.payments.cancel
finance.reminders.manage
finance.collections.view
finance.schedules.manage
finance.statements.generate

Use actual naming conventions.

Do not create duplicates where existing Finance permissions cover actions.

==================================================
56. TENANT / COMPANY SCOPE
==================================================

Every:

Invoice
Payment
Reminder
Schedule
Promise
Statement

must remain within authorized company/tenant scope.

Mandatory backend scope.

Frontend filtering is not authorization.

==================================================
57. PROJECT / CLIENT RELATION
==================================================

Backend must verify:

Invoice belongs to Project
Project belongs to Client

where relevant.

Do not trust IDs sent independently by browser.

==================================================
58. PAYMENT IDOR
==================================================

User must not manipulate:

/project/A/payment/B

if Payment B belongs elsewhere.

Use scoped binding/explicit verification.

==================================================
59. REMINDER IDOR
==================================================

Same rule.

Reminder must belong to authorized Finance source.

==================================================
60. PRINT SECURITY
==================================================

Receipt open/download/print uses trusted source-specific route.

Never accept arbitrary:

path
disk
filename

from frontend.

==================================================
PART 23 — FINANCIAL AUDIT LOG
==================================================

Meaningful actions:

Payment created
Payment cancelled
Reminder created
Reminder snoozed
Reminder completed
Promise created
Promise fulfilled/broken
Schedule changed

Use current activity log.

Do not log ordinary page views.

==================================================
PART 24 — FRONTEND ARCHITECTURE
==================================================

Do not create giant FinancePage.tsx.

Use focused components.

Possible structure conceptually:

FinanceOverview
ReceivablesWorkspace
ReceivableCard/Row
PaymentDrawer
PaymentSuccessReceiptModal
PaymentSchedule
PaymentReminderDrawer
PaymentPromiseDrawer
CollectionHistory
ClientFinancialSummary
ProjectFinancialSummary
ClientStatement

Follow current folder structure.

==================================================
61. BACKEND ARCHITECTURE
==================================================

Keep Controllers thin.

Prefer domain services for:

receivables
reminders
payments
schedules
statements

Do not create an overengineered abstract framework.

==================================================
62. STRICT TYPES
==================================================

No unnecessary `any`.

Normalize backend responses with Resources/DTOs according to project patterns.

==================================================
PART 25 — RESPONSIVE
==================================================

All new Finance UIs must work at:

1920
1440
1280
1024
768
480
390
320

==================================================
63. MOBILE À ENCAISSER
==================================================

Use cards instead of huge desktop table.

Example:

Ahmed ...
MAR-0042

Reste
8 000 MAD

Échéance
01/08

Retard · 9 jours

[Ajouter paiement]
[Relancer]
[...]

==================================================
64. PAYMENT MODAL MOBILE
==================================================

Receipt print modal/buttons stack cleanly.

No overflow.

==================================================
PART 26 — I18N
==================================================

French UI.

Examples:

À encaisser
À recevoir
En retard
Échéance
Échéance aujourd'hui
Rappel
Reporter
Promesse de paiement
Promesse non tenue
Échéancier
Ajouter un paiement
Montant encaissé
Reste
Clients à relancer
Relevé client
Imprimer maintenant
Ouvrir le reçu
Plus tard
Annuler le paiement

Do not expose raw enums.

==================================================
PART 27 — EMPTY / ERROR STATES
==================================================

À encaisser empty:

Aucun paiement à encaisser.

Promise empty:
Aucune promesse de paiement active.

Reminder empty:
Aucun rappel programmé.

Handle errors gracefully.

==================================================
PART 28 — TESTS: RECEIVABLES
==================================================

Required:

Invoice:
10 000

No payments:
outstanding 10 000

Payment:
3 000

outstanding:
7 000

Second:
7 000

outstanding:
0
state:
paid

==================================================
65. TEST OVERDUE
==================================================

Outstanding > 0
due yesterday

→ overdue
→ daysOverdue = 1

Outstanding = 0
due yesterday

→ paid
NOT overdue.

==================================================
66. TEST PARTIAL PAYMENT
==================================================

Partial payment does not falsely mark invoice paid.

==================================================
PART 29 — TEST PAYMENT RECEIPT
==================================================

Create Payment.

Expected:

Payment persisted once.

Receipt persisted/generated once.

Success modal data available.

Print:
works.

Skip:
no data changes.

Open:
works.

Rapid double submit:
no duplicate Payment.

==================================================
PART 30 — TEST REMINDERS
==================================================

Create reminder.

Scheduler before date:
nothing.

At due time:
one notification.

Run scheduler again:
no duplicate.

Snooze:
new target honored.

Fully pay Invoice:
pending reminder no longer triggers.

==================================================
PART 31 — TEST SCHEDULE
==================================================

Invoice:
30 000

Schedule:

10k
10k
10k

verify totals.

Due state per installment.

Payment updates appropriate state according to implemented allocation semantics.

==================================================
PART 32 — TEST PROMISE
==================================================

Promise:
15/08
5 000

Before date:
active.

Date passes unpaid:
broken/overdue according to implementation.

Payment satisfies:
fulfilled.

==================================================
PART 33 — TEST PAYMENT CANCELLATION
==================================================

Invoice:
10k

Payment:
3k

Outstanding:
7k

Cancel Payment.

Outstanding:
10k

Payment history remains.

Audit present.

==================================================
PART 34 — TEST CLIENT SUMMARY
==================================================

Client:

Project A:
10k invoice
5k paid

Project B:
20k invoice
8k paid

Expected:

Facturé:
30k

Encaissé:
13k

Reste:
17k

No cross-client values.

==================================================
PART 35 — TEST PROJECT SUMMARY
==================================================

Only Project's Finance data.

Sibling Project must not leak.

==================================================
PART 36 — TEST À ENCAISSER
==================================================

Filter:

today
upcoming
overdue
30+
promises

Verify correct backend results.

Pagination.

Sorting.

==================================================
PART 37 — TEST TENANT
==================================================

Company A:

Finance records

must not appear in Company B:

Overview
À encaisser
Client summary
Project summary
Calendar
Reminder
Statement

Mandatory.

==================================================
PART 38 — TEST PERMISSIONS
==================================================

View-only Finance user:

can view allowed summaries.

Cannot:

create Payment
cancel Payment
create reminder
edit schedule
create promise

unless effective permission grants it.

Direct backend attempts:
403.

==================================================
PART 39 — CALENDAR TEST
==================================================

Finance due date appears once.

Reminder appears appropriately.

Promise appears appropriately.

No duplicated storage record in Calendar.

==================================================
PART 40 — PERFORMANCE TEST
==================================================

Inspect representative Finance Overview / À encaisser queries.

No N+1.

Report query count if practical.

==================================================
PART 41 — MIGRATIONS
==================================================

Create forward-only migrations.

Do not edit historical production migrations.

Do not wipe/reset DB.

Preserve existing Finance records.

Nullable/new defaults must not corrupt old rows.

==================================================
PART 42 — EXISTING FINANCE REGRESSION
==================================================

Mandatory.

Verify existing:

Devis creation
Facture creation
Receipt creation
Finance templates
preview
PDF
downloads
payments
Project Finance
Client relationships

still work.

==================================================
PART 43 — DO NOT CHANGE
==================================================

Do NOT:

- redesign Finance templates
- alter Devis/Facture PDF visual design
- rewrite template engine
- alter document numbering unnecessarily
- modify unrelated modules
- replace HeroUI
- install packages
- commit
- push

==================================================
PART 44 — IMPLEMENTATION ORDER
==================================================

Work internally in this exact order:

1. Audit
2. Receivables calculation foundation
3. Due dates / overdue state
4. Payment receipt success modal
5. Reminders
6. Notifications/scheduler
7. À encaisser
8. Finance Overview
9. Client summary
10. Project summary
11. Payment schedule
12. Promise to pay
13. Collection history
14. Payment cancellation
15. Client Statement
16. Calendar integration
17. Reverb/soft refresh
18. Security/performance
19. Full regression

Do not jump to UI before financial calculations are authoritative.

==================================================
PART 45 — FINAL MANUAL WORKFLOW
==================================================

Use real development data.

Scenario:

Invoice:
20 000 MAD

Due:
01/08/2026

Already paid:
5 000 MAD

Expected:

Reste:
15 000

En retard:
correct days

Create reminder:
today.

Check notification.

Record Payment:
3 000

Expected:

Paid:
8 000

Reste:
12 000

Receipt generated.

Modal appears:

Plus tard
Ouvrir
Imprimer maintenant

Print.

Create schedule for another Invoice.

Create Payment promise.

Verify Finance Overview.

Verify À encaisser.

Verify Client financial summary.

Verify Project financial summary.

Verify Calendar.

Cancel a test Payment.

Verify balance recalculates.

==================================================
FINAL REPORT
==================================================

ARCHITECTURE

Receivables service:
<path>

Payment service:
<path>

Reminder service:
<path>

Schedule:
<paths>

Promises:
<paths>

Statement:
<paths>

==================================================

PAYMENT

Create:
PASSED / FAILED

Receipt generation:
PASSED / FAILED

Success modal:
PASSED / FAILED

Plus tard:
PASSED / FAILED

Ouvrir:
PASSED / FAILED

Imprimer:
PASSED / FAILED

Duplicate payment protection:
PASSED / FAILED

==================================================

RECEIVABLES

Outstanding calculation:
PASSED / FAILED

Due today:
PASSED / FAILED

Upcoming:
PASSED / FAILED

Overdue:
PASSED / FAILED

Days overdue:
PASSED / FAILED

Aging:
PASSED / FAILED

==================================================

REMINDERS

Create:
PASSED / FAILED

Multiple reminders:
PASSED / FAILED

Snooze:
PASSED / FAILED

Scheduler:
PASSED / FAILED

Duplicate notification protection:
PASSED / FAILED

Auto-close when paid:
PASSED / FAILED

==================================================

À ENCAISSER

Page:
<path>

Today:
PASSED / FAILED

Upcoming:
PASSED / FAILED

Overdue:
PASSED / FAILED

30+:
PASSED / FAILED

Search:
PASSED / FAILED

Filters:
PASSED / FAILED

Sorting:
PASSED / FAILED

Pagination:
PASSED / FAILED

==================================================

DASHBOARD

Facturé:
PASSED / FAILED

Encaissé:
PASSED / FAILED

À recevoir:
PASSED / FAILED

En retard:
PASSED / FAILED

Aging:
PASSED / FAILED

Clients à relancer:
PASSED / FAILED

==================================================

CLIENT

Financial summary:
PASSED / FAILED

Cross-project aggregation:
PASSED / FAILED

Cross-client isolation:
PASSED / FAILED

Statement:
PASSED / FAILED

PDF:
PASSED / FAILED

Print:
PASSED / FAILED

==================================================

PROJECT

Financial summary:
PASSED / FAILED

Payment progress:
PASSED / FAILED

Next due:
PASSED / FAILED

Sibling isolation:
PASSED / FAILED

==================================================

ÉCHÉANCIER

Create:
PASSED / FAILED

Edit:
PASSED / FAILED

Totals:
PASSED / FAILED

Due state:
PASSED / FAILED

Payment integration:
PASSED / FAILED

==================================================

PROMESSES

Create:
PASSED / FAILED

Fulfilled:
PASSED / FAILED

Broken:
PASSED / FAILED

History:
PASSED / FAILED

==================================================

PAYMENT CANCELLATION

Cancel:
PASSED / FAILED

Balance recalculation:
PASSED / FAILED

Audit:
PASSED / FAILED

Hard delete exposed:
NO

==================================================

CALENDAR

Due dates:
PASSED / FAILED

Reminders:
PASSED / FAILED

Promises:
PASSED / FAILED

Duplicate Finance Calendar storage:
NO

==================================================

REALTIME

Reverb reused:
YES / NO

Soft refresh:
PASSED / FAILED

Duplicate events:
NO / YES

==================================================

SECURITY

PermissionRegistry:
PASSED / FAILED

Raw role checks:
NO

Tenant isolation:
PASSED / FAILED

Project/Client relation validation:
PASSED / FAILED

Payment IDOR:
BLOCKED / FAILED

Reminder IDOR:
BLOCKED / FAILED

Unsafe file paths:
NO

==================================================

PERFORMANCE

N+1:
NO / YES

Overview query count:
<value/N/A>

À encaisser query count:
<value/N/A>

Indexes added:
<list/reason>

==================================================

RESPONSIVE

1920:
PASSED / FAILED

1440:
PASSED / FAILED

1280:
PASSED / FAILED

1024:
PASSED / FAILED

768:
PASSED / FAILED

480:
PASSED / FAILED

390:
PASSED / FAILED

320:
PASSED / FAILED

==================================================

REGRESSION

Devis:
PASSED / FAILED

Factures:
PASSED / FAILED

Payments:
PASSED / FAILED

Receipts:
PASSED / FAILED

Finance templates:
PASSED / FAILED

PDF:
PASSED / FAILED

Project Finance:
PASSED / FAILED

==================================================

VALIDATION

Migrations:
<exact>

Finance tests:
<exact>

Reminder tests:
<exact>

Schedule tests:
<exact>

Promise tests:
<exact>

Permission tests:
<exact>

Tenant tests:
<exact>

Calendar tests:
<exact>

PHP syntax:
<exact>

ESLint:
<exact>

TypeScript:
<exact>

npm run build:
<exact>

git diff --check:
<exact>

Packages installed:
NO

Database reset:
NO

Commit:
NO

Push:
NO

List every created/modified file.

Show:

git status --short

STOP after FINANCE V2 is completely implemented and validated.
Do not start another module.