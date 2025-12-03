<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Instalacion;
use App\Models\Horario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Reserva;

class InstalacionController extends Controller
{
    // Función de ayuda para obtener el día de la semana en gallego
    protected function getDiaSemanaGallego(Carbon $date): string
    {
        Carbon::setLocale('gl'); 
        return ucfirst($date->dayName);
    }

    /**
     * Display a listing of the resource.
     * Retorna todas las instalaciones con su estado de disponibilidad HOY.
     */
    public function index(Request $request)
    {
        $instalacions = Instalacion::with(['tipo'])->get()->map(function ($i) {
            
            // Normalizamos el estado a minúsculas para comparar
            $estado_normalizado = strtolower($i->estado);
            
            // La instalación está disponible para reservar si NO está en mantenimiento ni clausurada.
            // Asumimos que el estado válido para reservar es 'disponible'.
            $esta_dispoñible = $estado_normalizado === 'disponible';
            
            return [
                'id_instalacion' => $i->id_instalacion,
                'nome' => $i->nome,
                'capacidade' => $i->capacidade,
                'estado_general' => $i->estado, // El texto original (ej. "Disponible", "En Mantemento")
                'tipo' => [
                    'id_tipo' => $i->tipo?->id_tipo,
                    'nome_tipo' => $i->tipo?->nome_tipo
                ],
                // CORRECCIÓN: Solo bloqueamos el botón si la instalación está rota/mantenimiento.
                // Si hay huecos libres o no, eso se valida al intentar reservar una hora concreta.
                'disponible' => $esta_dispoñible 
            ];
        });
        
        return response()->json($instalacions);
    }
    
    // ... (otros métodos)
}