<?php

return [

    /* ... Defaults ... */
    'defaults' => [
        'guard' => 'sanctum',
        'passwords' => 'users',
    ],

    /* ... Guards ... */
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        'sanctum' => [
            'driver' => 'sanctum',
            'provider' => 'users',
        ],
    ],

    /* ... Providers ... */
    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            // CORRECCIÓN: Usamos la clase directamente, sin env()
            'model' => App\Models\Usuario::class, 
        ],
    ],

    /* ... Passwords ... */
    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens', // O la tabla que uses
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,

];