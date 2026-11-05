import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard, guestGuard, permissionGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/login/login').then(m => m.Login) },
  {
    path: '', component: MainLayout, canActivate: [authGuard], canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', loadComponent: () => import('./features/inicio/inicio').then(m => m.Inicio) },
      { path: 'acceso-denegado', loadComponent: () => import('./shared/pages/acceso-denegado/acceso-denegado').then(m => m.AccesoDenegado) },
      { path: 'clientes', canActivate: [permissionGuard], data: {permission: 'CLIENTES_LEER'}, loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES) },
      { path: 'productos', canActivate: [permissionGuard], data: {permission: 'CATALOGO_LEER'}, loadChildren: () => import('./features/productos/productos.routes').then(m => m.PRODUCTOS_ROUTES) },
      { path: 'ventas', canActivate: [permissionGuard], data: {permission: 'VENTAS_LEER'}, loadChildren: () => import('./features/ventas/ventas.routes').then(m => m.VENTAS_ROUTES) },
      { path: 'reportes', canActivate: [permissionGuard], data: {permission: 'REPORTES_VER'}, loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES) },
      { path: 'categorias', canActivate: [permissionGuard], data: {permission: 'CATALOGO_LEER'}, loadChildren: () => import('./features/categorias/categorias.routes').then(m => m.CATEGORIAS_ROUTES) },
      { path: 'usuarios', canActivate: [permissionGuard], data: {permission: 'USUARIOS_ADMINISTRAR'}, loadComponent: () => import('./features/usuarios/usuarios').then(m => m.Usuarios) },
      { path: 'cuenta', loadComponent: () => import('./features/cuenta/cuenta').then(m => m.Cuenta) }
    ]
  },
  { path: '**', loadComponent: () => import('./shared/pages/no-encontrado/no-encontrado').then(m => m.NoEncontrado) }
];
