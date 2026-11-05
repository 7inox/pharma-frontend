import { Routes } from '@angular/router';
import { CategoriaList } from './pages/categoria-list/categoria-list';
import { CategoriaForm } from './pages/categoria-form/categoria-form';
import { permissionGuard } from '../../core/auth/auth.guard';
export const CATEGORIAS_ROUTES: Routes = [
  { path: '', component: CategoriaList },
  { path: 'nuevo', component: CategoriaForm, canActivate: [permissionGuard], data: {permission: 'CATALOGO_ESCRIBIR'} },
  { path: ':id/editar', component: CategoriaForm, canActivate: [permissionGuard], data: {permission: 'CATALOGO_ESCRIBIR'} }
];
