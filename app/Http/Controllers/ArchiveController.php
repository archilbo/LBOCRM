<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArchiveRecordRequest;
use App\Http\Requests\UpdateArchiveRecordRequest;
use App\Http\Requests\UpdateArchiveStatusRequest;
use App\Http\Resources\ArchiveEventResource;
use App\Http\Resources\ArchiveRecordResource;
use App\Models\ArchiveRecord;
use App\Models\Box;
use App\Models\City;
use App\Models\Client;
use App\Models\Dossier;
use App\Models\Room;
use App\Models\Shelf;
use App\Services\Archive\ArchiveNotificationService;
use App\Services\Archive\ArchiveNumberingException;
use App\Services\Archive\ArchiveNumberingService;
use App\Services\CompanyContext;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class ArchiveController extends Controller
{
    public function __construct(
        private readonly CompanyContext $companyContext,
        private readonly ArchiveNumberingService $archiveNumbering,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ArchiveRecord::class);

        $query = $this->scopedRecords($request->user())->with(['dossier.client', 'dossier.city']);

        // Status filter
        if ($statuses = $request->input('status')) {
            $statuses = is_array($statuses) ? $statuses : [$statuses];
            $query->whereIn('status', $statuses);
        }

        // Saved view
        $view = $request->input('view');
        if ($view === 'out') {
            $query->where('status', 'checked_out');
        } elseif ($view === 'overdue') {
            $query->overdue();
        } elseif ($view === 'lost') {
            $query->where('is_lost', true);
        } elseif ($view === 'empty_boxes') {
            $query->whereNull('box');
        }

        // Location filters
        if ($room = $request->input('room')) {
            $query->where('room', $room);
        }
        if ($shelf = $request->input('shelf')) {
            $query->where('shelf', $shelf);
        }
        if ($box = $request->input('box')) {
            $query->where('box', $box);
        }

        // City filter (by dossier city code)
        if ($city = $request->input('city')) {
            $query->whereHas('dossier', fn ($q) => $q->whereHas('city', fn ($cq) => $cq->where('code', $city)));
        }

        // Requester & Dossier
        if ($requesterId = $request->input('requesterId')) {
            $query->where('requester_id', $requesterId);
        }
        if ($dossierId = $request->input('dossierId')) {
            $query->where('dossier_id', $dossierId);
        }

        // Due date range
        if ($dueFrom = $request->input('dueFrom')) {
            $query->whereDate('due_at', '>=', $dueFrom);
        }
        if ($dueTo = $request->input('dueTo')) {
            $query->whereDate('due_at', '<=', $dueTo);
        }

        if ($overdueOnly = $request->boolean('overdueOnly')) {
            $query->overdue();
        }

        // Search
        if ($q = $request->input('q')) {
            $like = '%' . $q . '%';
            $query->where(function ($qry) use ($q, $like) {
                $qry->where('archive_number', 'like', $like)
                    ->orWhere('room', 'like', $like)
                    ->orWhere('shelf', 'like', $like)
                    ->orWhere('box', 'like', $like)
                    ->orWhere('folder', 'like', $like)
                    ->orWhere('requested_by', 'like', $like)
                    ->orWhere('notes', 'like', $like)
                    ->orWhereHas('dossier', fn ($d) => $d->where('dossier_number', 'like', $like)
                        ->orWhere('project_object', 'like', $like)
                        ->orWhereHas('client', fn ($c) => $c->where('full_name', 'like', $like)
                            ->orWhere('cin', 'like', $like)
                        )
                    );
            });
            // Prefix matches float to top
            $query->orderByRaw("CASE WHEN archive_number LIKE ? THEN 0 ELSE 1 END", ["$q%"]);
        }

        // Sort
        $sortField = 'created_at';
        $sortDir = 'desc';
        if ($sort = $request->input('sort')) {
            $parts = explode(':', $sort);
            $allowed = ['archive_number', 'status', 'room', 'due_at', 'in_date', 'out_date', 'updated_at', 'created_at'];
            if (in_array($parts[0], $allowed)) {
                $sortField = $parts[0];
                $sortDir = ($parts[1] ?? 'desc') === 'asc' ? 'asc' : 'desc';
            }
        }
        $query->orderBy($sortField, $sortDir);

        // Pagination
        $perPage = min(200, max(10, (int) ($request->input('perPage', 15))));
        $archiveRecords = $query->paginate($perPage);

        // Build storage tree with fill counts and record status summaries
        $archiveCountsByBox = $this->scopedRecords($request->user())->selectRaw('box, COUNT(*) as count')
            ->whereNotNull('box')
            ->groupBy('box')
            ->pluck('count', 'box');

        $archiveStatusesByBox = $this->scopedRecords($request->user())->selectRaw('box, status, COUNT(*) as count')
            ->whereNotNull('box')
            ->groupBy('box', 'status')
            ->get()
            ->groupBy('box')
            ->map(fn ($rows) => $rows->pluck('count', 'status')->toArray());

        $rooms = Room::with('shelves.boxes')->get()->map(fn ($room) => [
            'id' => $room->id,
            'name' => $room->name,
            'code' => $room->code,
            'shelves' => $room->shelves->map(fn ($shelf) => [
                'id' => $shelf->id,
                'name' => $shelf->name,
                'code' => $shelf->code,
                'boxes' => $shelf->boxes->map(fn ($box) => [
                    'id' => $box->id,
                    'name' => $box->name,
                    'code' => $box->code,
                    'capacity' => $box->capacity,
                    'fill' => $box->capacity > 0 ? min(100, (int) round(($archiveCountsByBox[$box->code] ?? 0) / $box->capacity * 100)) : 0,
                    'count' => $archiveCountsByBox[$box->code] ?? 0,
                    'recordsSummary' => $archiveStatusesByBox[$box->code] ?? [],
                ]),
            ]),
        ]);

        // Requesters (distinct requested_by names from archive records)
        $requesters = $this->scopedRecords($request->user())->whereNotNull('requested_by')
            ->distinct('requested_by')
            ->pluck('requested_by')
            ->map(fn ($name) => ['id' => $name, 'name' => $name]);

        // Cells — Room > Box > City grouping for sidebar
        $roomNames = Room::pluck('name', 'code');
        $cells = $this->scopedRecords($request->user())->whereNotNull('room')
            ->with('dossier.city')
            ->get()
            ->groupBy(fn ($r) => $r->room)
            ->map(fn ($byRoom, $roomCode) => [
                'name' => $roomNames[$roomCode] ?? $roomCode,
                'code' => $roomCode,
                'boxes' => $byRoom->groupBy('box')
                    ->map(fn ($byBox, $boxCode) => [
                        'code' => $boxCode,
                        'total' => $byBox->count(),
                        'cities' => $byBox->groupBy(fn ($r) => $r->dossier?->city?->code ?? '__none')
                            ->map(fn ($byCity) => [
                                'code' => $byCity->first()->dossier?->city?->code ?? 'N/A',
                                'name' => $byCity->first()->dossier?->city?->name ?? 'Unknown',
                                'color' => $byCity->first()->dossier?->city?->color ?? '#64748B',
                                'count' => $byCity->count(),
                            ])->values()->all(),
                    ])->values()->all(),
            ])->values()->all();

        $cities = City::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'color']);

        return Inertia::render('Archives/Index', [
            'archives' => ArchiveRecordResource::collection($archiveRecords)->resolve(),
            'paginator' => [
                'currentPage' => $archiveRecords->currentPage(),
                'lastPage' => $archiveRecords->lastPage(),
                'perPage' => $archiveRecords->perPage(),
                'total' => $archiveRecords->total(),
            ],
            'tree' => $rooms,
            'cells' => $cells,
            'clients' => $this->clientOptions($request->user()),
            'dossiers' => $this->dossierOptions($request->user()),
            'requesters' => $requesters,
            'cities' => $cities,
            'kpis' => [
                'total' => $this->scopedRecords($request->user())->count(),
                'ready' => $this->scopedRecords($request->user())->where('status', 'ready_to_archive')->count(),
                'stored' => $this->scopedRecords($request->user())->where('status', 'stored')->count(),
                'checkedOut' => $this->scopedRecords($request->user())->where('status', 'checked_out')->count(),
                'returned' => $this->scopedRecords($request->user())->where('status', 'returned')->count(),
                'overdue' => $this->scopedRecords($request->user())->overdue()->count(),
                'lost' => $this->scopedRecords($request->user())->where('is_lost', true)->count(),
            ],
            'reports' => $this->reportPayload($request->user()),
            'filters' => $request->only([
                'q', 'status', 'view', 'room', 'shelf', 'box',
                'requesterId', 'dossierId', 'dueFrom', 'dueTo',
                'overdueOnly', 'sort', 'page', 'perPage', 'density', 'columns', 'viewMode',
            ]),
        ]);
    }

    public function count(Request $request): \Illuminate\Http\JsonResponse
    {
        $this->authorize('viewAny', ArchiveRecord::class);

        $query = $this->scopedRecords($request->user());

        if ($statuses = $request->input('status')) {
            $query->whereIn('status', (array) $statuses);
        }
        if ($room = $request->input('room')) {
            $query->where('room', $room);
        }
        if ($shelf = $request->input('shelf')) {
            $query->where('shelf', $shelf);
        }
        if ($box = $request->input('box')) {
            $query->where('box', $box);
        }
        if ($requesterId = $request->input('requesterId')) {
            $query->where('requester_id', $requesterId);
        }
        if ($dossierId = $request->input('dossierId')) {
            $query->where('dossier_id', $dossierId);
        }
        if ($dueFrom = $request->input('dueFrom')) {
            $query->whereDate('due_at', '>=', $dueFrom);
        }
        if ($dueTo = $request->input('dueTo')) {
            $query->whereDate('due_at', '<=', $dueTo);
        }

        return response()->json(['count' => $query->count()]);
    }

    public function show(Request $request, ArchiveRecord $archiveRecord): Response
    {
        $this->authorize('view', $archiveRecord);
        $archiveRecord->load(['dossier.client', 'events.actor']);

        $tree = Room::with('shelves.boxes')->get()->map(fn ($room) => [
            'id' => $room->id,
            'name' => $room->name,
            'code' => $room->code,
            'shelves' => $room->shelves->map(fn ($shelf) => [
                'id' => $shelf->id,
                'name' => $shelf->name,
                'code' => $shelf->code,
                'boxes' => $shelf->boxes->map(fn ($box) => [
                    'id' => $box->id,
                    'name' => $box->name,
                    'code' => $box->code,
                    'capacity' => $box->capacity,
                ]),
            ]),
        ]);

        return Inertia::render('Archives/Show', [
            'archiveRecord' => (new ArchiveRecordResource($archiveRecord))->resolve(),
            'events' => ArchiveEventResource::collection($archiveRecord->events)->resolve(),
            'clients' => $this->clientOptions($request->user()),
            'dossiers' => $this->dossierOptions($request->user()),
            'tree' => $tree,
        ]);
    }

    public function store(StoreArchiveRecordRequest $request): RedirectResponse
    {
        $this->authorize('create', ArchiveRecord::class);
        $data = $this->prepareArchiveData($request->validated());

        try {
            $record = DB::transaction(function () use ($data, $request): ArchiveRecord {
                $dossier = $this->scopedDossiers($request->user())->findOrFail($data['dossier_id']);

                // Number + creation happen in the same transaction: the counter row is
                // locked (lockForUpdate), so concurrent requests can never collide.
                $numbering = $this->archiveNumbering->reserve($dossier);

                $data['archive_number'] = $numbering['number'];
                $data['archive_year'] = $numbering['year'];
                $data['archive_sequence'] = $numbering['sequence'];
                $data['company_id'] = $numbering['company_id'];
                $data['city_id'] = $numbering['city_id'];
                $data['folder'] = (string) $this->nextFolderNumber();

                $record = ArchiveRecord::create($data);
                $record->events()->create(['type' => 'ready', 'payload' => ['note' => 'Archive record created']]);

                return $record;
            });
        } catch (ArchiveNumberingException $e) {
            return redirect()->back()->withInput()->withErrors(['dossier_id' => $e->getMessage()]);
        }

        if ($request->filled('return_to')) {
            return redirect()->to($request->string('return_to')->toString())->with('success', 'Archive record created successfully.');
        }

        return redirect()
            ->route('archives.index')
            ->with('success', 'Archive record created successfully.');
    }

    public function storeRoom(Request $request): RedirectResponse
    {
        $this->authorize('create', ArchiveRecord::class);

        $rawName = $request->input('name');

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^SALLE [A-Z]$/i',
                Rule::unique('rooms', 'name')->where(function ($q) use ($rawName) {
                    $q->whereRaw('UPPER(name) = ?', [strtoupper($rawName)]);
                }),
            ],
            'description' => 'nullable|string|max:1000',
            'shelves_count' => 'nullable|integer|min:0|max:100',
            'boxes_per_shelf' => 'nullable|integer|min:0|max:1000',
        ], [
            'name.regex' => 'Le nom doit suivre le format SALLE + lettre (ex: SALLE A).',
            'name.unique' => 'Cette salle existe déjà.',
        ]);

        $roomName = strtoupper($validated['name']);

        $room = Room::create([
            'name' => $roomName,
            'code' => str_replace(' ', '-', $roomName),
            'description' => $validated['description'] ?? null,
        ]);

        $shelvesCount = (int) ($validated['shelves_count'] ?? 0);
        $boxesPerShelf = (int) ($validated['boxes_per_shelf'] ?? 0);

        for ($i = 1; $i <= $shelvesCount; $i++) {
            $shelfNumber = str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            $shelf = Shelf::create([
                'room_id' => $room->id,
                'name' => "{$room->name} - Étagère {$i}",
                'code' => "{$room->code}-ET{$shelfNumber}",
            ]);

            if ($boxesPerShelf > 0) {
                for ($j = 1; $j <= $boxesPerShelf; $j++) {
                    $boxNumber = str_pad((string) $j, 2, '0', STR_PAD_LEFT);
                    Box::create([
                        'shelf_id' => $shelf->id,
                        'name' => "{$shelf->name} - Boîte {$j}",
                        'code' => "{$shelf->code}-BT{$boxNumber}",
                    ]);
                }
            }
        }

        return redirect()
            ->route('archives.index')
            ->with('success', 'Salle créée avec succès.');
    }

    public function update(UpdateArchiveRecordRequest $request, ArchiveRecord $archiveRecord): RedirectResponse
    {
        $this->authorize('update', $archiveRecord);
        $data = $this->prepareArchiveData($request->validated());
        $this->scopedDossiers($request->user())->findOrFail($data['dossier_id']);
        $archiveRecord->update($data);

        if ($request->filled('return_to')) {
            return redirect()->to($request->string('return_to')->toString())->with('success', 'Archive record updated successfully.');
        }

        return redirect()
            ->route('archives.index')
            ->with('success', 'Archive record updated successfully.');
    }

    public function updateStatus(
        UpdateArchiveStatusRequest $request,
        ArchiveRecord $archiveRecord,
        ArchiveNotificationService $notifier,
    ): RedirectResponse {
        $status = $request->validated('status');
        $this->authorize($status === 'checked_out' ? 'checkout' : ($status === 'returned' ? 'checkin' : 'update'), $archiveRecord);

        $payload = [
            'status' => $status,
        ];

        $eventPayload = [];

        if ($status === 'stored' && !$archiveRecord->in_date) {
            $payload['in_date'] = now()->toDateString();
        }

        if ($status === 'checked_out' && !$archiveRecord->out_date) {
            $payload['out_date'] = now()->toDateString();
        }

        if ($status === 'checked_out') {
            if ($request->filled('due_at')) {
                $payload['due_at'] = $request->date('due_at');
            } else {
                $payload['due_at'] = now()->addDays(7);
            }
            $eventPayload['due_at'] = $payload['due_at']->format('Y-m-d');
        }

        if ($status === 'checked_out' && $request->filled('requested_by')) {
            $payload['requested_by'] = $request->string('requested_by');
            $eventPayload['requested_by'] = $payload['requested_by'];
        }

        if ($status === 'checked_out') {
            $payload['checked_out_at'] = now();
        }

        if ($status === 'returned' && !$archiveRecord->returned_at) {
            $payload['returned_at'] = now()->toDateString();
        }

        if ($status === 'returned') {
            $payload['due_at'] = null;
            $payload['checked_out_at'] = null;
        }

        $archiveRecord->update($payload);

        $archiveRecord->events()->create([
            'type' => $status,
            'payload' => $eventPayload,
            'actor_id' => $request->user()?->id,
        ]);

        if ($status === 'checked_out') {
            $notifier->notifyCheckedOut($archiveRecord, $payload['requested_by'] ?? 'Unknown');
        } elseif ($status === 'returned') {
            $notifier->notifyReturned($archiveRecord);
        }

        if ($request->filled('return_to')) {
            return redirect()->to($request->string('return_to')->toString())->with('success', 'Archive status updated successfully.');
        }

        return redirect()
            ->route('archives.index')
            ->with('success', 'Archive status updated successfully.');
    }

    public function destroy(ArchiveRecord $archiveRecord): RedirectResponse
    {
        $this->authorize('delete', $archiveRecord);
        $archiveRecord->delete();

        return redirect()
            ->route('archives.index')
            ->with('success', 'Archive record deleted successfully.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'archive_ids' => ['required', 'array', 'min:1', 'max:100'],
            'archive_ids.*' => ['integer', 'distinct'],
        ]);

        $records = $this->scopedRecords($request->user())
            ->whereKey($data['archive_ids'])
            ->get();

        abort_unless($records->count() === count($data['archive_ids']), 404);

        foreach ($records as $record) {
            $this->authorize('delete', $record);
        }

        DB::transaction(fn () => $records->each->delete());

        return redirect()->route('archives.index')
            ->with('success', "{$records->count()} archive record(s) deleted successfully.");
    }

    public function markLost(Request $request, ArchiveRecord $archiveRecord): RedirectResponse
    {
        $this->authorize('update', $archiveRecord);
        $data = $request->validate([
            'lost_reason' => 'nullable|string|max:1000',
        ]);

        $archiveRecord->update([
            'is_lost' => true,
            'lost_reason' => $data['lost_reason'] ?? null,
            'status' => 'checked_out',
        ]);

        $archiveRecord->events()->create([
            'type' => 'lost',
            'payload' => ['reason' => $data['lost_reason'] ?? 'Marked as lost'],
            'actor_id' => $request->user()?->id,
        ]);

        return redirect()
            ->route('archives.index')
            ->with('success', 'Archive marked as lost.');
    }

    public function bulkStatus(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:archive_records,id'],
            'status' => ['required', 'string', 'max:50'],
        ]);

        $records = $this->recordsByIds($request->user(), $data['ids']);

        foreach ($records as $record) {
            $this->authorize(
                $data['status'] === 'checked_out' ? 'checkout' : ($data['status'] === 'returned' ? 'checkin' : 'update'),
                $record,
            );
            $record->update(['status' => $data['status']]);

            $record->events()->create([
                'type' => $data['status'],
                'payload' => ['note' => 'Bulk status update'],
                'actor_id' => $request->user()?->id,
            ]);
        }

        return redirect()
            ->route('archives.index')
            ->with('success', count($records) . " archive(s) updated to {$data['status']}.");
    }

    public function bulkMove(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:archive_records,id'],
            'room' => ['nullable', 'string', 'max:120'],
            'shelf' => ['nullable', 'string', 'max:120'],
            'box' => ['nullable', 'string', 'max:120'],
        ]);

        $payload = array_filter([
            'room' => $data['room'] ?? null,
            'shelf' => $data['shelf'] ?? null,
            'box' => $data['box'] ?? null,
        ]);

        if (empty($payload)) {
            return redirect()
                ->route('archives.index')
                ->with('error', 'No location fields provided.');
        }

        $records = $this->recordsByIds($request->user(), $data['ids']);

        foreach ($records as $record) {
            $this->authorize('update', $record);
            $from = $record->locationLabel();
            $record->update($payload);

            $record->events()->create([
                'type' => 'moved',
                'payload' => ['from' => $from, 'to' => $record->locationLabel()],
                'actor_id' => $request->user()?->id,
            ]);
        }

        return redirect()
            ->route('archives.index')
            ->with('success', count($records) . ' archive(s) moved.');
    }

    public function checkout(Request $request, ArchiveNotificationService $notifier): RedirectResponse
    {
        $data = $request->validate([
            'archive_ids' => ['required', 'array'],
            'archive_ids.*' => ['integer', 'exists:archive_records,id'],
            'requester_id' => ['nullable', 'integer', 'exists:users,id'],
            'requested_by' => ['nullable', 'string', 'max:255'],
            'due_at' => ['required', 'date'],
            'purpose' => ['nullable', 'string', 'max:500'],
            'notify' => ['nullable', 'boolean'],
        ]);

        // Fallback: if no due_at was explicitly set, default to +7d
        if (!$request->has('due_at')) {
            $data['due_at'] = now()->addDays(7)->format('Y-m-d');
        }

        $records = $this->recordsByIds($request->user(), $data['archive_ids']);

        foreach ($records as $record) {
            $this->authorize('checkout', $record);
            $record->update([
                'status' => 'checked_out',
                'out_date' => $record->out_date ?? now()->toDateString(),
                'due_at' => $data['due_at'],
                'checked_out_at' => now(),
                'requested_by' => $request->input('requested_by'),
            ]);

            $record->events()->create([
                'type' => 'checked_out',
                'payload' => [
                    'due_at' => $data['due_at'],
                    'purpose' => $data['purpose'] ?? null,
                ],
                'actor_id' => $request->user()?->id,
            ]);

            $notifier->notifyCheckedOut($record, $request->input('requested_by', 'Unknown'));
        }

        return redirect()->route('archives.index')->with('success', count($records) . ' archive(s) checked out.');
    }

    public function returnArchives(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'archive_ids' => ['required', 'array'],
            'archive_ids.*' => ['integer', 'exists:archive_records,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $records = $this->recordsByIds($request->user(), $data['archive_ids']);

        foreach ($records as $record) {
            $this->authorize('checkin', $record);
            $record->update([
                'status' => 'returned',
                'returned_at' => $record->returned_at ?? now()->toDateString(),
                'due_at' => null,
                'checked_out_at' => null,
            ]);

            $record->events()->create([
                'type' => 'returned',
                'payload' => ['note' => $data['note'] ?? null],
                'actor_id' => $request->user()?->id,
            ]);
        }

        return redirect()->route('archives.index')->with('success', count($records) . ' archive(s) returned.');
    }

    public function moveArchives(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'archive_ids' => ['required', 'array'],
            'archive_ids.*' => ['integer', 'exists:archive_records,id'],
            'room' => ['required', 'string', 'max:120'],
            'shelf' => ['required', 'string', 'max:120'],
            'box' => ['required', 'string', 'max:120'],
        ]);

        $records = $this->recordsByIds($request->user(), $data['archive_ids']);

        foreach ($records as $record) {
            $this->authorize('update', $record);
            $from = $record->locationLabel();

            $record->update([
                'room' => $data['room'],
                'shelf' => $data['shelf'],
                'box' => $data['box'],
            ]);

            $record->events()->create([
                'type' => 'moved',
                'payload' => ['from' => $from, 'to' => $record->locationLabel()],
                'actor_id' => $request->user()?->id,
            ]);
        }

        return redirect()->route('archives.index')->with('success', count($records) . ' archive(s) moved.');
    }

    public function boxContents(Request $request, string $box): \Illuminate\Http\JsonResponse
    {
        $this->authorize('viewAny', ArchiveRecord::class);

        $records = $this->scopedRecords($request->user())->where('box', $box)
            ->with(['dossier.city', 'dossier.client'])
            ->orderBy('archive_number')
            ->get();

        $boxModel = Box::where('code', $box)->first();

        $roomName = null;
        $roomCode = null;
        $shelfCode = null;

        if ($boxModel && $boxModel->shelf) {
            $shelfCode = $boxModel->shelf->code;
            if ($boxModel->shelf->room) {
                $roomCode = $boxModel->shelf->room->code;
                $roomName = $boxModel->shelf->room->name;
            }
        }

        $groups = $records->groupBy(fn ($r) => $r->dossier?->city?->code ?? '__none')
            ->map(fn ($byCity) => [
                'city' => $byCity->first()->dossier?->city
                    ? ['code' => $byCity->first()->dossier->city->code, 'name' => $byCity->first()->dossier->city->name, 'color' => $byCity->first()->dossier->city->color]
                    : ['code' => 'N/A', 'name' => 'Unknown', 'color' => '#64748B'],
                'records' => $byCity->map(fn ($r) => [
                    'id' => $r->id,
                    'dossierId' => $r->dossier?->id,
                    'dossierNumber' => $r->dossier?->dossier_number,
                    'archiveNumber' => $r->archive_number,
                    'status' => $r->status,
                    'projectObject' => $r->dossier?->project_object,
                    'clientName' => $r->dossier?->client?->full_name,
                    'inDate' => optional($r->in_date)->format('Y-m-d'),
                    'dueAt' => optional($r->due_at)->format('Y-m-d'),
                    'isOverdue' => $r->isOverdue(),
                    'isLost' => $r->is_lost,
                ])->values()->all(),
            ])->values()->all();

        return response()->json([
            'box' => [
                'code' => $box,
                'name' => $boxModel?->name ?? $box,
                'capacity' => $boxModel?->capacity ?? 12,
                'count' => $records->count(),
                'roomName' => $roomName,
                'roomCode' => $roomCode,
                'shelfCode' => $shelfCode,
            ],
            'groups' => $groups,
        ]);
    }

    private function prepareArchiveData(array $data): array
    {
        $data['status'] = $data['status'] ?? 'ready_to_archive';

        foreach (['in_date', 'out_date', 'returned_at'] as $dateField) {
            if (($data[$dateField] ?? null) === '') {
                $data[$dateField] = null;
            }
        }

        if (($data['due_at'] ?? null) === '') {
            $data['due_at'] = null;
        }

        return $data;
    }

    private function nextFolderNumber(): int
    {
        $query = ArchiveRecord::query()
            ->whereNotNull('folder');

        // REGEXP is MySQL-only; SQLite uses GLOB for the same whole-value match.
        if (DB::connection()->getDriverName() === 'sqlite') {
            $query->where('folder', 'GLOB', '[0-9]*');
        } else {
            $query->where('folder', 'REGEXP', '^[0-9]+$');
        }

        $lastFolder = $query
            ->orderByRaw('CAST(folder AS UNSIGNED) DESC')
            ->value('folder');

        return ((int) $lastFolder) + 1;
    }

    public function reports(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', ArchiveRecord::class);

        return redirect()->route('archives.index', ['viewMode' => 'reports']);
    }

    private function reportPayload(User $user): array
    {
        $overdue = $this->scopedRecords($user)->with('dossier.client')
            ->overdue()->orderBy('due_at')->get()
            ->map(fn ($r) => [
                'id' => $r->id, 'archiveNumber' => $r->archive_number,
                'dossierNumber' => $r->dossier?->dossier_number ?? '-', 'projectObject' => $r->dossier?->project_object ?? '-',
                'clientName' => $r->dossier?->client?->full_name ?? '-', 'requestedBy' => $r->requested_by,
                'dueAt' => optional($r->due_at)->format('Y-m-d'), 'overdueDays' => (int) max(0, Carbon::parse($r->due_at)->diffInDays(now(), false)),
            ]);

        $monthly = $this->scopedRecords($user)->selectRaw($this->monthExpression().' as period, COUNT(*) as total')
            ->where('created_at', '>=', now()->subMonths(12))->groupBy('period')->orderBy('period')->get()
            ->map(fn ($r) => ['period' => $r->period, 'total' => (int) $r->total]);

        $lost = $this->scopedRecords($user)->with('dossier.client')->where('is_lost', true)->orderByDesc('updated_at')->get()
            ->map(fn ($r) => [
                'id' => $r->id, 'archiveNumber' => $r->archive_number, 'dossierNumber' => $r->dossier?->dossier_number ?? '-',
                'projectObject' => $r->dossier?->project_object ?? '-', 'lostReason' => $r->lost_reason,
                'lostAt' => optional($r->updated_at)->format('Y-m-d'),
            ]);

        return [
            'overdue' => $overdue->values(), 'monthly' => $monthly->values(), 'lost' => $lost->values(),
            'kpis' => ['totalOverdue' => $overdue->count(), 'totalLost' => $lost->count(), 'avgOverdueDays' => $overdue->isEmpty() ? 0 : (int) round($overdue->avg('overdueDays'))],
        ];
    }

    private function clientOptions(User $user): array
    {
        return $this->companyContext->applyTo(Client::query(), $user)
            ->orderBy('full_name')
            ->get()
            ->map(fn (Client $client) => [
                'id' => (string) $client->id,
                'label' => $client->cin . ' - ' . $client->full_name,
            ])
            ->values()
            ->all();
    }

    private function dossierOptions(User $user): array
    {
        return $this->scopedDossiers($user)
            ->with(['client', 'archiveRecord'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => $dossier->dossier_number . ($dossier->project_object ? ' - ' . $dossier->project_object : ''),
                'clientId' => (string) $dossier->client_id,
                'hasArchiveRecord' => $dossier->archiveRecord !== null,
            ])
            ->values()
            ->all();
    }

    private function scopedDossiers(User $user): Builder
    {
        return $this->companyContext->applyTo(Dossier::query(), $user);
    }

    private function scopedRecords(User $user): Builder
    {
        return ArchiveRecord::query()->whereIn('dossier_id', $this->scopedDossiers($user)->select('id'));
    }

    private function recordsByIds(User $user, array $ids): \Illuminate\Support\Collection
    {
        $records = $this->scopedRecords($user)->whereIn('id', $ids)->get();

        abort_unless($records->count() === count(array_unique($ids)), 403);

        return $records;
    }

    private function monthExpression(): string
    {
        return match (config('database.default')) {
            'sqlite' => "strftime('%Y-%m', created_at)",
            'pgsql' => "to_char(created_at, 'YYYY-MM')",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };
    }
}
