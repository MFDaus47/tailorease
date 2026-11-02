<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Muhammad Firdaus',
                'email' => 'mfdaus3158@gmail.com',
                'role' => 'customer',
                'email_verified_at' => now(),
                'password' => Hash::make('12345678'),
            ],
            [
                'name' => 'Tailor Admin',
                'email' => 'tailor@tailorease.test',
                'role' => 'tailor',
                'email_verified_at' => now(),
                'password' => Hash::make('12345678'),
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                [
                    'email' => $user['email'],
                ],
                $user
            );
        }
    }
}
