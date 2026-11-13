import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PaginaResponse } from '../../core/models/pagina-response';
import { mensajeError } from '../../core/utils/http-error';
import { enteroEnRango } from '../../core/utils/paginacion';
import { Paginador } from '../../shared/components/paginador/paginador';

interface Evento {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  entidad: string;
  entidadId: number | null;
  detalle: string | null;
  requestId: string | null;
}

@Component({
  selector: 'app-auditoria',
  imports: [DatePipe, ReactiveFormsModule, Paginador],
  templateUrl: './auditoria.html',
  styles: [`
    form { display: flex; flex-wrap: wrap; align-items: end; gap: .7rem; margin-bottom: 1rem; }
    label { display: grid; gap: .25rem; }
    input, select { padding: .45rem; }
    .tabla-scroll { overflow-x: auto; }
    code { font-size: .75rem; overflow-wrap: anywhere; }
  `],
})
export class Auditoria {
  readonly usuario = input('');
  readonly accion = input('');
  readonly desde = input('');
  readonly hasta = input('');
  readonly pagina = input(0, { transform: (valor: unknown) => enteroEnRango(valor, 0, 0, 2147483647) });
  readonly tamanio = input(20, { transform: (valor: unknown) => enteroEnRango(valor, 20, 1, 100) });
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly form = inject(NonNullableFormBuilder).group({ usuario: '', accion: '', desde: '', hasta: '' });
  protected readonly acciones = [
    'VENTA_REGISTRADA', 'PRECIO_MODIFICADO', 'PRODUCTO_ELIMINADO', 'USUARIO_DESACTIVADO',
    'CLIENTE_REGISTRADO', 'CATEGORIA_ELIMINADA', 'LOGIN_EXITOSO', 'LOGIN_FALLIDO',
  ];
  private readonly filtro = computed(() => ({
    usuario: this.usuario() || '', accion: this.accion() || '', desde: this.desde() || '', hasta: this.hasta() || '',
  }));
  private readonly errorFiltro = signal('');
  protected readonly consulta = rxResource({
    params: () => ({ filtro: this.filtro(), pagina: this.pagina(), tamanio: this.tamanio() }),
    stream: ({ params: p }) => {
      let params = new HttpParams().set('pagina', p.pagina).set('tamanio', p.tamanio);
      for (const [nombre, valor] of Object.entries(p.filtro)) {
        if (valor) params = params.set(nombre, valor);
      }
      return this.http.get<PaginaResponse<Evento>>(`${environment.apiUrl}/auditoria`, { params });
    },
  });
  protected readonly datos = linkedSignal<PaginaResponse<Evento> | undefined, PaginaResponse<Evento> | undefined>({
    source: () => this.consulta.hasValue() ? this.consulta.value() : undefined,
    computation: (valor, anterior) => valor ?? anterior?.value,
  });
  protected readonly error = computed(() => {
    const e = this.consulta.error();
    return this.errorFiltro() || (e instanceof HttpErrorResponse ? mensajeError(e) : e?.message ?? '');
  });

  constructor() {
    effect(() => {
      this.form.reset(this.filtro());
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

  protected buscar(): void {
    const { usuario, accion, desde, hasta } = this.form.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.errorFiltro.set('La fecha desde debe ser anterior o igual a la fecha hasta.');
      return;
    }
    this.errorFiltro.set('');
    this.navegar({ usuario: usuario.trim() || null, accion: accion || null,
      desde: desde || null, hasta: hasta || null, pagina: 0 });
  }

  protected limpiar(): void {
    this.form.reset();
    this.buscar();
  }

  protected navegar(queryParams: Params, replaceUrl = false): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl });
  }
}
