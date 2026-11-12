import { Component, DestroyRef, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ProductoService } from '../../services/producto-service';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { Categoria } from '../../../categorias/models/categoria.model';
import { Direccion, OrdenProducto, Producto } from '../../models/producto.model';
import { mensajeError } from '../../../../core/utils/http-error';
import { enteroEnRango } from '../../../../core/utils/paginacion';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';

@Component({
  selector: 'app-producto-list',
  imports: [CurrencyPipe, RouterLink, SiPermiso, Paginador],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList {
  readonly pagina = input(0, { transform: (v: unknown) => enteroEnRango(v, 0, 0, 2147483647) });
  readonly tamanio = input(20, { transform: (v: unknown) => enteroEnRango(v, 20, 1, 100) });
  readonly orden = input<OrdenProducto, unknown>('nombre', {
    transform: v => v === 'id' || v === 'precio' || v === 'stock' ? v : 'nombre',
  });
  readonly dir = input<Direccion, unknown>('asc', { transform: v => v === 'desc' ? 'desc' : 'asc' });
  readonly categoriaId = input<number | null, unknown>(null, {
    transform: v => enteroEnRango(v, 0, 1, Number.MAX_SAFE_INTEGER) || null,
  });

  private readonly service = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly consulta = rxResource({
    params: () => ({
      pagina: this.pagina(), tamanio: this.tamanio(), orden: this.orden(),
      dir: this.dir(), categoriaId: this.categoriaId(),
    }),
    stream: ({ params: p }) => this.service.listar(p.pagina, p.tamanio, p.orden, p.dir, p.categoriaId),
  });
  protected readonly resultado = linkedSignal({
    source: () => this.consulta.hasValue() ? this.consulta.value() : undefined,
    computation: (valor, anterior) => valor ?? anterior?.value,
  });
  protected readonly cargando = this.consulta.isLoading;
  protected readonly error = computed(() => {
    const error = this.consulta.error();
    return error ? mensajeError(error) : this.errorBaja();
  });
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly errorCategorias = signal('');
  protected readonly mensaje = signal(history.state?.mensaje ?? '');
  protected readonly confirmar = signal<Producto | null>(null);
  protected readonly eliminando = signal(false);
  private readonly errorBaja = signal('');

  constructor() {
    inject(CategoriaService).listar().pipe(takeUntilDestroyed()).subscribe({
      next: categorias => this.categorias.set(categorias),
      error: error => this.errorCategorias.set(mensajeError(error)),
    });
    effect(() => {
      if (!this.consulta.hasValue()) return;
      const p = this.consulta.value();
      if (p.pagina > 0 && p.pagina >= p.totalPaginas) {
        this.navegar({ pagina: Math.max(0, p.totalPaginas - 1) }, true);
      }
    });
  }

  cargar(): void { this.consulta.reload(); }
  ir(pagina: number): void { this.navegar({ pagina }); }
  cambiarTamanio(tamanio: number): void { this.navegar({ tamanio, pagina: 0 }); }
  filtrar(valor: string): void { this.navegar({ categoriaId: valor || null, pagina: 0 }); }

  ordenar(campo: OrdenProducto): void {
    const dir = this.orden() === campo && this.dir() === 'asc' ? 'desc' : 'asc';
    this.navegar({ orden: campo, dir, pagina: 0 });
  }

  private navegar(queryParams: Params, replaceUrl = false): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl });
  }

  baja(): void {
    const producto = this.confirmar();
    if (!producto || this.eliminando()) return;
    this.eliminando.set(true);
    this.errorBaja.set('');
    this.service.darDeBaja(producto.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.eliminando.set(false)),
    ).subscribe({
      next: () => {
        this.confirmar.set(null);
        this.mensaje.set('Producto dado de baja correctamente.');
        this.cargar();
      },
      error: error => {
        this.confirmar.set(null);
        this.errorBaja.set(mensajeError(error));
      },
    });
  }
}
