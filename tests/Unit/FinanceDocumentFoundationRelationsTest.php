<?php

namespace Tests\Unit;

use App\Models\Branch;
use App\Models\Client;
use App\Models\Company;
use App\Models\Dossier;
use App\Models\FinanceDocument;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Tests\TestCase;

class FinanceDocumentFoundationRelationsTest extends TestCase
{
    public function test_conversion_and_tenant_finance_relations_are_declared(): void
    {
        $document = new FinanceDocument;

        $this->assertInstanceOf(BelongsTo::class, $document->convertedToDocument());
        $this->assertInstanceOf(HasOne::class, $document->convertedFromDocument());

        foreach ([new Company, new Branch, new Client, new Dossier] as $model) {
            $this->assertInstanceOf(HasMany::class, $model->financeDocuments());
        }
    }
}
