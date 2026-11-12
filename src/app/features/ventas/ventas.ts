import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cliente } from '../clientes/models/cliente.model';
import { Producto } from '../productos/models/producto.model';
import { PaginaResponse } from '../../core/models/pagina-response';

interface Linea { producto: Producto; cantidad: number; }
interface Venta { id: number; fecha: string; clienteId: number; clienteNombre: string; estado: string; total: number; detalles: { productoId: number; productoNombre: string; cantidad: number; precio: number; subtotal: number }[]; }
@Component({
  selector: 'app-ventas', imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './ventas.html', styleUrl: './ventas.css'
})
export class Ventas {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  readonly clientes = signal<Cliente[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly lineas = signal<Linea[]>([]);
  readonly cliente = signal<Cliente | null>(null);
  readonly resumen = signal(false);
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly validando = signal(false);
  readonly guardada = signal<Venta | null>(null);
  readonly ventas = signal<Venta[]>([]);
  readonly impresion = signal<Venta | null>(null);
  readonly imprimirConsulta = signal(false);
  buscarCliente = ''; buscarProducto = ''; desde = ''; hasta = ''; estado = '';
  readonly total = computed(() => this.lineas().reduce((s, l) => s + this.centimos(l), 0) / 100);
  readonly filtrosCliente = computed(() => this.clientes().filter(c => c.estado && this.normalizar(`${c.dni} ${c.nombres} ${c.apellidos}`).includes(this.normalizar(this.buscarClienteSignal()))));
  readonly filtrosProducto = computed(() => this.productos().filter(p => p.estado && this.normalizar(`${p.nombre} ${p.categoriaNombre}`).includes(this.normalizar(this.buscarProductoSignal()))));
  readonly buscarClienteSignal = signal(''); readonly buscarProductoSignal = signal('');
  constructor() { this.cargarCatalogos(); this.consultar(); }
  normalizar(valor: string) { return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
  centimos(l: Linea) { return Number.isInteger(l.cantidad) && l.cantidad > 0 ? Math.round(l.producto.precio * 100) * l.cantidad : 0; }
  subtotal(l: Linea) { return this.centimos(l) / 100; }
  cantidad(p: Producto) { return this.lineas().find(l => l.producto.id === p.id)?.cantidad ?? 0; }
  problema(l: Linea) { return !Number.isInteger(l.cantidad) || l.cantidad <= 0 ? 'La cantidad debe ser entera y mayor que cero' : l.cantidad > l.producto.stock ? `Supera el stock (${l.producto.stock})` : ''; }
  cargarCatalogos() {
    this.cargarPagina<Cliente>('clientes', datos => this.clientes.set(datos));
    this.cargarPagina<Producto>('productos', datos => {
      this.productos.set(datos);
      this.lineas.update(lineas => lineas.map(l => ({...l, producto: datos.find(p => p.id === l.producto.id) ?? l.producto})));
    });
  }
  private cargarPagina<T>(recurso: string, aplicar: (datos: T[]) => void, pagina = 0, acumulado: T[] = []) {
    this.http.get<PaginaResponse<T>>(`${this.url}/${recurso}`, { params: new HttpParams().set('pagina', pagina).set('tamanio', 100) }).subscribe({
      next: respuesta => {
        const datos = [...acumulado, ...respuesta.contenido];
        if (pagina + 1 < respuesta.totalPaginas) this.cargarPagina(recurso, aplicar, pagina + 1, datos);
        else aplicar(datos);
      }, error: e => this.error.set(this.mensaje(e))
    });
  }
  agregar(p: Producto) {
    if (this.enviando() || this.resumen()) return;
    this.lineas.update(ls => {
      const existente = ls.find(l => l.producto.id === p.id);
      return existente ? ls.map(l => l === existente ? {...l, cantidad: l.cantidad + 1} : l) : [...ls, {producto: p, cantidad: 1}];
    });
  }
  enter(event: Event) { event.preventDefault(); const p = this.filtrosProducto()[0]; if (p) this.agregar(p); }
  cambiar(id: number, cantidad: number) { this.lineas.update(ls => ls.map(l => l.producto.id === id ? {...l, cantidad: Number(cantidad)} : l)); }
  quitar(id: number) { this.lineas.update(ls => ls.filter(l => l.producto.id !== id)); }
  revisar() {
    this.validando.set(true); this.error.set('');
    if (!this.cliente() || !this.lineas().length || this.lineas().some(l => this.problema(l))) return;
    this.resumen.set(true);
  }
  confirmar() {
    if (this.enviando() || !this.resumen() || !this.cliente()) return;
    this.enviando.set(true); this.error.set('');
    this.http.post<Venta>(`${this.url}/ventas`, {clienteId: this.cliente()!.id, detalles: this.lineas().map(l => ({productoId: l.producto.id, cantidad: l.cantidad}))}).subscribe({
      next: venta => {
        this.guardada.set(venta); this.resumen.set(false); this.enviando.set(false);
        this.lineas.set([]); this.cliente.set(null); this.validando.set(false);
        this.cargarCatalogos(); this.consultar();
      }, error: e => {
        this.error.set(this.mensaje(e)); this.enviando.set(false); this.resumen.set(false);
        if (e.status === 409) this.cargarCatalogos();
      }
    });
  }
  consultar() {
    if (this.desde && this.hasta && this.desde > this.hasta) { this.error.set('Rango de fechas inválido'); return; }
    let params = new HttpParams();
    if (this.desde) params = params.set('desde', this.desde);
    if (this.hasta) params = params.set('hasta', this.hasta);
    if (this.estado) params = params.set('estado', this.estado);
    this.http.get<Venta[]>(`${this.url}/ventas/buscar`, {params}).subscribe({next: ventas => this.ventas.set(ventas), error: e => this.error.set(this.mensaje(e))});
  }
  mensaje(e: {error?: {mensaje?: string; message?: string}; status?: number}) { return e.error?.mensaje ?? e.error?.message ?? 'No se pudo conectar con el backend'; }
  dni(venta: Venta) { return this.clientes().find(c => c.id === venta.clienteId)?.dni ?? 'No disponible'; }
  imprimir(venta: Venta | null) {
    this.impresion.set(venta); this.imprimirConsulta.set(!venta);
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }
}
