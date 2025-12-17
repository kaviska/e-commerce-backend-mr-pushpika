<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $products = Product::all();

        if ($users->isEmpty() || $products->isEmpty()) {
            return;
        }

        foreach ($products as $product) {
            // Add 0-5 reviews per product
            $reviewCount = rand(0, 5);

            for ($i = 0; $i < $reviewCount; $i++) {
                $user = $users->random();

                // Check if user already reviewed this product
                if (Review::where('user_id', $user->id)->where('product_id', $product->id)->exists()) {
                    continue;
                }

                Review::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'rating' => rand(1, 5),
                    'comment' => $this->getRandomComment(),
                ]);
            }
        }
    }

    private function getRandomComment()
    {
        $comments = [
            'Great product! Highly recommended.',
            'Good value for money.',
            'Average quality, but does the job.',
            'Not satisfied with the purchase.',
            'Excellent service and fast delivery.',
            'Will buy again!',
            'The product arrived damaged.',
            'Better than expected.',
            'Just okay.',
            'Amazing quality!',
        ];

        return $comments[array_rand($comments)];
    }
}
