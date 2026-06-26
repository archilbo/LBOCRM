<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArchiveRecordRequest;
use App\Http\Requests\UpdateArchiveRecordRequest;
use App\Http\Requests\UpdateArchiveStatusRequest;
use App\Http\Resources\ArchiveRecordResource;
use App\Models\ArchiveRecord;
use App\Models\Dossier;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ArchiveController extends Controller
{
    public function index(): Response
    {
        $archiveRecords = ArchiveRecord::query()
            ->with(['dossier.client'])
            ->latest()
            ->get();

        return Inertia::render('Archives/Index', [
            'archiveRecords' => ArchiveRecordResource::collection($archiveRecords)->resolve(),
            'dossiers' => $this->dossierOptions(),
            'metrics' => [
                'total' => ArchiveRecord::count(),
                'ready' => ArchiveRecord::where('status', 'ready_to_archive')->count(),
                'stored' => ArchiveRecord::where('status', 'stored')->count(),
                'checkedOut' => ArchiveRecord::where('status', 'checked_out')->count(),
                'returned' => ArchiveRecord::where('status', 'returned')->count(),
            ],
        ]);
    }

    public function store(StoreArchiveRecordRequest $request): RedirectResponse
    {
        $data = $this->prepareArchiveData($request->validated());
        $data['archive_number'] = $this->nextArchiveNumber();

        ArchiveRecord::create($data);

        return redirect()
            ->route('archives.index')
            ->with('success', 'Archive record created successfully.');
    }

    public function update(UpdateArchiveRecordRequest $request, ArchiveRecord $archiveRecord): RedirectResponse
    {
        $archiveRecord->update($this->prepareArchiveData($request->validated()));

        return redirect()
            ->route('archives.index')
            ->with('success', 'Archive record updated successfully.');
    }

    public function updateStatus(
        UpdateArchiveStatusRequest $request,
        ArchiveRecord $archiveRecord
    ): RedirectResponse {
        $status = $request->validated('status');

        $payload = [
            'status' => $status,
        ];

        if ($status === 'stored' && !$archiveRecord->in_date) {
            $payload['in_date'] = now()->toDateString();
        }

        if ($status === 'checked_out' && !$archiveRecord->out_date) {
            $payload['out_date'] = now()->toDateString();
        }

        if ($status === 'returned' && !$archiveRecord->returned_at) {
            $payload['returned_at'] = now()->toDateString();
        }

        $archiveRecord->update($payload);

        return redirect()
            ->route('archives.index')
            ->with('success', 'Archive status updated successfully.');
    }

    public function destroy(ArchiveRecord $archiveRecord): RedirectResponse
    {
        $archiveRecord->delete();

        return redirect()
            ->route('archives.index')
            ->with('success', 'Archive record deleted successfully.');
    }

    private function prepareArchiveData(array $data): array
    {
        $data['status'] = $data['status'] ?? 'ready_to_archive';

        foreach (['in_date', 'out_date', 'returned_at'] as $dateField) {
            if (($data[$dateField] ?? null) === '') {
                $data[$dateField] = null;
            }
        }

        return $data;
    }

    private function nextArchiveNumber(): string
    {
        $year = now()->format('Y');
        $next = ArchiveRecord::count() + 1;

        do {
            $number = sprintf('ARC-%s-%04d', $year, $next);
            $next++;
        } while (ArchiveRecord::where('archive_number', $number)->exists());

        return $number;
    }

    private function dossierOptions(): array
    {
        return Dossier::query()
            ->with(['client', 'archiveRecord'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => (string) $dossier->id,
                'label' => $dossier->dossier_number . ' - ' . $dossier->project_object . ' - ' . ($dossier->client?->full_name ?? '-'),
                'hasArchiveRecord' => $dossier->archiveRecord !== null,
            ])
            ->values()
            ->all();
    }
}