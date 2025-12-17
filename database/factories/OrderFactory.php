<?php

namespace Database\Factories;

use App\Enums\InvoiceStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentGateways;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\UserType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_number' => $this->faker->randomNumber(6),
            'user_id' => User::inRandomOrder()->first()->id,
            'order_status' => OrderStatus::DELIVERED->value,
            'user_name' => $this->faker->name,
            'user_email' => $this->faker->email,
            'user_phone' => $this->faker->phoneNumber,
            'user_type' => $this->faker->randomElement([UserType::REGISTERED->value, UserType::GUEST->value]),
            'user_address_id' => $this->faker->randomNumber(6),
            'user_address_line1' => $this->faker->address,
            'user_address_line2' => $this->faker->address,
            'user_country' => $this->faker->country,
            'user_region' => $this->faker->name,
            'user_region_id' => $this->faker->randomNumber(6),
            'user_prefecture' => $this->faker->name,
            'user_prefecture_id' => $this->faker->randomNumber(6),
            'user_city' => $this->faker->city,
            'user_postal_code' => $this->faker->postcode,
            'subtotal' => $this->faker->randomFloat(2, 1, 1000),
            'total_discount' => $this->faker->randomFloat(2, 1, 1000),
            'tax' => $this->faker->randomFloat(2, 1, 1000),
            'shipping_cost' => $this->faker->randomFloat(2, 1, 1000),
            'total' => $this->faker->randomFloat(2, 1, 1000),
            'payment_method' => PaymentMethod::BANK_TRANSFER->value,
            'payment_status' => PaymentStatus::COMPLETED->value,
            'paid_amount' => $this->faker->randomFloat(2, 1, 1000),
            'currency' => $this->faker->currencyCode,
            'due_payment_date' => $this->faker->dateTime,
            'due_payment_amount' => $this->faker->randomFloat(2, 1, 1000),
            'send_invoice_status' => InvoiceStatus::PAID->value,
            'payment_gateway' => PaymentGateways::PAYPAL->value,
            'payment_id' => $this->faker->randomNumber(6),
            'payment_data' => $this->faker->randomNumber(6),
            'shipping_status' => null,
           
        ];
    }
}
