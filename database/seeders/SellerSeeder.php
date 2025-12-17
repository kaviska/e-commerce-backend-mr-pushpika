<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SellerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Seller::create([
            'user_id' => 2,
            'shop_name' => 'Default Shop',
            'shop_email' => 'shop@example.com',
            'shop_phone' => '1122334455',
            'status' => 1,
        ]);
    }
}
