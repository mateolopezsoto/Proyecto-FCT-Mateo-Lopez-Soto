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

    protected $casts = [
        'data_reserva' => 'date:Y-m-d'
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function instalacion(): BelongsTo
    {
        return $this->belongsTo(Instalacion::class, 'id_instalacion', 'id_instalacion');
    }

    public function administrador(): BelongsTo
    {
        return $this->belongsTo(Administrador::class, 'id_admin', 'id_admin');
    }

    public function horario(): BelongsTo
    {
        return $this->belongsTo(Horario::class, 'id_horario', 'id_horario');
    }
}