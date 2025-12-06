<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reserva extends Model
{
    protected $table = 'Reserva';
    protected $primaryKey = 'id_reserva';
    public $timestamps = false;
    protected $fillable = [
        'data_reserva',
        'estado',
        'id_usuario',
        'id_instalacion',
        'id_admin',
        'id_horario'
    ];

    // Conversión automáticas de tipos
    protected $casts = [
        'data_reserva' => 'date:Y-m-d'
    ];

    /**
     * Relación: 1 reserva
     * pertence a 1 usuario
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    /**
     * Relación: 1 reserva
     * pertence a 1 instalación
     */
    public function instalacion(): BelongsTo
    {
        return $this->belongsTo(Instalacion::class, 'id_instalacion', 'id_instalacion');
    }

    /**
     * Relación: 1 reserva
     * pertence a 1 horario
     */
    public function horario(): BelongsTo
    {
        return $this->belongsTo(Horario::class, 'id_horario', 'id_horario');
    }
}