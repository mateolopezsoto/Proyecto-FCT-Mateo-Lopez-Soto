import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Importamos RouterModule
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  adminService = inject(AdminService);
  authService = inject(AuthService);
  router = inject(Router);

  filtroTipoId = signal('');
  filtroEstado = signal('');

  estadosDisponibles = ['Disponible', 'En Mantemento', 'Ocupada'];

  instalacionsFiltradas = computed(() => {
    const instalacions = this.adminService.instalacions();
    const tipoId = this.filtroTipoId();
    const estado = this.filtroEstado();

    return instalacions.filter(inst => {
      let pasaFiltroTipo = true;
      let pasaFiltroEstado = true;

      if (tipoId) {
        pasaFiltroTipo = inst.id_tipo === +tipoId;
      }
      
      if (estado) {
        pasaFiltroEstado = inst.estado.toLowerCase() === estado.toLowerCase();
      }

      return pasaFiltroTipo && pasaFiltroEstado;
    });
  });

  ngOnInit(): void {
    if (this.authService.usuario()?.rol?.nome_rol === 'Administrador') {
      this.adminService.cargarDatos();
    } else {
      this.router.navigate(['reservas']);
    }
  }

  onEliminar(id: number) {
    this.adminService.eliminarInstalacion(id);
  }

  onEditar(id: number) {
    this.router.navigate(['/admin/instalacions/editar', id]);
  }

  onEngadir() {
    this.router.navigate(['/admin/instalacions/engadir']);
  }
}
