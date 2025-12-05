<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;  // ← CAMBIA ESTO
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'Usuario';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $fillable = [
        'nome',
        'apelidos',
        'correo',
        'contrasinal',
        'telefono',
        'id_rol',
        'foto_perfil'
    ];

    protected $hidden = [
        'contrasinal',
    ];

    protected $appends = ['url_foto'];

    protected function urlFoto(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->foto_perfil
                ? asset('storage/' . $this->foto_perfil)
                : null,
        );

    }

    // Para que Laravel no toque los nombres automáticos
    public function getAuthPassword()
    {
        return $this->contrasinal;
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(RolUsuario::class, 'id_rol', 'id_rol');
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class, 'id_usuario', 'id_usuario');
    }

    public function administrador(): HasOne
    {
        return $this->hasOne(Administrador::class, 'usuario_id', 'id_usuario');
    }

    public function getEmailForPasswordReset()
    {
        return $this->correo;
    }

    public function routeNotificationForMail($notificacion) {
        return $this->correo;
    }
}