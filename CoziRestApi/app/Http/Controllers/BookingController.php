<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\BookingService;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function book(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'user_id'     => 'required|exists:users,id',
            'start_date'  => 'required|date|after_or_equal:today',
            'end_date'    => 'required|date|after_or_equal:start_date',
        ]);

        $this->bookingService->bookProperty($validated);

        return response()->json(['message' => 'ok']);
    }

    public function getBookedDates(Request $request)
    {
        $dates = $this->bookingService->getBookedDates([
            'property_id'     => $request->query('propertyId'),
        ]);
   
        return response()->json($dates);

    }

    public function getBookings(Request $request)
    {
        $bookings = $this->bookingService->getBookings([
            'userId'     => $request->query('userId'),
        ]);
   
        return response()->json($bookings);
    }
}
