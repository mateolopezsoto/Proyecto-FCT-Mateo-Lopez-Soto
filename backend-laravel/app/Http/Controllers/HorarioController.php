<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreHorarioRequest;
use App\Http\Requests\UpdateHorarioRequest;
use App\Models\Horario;

class HorarioController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/horarios
     */
    public function index()
    {
        $horarios = Horario::all();

        return response()->json($horarios);
    }
}