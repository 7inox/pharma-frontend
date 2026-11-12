import { Component, computed, input, output } from '@angular/core';
import { PaginaResponse } from '../../../core/models/pagina-response';

@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.html',
  styles: [`
    nav { display: flex; flex-wrap: wrap; align-items: center; gap: .65rem; margin-top: 1rem; }
    .rango { margin-right: auto; }
    label { display: flex; align-items: center; gap: .4rem; }
  `],
})
export class Paginador {
  readonly datos = input.required<PaginaResponse<unknown>>();
  readonly ocupado = input(false);
  readonly cambioPagina = output<number>();
  readonly cambioTamanio = output<number>();
  protected readonly tamanios = computed(() =>
    [...new Set([5, 10, 20, 50, 100, this.datos().tamanio])].sort((a, b) => a - b)
  );
  protected readonly desde = computed(() => this.datos().contenido.length
    ? this.datos().pagina * this.datos().tamanio + 1 : 0);
  protected readonly hasta = computed(() => this.desde()
    ? this.desde() + this.datos().contenido.length - 1 : 0);

  protected ir(pagina: number): void {
    if (!this.ocupado() && pagina >= 0 && pagina < this.datos().totalPaginas) {
      this.cambioPagina.emit(pagina);
    }
  }
}
