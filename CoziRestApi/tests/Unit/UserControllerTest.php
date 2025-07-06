<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected UserService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new UserService();
    }

    public function test_can_create_user()
    {
        $data = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Password123!',
            'contact_number' => '09123456789',
            'role' => 'guest',
        ];

        $user = $this->service->create($data);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'role' => 'guest',
        ]);

        $this->assertTrue(password_verify('Password123!', $user->password));
    }

    public function test_login_successful()
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $loggedIn = $this->service->login([
            'email' => 'user@example.com',
            'password' => 'secret123',
        ]);

        $this->assertEquals($user->id, $loggedIn->id);
    }

    public function test_login_with_wrong_credentials_throws_validation_exception()
    {
        $this->expectException(ValidationException::class);

        User::factory()->create([
            'email' => 'fail@example.com',
            'password' => bcrypt('correct'),
        ]);

        $this->service->login([
            'email' => 'fail@example.com',
            'password' => 'wrong',
        ]);
    }

    public function test_save_user_successfully()
    {
        $user = User::factory()->create([
            'email' => 'original@example.com',
            'name' => 'Original Name',
            'contact_number' => '09111111111',
        ]);

        $data = [
            'id' => $user->id,
            'email' => 'updated@example.com',
            'name' => 'Updated Name',
            'contact_number' => '09222222222',
        ];

        $updatedUser = $this->service->saveUser($data);

        $this->assertEquals('updated@example.com', $updatedUser->email);
        $this->assertEquals('Updated Name', $updatedUser->name);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'email' => 'updated@example.com',
        ]);
    }

    public function test_save_user_fails_when_email_is_taken()
    {
        $this->withoutExceptionHandling(); 

        $user1 = User::factory()->create(['email' => 'user1@example.com']);
        $user2 = User::factory()->create(['email' => 'user2@example.com']);

        $data = [
            'id' => $user2->id,
            'email' => 'user1@example.com',
            'name' => 'Trying Duplicate Email',
            'contact_number' => '09999999999',
        ];

        $response = $this->service->saveUser($data);

        $this->assertEquals(422, $response->status());
        $this->assertEquals('Email is already taken.', $response->getData()->message);
    }

    public function test_save_user_fails_when_user_not_found()
    {
        $data = [
            'id' => 9999, 
            'email' => 'notfound@example.com',
            'name' => 'Ghost User',
            'contact_number' => '0000000000',
        ];

        $response = $this->service->saveUser($data);

        $this->assertEquals(404, $response->status());
        $this->assertEquals('User not found.', $response->getData()->message);
    }
}
