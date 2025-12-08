<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\App;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return 'http://localhost:4200/restablecer-contrasinal?token='.$token.'&email='.$notifiable->getEmailForPasswordReset();
        });

        if (App::environment('production')) {
            URL::forceScheme('https');
        }

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = App::environment('production')
                ? config('app.url')
                : 'http://localhost:4200';
            
            return "{$frontendUrl}/restablecer-contrasinal?token={$token}&email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
