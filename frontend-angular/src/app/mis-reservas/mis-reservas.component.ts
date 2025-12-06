import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { ReservaService, ReservaUsuario } from '../services/reserva.service';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, SlicePipe, RouterLink],
  templateUrl: './mis-reservas.component.html',
  styleUrls: ['./mis-reservas.component.scss']
})
export class MisReservasComponent implements OnInit {
  reservaService = inject(ReservaService);
  authService = inject(AuthService);
  router = inject(Router);

  // Nuevo estado para las reservas del usuario
  misReservas = signal<ReservaUsuario[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    if (this.authService.estaLogueado()) {
      this.cargarMisReservas();
    }
  }

  // Carga as reservas do usuario
  async cargarMisReservas() {
    this.loading.set(true);
    try {
      // O ReservaService necesita un método para GET /api/mis-reservas
      const reservas = await this.reservaService.cargarHistorico();
      this.misReservas.set(reservas);
    } catch (error) {
      console.error('Error cargando histórico:', error);
      Swal.fire('Erro', 'Non se puido cargar o seu histórico de reservas.', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  // Acción para cancelar unha reserva
  async onCancelar(id: number) {
    const result = await Swal.fire({
      title: 'Queres cancelar esta reserva?',
      text: "Esta acción non se pode desfacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC3545',
      cancelButtonColor: '#FFA500',
      confirmButtonText: 'Si, cancelar!',
      cancelButtonText: 'Manter reserva'
    });

    if (result.isConfirmed) {
      this.loading.set(true);
      try {
        await this.reservaService.cancelarReserva(id);
        Swal.fire('Cancelada!', 'A reserva foi cancelada con éxito.', 'success');
        this.cargarMisReservas(); // Recargar a lista
      } catch (error) {
        Swal.fire('Erro', 'Non se puido procesar a cancelación.', 'error');
      } finally {
        this.loading.set(false);
      }
    }
  }
}

