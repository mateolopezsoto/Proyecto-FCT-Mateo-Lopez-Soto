import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

// Definición de interfaces
interface Rol {
  id_rol: number;
  nome_rol: string; 
}

interface Usuario {
  id_usuario: number;
  nome: string;
  apelidos: string;
  correo: string;
  telefono?: string;
  id_rol: number; 
  rol: Rol;
  url_foto?: string; // <--- Propiedade necesaria para a persistencia da foto
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
  private tokenKey = 'token'; // Usamos 'token' para coincidir coa súa implementación
  
  // ESTADO GLOBAL REACTIVO (Mantemos as súas implementacións orixinais)
  usuario = signal<Usuario | null>(null);
  estaLogueado = signal(false);
  loading = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    this.comprobarSesion();
  }

  // ===============================================
  //        LÓXICA DE CARGA E PERSISTENCIA
  // ===============================================

  /**
   * Carga o usuario autenticado dende o backend (/api/user) e actualiza sinais.
   * Este método garantiza que a 'url_foto' e o 'rol' se garden.
   */
  async getAuthenticatedUser() {
    try {
      const user: any = await lastValueFrom(this.http.get(`${this.apiUrl}/user`));
      this.usuario.set(user); 
      this.estaLogueado.set(true);
      return user;
    } catch (error) {
      // Se falla, o comprobador de sesión manéxao.
      throw error;
    }
  }

  // O seu método orixinal de comprobación de sesión, agora usando o método centralizado
  async comprobarSesion() {
    const token = localStorage.getItem(this.tokenKey);
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
      // Usamos o método central para cargar o usuario (que trae a foto)
      await this.getAuthenticatedUser();
    } catch (err: any) {
      // Se falla (token expirado ou inválido), borrámolo
      localStorage.removeItem(this.tokenKey);
      this.usuario.set(null);
      this.estaLogueado.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  // ===============================================
  // AUTENTICACIÓN
  // ===============================================

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

      // Gardamos o token en LocalStorage
      localStorage.setItem(this.tokenKey, res.access_token);

      // Cargamos o usuario autenticado (incluida a foto)
      await this.getAuthenticatedUser(); 
      
      await Swal.fire({
      icon: 'success',
      title: 'Benvido!',
      text: `Ola ${this.usuario()!.nome}!`, // Usamos a señal actualizada
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    });
      this.router.navigate(['/reservas']);
    } catch (err: any) {
      // Limpiamos el token si el login falla
      localStorage.removeItem(this.tokenKey); 
      await Swal.fire('Erro', err.error?.message || 'Credenciais incorrectas', 'error');
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
    
    // Garantizamos que o token se borra localmente
    localStorage.removeItem(this.tokenKey); 
    
    this.usuario.set(null);
    this.estaLogueado.set(false);
    await Swal.fire('Sesión pechada', 'Volve pronto!', 'info');
    this.router.navigate(['/']);
    this.loading.set(false);
  }

  // ===============================================
  //              PERFIL Y SEGURIDAD
  // ===============================================

  // Actualizar datos do perfil con FOTO (FormData)
  async updateProfile(formData: FormData) {
    
    const res: any = await lastValueFrom(
      this.http.post(`${this.apiUrl}/user/profile`, formData)
    );
    
    // O backend devolve o usuario actualizado (coa nova url_foto)
    this.usuario.set(res.user); 
    return res;
  }
  
  // Cambiar contrasinal estando logueado
  async updatePassword(datos: any) {
    return lastValueFrom(
      this.http.put(`${this.apiUrl}/user/password`, datos)
    );
  }

  // Solicitar enlace de restablecemento (Paso 1)
  async solicitarRestablecemento(correo: string): Promise<void> {
    const payload = { correo: correo };
    return lastValueFrom(this.http.post<void>(`${this.apiUrl}/forgot-password`, payload));
  }

  // Restablecer contrasinal (Paso 2)
  async restablecerContrasinal(datos: any): Promise<void> {
    return lastValueFrom(this.http.post<void>(`${this.apiUrl}/reset-password`, datos));
  }
}