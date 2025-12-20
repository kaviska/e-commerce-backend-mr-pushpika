<?php

namespace Database\Seeders;

use App\Models\HeroSlider;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class HeroSliderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing hero sliders
        HeroSlider::truncate();

        // Define the source and destination paths
        $sourceDir = public_path('storage/hero-sliders');
        $destinationDisk = 'public';
        $destinationFolder = 'hero-sliders';

        // Hero slider data with default images
        $sliders = [
            [
                'image_file' => '01.png',
                'heading' => 'Welcome to Our Store',
                'sub_heading' => 'Discover amazing products at great prices',
            ],
            [
                'image_file' => '02.png',
                'heading' => 'New Arrivals',
                'sub_heading' => 'Check out our latest collection',
            ],
            [
                'image_file' => '03.png',
                'heading' => 'Special Offers',
                'sub_heading' => 'Save big on your favorite items',
            ],
        ];

        foreach ($sliders as $sliderData) {
            $sourceFile = $sourceDir . '/' . $sliderData['image_file'];

            // Check if the source file exists
            if (File::exists($sourceFile)) {
                // Generate unique filename like the controller does
                $extension = pathinfo($sliderData['image_file'], PATHINFO_EXTENSION);
                $newFileName = time() . '_' . uniqid() . '.' . $extension;
                $destinationPath = $destinationFolder . '/' . $newFileName;

                // Copy the file to storage
                $fileContent = File::get($sourceFile);
                Storage::disk($destinationDisk)->put($destinationPath, $fileContent);

                // Create hero slider record
                HeroSlider::create([
                    'image' => $destinationPath,
                    'heading' => $sliderData['heading'],
                    'sub_heading' => $sliderData['sub_heading'],
                ]);

                echo "Created hero slider with image: {$destinationPath}\n";
            } else {
                echo "Warning: Source file not found: {$sourceFile}\n";
            }

            // Add a small delay to ensure unique timestamps
            usleep(100000); // 0.1 second delay
        }

        echo "Hero slider seeding completed successfully!\n";
    }
}
