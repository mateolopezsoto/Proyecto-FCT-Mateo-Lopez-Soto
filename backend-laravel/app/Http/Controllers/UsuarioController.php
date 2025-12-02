<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class UsuarioController extends Controller
{
    // POST /api/login
    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required'
        ]);

        $user = Usuario::where('correo', $request->correo)->first();

        if (!$user || !Hash::check($request->password, $user->contrasinal)) {
            throw ValidationException::withMessages([
                'correo' => ['As credenciais son incorrectas.'],
            ]);
        }

        // Crear token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login correcto',
            'user' => $user->makeVisible(['id_rol'])->load('rol'),
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    // POST /api/register
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nome' => 'required|string|max:50',
            'apelidos' => 'required|string|max:100',
            'correo' => 'required|email|max:100|unique:Usuario,correo',
            'telefono' => 'nullable|string|size:9|regex:/^[6-9][0-9]{8}$/',
            'password' => [
                'required',
                'confirmed',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
            ],
        ], [
            'nome.required' => 'O nome é obrigatorio',
            'nome.max' => 'O nome non pode ter máis de 50 caracteres',
            'apelidos.required' => 'O apelido é obrigatorio',
            'apelidos.max' => 'O apelido non pode ter máis de 100 caracteres',
            'correo.required' => 'O correo é obrigatorio',
            'correo.email' => 'O correo debe ter un formato válido',
            'correo.unique' => 'Este correo xa está rexistrado',
            'correo.max' => 'O correo non pode ter máis de 100 caracteres',
            'telefono.size' => 'O teléfono debe ter exactamente 9 díxitos',
            'telefono.regex' => 'O teléfono debe comezar por 6, 7, 8 ou 9',
            'password.required' => 'O contrasinal é obrigatorio',
            'password.confirmed' => 'Os contrasinais non coinciden',
            'password.min' => 'O contrasinal debe ter polo menos 8 caracteres',
            'password.regex' => 'O contrasinal debe ter maiúscula, minúscula, número e símbolo'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Erro de validación', 'errors' => $validator->errors()], 422);
        }

        $usuario = Usuario::create([
            'nome' => $request->nome,
            'apelidos' => $request->apelidos,
            'correo' => $request->correo,
            'contrasinal' => Hash::make($request->password),
            'telefono' => $request->telefono,
            'id_rol' => 1 // 1 = Usuario normal (crearás este rol después)
        ]);


        return response()->json([
            'message' => 'Rexistro correcto',
            'usuario' => [
                'nome' => $usuario->nome,
                'apelidos' => $usuario->apelidos,
                'correo' => $usuario->correo
            ]
        ], 201);
    }

    // GET /api/user (usuario autenticado)
    public function user(Request $request)
    {
        return response()->json($request->user()->load('rol'));
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión pechada']);
    }
}