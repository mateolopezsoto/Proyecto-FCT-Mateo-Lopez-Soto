<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Instalacion;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EstatisticasController extends Controller
{
    /**
     * Verifica que o usuario autenticado é un administrador.
     */
    private function checkAdmin() {
        /** @var \App\Models\Usuario|null $user */
        $user = Auth::user();
        if ($user) { $user->load('rol'); }

        if (!$user || !$user->rol || $user->rol->nome_rol !== "Administrador") {
            abort(RESPONSE::HTTP_FORBIDDEN, 'Acceso denegado');
        }
    }

    /**
     * GET /api/admin/estatisticas
     * Devolve:
     *  - Contadores de estatísticas
     *  - Datos para gráficas
     */
    public function index() {
        $this->checkAdmin();

        $totalReservas = Reserva::count();
        $instalacionsActivas = Instalacion::whereRaw('LOWER(estado) = ?', ['disponible'])->count();
        $usuariosRexistrados = Usuario::count();

        $reservasPorInstalacion = Instalacion::select('nome', DB::raw('count(Reserva.id_reserva) as total'))
                                            ->leftJoin('Reserva', 'Instalacion.id_instalacion', '=', 'Reserva.id_instalacion')
                                            ->groupBy('Instalacion.id_instalacion')
                                            ->get()
                                            ->map(function ($item) {
                                                return [
                                                    'nombre' => $item->nome ?? 'Eliminada',
                                                    'total' => $item->total
                                                ];
                                            });
        
        $reservasPorHora = DB::table('Reserva')
                                            ->join('Horario', 'Reserva.id_horario', '=', 'Horario.id_horario')
                                            ->select('hora_inicio', DB::raw('count(*) as total'))
                                            ->groupBy('Horario.hora_inicio')
                                            ->orderBy('Horario.hora_inicio')
                                            ->get()
                                            ->map(function ($item) {
                                                return [
                                                    'hora' => substr($item->hora_inicio, 0, 5),
                                                    'total' => $item->total
                                                ];
                                            });
        
        return response()->json([
            'contadores' => [
                'reservas' => $totalReservas,
                'instalacions' => $instalacionsActivas,
                'usuarios' => $usuariosRexistrados
            ],
            'graficas' => [
                'por_instalacion' => $reservasPorInstalacion,
                'por_hora' => $reservasPorHora
            ]
            ]);
    }

    /**
     * GET /api/admin/estatisticas/exportar
     * Xera e descarga un arquivo CSV con:
     *  - Todas as reservas do sistema
     *  - Inclúe usuario, instalación e horario
     */
    public function exportar() {
        $this->checkAdmin();

        $reservas = Reserva::with(['usuario', 'instalacion', 'horario'])->orderBy('data_reserva', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="informe-reservas.csv"'
        ];

        $callback = function() use ($reservas) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID Reserva', 'Data', 'Hora inicio', 'Hora fin', 'Usuario', 'Instalación', 'Estado']);

            foreach ($reservas as $reserva) {
                $horaInicio = $reserva->horario ? substr($reserva->horario->hora_inicio, 0, 5) : 'N/A';
                $horaFin = $reserva->horario ? substr($reserva->horario->hora_fin, 0, 5) : 'N/A';
                $usuario = $reserva->usuario ? ($reserva->usuario->nome . ' ' . $reserva->usuario->apelidos) : 'Usuario eliminado';
                $instalacion = $reserva->instalacion->nome ?? 'Instalación eliminada';
                fputcsv($file, [
                    $reserva->id_reserva,
                    $reserva->data_reserva,
                    $horaInicio,
                    $horaFin,
                    $usuario,
                    $instalacion,
                    $reserva->estado
                ]);
            }
            fclose($file);
        };
        return new StreamedResponse($callback, 200, $headers);
    }
}

