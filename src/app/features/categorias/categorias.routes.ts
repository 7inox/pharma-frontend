import { Routes } from '@angular/router';
import { CategoriaList } from './pages/categoria-list/categoria-list';
import { CategoriaForm } from './pages/categoria-form/categoria-form';
export const CATEGORIAS_ROUTES: Routes = [{ path: '', component: CategoriaList }, { path: 'nuevo', component: CategoriaForm }, { path: ':id/editar', component: CategoriaForm }];
