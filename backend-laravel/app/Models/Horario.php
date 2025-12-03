<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Horario extends Model
{
    protected $table = 'Horario';
    protected $primaryKey = 'id_horario';
    public $timestamps = false;
    protected $fillable = [
        'dia_semana',
        'hora_inicio',
        'hora_fin'
    ];
    protected $casts = [
        'hora_inicio' => 'string',
        'hora_fin' => 'string'
    ];

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class, 'id_horario', 'id_horario');
    }
}