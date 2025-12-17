<?php

namespace Database\Seeders;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'mobile' => '1234567890',
            'otp' => 1234,
            'user_type' => UserType::ADMIN,
            'email_verified_at' => '2025-03-24 19:04:02',
            'password' => Hash::make('password'),
        ]);
        User::create([
            'name' => 'Kaviska',
            'email' => 'kaviska525@gmail.com',
            'mobile' => '1234567890',
            'otp' => 1234,
            'user_type' => UserType::ADMIN,
            'email_verified_at' => '2025-03-24 19:04:02',
            'password' => Hash::make('Malidunew@123'),
        ]);

        User::create([
            'name' => 'Walk In Customer',
            'email' => 'walkincustomer@gmail.com',
            'mobile' => '0987654321',
            'otp' => 5678,
            'user_type' => UserType::GUEST,
            'email_verified_at' => '2025-03-25 10:15:00',
            'password' => Hash::make('securepassword'),
        ]);
    }
}
