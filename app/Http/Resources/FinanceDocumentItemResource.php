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
            'quantity' => (float) $this->quantity,
            'unit' => $this->unit,
            'unitPrice' => (float) $this->unit_price,
            'totalHt' => (float) $this->total_ht,
            'totalTva' => (float) $this->total_tva,
            'totalTtc' => (float) $this->total_ttc,
        ];
    }
}
