import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink],
  template: `<section class="card" role="alert">
    <p class="eyebrow">PHARMASOFT · SEGURIDAD</p>
    <h1>403 · Acceso denegado</h1>
    <p>Su usuario no tiene permiso para abrir esta página. Si lo necesita, solicítelo al administrador.</p>
    <a routerLink="/inicio" class="btn primario">Volver al inicio</a>
  </section>`
})
export class AccesoDenegado {}
