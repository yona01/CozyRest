<?php

namespace Database\Factories;

use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\File;

class PropertyImageFactory extends Factory
{
    public function definition(): array
    {
        $property = Property::inRandomOrder()->first() ?? Property::factory()->create();

        $storagePath = storage_path('app/public/property_images');
        $files = File::files($storagePath);

        if (empty($files)) {
            throw new \Exception("No images found in storage/app/public/property_images. Upload some images first.");
        }

        $randomImage = $files[array_rand($files)];

        return [
            'property_id' => $property->id,
            'path' => 'storage/property_images/' . $randomImage->getFilename(),
        ];
    }
}
