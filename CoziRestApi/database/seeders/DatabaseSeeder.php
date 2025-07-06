<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            PropertySeeder::class,
            PropertyImageSeeder::class,
            PropertyAmenitySeeder::class,
            BookingSeeder::class,
            RatingSeeder::class,
        ]);
    }
}
