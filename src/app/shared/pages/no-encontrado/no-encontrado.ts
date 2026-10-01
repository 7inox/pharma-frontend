import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-no-encontrado', imports: [RouterLink], template: '<main class="no-encontrado"><p class="eyebrow">ERROR 404</p><h1>404 · Página no encontrada</h1><p>La dirección que buscas no existe.</p><a routerLink="/inicio" class="btn primario">Volver al inicio</a></main>' })
export class NoEncontrado {
}
