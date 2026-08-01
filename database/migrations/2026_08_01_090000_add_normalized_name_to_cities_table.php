<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        $cities = DB::table('cities')->orderBy('id')->get(['id', 'name']);
        $normalizedNames = [];

        foreach ($cities as $city) {
            $name = preg_replace('/\s+/u', ' ', trim((string) $city->name)) ?? '';
            $normalizedName = Str::lower($name);

            if (isset($normalizedNames[$normalizedName])) {
                throw new \RuntimeException(sprintf(
                    'Impossible d’ajouter l’unicité des villes : « %s » et « %s » ont le même nom normalisé.',
                    $normalizedNames[$normalizedName],
                    $city->name,
                ));
            }

            $normalizedNames[$normalizedName] = $city->name;
        }

        Schema::table('cities', function (Blueprint $table): void {
            $table->string('name_normalized')->nullable()->after('name');
        });

        foreach ($cities as $city) {
            $name = preg_replace('/\s+/u', ' ', trim((string) $city->name)) ?? '';

            DB::table('cities')
                ->where('id', $city->id)
                ->update(['name_normalized' => Str::lower($name)]);
        }

        Schema::table('cities', function (Blueprint $table): void {
            $table->unique('name_normalized', 'cities_name_normalized_unique');
        });
    }

    public function down(): void
    {
        Schema::table('cities', function (Blueprint $table): void {
            $table->dropUnique('cities_name_normalized_unique');
            $table->dropColumn('name_normalized');
        });
    }
};
