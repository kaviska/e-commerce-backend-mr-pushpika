<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Product::factory()->count(10)->create();

        // delete images in storage
        Storage::disk("products")->delete(Storage::disk("products")->allFiles());

        $products = json_decode(file_get_contents(database_path('data/products.json')), true);

        foreach ($products as $product) {
            Product::create([
                'name' => $product['name'],
                'slug' => $product['slug'],
                'description' => $product['description'],
                'primary_image' => $product['primary_image'],
                'category_id' => $product['category_id'],
                'brand_id' => $product['brand_id'],
                'barcode' => $product['barcode'],
                'web_availability' => $product['web_availability'],
            ]);
        }

        // copy images
        $diskData = Storage::disk("data");
        $sourceFolder = "images/products/";
        $destinationFolder = storage_path("app/public/images/products/");

        foreach ($diskData->allFiles($sourceFolder) as $file) {
            File::copy($diskData->path($file), $destinationFolder . basename($file));
        }
    }
}
