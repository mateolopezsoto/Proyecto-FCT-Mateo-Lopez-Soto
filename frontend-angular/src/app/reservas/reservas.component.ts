import { Component, inject, signal, computed, OnInit } from '@angular/core'; 
import { CommonModule, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // IMPORTACIÓN CORREGIDA
import { AuthService } from '../services/auth.service';
import { ReservaService, Instalacion, Horario } from '../services/reserva.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas',
  standalone: true,
  // SlicePipe es necesario para cortar la hora (HH:MM:SS -> HH:MM) en el template
  imports: [CommonModule, FormsModule, SlicePipe], 
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.scss'] // El estilo está en el HTML
})
export class ReservasComponent implements OnInit { 
  authService = inject(AuthService);
  reservaService = inject(ReservaService);
  router = inject(Router); // La inyección es correcta

  // Estados de Filtro (Usados en el panel lateral)
  filtroTipo = signal('');
  filtroData = signal(new Date().toISOString().split('T')[0]); // Fecha de hoy por defecto
  filtroHorarioId = signal(''); 
  
  // Lista generada de horas de inicio posibles (08:00 a 21:00)
  reservableHours: string[] = this.generateReservableHours(); 

  // Lista Filtrada: Signal calculado que reacciona a los cambios en los datos o en los filtros.
  instalacionsFiltradas = computed(() => {
    const instalacions = this.reservaService.instalacions();
    const tipoId = this.filtroTipo();
    // const horarioId = this.filtroHorarioId(); // No se usa por ahora

    return instalacions.filter(inst => {
        let pasaFiltroTipo = true;
        // let pasaFiltroHorario = true; // No se usa por ahora

        // 1. FILTRADO POR TIPO
        if (tipoId) {
            pasaFiltroTipo = inst.tipo.id_tipo === +tipoId;
        }
        
        return pasaFiltroTipo;
    });
  });

  // El effect de carga automática fue eliminado del servicio para evitar el bucle.
  // Ahora controlamos la carga aquí.
  ngOnInit(): void {
    if (this.authService.estaLogueado() && this.reservaService.instalacions().length === 0) {
      this.reservaService.cargarDatos();
    }
  }

  constructor() {
    // El computed signal 'instalacionsFiltradas' se encarga de la reactividad del filtro.
  }
  
  /**
   * Genera las horas de inicio válidas de 08:00 a 21:00 (duración de 1h).
   */
  private generateReservableHours(): string[] {
    const hours = [];
    // Desde las 08:00 hasta las 21:00 (para terminar a las 22:00)
    for (let h = 8; h <= 21; h++) {
        hours.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return hours;
  }

  // Método para forzar la actualización del filtro
  filtrar() {
    // Se deja vacío porque la reactividad la maneja el computed signal
  }

  // Lógica para el botón Reservar (Modal SweetAlert2)
  async reservar(instalacion: Instalacion) {
    const reservableHours = this.reservableHours;

    // 1. Se construye el HTML de las opciones de horario usando CONCATENACIÓN SEGURA
    const hourOptionsHtml = reservableHours.map(h => 
        '<option value="' + h.slice(0, 5) + '">' + h.slice(0, 5) + '</option>'
    ).join('');

    // 2. Se construye el contenido HTML usando CONCATENACIÓN DE CADENAS SIMPLES
    const htmlContent = [
        '<div style="text-align: left;">',
            '<!-- Campo de Fecha -->',
            '<label for="swal-date">Data:</label>',
            '<input id="swal-date" type="date" class="swal2-input" value="' + this.filtroData() + '">',
            
            '<!-- Campo de Hora de INICIO (HH:MM) -->',
            '<label for="swal-hour">Hora de Inicio (08:00 - 21:00):</label>',
            '<select id="swal-hour" class="swal2-input">',
                '<option value="">Selecciona a hora de inicio</option>',
                hourOptionsHtml,
            '</select>',
        '</div>'
    ].join(''); // Juntamos el array de strings

    // Modal de confirmación para seleccionar Fecha y Hora de INICIO
    const result = await Swal.fire({
        title: 'Reservar: ' + instalacion.nome,
        html: htmlContent, // Se pasa la variable, evitando la interpolación compleja de nuevo
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar Reserva',
        cancelButtonText: 'Cancelar',
        // Validación antes de cerrar el modal
        preConfirm: () => {
            const dateInput = document.getElementById('swal-date') as HTMLInputElement;
            const hourSelect = document.getElementById('swal-hour') as HTMLSelectElement;

            const selectedDate = dateInput.value;
            const selectedHour = hourSelect.value;

            if (!selectedDate || !selectedHour) {
                Swal.showValidationMessage('Debes seleccionar unha data e unha hora de inicio.');
                return false;
            }
            return { id_instalacion: instalacion.id_instalacion, data_reserva: selectedDate, hora_inicio: selectedHour };
        },
    });

    if (result.isConfirmed && result.value) {
        try {
            // El servicio ahora espera hora_inicio, no id_horario
            await this.reservaService.reservar({
                id_instalacion: result.value.id_instalacion,
                hora_inicio: result.value.hora_inicio, // HH:MM
                data_reserva: result.value.data_reserva
            });
        } catch (error) {
            // El error es propagado por el servicio
        }
    }
  }
}