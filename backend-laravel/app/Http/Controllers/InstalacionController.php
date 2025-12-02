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
        // 1. Establecer la fecha de consulta (hoy por defecto, pero se puede añadir un filtro en el futuro)
        $hoxe = Carbon::today()->format('Y-m-d');
        $diaSemana = $this->getDiaSemanaGallego(Carbon::today());
        
        // 2. Obtener los IDs de Horario disponibles para el día de hoy
        // NOTA: Esto solo trae las franjas que existen en la tabla Horario (creadas previamente)
        $horariosDelDia = Horario::where('dia_semana', $diaSemana)->pluck('id_horario')->toArray();

        // 3. Obtener las reservas CONFIRMADAS para hoy y para esos horarios
        $reservasOcupadas = Reserva::where('data_reserva', $hoxe)
            ->whereIn('id_horario', $horariosDelDia)
            ->where('estado', 'Confirmada')
            ->pluck('id_instalacion')
            ->toArray();

        // 4. Obtener TODAS las instalaciones
        $instalacions = Instalacion::with(['tipo'])->get()->map(function ($i) use ($reservasOcupadas) {
            
            // Comprobación del estado general de la instalación
            $esta_dispoñible = strtolower($i->estado) === 'disponible';
            
            // La instalación está ocupada si su ID está en la lista de reservas
            $ocupada = in_array($i->id_instalacion, $reservasOcupadas);
            
            // Determinar el estado final de disponibilidad
            $disponible_final = $esta_dispoñible && !$ocupada;

            return [
                'id_instalacion' => $i->id_instalacion,
                'nome' => $i->nome,
                'capacidade' => $i->capacidade,
                'estado_general' => $i->estado, 
                'tipo' => [
                    'id_tipo' => $i->tipo?->id_tipo,
                    'nome_tipo' => $i->tipo?->nome_tipo
                ],
                'disponible' => $disponible_final 
            ];
        });
        
        return response()->json($instalacions);
    }
    
    // ... (otros métodos)
}