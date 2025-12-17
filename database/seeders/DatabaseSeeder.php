<?php

namespace Database\Seeders;

use App\Helper\FileMover;
use App\Models\Supplier;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Database\Seeders\SupplierSeeder;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
                // User Feature Seeders
            UserSeeder::class,
            SellerSeeder::class,
            RolePermissionSeeder::class,
            RegionSeeder::class,
            PrefectureSeeder::class,
            SupplierSeeder::class,
            PostalCodeSeeder::class,

                // Product Feature Seeders
            CategorySeeder::class,
            BrandSeeder::class,
            TaxonomySeeder::class,
                // ProductSeeder::class,

                // Stock Feature Seeders
            VariationSeeder::class,
            VariationOptionSeeder::class,
            
            // Test Product Data Seeder
            TestProductDataSeeder::class,

            // Additional Stock Seeders (must run after products are created)
            // StockSeeder::class,
            // VariationStockSeeder::class,

            // TaxonomyProductSeeder::class,

                // Order Feature Seeders
            CartSeeder::class,
            OrderSeeder::class,
            OrderItemSeeder::class,

                // Notice Feature Seeders
             NoticeSeeder::class,

            // Storage Data Seeder
            StorageDataSeeder::class,
            ReviewSeeder::class,
        ]);

    }
}
