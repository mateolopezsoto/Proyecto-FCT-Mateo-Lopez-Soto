import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

// Interfaces reutilizadas para aa estrutura de datos
export interface TipoInstalacion {
  id_tipo: number;
  nome_tipo: string;
}

export interface Instalacion {
  id_instalacion: number;
  nome: string;
  capacidade: number;
  estado_general: string; 
  tipo: { id_tipo: number; nome_tipo: string };
  disponible: boolean;
}

export interface Horario {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface UsuarioReserva {
  id_usuario: number;
  nome: string;
  apelidos: string;
  correo: string;
  telefono?: string;
  
}

// Estructura das reservas para a vista Histórico
export interface ReservaUsuario {
  id_reserva: number;
  data_reserva: string;
  estado: 'Confirmada' | 'Cancelada' | 'Pendiente';
  id_usuario: number;
  id_instalacion: number;
  id_horario: number;
  hora_inicio: string; // Asumimos que se engade á tabla Reserva
  hora_fin: string; // Asumimos que se engade á tabla Reserva
  // Relacións cargadas para aa vista
  instalacion: { nome: string; tipo: TipoInstalacion };
  horario: Horario;
  usuario?: UsuarioReserva;
}


@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api'; 

  tipos = signal<TipoInstalacion[]>([]);
  instalacions = signal<Instalacion[]>([]);
  horarios = signal<Horario[]>([]);
  loading = signal(false);

  // CONSTRUCTOR: A carga inicial contrólase dende o ngOnInit do componente
  constructor() { 
  }

  // Carga os datos do catálogo (Instalacións, Tipos, Horarios)
  async cargarDatos() {
    if (this.loading()) return; 
    this.loading.set(true);

    try {
      let tipos: TipoInstalacion[] = [];
      let instalacions: Instalacion[] = [];
      let horarios: Horario[] =  [];
      
      // CHAMADAS CONCURRINTES PARA CARGAR O CATÁLOGO
      // Úsanse try/catch individuales para non deter a carga se un falla.

      try {
        tipos = await lastValueFrom(this.http.get<TipoInstalacion[]>(`${this.apiUrl}/tipos-instalacion`));
      } catch (err) { console.warn('Fallo esperado o 401 en Tipos de Instalación.'); }
      
      try {
        instalacions = await lastValueFrom(this.http.get<Instalacion[]>(`${this.apiUrl}/instalacions`));
      } catch (err) { console.warn('Fallo esperado o 401 en Instalaciones.'); }

      try {
        horarios = await lastValueFrom(this.http.get<Horario[]>(`${this.apiUrl}/horarios`));
      } catch (err) { console.warn('Fallo esperado o 401 en Horarios.'); }

      this.tipos.set(tipos);
      this.instalacions.set(instalacions);
      this.horarios.set(horarios);

      if (tipos.length === 0 && instalacions.length === 0 && horarios.length === 0) {
        throw new Error('No se puido cargar ningún recurso.');
      }

    } catch (err) {
      Swal.fire('Erro', 'Non se puideron cargar as instalacións', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  // Método para crear unha reserva (POST /api/reservas)
  async reservar(datos: { id_instalacion: number; hora_inicio: string; data_reserva: string }) {
    this.loading.set(true);

    try {
      await lastValueFrom(this.http.post(`${this.apiUrl}/reservas`, datos));
      Swal.fire('Perfecto!', 'Reserva confirmada', 'success');
      await this.cargarDatos(); // actualiza dispoñibilidade do catálogo
    } catch (err: any) {
      const msg = err.error?.message || 'Erro ao reservar';
      Swal.fire('Erro', msg, 'error');
      throw  err;
    } finally {
      this.loading.set(false);
    }
  }
  
  // ===============================================
  // LÖXICA DE HISTÓRICO E CANCELACIÓN
  // ===============================================
  
  // Carga o historial de reservas do usuario (GET /api/mis-reservas)
  async cargarHistorico(): Promise<ReservaUsuario[]> {
    this.loading.set(true);
    try {
      const reservas = await lastValueFrom(
        this.http.get<ReservaUsuario[]>(`${this.apiUrl}/mis-reservas`)
      );
      return reservas;
    } catch (error) {
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  // Lóxica para cancelar unha reserva (POST/PUT a /api/reservas/{id}/cancelar - asumido)
  async cancelarReserva(idReserva: number): Promise<void> {
    this.loading.set(true);
    try {
      // Usaremos un método PUT para actualizar o estado a 'Cancelada' no backend
      await lastValueFrom(
        this.http.put<void>(`${this.apiUrl}/reservas/${idReserva}/cancelar`, {})
      );
    } catch (error) {
      throw error;
    } finally {
      this.loading.set(false);
    }
  }
}