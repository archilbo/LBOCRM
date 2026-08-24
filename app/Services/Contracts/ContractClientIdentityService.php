<?php

namespace App\Services\Contracts;

use App\Models\Client;
use App\Models\Dossier;

/**
 * Builds the client identity used by contract forms and generated documents.
 *
 * The principal client supplies the address. All linked clients appear in the
 * contract identity, with the principal client always first.
 */
class ContractClientIdentityService
{
    /**
     * @return array{
     *     civility: string,
     *     names: string,
     *     identity: string,
     *     cins: string,
     *     address: string,
     *     clients: list<array{id: string, civility: string, fullName: string, cin: string, address: string, isPrimary: bool}>
     * }
     */
    public function forDossier(?Dossier $dossier): array
    {
        if (! $dossier) {
            return $this->emptyIdentity();
        }

        $dossier->loadMissing(['primaryClient', 'clients']);

        /** @var Client|null $primaryClient */
        $primaryClient = $dossier->primaryClient;
        $clients = $dossier->clients->values();

        if ($primaryClient && ! $clients->contains(fn (Client $client) => $client->is($primaryClient))) {
            $clients->prepend($primaryClient);
        }

        $clients = $clients
            ->unique('id')
            ->sortBy(fn (Client $client) => $primaryClient && $client->is($primaryClient) ? 0 : 1)
            ->values();

        /** @var Client|null $principal */
        $principal = $primaryClient ?? $clients->first();

        $names = $clients
            ->values()
            ->map(fn (Client $client, int $index) => $index === 0
                ? $this->fullName($client)
                : $this->displayName($client))
            ->filter()
            ->implode(' / ');

        $identity = $clients
            ->map(fn (Client $client) => $this->displayName($client))
            ->filter()
            ->implode(' / ');

        $cins = $clients
            ->map(fn (Client $client) => trim((string) $client->cin))
            ->filter()
            ->implode(' / ');

        return [
            'civility' => trim((string) $principal?->civility) ?: 'Mr',
            'names' => $names ?: '-',
            'identity' => $identity ?: '-',
            'cins' => $cins ?: '-',
            'address' => trim((string) $principal?->address) ?: '-',
            'clients' => $clients
                ->map(fn (Client $client) => [
                    'id' => (string) $client->id,
                    'civility' => trim((string) $client->civility),
                    'fullName' => $this->fullName($client),
                    'cin' => trim((string) $client->cin),
                    'address' => trim((string) $client->address),
                    'isPrimary' => $principal !== null && $client->is($principal),
                ])
                ->all(),
        ];
    }

    private function displayName(Client $client): string
    {
        return trim(implode(' ', array_filter([
            trim((string) $client->civility),
            $this->fullName($client),
        ])));
    }

    private function fullName(Client $client): string
    {
        return trim((string) $client->full_name);
    }

    /**
     * @return array{
     *     civility: string,
     *     names: string,
     *     identity: string,
     *     cins: string,
     *     address: string,
     *     clients: list<array{id: string, civility: string, fullName: string, cin: string, address: string, isPrimary: bool}>
     * }
     */
    private function emptyIdentity(): array
    {
        return [
            'civility' => 'Mr',
            'names' => '-',
            'identity' => '-',
            'cins' => '-',
            'address' => '-',
            'clients' => [],
        ];
    }
}
