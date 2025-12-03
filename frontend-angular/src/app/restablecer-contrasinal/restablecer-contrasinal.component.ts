import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-restablecer-contrasinal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './restablecer-contrasinal.component.html',
  styleUrls: ['./restablecer-contrasinal.component.scss']
})
export class RestablecerContrasinalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute); // Para leer parámetros de la URL
  private router = inject(Router);
  
  loading = signal(false);

  // Definición del formulario reactivo
  resetForm = this.fb.group({
    token: ['', Validators.required], // Campo oculto para el token
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]], // Email del usuario
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]] // Confirmación de contraseña
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    // 1. Capturamos el token y el email de la URL (queryParams)
    this.route.queryParams.subscribe(params => {
        // Hacemos patchValue para no resetear el formulario y mantener el token/email
        this.resetForm.patchValue({
            token: params['token'],
            email: params['email']
        });
    });
  }

  // Validador personalizado: contraseñas coinciden
  passwordMatchValidator(form: any) {
    const pass = form.get('password')?.value;
    const confirm = form.get('password_confirmation')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  async onSubmit() {
    if (this.resetForm.invalid) return;
    
    this.loading.set(true);
    
    // Obtenemos los valores raw, incluyendo el email deshabilitado
    const datos = {
        token: this.resetForm.get('token')?.value,
        email: this.resetForm.get('email')?.value,
        password: this.resetForm.get('password')?.value,
        password_confirmation: this.resetForm.get('password_confirmation')?.value,
    };

    try {
        // Llamada al backend para restablecer la contraseña
        await this.authService.restablecerContrasinal(datos);
        await Swal.fire({
            icon: 'success',
            title: 'Contrasinal Cambiada!',
            text: 'Agora podes iniciar sesión coa túa nova contrasinal.',
            confirmButtonText: 'Ir ao Login'
        });
        this.router.navigate(['/']); // Redirigir a la pantalla de login
    } catch (error) {
         Swal.fire('Erro', 'O enlace expirou ou é inválido.', 'error');
    } finally {
        this.loading.set(false);
    }
  }
}