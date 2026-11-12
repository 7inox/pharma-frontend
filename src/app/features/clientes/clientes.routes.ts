import { Routes } from '@angular/router';
import { ClienteList } from './pages/cliente-list/cliente-list';
import { ClienteForm } from './pages/cliente-form/cliente-form';
export const CLIENTES_ROUTES: Routes = [
  { path: '', component: ClienteList, title: 'Clientes' },
  { path: 'nuevo', component: ClienteForm, title: 'Registrar cliente' },
  { path: ':id/editar', component: ClienteForm, title: 'Editar cliente' },
];
