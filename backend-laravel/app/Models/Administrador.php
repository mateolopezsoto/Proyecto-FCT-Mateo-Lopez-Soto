<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Administrador extends Model
{
    protected $table = 'Administrador';
    protected $primaryKey = 'id_admin';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id'
    ];

    /**
     * Relación: 1 administrador
     * é tamén 1 usuario
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'id_usuario');
    }
}
