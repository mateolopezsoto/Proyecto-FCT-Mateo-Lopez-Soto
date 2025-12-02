import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';

// Interfaces reutilizadas para la estructura de datos
export interface TipoInstalacion {
  id_tipo: number;
  nome_tipo: string;
}

export interface Instalacion {
  id_instalacion: number;
  nome: string;
  capacidade: number;
  // Propiedad de la columna original de la base de datos
  estado_general: string; 
  tipo: { id_tipo: number; nome_tipo: string };
  disponible: boolean; // Estado final calculado por Laravel para la fecha de hoy
}

export interface Horario {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
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

  // CONSTRUCTOR: carga automática al iniciar la app
  constructor() { 
    // SE ELIMINA EL EFFECT QUE LLAMABA A cargarDatos() Y CAUSABA EL BUCLE INFINITO
  }

  async cargarDatos() {
    if (this.loading()) return; 
    this.loading.set(true);

    try {
      // Inicializamos las variables con el tipo explícito
      let tipos: TipoInstalacion[] = [];
      let instalacions: Instalacion[] = [];
      let horarios: Horario[] =  [];

      // Realizamos las llamadas de forma concurrente pero con manejo de errores individual
      
      // LLAMADA 1: Tipos de Instalación
      try {
        tipos = await lastValueFrom(
          this.http.get<TipoInstalacion[]>(`${this.apiUrl}/tipos-instalacion`)
        );
      } catch (err) {
        console.warn('Fallo esperado o 401 en Tipos de Instalación.');
      }
      
      // LLAMADA 2: Instalaciones
      try {
        instalacions = await lastValueFrom(
          this.http.get<Instalacion[]>(`${this.apiUrl}/instalacions`)
        );
      } catch (err) {
        console.warn('Fallo esperado o 401 en Instalaciones.');
      }

      // LLAMADA 3: Horarios
      try {
        horarios = await lastValueFrom(
          this.http.get<Horario[]>(`${this.apiUrl}/horarios`)
        );
      } catch (err) {
        console.warn('Fallo esperado o 401 en Horarios.');
      }

      // Seteamos los datos 
      this.tipos.set(tipos);
      this.instalacions.set(instalacions);
      this.horarios.set(horarios);

      // Si todas fallaron, mostramos el mensaje de error general
      if (tipos.length === 0 && instalacions.length === 0 && horarios.length === 0) {
        throw new Error('No se pudo cargar ningún recurso.');
      }

    } catch (err) {
      // Este catch captura errores de red o el error forzado arriba
      Swal.fire('Erro', 'Non se puideron cargar as instalacións', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  // >> CORRECCIÓN: CAMBIAMOS 'id_horario' por 'hora_inicio' <<
  async reservar(datos: { id_instalacion: number; hora_inicio: string; data_reserva: string }) {
    this.loading.set(true);

    try {
      // Se asume que la ruta /api/reservas es un POST para crear la reserva
      await lastValueFrom(this.http.post(`${this.apiUrl}/reservas`, datos));
      Swal.fire('Perfecto!', 'Reserva confirmada', 'success');
      await this.cargarDatos(); // actualiza disponibilidad
    } catch (err: any) {
      const msg = err.error?.message || 'Erro ao reservar';
      Swal.fire('Erro', msg, 'error');
      throw  err;
    } finally {
      this.loading.set(false);
    }
  }
}