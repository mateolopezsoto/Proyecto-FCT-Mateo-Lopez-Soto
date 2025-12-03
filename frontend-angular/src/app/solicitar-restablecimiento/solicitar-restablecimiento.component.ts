import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitar-restablecimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './solicitar-restablecimiento.component.html',
  styleUrls: ['./solicitar-restablecimiento.component.scss'] // Usaremos un CSS simple
})
export class SolicitarRestablecimientoComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loading = signal(false);

  forgotPasswordForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  async onSubmit() {
    if (this.forgotPasswordForm.invalid) return;
    
    this.loading.set(true);
    const correo = this.forgotPasswordForm.get('correo')?.value?.trim() || '';

    try {
        await this.authService.solicitarRestablecemento(correo);
        await Swal.fire({
            icon: 'success',
            title: 'Correo Enviado!',
            text: 'Revisa a túa caixa de entrada para o enlace de restablecemento.',
            confirmButtonText: 'Entendido'
        });
        this.router.navigate(['/']); // Volver a la pantalla de login
    } catch (error) {
         Swal.fire('Erro', 'Non se puido enviar o correo ou o usuario non existe.', 'error');
    } finally {
        this.loading.set(false);
    }
  }
}