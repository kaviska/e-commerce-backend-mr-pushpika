<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regions = json_decode(file_get_contents(database_path('data/regions.json')), true);

        foreach ($regions as $region) {
            \App\Models\Region::create(
                [
                    'name' => $region['name'],
                ]
            );
        }
    }
}
