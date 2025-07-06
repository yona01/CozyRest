<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use App\Models\Property;
use App\Models\Booking;
use App\Models\Rating;

class BookingService
{
    public function bookProperty(array $data): void
    {
        DB::transaction(function () use ($data) {
            $property = Property::findOrFail($data['property_id']);

            $startDate = Carbon::parse($data['start_date']);
            $endDate = Carbon::parse($data['end_date']);
            $numberOfDays = $startDate->diffInDays($endDate) + 1;

            $totalPrice = $property->price * $numberOfDays;

            Booking::create([
                'property_id' => $property->id,
                'user_id'     => $data['user_id'],
                'start_date'  => $startDate,
                'end_date'    => $endDate,
                'total_price' => $totalPrice,
            ]);
        });
    }

    public function getBookedDates($propertyId): array
    {
        $bookings = Booking::where('property_id', $propertyId)->get();

        $bookedDates = [];
        $today = Carbon::today();

        foreach ($bookings as $booking) {
            $start = Carbon::parse($booking->start_date);
            $end = Carbon::parse($booking->end_date);

            if ($end->lt($today)) {
                continue;
            }

            $start = $start->lt($today) ? $today->copy() : $start;

            for ($date = $start; $date->lte($end); $date->addDay()) {
                $bookedDates[] = $date->toDateString();
            }
        }

        return array_unique($bookedDates);
    }

    public function getBookings($userId)
    {
        $bookings = Booking::with('property')
            ->where('user_id', $userId)
            ->orderByDesc('start_date')
            ->get();

        $results = [];

        foreach ($bookings as $booking) {
            if (!$booking->property) {
                continue;
            }

            $start = Carbon::parse($booking->start_date);
            $end = Carbon::parse($booking->end_date);
            $nights = $start->diffInDays($end);
            $pricePerNight = $booking->property->price;
            $totalPrice = $nights * $pricePerNight;

            $rating = Rating::where('user_id', $userId)
                ->where('property_id', $booking->property_id)
                ->value('rating'); 

            $results[] = [
                'property_name' => $booking->property->title,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'price_per_night' => $pricePerNight,
                'total_price' => $totalPrice,
                'property_id' => $booking->property_id,
                'address' => $booking->property->address,
                'user_rating' => $rating,
            ];
        }

        return $results;
    }
}
