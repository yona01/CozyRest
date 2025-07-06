<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\PropertyService;

class PropertyController extends Controller
{
    protected $propertyService;

    public function __construct(PropertyService $propertyService)
    {
        $this->propertyService = $propertyService;
    }

    public function save(Request $request)
    {
        $validated = $request->validate([
            'id'           => 'required|numeric',
            'title'        => 'required|string|max:255',
            'user_id'      => 'required|numeric',
            'description'  => 'nullable|string',
            'price'        => 'required|numeric',
            'address'      => 'required|string|max:500',
            'max_guests'   => 'nullable|integer|min:1',
            'rating'       => 'nullable|numeric|min:0|max:5',
            'is_active'    => 'nullable|boolean',
            'amenities'    => 'sometimes|array',
            'amenities.*'  => 'string|max:100',
            'images' => 'sometimes|array',
            'images.*' => 'file|mimes:jpg,jpeg,png|max:5120',
            'removed_image_ids.*' => 'string'
        ]);

        $this->propertyService->saveProperty($validated);

        return response()->json(['message' => 'ok']);
    }

    public function getProperties(Request $request)
    {
        $properties = $this->propertyService->getProperties([
            'userId'     => $request->query('userId'),
            'showInactive' => $request->query('showInactive')
        ]);
   
        return response()->json($properties, 200, [], JSON_UNESCAPED_SLASHES);

    }

    public function getGuestProperties(Request $request)
    {
        $properties = $this->propertyService->getGuestProperties([
            'search'     => $request->query('search'),
            'minPrice' => $request->query('minPrice'),
            'maxPrice' => $request->query('maxPrice'),
            'minGuests' => $request->query('minGuests')
        ]);
   
        return response()->json($properties, 200, [], JSON_UNESCAPED_SLASHES);

    }

    public function rate(Request $request)
    {
        $validated = $request->validate([
            'user_id'      => 'required|numeric',
            'property_id'  => 'nullable|numeric',
            'rating'       => 'required|numeric|min:1|max:5',
        ]);

        $this->propertyService->rateProperty($validated);

        return response()->json(['message' => 'ok']);
    }
}
