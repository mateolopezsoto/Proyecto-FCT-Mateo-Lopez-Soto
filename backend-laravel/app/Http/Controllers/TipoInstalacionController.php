<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTipoInstalacionRequest;
use App\Http\Requests\UpdateTipoInstalacionRequest;
use App\Models\TipoInstalacion;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Request;

class TipoInstalacionController extends Controller
{
    /**
     * Helper para verificar se o usuario é administrador.
     */
    private function checkAdmin()
    {
        // 1. Cargamos explícitamente a relación 'rol'
        /** @var \App\Models\Usuario|null $user */
        $user = Auth::user(); 

        if ($user) {
            $user->load('rol');
        }
        // Verifica se o usuario existe e se o seu rol cargado é Administrador
        if (!$user || !$user->rol || $user->rol->nome_rol !== "Administrador") { 
            abort(Response::HTTP_FORBIDDEN, 'Acceso denegado. Requirese rol de administrador');
        }
    }

    /**
     * Display a listing of the resource.
     * GET /api/tipos-instalacion
     */
    public function index()
    {
        $tipos = TipoInstalacion::select('id_tipo', 'nome_tipo')->get();

        return response()->json($tipos);
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/tipos-instalacion
     */
    public function store(Request $request)
    {
        $this->checkAdmin();

        $request->validate([
            'nome_tipo' => 'required|string|max:50|unique:TipoInstalacion,nome_tipo'
        ]);

        $tipo = TipoInstalacion::create([
            'nome_tipo' => $request->nome_tipo,
            'descricion' => 'Creado dende panel admin'
        ]);

        return response()->json(['message' => 'Tipo creado correctamente', 'tipo' => $tipo], Response::HTTP_CREATED);
    }
}