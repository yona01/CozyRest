<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Property extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'description', 
        'price',
        'address',
        'max_guests',
        'rating',
        'is_active'
    ];

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class, 'property_id', 'id');
    }

    public function amenities(): HasMany
    {
        return $this->hasMany(PropertyAmenity::class, 'property_id', 'id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'property_id', 'id');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class, 'property_id', 'id');
    }
}
