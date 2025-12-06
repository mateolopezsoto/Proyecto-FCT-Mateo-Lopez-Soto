<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoInstalacion extends Model
{
    protected $table = 'TipoInstalacion';
    protected $primaryKey = 'id_tipo';
    public $timestamps = false;
    protected $fillable = [
        'nome_tipo',
        'descricion'
    ];

    /**
     * Relación: 1 tipo de instalación
     * ten moitas instalacións
     */
    public function instalacions(): HasMany
    {
        return $this->hasMany(Instalacion::class, 'id_tipo', 'id_tipo');
    }
}