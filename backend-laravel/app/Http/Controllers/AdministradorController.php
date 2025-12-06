<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Instalacion;
use App\Models\TipoInstalacion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

class AdministradorController extends Controller
{
    /**
     * Verifica que o usuario autenticado é un administrador.
     */
    protected function checkAdminRole()
    {
        $user = Auth::user();
        // Verifica se o usuario existe e se o seu rol cargado é Administrador
        if (!$user || $user->rol->nome_rol !== 'Administrador') { 
            return response()->json(['message' => 'Acceso denegado. Se requiere rol de administrador.'], Response::HTTP_FORBIDDEN);
        }
        return true;
    }

    /**
     * Lista todas as instalacións para o panel de administración.
     * GET /api/admin/instalacions
     */
    public function indexInstalacions()
    {
        // 1. Verificación de Rol
        $check = $this->checkAdminRole();
        if ($check !== true) {
            return $check; // Devuelve 403 Forbidden
        }

        // 2. Obter TODAS as instalacións (co tipo cargado)
        $instalacions = Instalacion::with('tipo')->get();

        // 3. Mapear os datos para Angular
        $data = $instalacions->map(function ($inst) {
            return [
                'id_instalacion' => $inst->id_instalacion,
                'nome' => $inst->nome,
                'capacidade' => $inst->capacidade,
                'estado' => $inst->estado,
                'id_tipo' => $inst->id_tipo, // Usado para o filtro en Angular
                'tipo' => [
                    'id_tipo' => $inst->tipo->id_tipo,
                    'nome_tipo' => $inst->tipo->nome_tipo,
                ],
            ];
        });

        return response()->json($data);
    }
    
    /**
     * Elimina unha instalación.
     * DELETE /api/admin/instalacions/{id}
     */
    public function destroyInstalacion(int $id)
    {
        $check = $this->checkAdminRole();
        if ($check !== true) {
            return $check;
        }

        try {
            $instalacion = Instalacion::findOrFail($id);
            
            // Impedir eliminar se hay reservas activas (Confirmadas)
            if ($instalacion->reservas()->where('estado', 'Confirmada')->where('data_reserva', '>=', Carbon::today())->exists()) {
                return response()->json(['message' => 'No se puede eliminar la instalación porque tiene reservas futuras activas.'], Response::HTTP_CONFLICT);
            }

            $instalacion->delete();
            return response()->json(['message' => 'Instalación eliminada con éxito.'], Response::HTTP_OK);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Instalación no encontrada.'], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar la instalación.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
}