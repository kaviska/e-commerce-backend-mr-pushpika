<?php

namespace Database\Seeders;

use App\Models\Notice;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class NoticeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // delete images in storage
        Storage::disk("notices")->delete(Storage::disk("notices")->allFiles());

        $notices = json_decode(file_get_contents(database_path('data/notice.json')), true);

        foreach ($notices as $notice) {
            Notice::create([
                'title' => $notice['title'],
                'description' => $notice['description'],
                'image' => $notice['image'],
                'link' => $notice['link'],
                'section' => 'sample',
                'status' => $notice['status'],
                'start_date' => $notice['start_date'],
                'end_date' => $notice['end_date'],
                'button_text' => 'Shop Now',
                'additional_field_1' => 'Free Shipping',
                'additional_field_2' => 'Limited Time',
            ]);
        }


        // copy images
        $diskData = Storage::disk("data");
        $sourceFolder = "images/notices/";
        $destinationFolder = storage_path("app/public/images/notices/");

        foreach ($diskData->allFiles($sourceFolder) as $file) {
            File::copy($diskData->path($file), $destinationFolder . basename($file));
        }
    }
}
