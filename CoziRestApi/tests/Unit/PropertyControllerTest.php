<?php

namespace Tests\Unit;

use App\Models\Property;
use App\Models\PropertyAmenity;
use App\Models\PropertyImage;
use App\Models\Rating;
use App\Services\PropertyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PropertyControllerTest extends TestCase
{
    use RefreshDatabase;

    protected PropertyService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PropertyService();
    }

    public function test_can_create_property_with_amenities_and_images()
    {

        $user = \App\Models\User::factory()->create();
        $fakeImage = UploadedFile::fake()->image('photo.jpg');

        $data = [
            'user_id' => $user->id,
            'title' => 'Cozy Beach House',
            'description' => 'Nice place to relax',
            'price' => 200,
            'address' => '123 Ocean Ave',
            'max_guests' => 4,
            'amenities' => ['WiFi', 'Pool'],
            'images' => [$fakeImage],
        ];

        $this->service->saveProperty($data);

        $this->assertDatabaseHas('properties', ['title' => 'Cozy Beach House']);
        $this->assertDatabaseCount('property_amenities', 2);
        $this->assertDatabaseCount('property_images', 1);

        $image = PropertyImage::first();

        $actualStoragePath = str_replace('storage/', '', $image->path);

        Storage::disk('public')->assertExists($actualStoragePath);

        Storage::disk('public')->delete($actualStoragePath);
    }

    public function test_get_properties_with_filter()
    {
        $user = \App\Models\User::factory()->create();
        Property::factory()->count(3)->create(['user_id' => $user->id, 'is_active' => true]);
        Property::factory()->create(['is_active' => false]);

        $result = $this->service->getProperties(['userId' => $user->id]);

        $this->assertCount(3, $result);
        $this->assertEquals($user->id, $result[0]['user_id']);
    }

    public function test_user_can_rate_property_once_and_updates_rating()
    {
        $user = \App\Models\User::factory()->create();
        $property = Property::factory()->create();

        $this->service->rateProperty([
            'user_id' => $user->id,
            'property_id' => $property->id,
            'rating' => 4,
        ]);

        $this->assertDatabaseHas('ratings', [
            'user_id' => $user->id,
            'property_id' => $property->id,
            'rating' => 4
        ]);

        $updatedProperty = Property::find($property->id);
        $this->assertEquals(4, $updatedProperty->rating);

        $this->service->rateProperty([
            'user_id' => $user->id,
            'property_id' => $property->id,
            'rating' => 5,
        ]);

        $this->assertDatabaseCount('ratings', 1);
    }
}
