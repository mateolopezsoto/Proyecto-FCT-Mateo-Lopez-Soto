<?php

use App\Http\Controllers\AdministradorController;
use App\Http\Controllers\AdminReservaController;
use App\Http\Controllers\EstatisticasController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\InstalacionController;
use App\Http\Controllers\TipoInstalacionController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\HorarioController;
use App\Models\TipoInstalacion;

/*
|------------------------------------------------------------------------
| RUTAS API DO PROXECTO
|------------------------------------------------------------------------
| Este arquivo define todas as rutas API do backend
| Agrúpanse baixo o prefixo /api e sen o middleware web
| Para evitar CSRF e sesións basadas en cookies, xa que se usa Sanctum
*/
Route::prefix('api')
    ->withoutMiddleware(['web']) // desactiva todo o middleware web, incluido CSRF
    ->group(function () {

        /*
        |---------------------------------------------------------
        | Rutas públicas (non requiren autenticación)
        |---------------------------------------------------------
        */

        // Inicio de sesión
        Route::post('/login', [UsuarioController::class, 'login']);
        // Rexistro de usuario
        Route::post('/register', [UsuarioController::class, 'register']);
        // Petición para recuperar a contrasinal
        Route::post('/forgot-password', [UsuarioController::class, 'forgotPassword']);
        // Restablecemento da contrasinal con token
        Route::post('/reset-password', [UsuarioController::class, 'reset']);


        /*
        |---------------------------------------------------------
        | Rutas protexidas con Sanctum
        |---------------------------------------------------------
        */
        Route::middleware('auth:sanctum')->group(function () {
            // Cerrar sesión
            Route::post('/logout', [UsuarioController::class, 'logout']);
            // Crear nova reservas
            Route::post('/reservas', [ReservaController::class, 'store']);
            // Obter todas as reservas do usuario autenticado
            Route::get('/mis-reservas', [ReservaController::class, 'misReservas']);
            // Listado de instalacións dispoñibles
            Route::get('/instalacions', [InstalacionController::class, 'index']);
            // Listado de tipos de instalación dispoñibles
            Route::get('/tipos-instalacion', [TipoInstalacionController::class, 'index']);
            // Listado de horarios dispoñibles
            Route::get('/horarios', [HorarioController::class, 'index']);
            // Obter datos do usuario autenticado
            Route::get('/user', [UsuarioController::class, 'user']);
            // Cancelar unha reserva
            Route::put('/reservas/{id}/cancelar', [ReservaController::class, 'cancelarReserva']);
            // Actualizar perfil do usuario autenticado
            Route::post('/user/profile', [UsuarioController::class, 'updateProfile']);
            // Cambiar contrasinal do usuario autenticado
            Route::put('/user/password', [UsuarioController::class, 'updatePassword']);
            // Crear un novo tipo de instalación
            Route::post('/tipos-instalacion', [TipoInstalacionController::class, 'store']);

            /*
            |---------------------------------------------------------
            | Rutas de administración (requiren rol de admin)
            |---------------------------------------------------------
            | Todas comezan con /api/admin/...
            */
            Route::prefix('admin')->group(function() {
                // Listado de instalacións (vista admin)
                Route::get('/instalacions', [InstalacionController::class, 'indexAdmin']);
                // Eliminar unha instalación
                Route::delete('/instalacions/{id}', [InstalacionController::class, 'destroyInstalacion']);
                // Crear unha instalación
                Route::post('/instalacions', [InstalacionController::class, 'store']);
                // Ver detalles dunha instalación
                Route::get('/instalacions/{id}', [InstalacionController::class, 'show']);
                // Actualizar os datos dunha instalación
                Route::put('/instalacions/{id}', [InstalacionController::class, 'update']);
                // Listado de todas as reservas (admin)
                Route::get('/reservas', [AdminReservaController::class, 'index']);
                // Cambiar estado dunha reserva
                Route::put('/reservas/{id}/estado', [AdminReservaController::class, 'updateEstado']);
                // Estatísticas xenerais
                Route::get('/estatisticas', [EstatisticasController::class, 'index']);
                // Exportar estatísticas nun arquivo
                Route::get('/estatisticas/exportar', [EstatisticasController::class, 'exportar']);
            });
        });
});
