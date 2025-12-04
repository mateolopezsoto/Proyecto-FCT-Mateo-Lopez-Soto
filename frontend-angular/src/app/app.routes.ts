import { Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { RestablecerContrasinalComponent } from './restablecer-contrasinal/restablecer-contrasinal.component';
import { PerfilComponent } from './perfil/perfil.component';
import { InstalacionComponent } from './instalacion/instalacion.component';

// Función auxiliar para verificar la autenticación (usa la misma lógica que el Guard de Reservas)
const authGuard = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const token = localStorage.getItem('token'); 

    if (auth.estaLogueado()) {
      return true;
    }
    
    if (token) {
      try {
        await auth.comprobarSesion(); 
      } catch {
        // Fallo de sesión, el servicio ya limpia el token
      }
    }

    if (auth.estaLogueado()) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
};

// Función auxiliar para verificar el rol de Administrador
const adminGuard = async () => {
    const router = inject(Router);
    const auth = inject(AuthService);

    // Aseguramos que la sesión esté cargada (debería ser redundante si se usa después de authGuard)
    if (!auth.estaLogueado() && localStorage.getItem('token')) {
        await auth.comprobarSesion();
    }
    
    // Verificamos el rol (Asumiendo que id_rol 2 es Administrador según tu DB)
    if (auth.usuario() && auth.usuario()!.rol.nome_rol === 'Administrador') {
        return true;
    } else {
        router.navigate(['/reservas']); // Redirigir a una ruta donde el usuario sí tiene acceso
        return false;
    }
};


export const routes: Routes = [
  // Ruta raíz → Login
  {
    path: '',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },

  // Registro
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent)
  },
  
  // Reservas (Ruta de Usuario Normal)
  {
    path: 'reservas',
    loadComponent: () => import('./reservas/reservas.component').then(c => c.ReservasComponent),
    canActivate: [authGuard] // Solo requiere estar logueado
  },

  {
    path: 'mis-reservas',
    loadComponent: () => import('./mis-reservas/mis-reservas.component').then(c => c.MisReservasComponent),
    canActivate: [authGuard]
  },

  {
    path: 'olvido-contrasinal',
    loadComponent: () => import('./solicitar-restablecimiento/solicitar-restablecimiento.component').then(c => c.SolicitarRestablecimientoComponent)
  },

  {
    path: 'restablecer-contrasinal',
    component: RestablecerContrasinalComponent
  },

  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },

  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'instalacions',
        loadComponent: () => import('./admin/admin.component').then(c => c.AdminComponent)
      },
      {
        path: 'instalacions/engadir',
        component: InstalacionComponent
      },
      { path: '', redirectTo: 'instalacions', pathMatch: 'full' }
    ]
  },


  // Ruta 404/Wildcard
  { path: '**', redirectTo: ''}, 
];