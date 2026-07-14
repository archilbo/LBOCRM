<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['Casablanca','CSB','#2563EB'],
            ['Rabat','RBT','#059669'],
            ['Salé','SLE','#0EA5E9'],
            ['Fès','FES','#D97706'],
            ['Marrakech','MRK','#DC2626'],
            ['Meknès','MKN','#7C3AED'],
            ['Tanger','TNG','#14B8A6'],
            ['Agadir','AGD','#F97316'],
            ['Oujda','OUJ','#4F46E5'],
            ['Kénitra','KEN','#22C55E'],
            ['Tétouan','TET','#EC4899'],
            ['Safi','SAF','#EAB308'],
            ['El Jadida','EJD','#0D9488'],
            ['Béni Mellal','BNM','#A855F7'],
            ['Nador','NDR','#EF4444'],
            ['Taza','TAZ','#84CC16'],
            ['Settat','STT','#0284C7'],
            ['Khouribga','KHO','#EA580C'],
            ['Larache','LAR','#8B5CF6'],
            ['Guelmim','GLM','#0F766E'],
            ['Berrechid','BRC','#F43F5E'],
            ['Ksar El Kébir','KSK','#65A30D'],
            ['Khemisset','KHM','#3B82F6'],
            ['Errachidia','ERR','#B45309'],
            ['Ouarzazate','OZT','#C026D3'],
            ['Taourirt','TRT','#047857'],
            ['Berkane','BRK','#E11D48'],
            ['Sidi Slimane','SSL','#6366F1'],
            ['Sidi Kacem','SKC','#06B6D4'],
            ['Al Hoceïma','AHC','#BE123C'],
            ['Dakhla','DKL','#0891B2'],
            ['Laâyoune','LYN','#D946EF'],
            ['Tiznit','TZN','#4338CA'],
            ['Taroudant','TRD','#16A34A'],
            ['Essaouira','ESS','#F472B6'],
            ['Ifrane','IFR','#38BDF8'],
            ['Azrou','AZR','#92400E'],
            ['Midelt','MDL','#166534'],
            ['Tinghir','TGH','#A16207'],
            ['Zagora','ZGR','#9D174D'],
            ['Chefchaouen','CFC','#1D4ED8'],
            ['Ouazzane','OZN','#4D7C0F'],
            ['Fkih Ben Salah','FBS','#991B1B'],
            ['Youssoufia','YSF','#115E59'],
            ['Sefrou','SFR','#7E22CE'],
            ['Guercif','GRC','#78350F'],
            ['Jerada','JRD','#365314'],
            ['Sidi Ifni','SIF','#86198F'],
            ['Tan-Tan','TNT','#075985'],
            ['Boujdour','BJD','#881337'],
            ['Smara','SMR','#312E81'],
        ];

        foreach ($cities as [$name, $code, $color]) {
            City::updateOrCreate(['code' => $code], [
                'name' => $name, 'color' => $color, 'is_active' => true,
            ]);
        }
    }
}
