import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/auth/auth.guard';
export const VENTAS_ROUTES:Routes=[
  {path:'',title:'Consulta de ventas',loadComponent:()=>import('./pages/venta-list/venta-list').then(m=>m.VentaList)},
  {path:'nueva',title:'Nueva venta',canActivate:[permissionGuard],data:{permission:'VENTAS_REGISTRAR'},loadComponent:()=>import('./pages/venta-form/venta-form').then(m=>m.VentaForm)},
  {path:':id',title:'Comprobante de venta',loadComponent:()=>import('./pages/venta-detalle/venta-detalle').then(m=>m.VentaDetalle)}
];
