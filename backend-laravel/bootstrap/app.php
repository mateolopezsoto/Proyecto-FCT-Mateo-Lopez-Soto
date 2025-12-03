<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Este require está duplicado, pero lo mantenemos para no romper el flujo del usuario
            require base_path('routes/web.php'); 
        }
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'cors' => \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // CORRECCIÓN CLAVE PARA TOKENS BEARER: 
        // Eliminamos EnsureFrontendRequestsAreStateful. Solo mantenemos CORS.
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
            // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, <-- ELIMINADO
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => 'Non autenticado.'], 401);
            }
            return redirect()->to('/');
        });
    })
    ->create();