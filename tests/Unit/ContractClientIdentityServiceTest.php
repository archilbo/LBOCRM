<?php

namespace Tests\Unit;

use App\Models\Client;
use App\Models\Dossier;
use App\Services\Contracts\ContractClientIdentityService;
use Illuminate\Support\Collection;
use Tests\TestCase;

class ContractClientIdentityServiceTest extends TestCase
{
    public function test_it_lists_every_linked_client_and_uses_the_principal_address(): void
    {
        $principal = new Client([
            'civility' => 'Mr',
            'full_name' => 'CLIENT PRINCIPAL',
            'cin' => 'AB123456',
            'address' => '12 RUE PRINCIPALE',
        ]);
        $principal->setAttribute('id', 10);

        $coClient = new Client([
            'civility' => 'Ms',
            'full_name' => 'CLIENT SECONDAIRE',
            'cin' => 'CD654321',
            'address' => '99 AUTRE RUE',
        ]);
        $coClient->setAttribute('id', 11);

        $dossier = new Dossier();
        $dossier->setRelation('primaryClient', $principal);
        $dossier->setRelation('clients', new Collection([$coClient, $principal]));

        $identity = app(ContractClientIdentityService::class)->forDossier($dossier);

        $this->assertSame('Mr', $identity['civility']);
        $this->assertSame('CLIENT PRINCIPAL / Ms CLIENT SECONDAIRE', $identity['names']);
        $this->assertSame('Mr CLIENT PRINCIPAL / Ms CLIENT SECONDAIRE', $identity['identity']);
        $this->assertSame('AB123456 / CD654321', $identity['cins']);
        $this->assertSame('12 RUE PRINCIPALE', $identity['address']);
        $this->assertTrue($identity['clients'][0]['isPrimary']);
    }
}
