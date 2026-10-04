import { Routes } from '@angular/router';
export const PRODUCTOS_ROUTES: Routes = [
  { path: '', title: 'Productos', loadComponent: () => import('./pages/producto-list/producto-list').then(m => m.ProductoList) },
  { path: 'nuevo', title: 'Nuevo producto', loadComponent: () => import('./pages/producto-form/producto-form').then(m => m.ProductoForm) },
  { path: ':id/editar', title: 'Editar producto', loadComponent: () => import('./pages/producto-form/producto-form').then(m => m.ProductoForm) },
];
