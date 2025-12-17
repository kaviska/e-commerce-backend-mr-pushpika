<?php

namespace Database\Seeders;

use App\Helper\FileMover;
use App\Models\Product;
use App\Models\Stock;
use App\Models\VariationOption;
use App\Models\VariationStock;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class StorageDataSeeder extends Seeder
{

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fileMover = new FileMover();

        // move porduct images
        $fileMover->move("app_images", "branding", "images/assets/app_img/branding/", "app/public/images/assets/app_img/branding/");
        $fileMover->move("app_images", "images", "images/assets/app_img/images/", "app/public/images/assets/app_img/images/");
        $fileMover->move("web_images", "branding", "images/assets/web_img/branding/", "app/public/images/assets/web_img/branding/");
    }
}
