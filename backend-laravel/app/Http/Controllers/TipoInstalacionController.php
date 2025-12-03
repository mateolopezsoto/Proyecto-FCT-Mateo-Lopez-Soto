<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTipoInstalacionRequest;
use App\Http\Requests\UpdateTipoInstalacionRequest;
use App\Models\TipoInstalacion;

class TipoInstalacionController extends Controller
{
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
        //
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