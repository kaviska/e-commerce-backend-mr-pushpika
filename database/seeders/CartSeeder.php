<?php

namespace Database\Seeders;

use App\Models\Cart;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cart::factory()->count(5)->create();

        Cart::create([
            'user_id' => 1,
            'stock_id' => 1,
            'quantity' => 1,
        ]);

        Cart::create([
            'user_id' => 1,
            'stock_id' => 2,
            'quantity' => 2,
        ]);
    }
}
