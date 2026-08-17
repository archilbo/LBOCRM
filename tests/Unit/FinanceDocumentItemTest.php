<?php

namespace Tests\Unit;

use App\Models\FinanceDocumentItem;
use PHPUnit\Framework\TestCase;

class FinanceDocumentItemTest extends TestCase
{
    public function test_calculates_ht_tva_and_ttc_from_the_document_rate(): void
    {
        $item = new FinanceDocumentItem([
            'quantity' => 1,
            'unit_price' => 50,
        ]);

        $item->calculateTotals(20);

        $this->assertSame(50.0, (float) $item->total_ht);
        $this->assertSame(10.0, (float) $item->total_tva);
        $this->assertSame(60.0, (float) $item->total_ttc);
    }

    public function test_supports_tax_exempt_documents(): void
    {
        $item = new FinanceDocumentItem([
            'quantity' => 2,
            'unit_price' => 25,
        ]);

        $item->calculateTotals(0);

        $this->assertSame(0.0, (float) $item->total_tva);
        $this->assertSame(50.0, (float) $item->total_ttc);
    }
}
