<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\UserController;

Route::post('/register', fn (Request $request) => app(AuthController::class)->register($request));
Route::post('/login', fn (Request $request) => app(AuthController::class)->login($request));

Route::middleware('jwt.auth')->group(function () {

    Route::post('/saveProperty', fn (Request $request) => app(PropertyController::class)->save($request));
    Route::get('/getProperties', [PropertyController::class, 'getProperties']);
    Route::get('/getGuestProperties', [PropertyController::class, 'getGuestProperties']);

    Route::post('/bookProperty', fn (Request $request) => app(BookingController::class)->book($request));
    Route::get('/getBookedDates', [BookingController::class, 'getBookedDates']);
    Route::get('/getBookings', [BookingController::class, 'getBookings']);

    Route::post('/saveUser', fn (Request $request) => app(UserController::class)->saveUser($request));

    Route::post('/rateProperty', fn (Request $request) => app(PropertyController::class)->rate($request));

});
