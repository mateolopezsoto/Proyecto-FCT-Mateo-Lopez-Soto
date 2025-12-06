// src/app/registro/registro.component.ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

interface RegisterData {
  nome: string;
  apelidos: string;
  correo: string;
  telefono?: string;     // ← opcional, como na base de datos
  contrasinal: string;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  registroForm = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    apelidos: ['', [Validators.required, Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    telefono: ['', [Validators.pattern(/^[6-9][0-9]{8}$/)]], // opcional pero con formato
    contrasinal: ['', [Validators.required, Validators.minLength(8)]],
    confirmar_contrasinal: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Validador personalizado: contrasinais coinciden
  passwordMatchValidator(form: any) {
    const pass = form.get('contrasinal')?.value;
    const confirm = form.get('confirmar_contrasinal')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  async onRegister() {
    if (this.registroForm.invalid) return;

    // Preparamos os datos exactamente coma os espera Laravel
    const datos: RegisterData = {
      nome: this.registroForm.get('nome')?.value?.trim() || '',
      apelidos: this.registroForm.get('apelidos')?.value?.trim() || '',
      correo: this.registroForm.get('correo')?.value?.trim() || '',
      telefono: this.registroForm.get('telefono')?.value?.trim() || undefined,
      contrasinal: this.registroForm.get('contrasinal')?.value || ''
    };

    // O servizo  encárgase de TODO: petición, mensaxes, redirección
    await this.authService.register(datos);
  }
}