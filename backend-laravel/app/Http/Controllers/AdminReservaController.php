<?php

namespace App\Http\Controllers;

use App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Reserva;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminReservaController extends Controller
{

    private function checkAdmin() {
        /** @var \App\Models\Usuario|null $user */
        $user = Auth::user();
        if ($user) { $user->load('rol'); }

        if (!$user || !$user->rol || $user->rol->nome_rol !== "Administrador") {
            abort(RESPONSE::HTTP_FORBIDDEN, 'Acceso denegado. Require permisos de administrador');
        }
    }
    /**
     * Display a listing of the resource.
     * GET /api/admin/reservas
     */
    public function index()
    {
        $this->checkAdmin();

        $reservas = Reserva::with(['usuario', 'instalacion.tipo', 'horario'])
                            ->orderBy('data_reserva', 'desc')
                            ->get();
        
        return response()->json($reservas);
    }

    /**
     * PUT /api/admin/reservas/{id}/estado
     * Actualiza o estado dunha reserva
     */
    public function updateEstado(Request $request, int $id) {
        $this->checkAdmin();

        $request->validate([
            'estado' => 'required|in:Confirmada,Cancelada,Pendente' 
        ]);

        $reserva = Reserva::findOrFail($id);
        $reserva->update(['estado' => $request->estado]);

        return response()->json([
            'message' => 'Estado da reserva actualizado correctamente', 'reserva' => $reserva
        ]);
 }
}
