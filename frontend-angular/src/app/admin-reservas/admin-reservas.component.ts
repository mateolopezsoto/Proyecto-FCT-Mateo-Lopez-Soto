import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { ReservaUsuario } from '../services/reserva.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, SlicePipe],
  templateUrl: './admin-reservas.component.html',
  styleUrl: './admin-reservas.component.scss'
})
export class AdminReservasComponent implements OnInit {
  adminService = inject(AdminService);
  authService = inject(AuthService);
  router = inject(Router);

  filtroUsuario = signal('');
  filtroData = signal('');

  paginaActual = signal(1);
  pageSize = signal(10);

  private filteredReservasList = computed(() => {
    const reservas = this.adminService.reservas();
    const filtroTexto = this.filtroUsuario().toLowerCase();
    const data = this.filtroData();

    return reservas.filter(r => {

      const userName = r.usuario?.nome?.toLowerCase() || '';
      const userApelido = r.usuario?.apelidos?.toLowerCase() || '';
      const userCorreo = r.usuario?.correo?.toLowerCase() || '';
      const userId = r.id_usuario?.toString().toLowerCase() || '';

      const matchUsuario = !filtroTexto ||
                            userId.includes(filtroTexto) ||
                            userName.includes(filtroTexto) ||
                            userApelido.includes(filtroTexto) ||
                            userCorreo.includes(filtroTexto);
  
      const matchData = !data || r.data_reserva === data;

      return matchUsuario && matchData;
    });
  });

  totalPaginas = computed(() => {
    const totalItems = this.filteredReservasList().length;
    return Math.ceil(totalItems / this.pageSize());
  })

  reservasFiltradas = computed(() => {
    const filtered = this.filteredReservasList();
    const inicio = (this.paginaActual() - 1) * this.pageSize();
    const fin = inicio + this.pageSize(); 

    return filtered.slice(inicio, fin);
  })

  constructor() {
    effect(() => {
      const totalItems = this.filteredReservasList().length;
      const totalPages = Math.ceil(totalItems / this.pageSize());

      if (this.paginaActual() > totalPages && totalPages > 0) {
        this.paginaActual.set(1);
      } else if (totalPages === 0 && this.paginaActual() !== 1) {
        this.paginaActual.set(1);
      }
    });
  }

  ngOnInit() {
    if (this.authService.usuario()?.rol?.nome_rol !== 'Administrador') {
      this.router.navigate(['/reservas']);
      return;
    }
    this.adminService.cargarReservas();
  }

  cambiarPagina(delta: number) {
    const nuevaPagina = this.paginaActual() + delta;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina);
    }
  }

  async onCambiarEstado(reserva: ReservaUsuario) {
    const { value: estado } = await Swal.fire({
      title: 'Cambiar estado',
      input: 'select',
      inputOptions: {
        'Confirmada': 'Confirmada',
        'Pendente': 'Pendente',
        'Cancelada': 'Cancelada'
      },
      inputPlaceholder: 'Selecciona un estado',
      inputValue: reserva.estado,
      showCancelButton: true,
      confirmButtonColor: '#4285F4'
    });

    if (estado && estado !== reserva.estado) {
      this.adminService.cambiarEstadoReserva(reserva.id_reserva, estado);
    }
  }

  onDetalles(reserva: ReservaUsuario) {
    let horaInicio = 'N/A';
    let horaFin = 'N/A';

    if (reserva.horario) {
      horaInicio = reserva.horario.hora_inicio ? reserva.horario.hora_inicio.slice(0, 5) : 'N/A';
      horaFin = reserva.horario.hora_fin ? reserva.horario.hora_fin.slice(0, 5) : 'N/A';
    } else if ((reserva as any).hora_inicio) {
      horaInicio = (reserva as any).hora_inicio.slice(0, 5);
      horaFin = (reserva as any).hora_fin.slice(0, 5);
    }

    const instNome = reserva.instalacion?.nome || 'Instalación descoñecida';
    const instTipo = reserva.instalacion?.tipo?.nome_tipo || 'Tipo descoñecido';

    const userNome = reserva.usuario? `${reserva.usuario.nome} ${reserva.usuario.apelidos}` : 'Usuario eliminado';
    const userCorreo = reserva.usuario?.correo || 'N/A';
    const userTel = reserva.usuario?.telefono || 'N/A';

    Swal.fire({
      title: 'Detalles da reserva',
      html: `
        <div style="text-align: left">
          <p><strong>ID Reserva:</strong> ${reserva.id_reserva}</p>
          <hr>
          <h4>Datos do usuario</h4>
          <p><strong>Nome:</strong> ${userNome}</p>
          <p><strong>Correo:</strong> ${userCorreo}</p>
          <p><strong>Teléfono:</strong> ${userTel}</p>
          <hr>
          <h4>Instalación</h4>
          <p><strong>Nome:</strong> ${instNome}</p>
          <p><strong>Tipo:</strong> ${instTipo}</p>
          <p><strong>Horario:</strong> ${horaInicio} - ${horaFin}</p>
        </div>
        `,
        confirmButtonText: 'Pechar',
        confirmButtonColor: '#6c757d'
    });
  }
}
