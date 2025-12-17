<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PrefectureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prefectures = json_decode(file_get_contents(database_path('data/prefectures.json')), true);
        
        foreach ($prefectures as $prefecture) {
            \App\Models\Prefecture::create(
                [
                    'prefecture_name' => $prefecture['prefecture_name'],
                    'shipping_fee' => $prefecture['shipping_fee'],
                    'region_id' => $prefecture['region_id'],
                ]
            );
        }
    }
}
