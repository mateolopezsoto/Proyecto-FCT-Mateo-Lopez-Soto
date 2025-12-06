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

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'Usuario';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false;

    protected $passwordAttribute = 'contrasinal';

    protected $fillable = [
        'nome',
        'apelidos',
        'correo',
        'contrasinal',
        'telefono',
        'id_rol'
    ];

    protected $hidden = [
        'contrasinal',
    ];

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
}