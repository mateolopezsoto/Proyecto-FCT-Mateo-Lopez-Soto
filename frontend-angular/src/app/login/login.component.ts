// src/app/login/login.component.ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
    // O servizo xa:
    // - fai o CSRF
    // - fai o login
    // - garda o usuario
    // - amosa o SweetAlert
    // - redirixe ao dashboard si todo va bien
    // - amosa erro se falla
  }

  openForgotPassword(e: Event) {
    e.preventDefault();
    Swal.fire(
      'Esquecín o contrasinal',
      'Contacta con <strong>admin@concello.gal</strong>',
      'info'
    );
  }
}