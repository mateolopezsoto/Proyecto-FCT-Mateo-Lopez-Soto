<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

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
            'user' => $user->makeVisible(['id_rol'])->append('url_foto')->load('rol'),
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
        return response()->json($request->user()->append('url_foto')->load('rol'));
    }

    // POST /api/logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión pechada']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['correo' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('correo')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Ligazón de restablecemento enviada'], 200);
        }

        return response()->json(['message' => 'Non se puido enviar a ligazón de restablecemento'], 400);
    }

    public function reset(Request $request)
    {
$request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);

        // 1. Buscar al usuario explícitamente por 'correo'
        $user = Usuario::where('correo', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuario non atopado (Email incorrecto).'], 404);
        }

        // 2. Verificar el token usando el repositorio (Requiere que la tabla password_reset_tokens exista)
        $tokenRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$tokenRecord) {
            return response()->json(['message' => 'Non existe unha solicitude de restablecemento para este correo.'], 400);
        }

        // 3. Verificaciones de seguridad: Expiración y hash del token (Asumiendo corrección UTC)
        $tokenCreatedAt = \Carbon\Carbon::parse($tokenRecord->created_at);
        if ($tokenCreatedAt->addMinutes(60)->isPast()) {
            return response()->json(['message' => 'O token expirou.'], 400);
        }

        if (! Hash::check($request->token, $tokenRecord->token)) {
            return response()->json(['message' => 'O token é inválido (Hash non coincide).'], 400);
        }

        // 5. CAMBIO DE CONTRASEÑA FINAL:
        $user->forceFill([
            'contrasinal' => Hash::make($request->password)
        ])->save(); // <--- ELIMINAMOS setRememberToken() AQUÍ

        // 6. Borrar el token usado
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        event(new PasswordReset($user));

        return response()->json(['message' => 'O teu contrasinal foi restablecido con éxito.'], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nome' => 'required|string|max:50',
            'apelidos' => 'required|string|max:100',
            'correo' => ['required', 'email', 'max:100', Rule::unique('Usuario')->ignore($user->id_usuario, 'id_usuario')],
            'telefono' => 'nullable|string|size:9|regex:/^[6-9][0-9]{8}$/',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $data = [
            'nome' => $request->nome,
            'apelidos' => $request->apelidos,
            'correo' => $request->correo,
            'telefono' => $request->telefono
        ];

        if ($request->hasFile('foto')) {
            if ($user->foto_perfil) {
                Storage::disk('public')->delete($user->foto_perfil);
            }

            $path = $request->file('foto')->store('perfiles', 'public');
            $data['foto_perfil'] = $path;
        }

        $user->update($data);

        return response()->json(['message' => 'Perfil actualizado correctamente', 'user' => $user->fresh()->append('url_foto')]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/']
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->contrasinal)) {
            throw ValidationException::withMessages([
                'current_password' => ['A contrasinal actual non é correcta']
            ]);
        }

        $user->forceFill([
            'contrasinal' => Hash::make($request->password)
        ])->save();

        return response()->json(['message' => 'Contrasinal actualizada correctamente']);
    }
}