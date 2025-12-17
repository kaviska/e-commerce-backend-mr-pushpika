<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{

    private array $brandNames = [
        'Astra',
        'Butter Lands',
        'Egg Foundation',
        'EatMore Group',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Brand::factory()->count(10)->create();

        foreach ($this->brandNames as $brandName) {
            Brand::create([
                'name' => $brandName,
            ]);
        }
    }
}
