<?php

use App\Http\Controllers\AdministradorController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\InstalacionController;
use App\Http\Controllers\TipoInstalacionController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\HorarioController;

Route::prefix('api')
    ->withoutMiddleware(['web']) // desactiva todo el middleware web, incluido CSRF
    ->group(function () {

        // Rutas públicas
        Route::post('/login', [UsuarioController::class, 'login']);
        Route::post('/register', [UsuarioController::class, 'register']);
        Route::post('/forgot-password', [UsuarioController::class, 'forgotPassword']);
        Route::post('/reset-password', [UsuarioController::class, 'reset']);


        // Rutas protegidas con Sanctum
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [UsuarioController::class, 'logout']);
            Route::post('/reservas', [ReservaController::class, 'store']);
            Route::get('/mis-reservas', [ReservaController::class, 'misReservas']);
            Route::get('/instalacions', [InstalacionController::class, 'index']);
            Route::get('/tipos-instalacion', [TipoInstalacionController::class, 'index']);
            Route::get('/horarios', [HorarioController::class, 'index']);
            Route::get('/user', [UsuarioController::class, 'user']);
            Route::put('/reservas/{id}/cancelar', [ReservaController::class, 'cancelarReserva']);
            Route::post('/user/profile', [UsuarioController::class, 'updateProfile']);
            Route::put('/user/password', [UsuarioController::class, 'updatePassword']);
            Route::prefix('admin')->group(function() {
                Route::get('/instalacions', [InstalacionController::class, 'indexAdmin']);
                Route::delete('/instalacions/{id}', [InstalacionController::class, 'destroyInstalacion']);
            });
        });
});
