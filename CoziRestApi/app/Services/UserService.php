<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function create(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'contact_number' => $data['contact_number'] ?? '',
            'api_token' => Str::random(60),
            'role' => $data['role']
        ]);
    }

    public function login(array $credentials): User
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! password_verify($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return $user;
    }

    public function saveUser(array $credentials)
    {
        $user = User::find($credentials['id']);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $existingUser = User::where('email', $credentials['email'])
            ->where('id', '!=', $credentials['id'])
            ->first();

        if ($existingUser) {
            return response()->json(['message' => 'Email is already taken.'], 422);
        }

        $user->update([
            'email' => $credentials['email'],
            'name' => $credentials['name'],
            'contact_number' => $credentials['contact_number'],
        ]);

        return $user;
    }
}
