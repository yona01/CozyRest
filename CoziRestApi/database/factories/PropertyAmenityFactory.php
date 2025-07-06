<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PropertyAmenity>
 */
class PropertyAmenityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'property_id' => \App\Models\Property::inRandomOrder()->first()->id,
            'name' => $this->faker->randomElement(['WiFi', 'TV', 'Aircon', 'Hot Shower', 'Balcony', 'Fridge']),
        ];
    }
}
