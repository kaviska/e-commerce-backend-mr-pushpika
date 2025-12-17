<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class PostalCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ini_set('memory_limit', '1024M');
        $csvFile = database_path('data/exported_postal_codes_db.csv');

        if (!File::exists($csvFile)) {
            Log::error("CSV file not found: $csvFile");
            $this->command->error("CSV file not found: $csvFile");
            return;
        }

        $this->command->info('Starting postal codes import...');

        // Disable foreign key checks and query log for better performance
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::disableQueryLog();

        // Truncate the table before seeding
        DB::table('postal_codes')->truncate();

        // Open the CSV file
        $handle = fopen($csvFile, 'r');

        if ($handle === false) {
            $this->command->error("Unable to open CSV file");
            return;
        }

        // Skip the header row
        $header = fgetcsv($handle);

        $batchSize = 1000;
        $batch = [];
        $totalImported = 0;

        while (($row = fgetcsv($handle)) !== false) {
            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            // Skip if we don't have enough columns
            if (count($row) < 7) {
                continue;
            }

            $batch[] = [
                'postal_code' => $row[1] ?? null,
                'prefecture_code' => $row[2] ?? null,
                'city_code' => $row[3] ?? null,
                'address_detail' => $row[4] ?? null,
                'prefecture_name_en' => $row[5] ?? null,
                'city_name_en' => $row[6] ?? null,
                'additional_info' => $row[7] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Insert in batches for better performance
            if (count($batch) >= $batchSize) {
                DB::table('postal_codes')->insert($batch);
                $totalImported += count($batch);
                $this->command->info("Imported {$totalImported} postal codes...");
                $batch = [];
            }
        }

        // Insert remaining records
        if (!empty($batch)) {
            DB::table('postal_codes')->insert($batch);
            $totalImported += count($batch);
        }

        fclose($handle);

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info("Import completed! Total records imported: {$totalImported}");
    }
}
