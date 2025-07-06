<?php

namespace Tests\Unit;

use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $authHeader;

    protected function authenticate()
    {
        $user = User::factory()->create([
            'email' => 'bookinguser@example.com',
            'password' => bcrypt('Password123!'),
            'role' => 'guest',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'bookinguser@example.com',
            'password' => 'Password123!',
        ]);

        $token = $response['token'];
        $this->authHeader = ['Authorization' => "Bearer $token"];
        return $user;
    }

    public function test_book_property_successfully()
    {
        $user = $this->authenticate();
        $property = Property::factory()->create([
            'price' => 150,
        ]);

        $startDate = now()->addDays(1)->format('Y-m-d');
        $endDate = now()->addDays(3)->format('Y-m-d');

        $response = $this->postJson('/api/bookProperty', [
            'property_id' => $property->id,
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ], $this->authHeader);

        $response->assertStatus(200)->assertJson(['message' => 'ok']);

        $this->assertDatabaseHas('bookings', [
            'property_id' => $property->id,
            'user_id' => $user->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);
    }

    public function test_book_property_validation_error()
    {
        $this->authenticate();

        $response = $this->postJson('/api/bookProperty', [
            'property_id' => null,
            'user_id' => null,
            'start_date' => 'invalid-date',
            'end_date' => '2020-01-01',
        ], $this->authHeader);

        $response->assertStatus(422);
    }

    public function test_get_booked_dates()
    {
        $user = $this->authenticate();
        $property = Property::factory()->create();

        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'property_id' => $property->id,
            'start_date' => now()->addDays(1)->format('Y-m-d'),
            'end_date' => now()->addDays(3)->format('Y-m-d'),
        ]);

        $response = $this->getJson("/api/getBookedDates?propertyId={$property->id}", $this->authHeader);

        $response->assertStatus(200);

        $bookedDates = $response->json();

        $expectedDates = [
            now()->addDays(1)->toDateString(),
            now()->addDays(2)->toDateString(),
            now()->addDays(3)->toDateString(),
        ];

        foreach ($expectedDates as $date) {
            $this->assertContains($date, $bookedDates);
        }
    }

    public function test_get_bookings()
    {
        $user = $this->authenticate();
        $property = Property::factory()->create([
            'title' => 'My Sample Property',
            'address' => '456 Test Address',
            'price' => 200,
        ]);

        $startDate = now()->addDays(2);
        $endDate = now()->addDays(4);

        Booking::factory()->create([
            'user_id' => $user->id,
            'property_id' => $property->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        $response = $this->getJson("/api/getBookings?userId={$user->id}", $this->authHeader);

        $response->assertStatus(200)->assertJsonStructure([[
            'property_name',
            'start_date',
            'end_date',
            'price_per_night',
            'total_price',
            'property_id',
            'address',
            'user_rating',
        ]]);

        $data = $response->json()[0];

        $this->assertEquals('My Sample Property', $data['property_name']);
        $this->assertEquals($property->id, $data['property_id']);
        $this->assertEquals($property->address, $data['address']);
        $this->assertEquals(200, $data['price_per_night']);
        $this->assertEquals(400, $data['total_price']); 
    }
}
