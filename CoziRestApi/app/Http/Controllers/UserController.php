<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\UserService;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function saveUser(Request $request)
    {
         $validated = $request->validate([
            'id'  => 'required|numeric',
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:20',
        ]);

        $user = $this->userService->saveUser($validated);

        return response()->json([
            'message' => 'Login successful',
            'data' => $user,
        ]);
    }
}
