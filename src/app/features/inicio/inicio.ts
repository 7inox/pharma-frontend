import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-inicio', imports: [RouterLink], template: `<p class="eyebrow">PANEL PRINCIPAL</p><h1>Bienvenido a PharmaSoft</h1><p class="subtitulo">Administra el catálogo de tu botica desde un solo lugar.</p><section class="card inicio-card"><span class="modulo-icono" aria-hidden="true">▦</span><h2>Categorías</h2><p>Consulta, registra y organiza las categorías de productos.</p><a class="btn primario" routerLink="/categorias">Administrar categorías →</a></section>` })
export class Inicio {
}
