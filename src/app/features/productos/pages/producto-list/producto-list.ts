import { Component, DestroyRef, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, finalize, switchMap } from 'rxjs';
import { ProductoService } from '../../services/producto-service';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { Categoria } from '../../../categorias/models/categoria.model';
import { Direccion, OrdenProducto, Producto } from '../../models/producto.model';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({ selector: 'app-producto-list', imports: [CurrencyPipe, RouterLink, SiPermiso], templateUrl: './producto-list.html', styleUrl: './producto-list.css' })
export class ProductoList implements OnInit {
  readonly categoriaId = input<string>();
  private inicializado = false;
  private ultimoParametro: string | null = null;
  private readonly service = inject(ProductoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recargar = new Subject<void>();
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<OrdenProducto>('nombre');
  protected readonly direccion = signal<Direccion>('asc');
  protected readonly resultado = signal<PaginaResponse<Producto> | null>(null);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaFiltro = signal<number | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly errorCategorias = signal('');
  protected readonly mensaje = signal(history.state?.mensaje ?? '');
  protected readonly confirmar = signal<Producto | null>(null);
  protected readonly eliminando = signal(false);
  protected readonly productos = computed(() => (this.resultado()?.contenido ?? []).filter(p => this.categoriaFiltro() === null || p.categoriaId === this.categoriaFiltro()));
  protected readonly notaCategoria = computed(() => {
    if (!this.categoriaId() || this.categoriaFiltro() === null || this.tamanio() !== 100) return '';
    const nombre = this.categorias().find(c => c.id === this.categoriaFiltro())?.nombre ?? `#${this.categoriaFiltro()}`;
    return `Mostrando productos de la categoría ${nombre} en los primeros 100 registros`;
  });
  constructor() {
    inject(CategoriaService).listar().pipe(takeUntilDestroyed()).subscribe({ next: c => this.categorias.set(c), error: e => this.errorCategorias.set(mensajeError(e)) });
    this.recargar.pipe(switchMap(() => {
      this.cargando.set(true); this.error.set('');
      return this.service.listar(this.pagina(), this.tamanio(), this.ordenarPor(), this.direccion()).pipe(
        catchError(e => { this.error.set(mensajeError(e)); return EMPTY; }), finalize(() => this.cargando.set(false)));
    }), takeUntilDestroyed()).subscribe(p => {
      if (p.totalPaginas > 0 && p.pagina >= p.totalPaginas) { this.pagina.set(p.totalPaginas - 1); this.cargar(); return; }
      this.resultado.set(p);
    });
    effect(() => { const valor = this.categoriaId(); if (this.inicializado) this.aplicarParametro(valor); });
  }
  ngOnInit() { this.inicializado = true; this.aplicarParametro(this.categoriaId()); }
  private aplicarParametro(raw: string | undefined) {
    const valor = raw ?? ''; if (valor === this.ultimoParametro) return;
    this.ultimoParametro = valor;
    const id = valor ? Number(valor) : null;
    if (id !== null && (!Number.isSafeInteger(id) || id <= 0)) {
      this.categoriaFiltro.set(null); this.resultado.set(null); this.error.set('El identificador de categoría de la URL no es válido.'); return;
    }
    this.categoriaFiltro.set(id); this.tamanio.set(id === null ? 10 : 100); this.pagina.set(0); this.cargar();
  }
  cargar() { this.recargar.next(); }
  ordenar(campo: OrdenProducto) {
    this.direccion.set(this.ordenarPor() === campo && this.direccion() === 'asc' ? 'desc' : 'asc');
    this.ordenarPor.set(campo); this.pagina.set(0); this.cargar();
  }
  cambiarTamanio(valor: string) { this.tamanio.set(Number(valor)); this.pagina.set(0); this.cargar(); }
  filtrar(valor: string) { this.categoriaFiltro.set(valor ? Number(valor) : null); }
  ir(pagina: number) { if (pagina < 0 || pagina >= (this.resultado()?.totalPaginas ?? 0) || this.cargando()) return; this.pagina.set(pagina); this.cargar(); }
  baja() {
    const producto = this.confirmar(); if (!producto || this.eliminando()) return;
    this.eliminando.set(true); this.error.set('');
    this.service.darDeBaja(producto.id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.eliminando.set(false))).subscribe({
      next: () => { this.confirmar.set(null); this.mensaje.set('Producto dado de baja correctamente.'); this.cargar(); },
      error: e => { this.confirmar.set(null); this.error.set(mensajeError(e)); }
    });
  }
}
