import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

// DEFINICIÓN DE INTERFACES CORREGIDA PARA RESOLVER EL ERROR "Property 'rol' does not exist"

interface Rol {
  id_rol: number;
  nome_rol: string; // <-- Propiedad usada para la comprobación de rol
}

interface Usuario {
  id_usuario: number;
  nome: string;
  apelidos: string;
  correo: string;
  telefono?: string;
  id_rol: number; 
  rol: Rol;     // <--- ESTO ES LO QUE ARREGLA EL ERROR. Objeto de relación cargado por Laravel.
}

interface RegisterData {
  nome: string;
  apelidos: string;
  correo: string;
  telefono?: string;
  contrasinal: string;
}

interface LoginData {
  correo: string;
  contrasinal: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  // ESTADO GLOBAL REACTIVO
  usuario = signal<Usuario | null>(null);
  estaLogueado = signal(false);
  loading = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    this.comprobarSesion();
  }

  async register(datos: RegisterData) {
    this.loading.set(true);
    try {

      const payload = {
      nome: datos.nome,
      apelidos: datos.apelidos,
      correo: datos.correo,
      telefono: datos.telefono ?? null,
      password: datos.contrasinal,
      password_confirmation: datos.contrasinal
    };

      // Ahora sí hacer el registro
      const res: any = await lastValueFrom(
        this.http.post(`${this.apiUrl}/register`, payload)
      );

      await Swal.fire({
        icon: 'success',
        title: 'Rexistro correcto!',
        text: 'Xa podes iniciar sesión co teu novo usuario',
        timer: 3000,
        showConfirmButton: false
      });

      this.router.navigate(['/']);
    } catch (err: any) {
      const errors = err.error?.errors || {};
      let msg = 'Erro no rexistro';
      if (errors.correo?.[0]) msg = errors.correo[0];
      else if (errors.telefono?.[0]) msg = errors.telefono[0];
      else if (errors.password?.[0]) msg = errors.password[0];
      else if (err.error?.message) msg = err.error.message;

      await Swal.fire('Erro', msg, 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async login(credenciais: LoginData) {
    this.loading.set(true);
    try {
      const payload = {
        correo: credenciais.correo,
        password: credenciais.contrasinal 
      };

      const res: any = await lastValueFrom(
        this.http.post(`${this.apiUrl}/login`, payload)
      );

      // Guardamos el token en LocalStorage
      localStorage.setItem('token', res.access_token);

      // El tipo 'res.user' ahora coincide con la interfaz 'Usuario'
      this.usuario.set(res.user); 
      this.estaLogueado.set(true);

      await Swal.fire({
      icon: 'success',
      title: 'Benvido!',
      text: `Ola ${res.user.nome}!`,
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    });
      this.router.navigate(['/reservas']);
    } catch (err: any) {
      // Limpiamos el token si el login falla
      localStorage.removeItem('token'); 
      await Swal.fire('Erro', err.error?.message || 'Credenciais incorrectas', 'error');
    } finally {
      this.loading.set(false);
    }
  }

async comprobarSesion() {
  const token = localStorage.getItem('token');
  if (!token) {
    this.usuario.set(null);
    this.estaLogueado.set(false);
    return;
  }

  if (this.estaLogueado() && this.usuario()) {
    return;
  }

  this.loading.set(true);
  try {
    // Este endpoint de Laravel (UsuarioController@user) DEBE cargar el rol: return $request->user()->load('rol');
    const res: any = await lastValueFrom(
      this.http.get(`${this.apiUrl}/user`)
    );
    
    this.usuario.set(res); 
    this.estaLogueado.set(true);
  } catch (err: any) {
    // Si falla (token expirado o inválido), lo borramos
    localStorage.removeItem('token');
    this.usuario.set(null);
    this.estaLogueado.set(false);
  } finally {
    this.loading.set(false);
  }
}

  async logout() {
    this.loading.set(true);
    try {
      await lastValueFrom(
        this.http.post(`${this.apiUrl}/logout`, {})
      );
    } catch {}
    
    // Garantizamos que el token se borra localmente
    localStorage.removeItem('token'); 
    
    this.usuario.set(null);
    this.estaLogueado.set(false);
    await Swal.fire('Sesión pechada', 'Volve pronto!', 'info');
    this.router.navigate(['/']);
    this.loading.set(false);
  }
}