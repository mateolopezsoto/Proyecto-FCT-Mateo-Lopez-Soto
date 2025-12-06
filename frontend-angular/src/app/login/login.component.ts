import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; // Inxectamos Router
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private router = inject(Router); // Inxectamos Router

  loginForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasinal: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onLogin() {
    if (this.loginForm.invalid) return;

    const credenciais = {
      correo: this.loginForm.get('correo')?.value?.trim() || '',
      contrasinal: this.loginForm.get('contrasinal')?.value || ''
    };

    await this.authService.login(credenciais);
  }
  
  // Función para navegar ao formulario de olvido
  navigateToForgotPassword(e: Event) {
    e.preventDefault();
    this.router.navigate(['/olvido-contrasinal']);
  }
}