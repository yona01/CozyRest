<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('+1 days', '+10 days');
        $end = (clone $start)->modify('+'.rand(1, 5).' days');

        $pricePerNight = \App\Models\Property::inRandomOrder()->first()->price ?? 1000;
        $totalPrice = $pricePerNight * (int)$start->diff($end)->format('%a');

        return [
            'property_id' => \App\Models\Property::inRandomOrder()->first()->id,
            'user_id' => \App\Models\User::inRandomOrder()->first()->id,
            'start_date' => $start,
            'end_date' => $end,
            'total_price' => $totalPrice,
        ];
    }
}
