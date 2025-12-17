<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $product = Product::inRandomOrder()->first();

        return [
            "order_id" => Order::inRandomOrder()->first()->id,
            "stock_id" => 1,
            "product_id" => $product->id ?? 1,
            "product_name" => $product->name,
            "category_id" => $product->category_id,
            "category" => $product->category->name,
            "brand_id" => $product->brand_id,
            'brand' => $product->brand->name,
            'slug' => $product->slug,
            'unit_price' => $product->web_price ?? 100,
            'unit_discount' => $product->web_discount ?? 0,
            'unit_quantity' => $this->faker->randomFloat(2, 1, 1000),
            'line_total' => $product->web_price * $this->faker->randomFloat(2, 1, 1000) ?? 100,
        ];
    }
}
