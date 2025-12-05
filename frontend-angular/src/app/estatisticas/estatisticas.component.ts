import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-estatisticas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './estatisticas.component.html',
  styleUrl: './estatisticas.component.scss'
})
export class EstatisticasComponent implements OnInit {
  adminService = inject(AdminService);
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    if (this.authService.usuario()?.rol?.nome_rol !== "Administrador") {
      this.router.navigate(['/reservas']);
      return;
    }
    this.adminService.cargarEstatisticas();
  }

  getPorcentaxe(valor: number, lista: any[]): string {
    if (!lista || lista.length === 0) return '0%';
    const max = Math.max(...lista.map(i => i.total));
    return (valor / max * 100) + '%';
  }
}
