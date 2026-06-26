<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinanceDocumentItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'position' => $this->position,
            'title' => $this->title,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'unitPrice' => $this->unit_price,
            'discountRate' => $this->discount_rate,
            'tvaRate' => $this->tva_rate,
            'totalHt' => $this->total_ht,
            'totalTva' => $this->total_tva,
            'totalTtc' => $this->total_ttc,
        ];
    }
}
