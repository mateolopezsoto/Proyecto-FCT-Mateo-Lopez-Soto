<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Symfony\Component\Translation\Loader\FileLoader;

class RolUsuario extends Model
{
    protected $table = 'RolUsuario';
    protected $primaryKey = 'id_rol';
    public $timestamps = false;
    protected $fillable = [
        'nome_rol'
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuario::class, 'id_rol', 'id_rol');
    }
}