import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, finalize, startWith, switchMap, catchError, EMPTY } from 'rxjs';
import { ClienteService } from '../../services/cliente-service';
import { Cliente } from '../../models/cliente.model';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({ selector: 'app-cliente-list', imports: [RouterLink], templateUrl: './cliente-list.html' })
export class ClienteList {
  private readonly service = inject(ClienteService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recargar = new Subject<void>();
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<'dni' | 'apellidos'>('apellidos');
  protected readonly direccion = signal<'asc' | 'desc'>('asc');
  protected readonly totalPaginas = signal(0);
  protected readonly totalElementos = signal(0);
  protected readonly ultima = signal(true);
  protected readonly filtro = signal('');
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal(inject(Router).currentNavigation()?.extras.state?.['mensaje'] ?? '');
  protected readonly pendiente = signal<Cliente | null>(null);
  protected readonly eliminando = signal(false);
  protected readonly filtradas = computed(() => {
    const texto = this.filtro().trim().toLocaleLowerCase();
    return this.clientes().filter(c => c.dni.includes(texto) || `${c.nombres} ${c.apellidos}`.toLocaleLowerCase().includes(texto));
  });
  constructor() {
    this.recargar.pipe(startWith(undefined), switchMap(() => {
      this.cargando.set(true); this.error.set('');
      return this.service.listar(this.pagina(), this.tamanio(), this.ordenarPor(), this.direccion()).pipe(
        catchError(err => { this.error.set(mensajeError(err)); this.clientes.set([]); return EMPTY; }),
        finalize(() => this.cargando.set(false)));
    }), takeUntilDestroyed(this.destroyRef)).subscribe(datos => {
      this.clientes.set(datos.contenido); this.pagina.set(datos.pagina);
      this.totalPaginas.set(datos.totalPaginas); this.totalElementos.set(datos.totalElementos); this.ultima.set(datos.ultima);
    });
  }
  cargar() { this.recargar.next(); }
  cambiarPagina(pagina: number) { if (!this.cargando() && pagina >= 0 && pagina < this.totalPaginas()) { this.pagina.set(pagina); this.cargar(); } }
  cambiarTamanio(valor: string) { const n = Number(valor); if ([5, 10, 20].includes(n)) { this.tamanio.set(n); this.pagina.set(0); this.cargar(); } }
  ordenar(campo: 'dni' | 'apellidos') {
    this.direccion.set(this.ordenarPor() === campo && this.direccion() === 'asc' ? 'desc' : 'asc');
    this.ordenarPor.set(campo); this.pagina.set(0); this.cargar();
  }
  confirmarEliminar() {
    const cliente = this.pendiente(); if (!cliente || this.eliminando()) return;
    this.eliminando.set(true); this.error.set(''); this.exito.set('');
    this.service.eliminar(cliente.id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.eliminando.set(false))).subscribe({
      next: () => { this.pendiente.set(null); this.exito.set('Cliente dado de baja correctamente.'); this.cargar(); },
      error: err => { this.pendiente.set(null); this.error.set(mensajeError(err)); }
    });
  }
}
