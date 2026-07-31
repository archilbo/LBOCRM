<?php

namespace App\Services\Dossiers;

use Illuminate\Support\Facades\DB;

class DossierNumberService
{
    /**
     * Generate a globally unique dossier number in P{SEQ}-{PERIOD} format.
     *
     * Example: P001-2026-07
     *
     * @return array{number:string, sequence:int, period:string}
     */
    public function generate(?\DateTimeInterface $at = null): array
    {
        $at ??= now();
        $period = $at->format('Y-m');

        return DB::transaction(function () use ($period) {
            $row = DB::table('dossier_number_sequences')
                ->where('period', $period)
                ->lockForUpdate()
                ->first();

            if (!$row) {
                DB::table('dossier_number_sequences')->insert([
                    'period'     => $period,
                    'last_seq'   => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $row = DB::table('dossier_number_sequences')
                    ->where('period', $period)
                    ->lockForUpdate()
                    ->first();
            }

            $next = $row->last_seq + 1;
            DB::table('dossier_number_sequences')
                ->where('id', $row->id)
                ->update(['last_seq' => $next, 'updated_at' => now()]);

            $seqStr = str_pad((string) $next, 3, '0', STR_PAD_LEFT);
            $number = sprintf('P%s-%s', $seqStr, $period);

            return ['number' => $number, 'sequence' => $next, 'period' => $period];
        });
    }
}
