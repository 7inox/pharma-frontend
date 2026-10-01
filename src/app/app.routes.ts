import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
export const routes: Routes = [{ path: '', component: MainLayout, children: [{ path: '', pathMatch: 'full', redirectTo: 'inicio' }, { path: 'inicio', loadComponent: () => import('./features/inicio/inicio').then(m => m.Inicio) }, { path: 'categorias', loadChildren: () => import('./features/categorias/categorias.routes').then(m => m.CATEGORIAS_ROUTES) }] }, { path: '**', loadComponent: () => import('./shared/pages/no-encontrado/no-encontrado').then(m => m.NoEncontrado) }];
