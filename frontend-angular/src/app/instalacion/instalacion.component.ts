import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-instalacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './instalacion.component.html',
  styleUrl: './instalacion.component.scss'
})
export class InstalacionComponent implements OnInit {
  private fb = inject(FormBuilder);
  public adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  instalacionForm = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    id_tipo: ['', [Validators.required]],
    capacidade: [0, [Validators.required, Validators.min(1)]],
    estado: ['Disponible', [Validators.required]]
  });

  estadosDisponibles = ['Disponible', 'En Mantemento', 'Ocupada'];

  ngOnInit() {
    if (this.authService.usuario()?.rol?.nome_rol !== "Administrador") {
      this.router.navigate(['/reservas']);
      return;
    }

    if (this.adminService.tipos().length === 0) {
      this.adminService.cargarDatos();
    }
  }

  async onCrearTipo() {
    const { value: nome } = await Swal.fire({
      title: 'Novo tipo de instalación',
      input: 'text',
      inputLabel: 'Nome',
      inputPlaceholder: 'Ex: Pista de tenis',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4285F4',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes escribir un nome!';
        }
        return null;
      }
    });

    if (nome) {
      const success = await this.adminService.crearTipoInstalacion(nome);
      if (success) {

      }
    }
  }

  async onSubmit() {
    if (this.instalacionForm.invalid) {
      this.instalacionForm.markAllAsTouched();
      return;
    }

    const exito = await this.adminService.crearInstalacion(this.instalacionForm.value);

    if (exito) {
      this.router.navigate(['/admin/instalacions']);
    }
  }
}
