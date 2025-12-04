<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTipoInstalacionRequest;
use App\Http\Requests\UpdateTipoInstalacionRequest;
use App\Models\TipoInstalacion;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TipoInstalacionController extends Controller
{
    /**
     * Helper para verificar se o usuario é administrador.
     */
    private function checkAdmin()
    {
        $user = Auth::user();
        // Verifica si el usuario existe y si su rol cargado es 'Administrador'
        if (!$user || $user->rol->nome_rol !== 'Administrador') { 
            return response()->json(['message' => 'Acceso denegado. Se requiere rol de administrador.'], Response::HTTP_FORBIDDEN);
        }
        return true;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tipos = TipoInstalacion::select('id_tipo', 'nome_tipo')->get();

        return response()->json($tipos);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTipoInstalacionRequest $request)
    {
        $request->validate([
            'nome_tipo' => 'required|string|max:50|unique:TipoInstalacion,nome_tipo'
        ]);

        $tipo = TipoInstalacion::create([
            'nome_tipo' => $request->nome_tipo,
            'descricion' => 'Creado dende panel admin'
        ]);

        return response()->json(['message' => 'Tipo creado correctamente', 'tipo' => $tipo], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TipoInstalacion $tipoInstalacion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TipoInstalacion $tipoInstalacion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTipoInstalacionRequest $request, TipoInstalacion $tipoInstalacion)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TipoInstalacion $tipoInstalacion)
    {
        //
    }
}