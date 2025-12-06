<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Instalacion;
use App\Models\Horario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Reserva;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\TipoInstalacion;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Validation\Rule;

class InstalacionController extends Controller
{
    /**
     * Verifica que o usuario autenticado é un administrador.
     */
    private function checkAdmin()
    {
        $user = Auth::user();
        if (!$user || !$user->rol || $user->rol->nome_rol !== "Administrador") {
            abort(Response::HTTP_FORBIDDEN, 'Acceso denegado. Require permisos de administrador');
        }
    }

    // Función de axuda para obter o día da semana en galego
    protected function getDiaSemanaGallego(Carbon $date): string
    {
        Carbon::setLocale('gl'); 
        return ucfirst($date->dayName);
    }

    /**
     * Retorna todas as instalacións co seu estado de dispoñibilidade HOXE.
     * GET /api/instalacions
     */
    public function index(Request $request)
    {
        $instalacions = Instalacion::with(['tipo'])->get()->map(function ($i) {
            
            // Normalizamos o estado a minúsculas para comparar
            $estado_normalizado = strtolower($i->estado);
            
            // A instalación está dispoñible para reservar se NON está en mantemento.
            $esta_dispoñible = $estado_normalizado === 'disponible';
            
            return [
                'id_instalacion' => $i->id_instalacion,
                'nome' => $i->nome,
                'capacidade' => $i->capacidade,
                'estado_general' => $i->estado, // O texto orixinal (ex. "Disponible", "En Mantemento")
                'tipo' => [
                    'id_tipo' => $i->tipo?->id_tipo,
                    'nome_tipo' => $i->tipo?->nome_tipo
                ],
                // Só bloqueamos o botón se a instalación está rota/en mantemento.
                // Se hay ocos libres ou non, eso valídase ao intentar reservar unha hora concreta.
                'disponible' => $esta_dispoñible 
            ];
        });
        
        return response()->json($instalacions);
    }

    /**
     * Lista todas as instalacións
     * GET /api/admin/instalacions
     */
    public function indexAdmin() 
    {
        $this->checkAdmin();

        $instalacions = Instalacion::with('tipo')->get();

        $data = $instalacions->map(function ($inst) {
            return [
                'id_instalacion' => $inst->id_instalacion,
                'nome' => $inst->nome,
                'capacidade' => $inst->capacidade,
                'estado' => $inst->estado,
                'id_tipo' => $inst->id_tipo,
                'tipo' => [
                    'id_tipo' => $inst->tipo->id_tipo,
                    'nome_tipo' => $inst->tipo->nome_tipo
                ],
            ];
        });

        return response()->json($data);
    }
    
    /**
     * Elimina unha instalación
     * DELETE /api/admin/instalacions/{id}
     */
    public function destroyInstalacion(int $id) {
        $this->checkAdmin();

        try {
            $instalacion = Instalacion::findOrFail($id);

            if ($instalacion->reservas()->where('estado', 'Confirmada')->where('data_reserva', '>=', Carbon::today())->exists()) {
                return response()->json(['message' => 'Non se pode eliminar unha instalación con reservas futuras activas'], Response::HTTP_CONFLICT);
            }

            $instalacion->delete();
            return response()->json(['message' => 'Instalación eliminada con éxito'], Response::HTTP_OK);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Instalacion non encontrada'], Response::HTTP_NOT_FOUND);
        } catch (QueryException $e) {
            if ($e->errorInfo[1] == 1451) {
                return response()->json([
                    'message' => 'Non se pode eliminar: Esta instalación ten historial de reservas pasadas'
                ], Response::HTTP_CONFLICT);
            }

            return response()->json(['message' => 'Erro interno da base de datos'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Crea unha nova instalación
     * POST /api/admin/instalacions
     */
    public function store(Request $request) {
        $this->checkAdmin();

        $request->validate([
            'nome' => 'required|string|max:100|unique:Instalacion,nome',
            'id_tipo' => 'required|exists:TipoInstalacion,id_tipo',
            'capacidade' => 'required|integer|max:50',
            'estado' => 'required|string|max:50'
        ]);

        $user = Auth::user();

        $instalacion = Instalacion::create([
            'nome' => $request->nome,
            'id_tipo' => $request->id_tipo,
            'capacidade' => $request->capacidade,
            'estado' => $request->estado,
            'id_admin' => $user->administrador->id_admin ?? 1
        ]);

        return response()->json(['message' => 'Instalación creada correctamente', 'instalación' => $instalacion], Response::HTTP_CREATED);
    }

    public function show($id) {
        $this->checkAdmin();
        $instalacion = Instalacion::findOrFail($id);
        return response()->json($instalacion);
    }

    public function update(Request $request, $id) {
        $this->checkAdmin();
        $instalacion = Instalacion::findOrFail($id);

        $request->validate([
            'nome' => ['required', 'string', 'max:100', Rule::unique('Instalacion', 'nome')->ignore($id, 'id_instalacion')],
            'id_tipo' => 'required|exists:TipoInstalacion,id_tipo',
            'capacidade' => 'required|integer|min:1',
            'estado' => 'required|string|max:50'
        ]);

        $instalacion->update([
            'nome' => $request->nome,
            'id_tipo' => $request->id_tipo,
            'capacidade' => $request->capacidade,
            'estado' => $request->estado
        ]);

        return response()->json(['message' => 'Instalación actualizada correctamente!', 'instalacion' => $instalacion], 200);
    }
}