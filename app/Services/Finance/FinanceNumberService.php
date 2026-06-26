<?php

namespace App\Services\Finance;

use App\Models\FinanceDocument;
use App\Models\Payment;

class FinanceNumberService
{
    public static function nextDocumentNumber(string $type): string
    {
        $year = now()->year;
        $prefix = match ($type) {
            'quote' => 'DEV',
            'invoice' => 'FAC',
            'receipt' => 'REC',
            default => 'DOC',
        };

        $lastNumber = FinanceDocument::where('type', $type)
            ->whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->value('number');

        if ($lastNumber) {
            $parts = explode('-', $lastNumber);
            $lastSeq = (int) end($parts);
            $nextSeq = $lastSeq + 1;
        } else {
            $nextSeq = 1;
        }

        $number = sprintf('%s-%04d-%04d', $prefix, $year, $nextSeq);

        while (FinanceDocument::where('number', $number)->exists()) {
            $nextSeq++;
            $number = sprintf('%s-%04d-%04d', $prefix, $year, $nextSeq);
        }

        return $number;
    }

    public static function nextPaymentNumber(): string
    {
        $year = now()->year;
        $prefix = 'PAY';

        $lastNumber = Payment::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->value('payment_number');

        if ($lastNumber) {
            $parts = explode('-', $lastNumber);
            $lastSeq = (int) end($parts);
            $nextSeq = $lastSeq + 1;
        } else {
            $nextSeq = 1;
        }

        $number = sprintf('%s-%04d-%04d', $prefix, $year, $nextSeq);

        while (Payment::where('payment_number', $number)->exists()) {
            $nextSeq++;
            $number = sprintf('%s-%04d-%04d', $prefix, $year, $nextSeq);
        }

        return $number;
    }
}
