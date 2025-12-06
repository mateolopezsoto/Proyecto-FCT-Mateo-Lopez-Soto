import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  seccionActiva = signal<'datos' | 'password'>('datos');
  loading = signal(false);
  
  // Variable para gardar o arquivo seleccionado
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  perfilForm = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    apelidos: ['', [Validators.required, Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.pattern(/^[6-9][0-9]{8}$/)]]
  });

  // ... (passwordForm e ngOnInit iguales) ...
  passwordForm = this.fb.group({
    current_password: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  ngOnInit() {
    const user = this.authService.usuario();
    if (user) {
      this.perfilForm.patchValue({
        nome: user.nome,
        apelidos: user.apelidos,
        correo: user.correo,
        telefono: user.telefono
      });
      // Se xa ten foto, amosámola
      if (user.url_foto) {
        this.previewUrl = user.url_foto;
      }
    }
  }

  passwordMatchValidator(form: any) {
      const pass = form.get('password')?.value;
      const confirm = form.get('password_confirmation')?.value;
      return pass === confirm ? null : { mismatch: true };
  }

  cambiarSeccion(seccion: 'datos' | 'password') {
    this.seccionActiva.set(seccion);
  }

  // 1. DISPARAR O INPUT OCULTO
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  // 2. MANEXAR A SELECCIÓN DE ARQUIVO
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // 3. GARDAR CON FORMDATA
  async onUpdateProfile() {
    if (this.perfilForm.invalid) return;

    this.loading.set(true);
    
    // Crear FormData
    const formData = new FormData();
    formData.append('nome', this.perfilForm.get('nome')?.value || '');
    formData.append('apelidos', this.perfilForm.get('apelidos')?.value || '');
    formData.append('correo', this.perfilForm.get('correo')?.value || '');
    formData.append('telefono', this.perfilForm.get('telefono')?.value || '');

    if (this.selectedFile) {
        formData.append('foto', this.selectedFile);
    }

    try {
      await this.authService.updateProfile(formData);
      Swal.fire('Gardado', 'Perfil actualizado correctamente.', 'success');
    } catch (error: any) {
      const msg = error.error?.message || 'Erro ao actualizar perfil.';
      Swal.fire('Erro', msg, 'error');
    } finally {
      this.loading.set(false);
    }
  }

  // ... (onUpdatePassword igual)
  async onUpdatePassword() {
    if (this.passwordForm.invalid) return;
    this.loading.set(true);
    try {
      await this.authService.updatePassword(this.passwordForm.value);
      Swal.fire('Éxito', 'O teu contrasinal cambiouse correctamente.', 'success');
      this.passwordForm.reset();
    } catch (error: any) {
      const errors = error.error?.errors;
      let msg = 'Erro ao cambiar contrasinal.';
      if (errors?.current_password) msg = errors.current_password[0];
      Swal.fire('Erro', msg, 'error');
    } finally {
      this.loading.set(false);
    }
  }
}