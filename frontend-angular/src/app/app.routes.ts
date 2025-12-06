import { Routes } from '@angular/router';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { RestablecerContrasinalComponent } from './restablecer-contrasinal/restablecer-contrasinal.component';
import { PerfilComponent } from './perfil/perfil.component';
import { InstalacionComponent } from './instalacion/instalacion.component';

// Función auxiliar para verificar a autenticación (usa a mesma lóxica que o Guard de Reservas)
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
        // Fallo de sesión, o servizo xa limpa o token
      }
    }

    if (auth.estaLogueado()) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
};

// Función auxiliar para verificar o rol de Administrador
const adminGuard = async () => {
    const router = inject(Router);
    const auth = inject(AuthService);

    // Aseguramos que a sesión esté cargada (debería ser redundante se se usa despois de authGuard)
    if (!auth.estaLogueado() && localStorage.getItem('token')) {
        await auth.comprobarSesion();
    }
    
    // Verificamos o rol
    if (auth.usuario() && auth.usuario()!.rol.nome_rol === 'Administrador') {
        return true;
    } else {
        router.navigate(['/reservas']); // Redirixir a una ruta donde o usuario sí ten acceso
        return false;
    }
};


export const routes: Routes = [
  // Ruta raíz → Login
  {
    path: '',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },

  // Rexistro
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

  // Reservas feitas polo usuario actual
  {
    path: 'mis-reservas',
    loadComponent: () => import('./mis-reservas/mis-reservas.component').then(c => c.MisReservasComponent),
    canActivate: [authGuard]
  },

  // Pantalla de olvido de contrasinal
  {
    path: 'olvido-contrasinal',
    loadComponent: () => import('./solicitar-restablecimiento/solicitar-restablecimiento.component').then(c => c.SolicitarRestablecimientoComponent)
  },

  // Restablecemento de contrasinal
  {
    path: 'restablecer-contrasinal',
    component: RestablecerContrasinalComponent
  },

  // Perfil do usuario actual
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },

  // Rutas do administrador
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      // Xestión de instalacións
      {
        path: 'instalacions',
        loadComponent: () => import('./admin/admin.component').then(c => c.AdminComponent)
      },
      // Engadir unha nova instalación
      {
        path: 'instalacions/engadir',
        component: InstalacionComponent
      },
      // Editar unha instalación
      {
        path: 'instalacions/editar/:id',
        component: InstalacionComponent
      },
      // Xestión de reservas (admin)
      {
        path: 'reservas',
        loadComponent: () => import('./admin-reservas/admin-reservas.component').then(c => c.AdminReservasComponent)
      },
      // Estatísticas xerais
      {
        path: 'estatisticas',
        loadComponent: () => import('./estatisticas/estatisticas.component').then(c => c.EstatisticasComponent)
      },

      { path: '', redirectTo: 'instalacions', pathMatch: 'full' }
    ]
  },


  // Ruta 404/Wildcard
  { path: '**', redirectTo: ''}, 
];