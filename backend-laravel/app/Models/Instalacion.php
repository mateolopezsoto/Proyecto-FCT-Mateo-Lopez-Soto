<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Instalacion extends Model
{
    protected $table = 'Instalacion';
    protected $primaryKey = 'id_instalacion';
    public $timestamps = false;
    protected $fillable = [
        'nome',
        'capacidade',
        'estado',
        'id_admin',
        'id_tipo'
    ];

    /**
     * Relación: 1 instalación
     * pertence a 1 tipo de instalación
     */
    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoInstalacion::class, 'id_tipo', 'id_tipo');
    }

    /**
     * Relación: 1 instalación
     * pertence a 1 administrador
     */
    public function administrador(): BelongsTo
    {
        return $this->belongsTo(Administrador::class, 'id_admin', 'id_admin');
    }
  
    /**
     * Relación: 1 instalación
     * é reservada por 1 usuario
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }

    /**
     * Relación: 1 instalación
     * ten moitas reservas
     */
    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class, 'id_instalacion', 'id_instalacion');
    }
}