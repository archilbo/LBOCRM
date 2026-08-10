<?php

namespace App\Http\Controllers;

use App\Models\ArchiveRecord;
use App\Models\Client;
use App\Models\Contract;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\FinanceDocument;
use App\Services\CompanyContext;
use App\Services\PermissionRegistry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class GlobalSearchController extends Controller
{
    public function index(Request $request, CompanyContext $companyContext, PermissionRegistry $permissions): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json([
                'results' => [],
            ]);
        }

        $tokens = $this->tokens($this->normalizeCahierPrefix($query));

        $user = $request->user();
        $canViewArchive = $permissions->allows($user, 'archive.view');

        $matched = collect([
            $permissions->allows($user, 'clients.view') ? $this->clients($tokens, $request, $companyContext) : collect(),
            $permissions->allows($user, 'dossiers.view') ? $this->dossiers($tokens, $request, $companyContext, $canViewArchive) : collect(),
            $permissions->allows($user, 'documents.view') ? $this->documents($tokens, $request, $companyContext) : collect(),
            $permissions->allows($user, 'contracts.view') ? $this->contracts($tokens, $request, $companyContext) : collect(),
            $permissions->allows($user, 'finance.view') ? $this->finance($tokens, $request, $companyContext) : collect(),
            $canViewArchive ? $this->archives($tokens, $request, $companyContext) : collect(),
        ])->filter(fn (Collection $items) => $items->isNotEmpty());

        // Fair-share spread: when every category matches, each gets an equal
        // slice of the 18-result budget instead of the first categories
        // starving the later ones. With one or two matches, the full 5-per-
        // category depth is kept.
        $share = max(1, intdiv(18, max(1, $matched->count())));

        $results = $matched
            ->flatMap(fn (Collection $items) => $items->take($share))
            ->take(18)
            ->values();

        return response()->json([
            'results' => $results,
        ]);
    }

    /**
     * Split the raw query into tokens. Every token must match at least one
     * searchable field of a result ("essai marrakech" behaves as an AND of
     * the two tokens instead of matching a single literal phrase).
     *
     * @return array<int, string>
     */
    private function tokens(string $query): array
    {
        return array_values(array_filter(
            array_map('trim', explode(' ', $query)),
            fn (string $token) => $token !== '',
        ));
    }

    /**
     * LIKE pattern for a single token. User wildcards are escaped so "%" and
     * "_" in the query are matched literally instead of acting as SQL
     * wildcards.
     *
     * The escape character is "!" (not a backslash): a backslash literal in
     * a string is parsed differently by SQLite ('\' is fine) and
     * MySQL/MariaDB ('\' escapes the closing quote and is a syntax error),
     * while "!" behaves identically on every engine.
     */
    private function likePattern(string $token): string
    {
        $escaped = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $token);

        return '%' . $escaped . '%';
    }

    /**
     * Case-insensitive substring match with an explicit ESCAPE clause using
     * a non-backslash escape character, so the escaped wildcards from
     * likePattern() stay literal on SQLite, MySQL and MariaDB alike.
     */
    private function whereToken(Builder $builder, string $column, string $token): Builder
    {
        return $builder->whereRaw(
            $builder->getGrammar()->wrap($column) . " like ? escape '!'",
            [$this->likePattern($token)],
        );
    }

    private function orWhereToken(Builder $builder, string $column, string $token): Builder
    {
        return $builder->orWhereRaw(
            $builder->getGrammar()->wrap($column) . " like ? escape '!'",
            [$this->likePattern($token)],
        );
    }

    private function clients(array $tokens, Request $request, CompanyContext $companyContext): Collection
    {
        return $companyContext->applyTo(Client::query(), $request->user())
            ->where(function (Builder $builder) use ($tokens) {
                foreach ($tokens as $token) {
                    $builder->where(function (Builder $tokenQuery) use ($token) {
                        $this->whereToken($tokenQuery, 'client_number', $token);
                        $this->orWhereToken($tokenQuery, 'full_name', $token);
                        $this->orWhereToken($tokenQuery, 'cin', $token);
                        $this->orWhereToken($tokenQuery, 'phone', $token);
                        $this->orWhereToken($tokenQuery, 'email', $token);
                    });
                }
            })
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Client $client) => [
                'id' => 'client-' . $client->id,
                'type' => 'Client',
                'title' => $client->full_name,
                'subtitle' => $client->client_number . ' · ' . ($client->cin ?? 'No CIN'),
                'meta' => $this->mergeMeta([
                    $client->cin ? 'CIN ' . $client->cin : null,
                    $client->phone ?: null,
                ]),
                'href' => '/clients/' . $client->id,
                'badge' => $client->status,
            ]);
    }

    private function dossiers(array $tokens, Request $request, CompanyContext $companyContext, bool $canViewArchive): Collection
    {
        return $companyContext->applyTo(Dossier::query(), $request->user())
            ->with(['client', 'cahier', ...$canViewArchive ? ['archiveRecord', 'city'] : []])
            ->where(function (Builder $builder) use ($tokens) {
                foreach ($tokens as $token) {
                    $builder->where(function (Builder $tokenQuery) use ($token) {
                        $this->whereToken($tokenQuery, 'dossier_number', $token);
                        $this->orWhereToken($tokenQuery, 'project_object', $token);
                        $this->orWhereToken($tokenQuery, 'project_address', $token);
                        $this->orWhereToken($tokenQuery, 'commune', $token);
                        $this->orWhereToken($tokenQuery, 'province', $token);
                        $this->orWhereToken($tokenQuery, 'land_title_number', $token);
                        $tokenQuery->orWhereHas('cahier', function (Builder $cahierQuery) use ($token) {
                            $this->whereToken($cahierQuery, 'cahier_number', $token);
                        });
                        $tokenQuery->orWhereHas('client', function (Builder $clientQuery) use ($token) {
                            $this->whereToken($clientQuery, 'full_name', $token);
                            $this->orWhereToken($clientQuery, 'client_number', $token);
                            $this->orWhereToken($clientQuery, 'cin', $token);
                        });
                    });
                }
            })
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Dossier $dossier) => [
                'id' => 'dossier-' . $dossier->id,
                'type' => 'Project',
                'title' => $dossier->project_object,
                'subtitle' => $dossier->dossier_number . ' · ' . ($dossier->client?->full_name ?? '-'),
                'meta' => $this->mergeMeta([
                    $dossier->commune ?: null,
                    $dossier->province ?: null,
                ]),
                'href' => '/dossiers/' . $dossier->id,
                'badge' => $dossier->workflow_step,
                'cahier' => $dossier->cahier
                    ? [
                        'number' => (string) $dossier->cahier->cahier_number,
                        'href' => '/dossiers/' . $dossier->id . '?tab=workflow',
                    ]
                    : null,
                'archive' => $canViewArchive && $dossier->relationLoaded('archiveRecord') && $dossier->archiveRecord
                    ? [
                        'number' => $dossier->archiveRecord->archive_number,
                        'status' => $dossier->archiveRecord->status,
                        'location' => collect([$dossier->archiveRecord->room, $dossier->archiveRecord->shelf, $dossier->archiveRecord->box])->filter()->implode(' / '),
                        'city' => $dossier->city?->name,
                        'cityColor' => $dossier->city?->color,
                        'room' => $dossier->archiveRecord->room,
                        'requestedBy' => $dossier->archiveRecord->requested_by,
                        'href' => '/archives/' . $dossier->archiveRecord->id,
                    ]
                    : null,
            ]);
    }

    private function normalizeCahierPrefix(string $query): string
    {
        return preg_replace('/(?:^|\\s)n[°º]\\s*/iu', ' ', $query) ?? $query;
    }

    private function documents(array $tokens, Request $request, CompanyContext $companyContext): Collection
    {
        return DossierDocument::query()
            ->with(['dossier.client', 'template'])
            ->whereHas('dossier', fn ($query) => $companyContext->applyTo($query, $request->user()))
            ->where(function (Builder $builder) use ($tokens) {
                foreach ($tokens as $token) {
                    $builder->where(function (Builder $tokenQuery) use ($token) {
                        $this->whereToken($tokenQuery, 'document_number', $token);
                        $this->orWhereToken($tokenQuery, 'original_filename', $token);
                        $this->orWhereToken($tokenQuery, 'status', $token);
                        $tokenQuery->orWhereHas('template', function (Builder $templateQuery) use ($token) {
                            $this->whereToken($templateQuery, 'name', $token);
                            $this->orWhereToken($templateQuery, 'code', $token);
                        });
                        $tokenQuery->orWhereHas('dossier', function (Builder $dossierQuery) use ($token) {
                            $this->whereToken($dossierQuery, 'dossier_number', $token);
                            $this->orWhereToken($dossierQuery, 'project_object', $token);
                        });
                    });
                }
            })
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (DossierDocument $document) => [
                'id' => 'document-' . $document->id,
                'type' => 'Document',
                'title' => $document->template?->name ?? $document->original_filename ?? 'Document',
                'subtitle' => ($document->dossier?->dossier_number ?? '-') . ' · ' . ($document->original_filename ?? 'No file'),
                'meta' => $this->mergeMeta([
                    $document->template?->code ?: null,
                    $document->document_side ? ucfirst($document->document_side) : null,
                ]),
                'href' => '/documents',
                'badge' => $document->status,
            ]);
    }

    private function contracts(array $tokens, Request $request, CompanyContext $companyContext): Collection
    {
        return Contract::query()
            ->with(['dossier.client'])
            ->whereHas('dossier', fn ($query) => $companyContext->applyTo($query, $request->user()))
            ->where(function (Builder $builder) use ($tokens) {
                foreach ($tokens as $token) {
                    $builder->where(function (Builder $tokenQuery) use ($token) {
                        $this->whereToken($tokenQuery, 'contract_number', $token);
                        $this->orWhereToken($tokenQuery, 'status', $token);
                        $tokenQuery->orWhereHas('dossier', function (Builder $dossierQuery) use ($token) {
                            $this->whereToken($dossierQuery, 'dossier_number', $token);
                            $this->orWhereToken($dossierQuery, 'project_object', $token);
                        });
                        $tokenQuery->orWhereHas('dossier.client', function (Builder $clientQuery) use ($token) {
                            $this->whereToken($clientQuery, 'full_name', $token);
                            $this->orWhereToken($clientQuery, 'cin', $token);
                        });
                    });
                }
            })
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Contract $contract) => [
                'id' => 'contract-' . $contract->id,
                'type' => 'Contract',
                'title' => $contract->contract_number,
                'subtitle' => ($contract->dossier?->dossier_number ?? '-') . ' · ' . ($contract->dossier?->client?->full_name ?? '-'),
                'meta' => $this->mergeMeta([
                    $contract->dossier?->project_object ?: null,
                ]),
                'href' => '/contracts',
                'badge' => $contract->status,
            ]);
    }

    private function finance(array $tokens, Request $request, CompanyContext $companyContext): Collection
    {
        return $companyContext->applyTo(FinanceDocument::query(), $request->user())
            ->with(['dossier', 'client'])
            ->where(function (Builder $builder) use ($tokens) {
                foreach ($tokens as $token) {
                    $builder->where(function (Builder $tokenQuery) use ($token) {
                        $this->whereToken($tokenQuery, 'number', $token);
                        $this->orWhereToken($tokenQuery, 'type', $token);
                        $this->orWhereToken($tokenQuery, 'status', $token);
                        $tokenQuery->orWhereHas('dossier', function (Builder $dossierQuery) use ($token) {
                            $this->whereToken($dossierQuery, 'dossier_number', $token);
                            $this->orWhereToken($dossierQuery, 'project_object', $token);
                        });
                        $tokenQuery->orWhereHas('client', function (Builder $clientQuery) use ($token) {
                            $this->whereToken($clientQuery, 'full_name', $token);
                            $this->orWhereToken($clientQuery, 'cin', $token);
                        });
                    });
                }
            })
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (FinanceDocument $record) => [
                'id' => 'finance-' . $record->id,
                'type' => 'Finance',
                'title' => $record->number,
                'subtitle' => ($record->client?->full_name ?? '-') . ' · ' . number_format((float) $record->total_ttc, 0) . ' MAD',
                'meta' => $this->mergeMeta([
                    $record->type ? ucfirst($record->type) : null,
                    $record->dossier?->dossier_number ? 'Dossier ' . $record->dossier->dossier_number : null,
                ]),
                'href' => route('finance.documents.show', $record),
                'badge' => $record->status,
            ]);
    }

    private function archives(array $tokens, Request $request, CompanyContext $companyContext): Collection
    {
        return ArchiveRecord::query()
            ->with(['dossier.client', 'dossier.city'])
            ->whereHas('dossier', fn ($query) => $companyContext->applyTo($query, $request->user()))
            ->where(function (Builder $builder) use ($tokens) {
                foreach ($tokens as $token) {
                    $builder->where(function (Builder $tokenQuery) use ($token) {
                        $this->whereToken($tokenQuery, 'archive_number', $token);
                        $this->orWhereToken($tokenQuery, 'status', $token);
                        $this->orWhereToken($tokenQuery, 'room', $token);
                        $this->orWhereToken($tokenQuery, 'shelf', $token);
                        $this->orWhereToken($tokenQuery, 'box', $token);
                        $this->orWhereToken($tokenQuery, 'folder', $token);
                        $this->orWhereToken($tokenQuery, 'requested_by', $token);
                        $tokenQuery->orWhereHas('dossier', function (Builder $dossierQuery) use ($token) {
                            $this->whereToken($dossierQuery, 'dossier_number', $token);
                            $this->orWhereToken($dossierQuery, 'project_object', $token);
                        });
                    });
                }
            })
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (ArchiveRecord $record) => [
                'id' => 'archive-' . $record->id,
                'type' => 'Archive',
                'title' => $record->archive_number,
                'subtitle' => ($record->dossier?->dossier_number ?? '-') . ' · ' . collect([$record->room, $record->shelf, $record->box, $record->folder])->filter()->implode(' / '),
                'meta' => $this->mergeMeta([
                    $record->dossier?->project_object ?: null,
                ]),
                'href' => '/archives',
                'badge' => $record->status,
                'archive' => [
                    'number' => $record->archive_number,
                    'status' => $record->status,
                    'location' => collect([$record->room, $record->shelf, $record->box])->filter()->implode(' / '),
                    'city' => $record->dossier?->city?->name,
                    'cityColor' => $record->dossier?->city?->color,
                    'room' => $record->room,
                    'requestedBy' => $record->requested_by,
                    'href' => '/archives/' . $record->id,
                ],
            ]);
    }

    /**
     * Remove empty values and keep the result metadata compact.
     *
     * @param  array<int, string|null>  $pieces
     * @return array<int, string>
     */
    private function mergeMeta(array $pieces): array
    {
        return array_values(array_filter($pieces, fn (?string $piece) => $piece !== null && trim($piece) !== ''));
    }
}
