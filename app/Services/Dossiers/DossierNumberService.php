<?php

namespace App\Services\Dossiers;

use App\Models\City;
use Illuminate\Support\Facades\DB;

class DossierNumberService
{
    /**
     * @return array{number:string, sequence:int, period:string}
     */
    public function generate(City $city, ?\DateTimeInterface $at = null): array
    {
        $at ??= now();
        $period = $at->format('Y-m');

        return DB::transaction(function () use ($city, $period) {
            $row = DB::table('dossier_number_sequences')
                ->where('city_id', $city->id)
                ->where('period', $period)
                ->lockForUpdate()
                ->first();

            if (!$row) {
                DB::table('dossier_number_sequences')->insert([
                    'city_id'    => $city->id,
                    'period'     => $period,
                    'last_seq'   => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $row = DB::table('dossier_number_sequences')
                    ->where('city_id', $city->id)
                    ->where('period', $period)
                    ->lockForUpdate()
                    ->first();
            }

            $next = $row->last_seq + 1;
            DB::table('dossier_number_sequences')
                ->where('id', $row->id)
                ->update(['last_seq' => $next, 'updated_at' => now()]);

            $seqStr = str_pad((string) $next, 3, '0', STR_PAD_LEFT);
            $number = sprintf('%s%s-%s', strtoupper($city->code), $seqStr, $period);

            return ['number' => $number, 'sequence' => $next, 'period' => $period];
        });
    }
}
