<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::inRandomOrder()->first()->id,
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph,
            'price' => $this->faker->numberBetween(800, 5000),
            'address' => $this->faker->address,
            'max_guests' => $this->faker->numberBetween(1, 5),
            'rating' => $this->faker->randomFloat(2, 3.5, 5),
            'is_active' => true,
        ];
    }
}
