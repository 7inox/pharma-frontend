import { mensajeError } from '../../../../core/utils/http-error';
import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { VentaService } from '../../services/venta-service';
import { Cliente } from '../../../clientes/models/cliente.model';
import { EstadoVenta, FiltroVentas, OrdenVenta } from '../../models/venta.model';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { enteroEnRango } from '../../../../core/utils/paginacion';

@Component({
  selector: 'app-venta-list',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, RouterLink, SiPermiso, Paginador],
  templateUrl: './venta-list.html',
  styleUrl: '../../ventas.css',
})
export class VentaList {
  readonly numero = input(0, { alias: 'pagina', transform: (v: unknown) => enteroEnRango(v, 0, 0, 2147483647) });
  readonly tamanio = input(20, { transform: (v: unknown) => enteroEnRango(v, 20, 1, 100) });
  readonly clienteId = input<number | null, unknown>(null, {
    transform: v => enteroEnRango(v, 0, 1, Number.MAX_SAFE_INTEGER) || null,
  });
  readonly estado = input<EstadoVenta | null, unknown>(null, {
    transform: v => v === 'REGISTRADA' || v === 'ANULADA' ? v : null,
  });
  readonly desde = input<string>();
  readonly hasta = input<string>();
  readonly orden = input<OrdenVenta, unknown>('fecha', {
    transform: v => v === 'total' || v === 'estado' || v === 'clienteId' ? v : 'fecha',
  });
  readonly dir = input<'asc' | 'desc', unknown>('desc', { transform: v => v === 'asc' ? 'asc' : 'desc' });

  private readonly servicio = inject(VentaService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: '',
    hasta: '',
  });
  readonly clientes = signal<Cliente[]>([]);
  readonly errorClientes = signal('');
  private readonly errorFiltro = signal('');
  readonly aplicados = computed<FiltroVentas>(() => ({
    clienteId: this.clienteId(), estado: this.estado(), desde: this.desde() || null, hasta: this.hasta() || null,
  }));
  private readonly consulta = rxResource({
    params: () => ({
      filtros: this.aplicados(), pagina: this.numero(), tamanio: this.tamanio(),
      orden: this.orden(), dir: this.dir(),
    }),
    stream: ({ params: p }) => this.servicio.buscar(p.filtros, p.pagina, p.tamanio, p.orden, p.dir),
  });
  readonly pagina = linkedSignal({
    source: () => this.consulta.hasValue() ? this.consulta.value() : undefined,
    computation: (valor, anterior) => valor ?? anterior?.value,
  });
  readonly cargando = this.consulta.isLoading;
  readonly error = computed(() => {
    const error = this.consulta.error();
    return this.errorFiltro() || (error ? mensajeError(error, 'No se pudo consultar ventas') : '');
  });
  readonly totalPagina = computed(() => (this.pagina()?.contenido ?? [])
    .filter(v => v.estado === 'REGISTRADA')
    .reduce((centimos, venta) => centimos + Math.round(venta.total * 100), 0) / 100);

  constructor() {
    this.servicio.catalogo<Cliente>('clientes').pipe(takeUntilDestroyed()).subscribe({
      next: clientes => this.clientes.set(clientes),
      error: e => this.errorClientes.set(mensajeError(e, 'No se pudieron cargar clientes')),
    });
    effect(() => {
      const filtros = this.aplicados();
      this.filtros.reset({ ...filtros, desde: filtros.desde ?? '', hasta: filtros.hasta ?? '' });
      this.errorFiltro.set('');
    });
    effect(() => {
      if (!this.consulta.hasValue()) return;
      const p = this.consulta.value();
      if (p.pagina > 0 && p.pagina >= p.totalPaginas) {
        this.navegar({ pagina: Math.max(0, p.totalPaginas - 1) }, true);
      }
    });
  }

  buscar(): void {
    const filtros = this.filtros.getRawValue();
    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
      this.errorFiltro.set('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }
    this.errorFiltro.set('');
    this.navegar({ ...filtros, desde: filtros.desde || null, hasta: filtros.hasta || null, pagina: 0 });
  }

  limpiar(): void {
    this.filtros.reset({ clienteId: null, estado: null, desde: '', hasta: '' });
    this.buscar();
  }

  ordenar(campo: OrdenVenta): void {
    const dir = this.orden() === campo && this.dir() === 'desc' ? 'asc' : 'desc';
    this.navegar({ orden: campo, dir, pagina: 0 });
  }

  ir(pagina: number): void { this.navegar({ pagina }); }
  cambiarTamanio(tamanio: number): void { this.navegar({ tamanio, pagina: 0 }); }
  recargar(): void { this.consulta.reload(); }
  clienteFiltro(): Cliente | undefined { return this.clientes().find(c => c.id === this.aplicados().clienteId); }
  imprimirConsulta(): void { window.print(); }

  private navegar(queryParams: Params, replaceUrl = false): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl });
  }
}
