<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Horario; // Necesario para buscar/crear horarios
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class ReservaController extends Controller
{
    /**
     * Devuelve el nombre del día de la semana en gallego.
     */
    protected function getDiaSemanaGallego(Carbon $date): string
    {
        Carbon::setLocale('gl'); 
        $dayName = $date->dayName; // Retorna "Luns", "Martes", etc.
        return ucfirst($dayName);
    }

    /**
     * Endpoint: POST /api/reservas
     */
    public function store(Request $request)
    {
        // 1. VALIDACIÓN DE ENTRADA BÁSICA
        $request->validate([
            'id_instalacion' => 'required|exists:Instalacion,id_instalacion', 
            'hora_inicio' => 'required|date_format:H:i', // Espera HH:MM
            'data_reserva' => 'required|date|after_or_equal:today'
        ]);
        
        // --- LÓGICA DE TIEMPO ---
        $dataReserva = $request->data_reserva;
        $horaInicioString = $request->hora_inicio;
        
        // Objeto Carbon para la hora de inicio de la reserva
        $horaInicio = Carbon::createFromFormat('Y-m-d H:i', $dataReserva . ' ' . $horaInicioString);
        $horaFin = $horaInicio->copy()->addHour(); // Hora de fin es siempre 1 hora después
        $diaSemana = $this->getDiaSemanaGallego(Carbon::parse($dataReserva));


        // 2. VALIDACIÓN DE LÍMITES (08:00 a 22:00)
        $horaLimiteInicio = 8; 
        $horaLimiteFin = 22; 
        
        if ($horaInicio->hour < $horaLimiteInicio || $horaFin->hour > $horaLimiteFin || ($horaFin->hour === $horaLimiteFin && $horaFin->minute > 0)) {
            throw ValidationException::withMessages(['hora_inicio' => ['A reserva debe estar entre as 08:00 e as 22:00.']]);
        }

        // 3. BUSCAR/CREAR HORARIO PARA ID_HORARIO
        $horario = Horario::firstOrCreate(
            [
                'dia_semana' => $diaSemana,
                'hora_inicio' => $horaInicio->format('H:i:s'),
                'hora_fin' => $horaFin->format('H:i:s'),
            ]
        );
        $idHorario = $horario->id_horario;


        // 4. VALIDACIÓN DE SOLAPAMIENTO POR ID_HORARIO
        // A táboa Reserva debe ter id_horario e as novas columnas de hora para o solapamento.
        $solapamiento = Reserva::where('id_instalacion', $request->id_instalacion)
            ->where('data_reserva', $dataReserva)
            ->where('id_horario', $idHorario) // Verificación estrita do slot de Horario
            ->where('estado', 'Confirmada')
            ->exists();

        if ($solapamiento) {
            return response()->json(['message' => 'Xa existe unha reserva para esa instalación nese horario.'], Response::HTTP_CONFLICT);
        }

        // 5. CREACIÓN DE LA RESERVA
        $userId = auth('sanctum')->id();
        if (!$userId) {
             throw ValidationException::withMessages(['usuario' => ['Non estás autenticado para reservar.']]); 
        }
        
        $reserva = Reserva::create([
            'data_reserva' => $dataReserva,
            'hora_inicio' => $horaInicio->format('H:i:s'), // Asumindo migración
            'hora_fin' => $horaFin->format('H:i:s'),       // Asumindo migración
            'estado' => 'Confirmada',
            'id_usuario' => $userId,
            'id_instalacion' => $request->id_instalacion,
            'id_horario' => $idHorario, // Usamos o ID do slot creado/encontrado
            'id_admin' => 1 // Provisional
        ]);

        return response()->json(['message' => 'Reserva confirmada!', 'reserva' => $reserva], Response::HTTP_CREATED);
    }
    
    public function misReservas()
    {
        $userId = Auth::id(); 

        $reservas = Reserva::where('id_usuario', $userId)
                            ->with(['instalacion.tipo', 'horario'])
                            ->get();

        return response()->json($reservas);
    }

    public function cancelarReserva(int $id)
    {
        $userId = Auth::id();

        try {
            $reserva = Reserva::where('id_reserva', $id)
                                ->where('id_usuario', $userId)
                                ->firstOrFail();
            
            if (Carbon::parse($reserva->data_reserva)->isPast()) {
                return response()->json(['message' => 'Non se pode cancelar unha reserva xa pasada'], Response::HTTP_CONFLICT);
            }

            $reserva->update(['estado' => 'Cancelada']);

            return response()->json(['message' => 'Reserva cancelada con éxito'], Response::HTTP_OK);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Reserva non atopada ou non autorizada'], Response::HTTP_NOT_FOUND);
        }
    }
}