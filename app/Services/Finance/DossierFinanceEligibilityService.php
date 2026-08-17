<?php

namespace App\Services\Finance;

use App\Models\Dossier;
use App\Models\FinanceDocument;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class DossierFinanceEligibilityService
{
    public function assertCanCreateDocument(
        array $scope,
        string $type,
        ?int $dossierId,
        ?int $exceptDocumentId = null,
        ?int $clientId = null,
    ): void
    {
        if (! $dossierId || ! in_array($type, ['quote', 'invoice', 'internal_invoice'], true)) {
            return;
        }

        $dossier = $this->scopedDossier($scope, $dossierId);

        if ($clientId && $clientId !== (int) $dossier->client_id) {
            throw ValidationException::withMessages([
                'client_id' => 'Le client selectionne ne correspond pas au dossier.',
            ]);
        }

        if ($type === 'invoice' && $this->hasActiveInvoice($scope, $dossierId, $exceptDocumentId)) {
            throw ValidationException::withMessages([
                'dossier_id' => 'Ce dossier possede deja une facture active.',
            ]);
        }

        if ($type === 'quote' && $this->hasAcceptedQuote($scope, $dossierId)) {
            throw ValidationException::withMessages([
                'dossier_id' => 'Impossible de creer un nouveau devis: un devis a deja ete accepte pour ce dossier.',
            ]);
        }
    }

    public function assertCanRecordAdvance(array $scope, Dossier $dossier, ?int $requestedClientId = null): void
    {
        $this->scopedDossier($scope, $dossier->id);

        if ($requestedClientId && $requestedClientId !== (int) $dossier->client_id) {
            throw ValidationException::withMessages([
                'client_id' => 'Le client selectionne ne correspond pas au dossier.',
            ]);
        }

        $state = $this->stateForDocuments($this->scopedDocuments($scope, $dossier->id)->get());

        if (! $state['canRecordAdvance']) {
            throw ValidationException::withMessages([
                'finance_document_id' => $state['paymentReason'],
            ]);
        }
    }

    public function stateForDocuments(Collection $documents): array
    {
        $activeDocuments = $documents->filter(fn (FinanceDocument $document) => $document->status !== 'cancelled');
        $activeInvoice = $activeDocuments->first(fn (FinanceDocument $document) => $document->isInvoice());
        $acceptedQuote = $documents->first(fn (FinanceDocument $document) => $document->isQuote() && $document->accepted_at !== null);
        $activeQuote = $activeDocuments->first(fn (FinanceDocument $document) => $document->isQuote());

        $canCreateInvoice = $activeInvoice === null;
        $canCreateQuote = $acceptedQuote === null;
        $canRecordAdvance = $activeInvoice === null && $activeQuote === null;

        return [
            'canCreateInvoice' => $canCreateInvoice,
            'canCreateQuote' => $canCreateQuote,
            'canRecordAdvance' => $canRecordAdvance,
            'invoiceId' => $activeInvoice?->id,
            'acceptedQuoteId' => $acceptedQuote?->id,
            'paymentReason' => $activeInvoice
                ? 'Une facture existe deja: enregistrez le paiement sur cette facture.'
                : ($activeQuote ? 'Un devis existe deja: creez ou convertissez la facture avant d enregistrer un paiement.' : null),
        ];
    }

    public function invoiceGuardKey(array $scope, string $type, ?int $dossierId, string $status): ?string
    {
        if ($type !== 'invoice' || ! $dossierId || $status === 'cancelled') {
            return null;
        }

        return sprintf('branch:%s:dossier:%d', $scope['branch_id'] ?? 'global', $dossierId);
    }

    public function hasActiveInvoice(array $scope, int $dossierId, ?int $exceptDocumentId = null): bool
    {
        return $this->scopedDocuments($scope, $dossierId)
            ->where('type', 'invoice')
            ->where('status', '!=', 'cancelled')
            ->when($exceptDocumentId, fn ($query, $id) => $query->whereKeyNot($id))
            ->exists();
    }

    private function hasAcceptedQuote(array $scope, int $dossierId): bool
    {
        return $this->scopedDocuments($scope, $dossierId)
            ->where('type', 'quote')
            ->whereNotNull('accepted_at')
            ->where('status', '!=', 'cancelled')
            ->exists();
    }

    private function scopedDocuments(array $scope, int $dossierId)
    {
        return FinanceDocument::query()
            ->where('company_id', $scope['company_id'])
            ->when(
                array_key_exists('branch_id', $scope) && $scope['branch_id'] !== null,
                fn ($query) => $query->where('branch_id', $scope['branch_id']),
                fn ($query) => $query->whereNull('branch_id'),
            )
            ->where('dossier_id', $dossierId);
    }

    private function scopedDossier(array $scope, int $dossierId): Dossier
    {
        return Dossier::query()
            ->whereKey($dossierId)
            ->where('company_id', $scope['company_id'])
            ->when(
                array_key_exists('branch_id', $scope) && $scope['branch_id'] !== null,
                fn ($query) => $query->where('branch_id', $scope['branch_id']),
                fn ($query) => $query->whereNull('branch_id'),
            )
            ->lockForUpdate()
            ->firstOrFail();
    }
}
