<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company,
            'email' => $this->faker->unique()->safeEmail,
            'mobile' => $this->faker->optional()->phoneNumber,
            'address' => $this->faker->optional()->address,
            'bank_name' => $this->faker->optional()->company,
            'bank_account_number' => $this->faker->optional()->bankAccountNumber,
        ];
    }
}