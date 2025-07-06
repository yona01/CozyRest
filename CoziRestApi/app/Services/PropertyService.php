<?php

namespace App\Services;

use App\Models\Property;
use App\Models\PropertyAmenity;
use App\Models\PropertyImage;
use App\Models\Rating;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PropertyService
{
    public function saveProperty(array $data): void
    {
        DB::transaction(function () use ($data) {
            $isUpdate = isset($data['id']) && $data['id'] > 0;

            if ($isUpdate) {
                $property = Property::findOrFail($data['id']);
                $property->update([
                    'user_id'     => $data['user_id'],
                    'title'       => $data['title'],
                    'description' => $data['description'] ?? null,
                    'price'       => $data['price'],
                    'address'     => $data['address'],
                    'max_guests'  => $data['max_guests'] ?? 1,
                    'rating'      => $data['rating'] ?? null,
                    'is_active'   => $data['is_active'] ?? true
                ]);
            } else {
                $property = Property::create([
                    'user_id'     => $data['user_id'],
                    'title'       => $data['title'],
                    'description' => $data['description'] ?? null,
                    'price'       => $data['price'],
                    'address'     => $data['address'],
                    'max_guests'  => $data['max_guests'] ?? 1,
                    'rating'      => $data['rating'] ?? null,
                    'is_active'   => $data['is_active'] ?? true
                ]);
            }

            if (array_key_exists('amenities', $data)) {
                PropertyAmenity::where('property_id', $property->id)->delete();
                
                if (is_array($data['amenities'])) {
                    foreach ($data['amenities'] as $amenityName) {
                        PropertyAmenity::create([
                            'property_id' => $property->id,
                            'name'        => $amenityName,
                        ]);
                    }
                }
            }

            if ($isUpdate && array_key_exists('removed_image_ids', $data)) {
                foreach ($data['removed_image_ids'] as $imageId) {
                    $image = PropertyImage::find($imageId);
                    if ($image) {
                        $relativePath = str_replace('storage/', 'public/', $image->path);
                        Storage::delete($relativePath);
                        $image->delete();
                    }
                }
            }

            if (array_key_exists('images', $data)) {
                foreach ($data['images'] as $image) {
                    if ($image->isValid()) {
                        $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                        $path = $image->storeAs('public/property_images', $filename);

                        PropertyImage::create([
                            'property_id' => $property->id,
                            'path'        => str_replace('public/', 'storage/', $path),
                        ]);
                    }
                }
            }
        });
    }

    public function getProperties(array $filters)
    {
        $query = Property::with(['images', 'amenities']);

        if (!empty($filters['userId'])) {
            $query->where('user_id', $filters['userId']);
        }

        if (empty($filters['showInactive']) || filter_var($filters['showInactive'], FILTER_VALIDATE_BOOLEAN) === false) {
            $query->where('is_active', true);
        }

        return $query->get()->map(function ($property) {
            return [
                'id' => $property->id,
                'user_id' => $property->user_id,
                'title' => $property->title,
                'description' => $property->description,
                'price' => $property->price,
                'address' => $property->address,
                'max_guests' => $property->max_guests,
                'rating' => $property->rating,
                'is_active' => $property->is_active,
                'created_at' => $property->created_at,
                'updated_at' => $property->updated_at,
                'amenities' => $property->amenities->pluck('name')->toArray(),
                'existing_images' => $property->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => asset($image->path),
                        'path' => $image->path
                    ];
                })->toArray(),
            ];
        });
    }

    public function getGuestProperties(array $filters = [])
    {
        $query = Property::with(['images', 'amenities'])
            ->where('is_active', true); 

        if (!empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                ->orWhere('address', 'like', $searchTerm);
            });
        }

        if (!empty($filters['minPrice'])) {
            $query->where('price', '>=', $filters['minPrice']);
        }
        if (!empty($filters['maxPrice'])) {
            $query->where('price', '<=', $filters['maxPrice']);
        }

        if (!empty($filters['minGuests'])) {
            $query->where('max_guests', '>=', $filters['minGuests']);
        }

        return $query->get()->map(function ($property) {
            return [
                'id' => $property->id,
                'user_id' => $property->user_id,
                'title' => $property->title,
                'description' => $property->description,
                'price' => $property->price,
                'address' => $property->address,
                'max_guests' => $property->max_guests,
                'rating' => $property->rating,
                'is_active' => $property->is_active,
                'created_at' => $property->created_at,
                'updated_at' => $property->updated_at,
                'amenities' => collect($property->amenities)->pluck('name')->toArray(),
                'existing_images' => $property->images->map(function ($image) {
                    return $image ? [
                        'id' => $image->id,
                        'url' => asset($image->path),
                        'path' => $image->path
                    ] : null;
                })->filter()->values()->toArray(),
                'image_objects' => $property->images->map(function ($image) {
                    return $image ? [
                        'id' => $image->id,
                        'url' => asset($image->path),
                        'path' => $image->path
                    ] : null;
                })->filter()->values()->toArray(),
            ];
        });
    }

    public function rateProperty(array $credentials): void
    {
        $existing = Rating::where('user_id', $credentials['user_id'])
                        ->where('property_id', $credentials['property_id'])
                        ->first();

        if ($existing) {
            return;
        }

        Rating::create([
            'user_id' => $credentials['user_id'],
            'property_id' => $credentials['property_id'],
            'rating' => $credentials['rating'],
        ]);
        
        $this->updatePropertyRating($credentials['property_id']);
    }

    private function updatePropertyRating($propertyId): void
    {
        $average = Rating::where('property_id', $propertyId)->avg('rating');

        Property::where('id', $propertyId)->update([
            'rating' => $average,
        ]);
    }
}
