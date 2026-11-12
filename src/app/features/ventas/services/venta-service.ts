import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { FiltroVentas, OrdenVenta, Venta, VentaRequest } from '../models/venta.model';
import { Cliente } from '../../clientes/models/cliente.model';
import { Producto } from '../../productos/models/producto.model';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;

  registrar(dto: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(`${this.url}/ventas`, dto);
  }

  obtener(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.url}/ventas/${id}`);
  }

  buscar(f: FiltroVentas, pagina: number, tamanio: number, orden: OrdenVenta, dir: 'asc' | 'desc') {
    let params = new HttpParams().set('pagina', pagina).set('tamanio', tamanio)
      .set('ordenarPor', orden).set('direccion', dir);
    if (f.clienteId) params = params.set('clienteId', f.clienteId);
    if (f.estado) params = params.set('estado', f.estado);
    if (f.desde) params = params.set('desde', f.desde);
    if (f.hasta) params = params.set('hasta', f.hasta);
    return this.http.get<PaginaResponse<Venta>>(`${this.url}/ventas/buscar`, { params });
  }

  buscarClientes(q: string) {
    return this.http.get<PaginaResponse<Cliente>>(`${this.url}/clientes/activos`, { params: { q } })
      .pipe(map(p => p.contenido));
  }

  obtenerProducto(id: number) {
    return this.http.get<Producto>(`${this.url}/productos/${id}`);
  }

  buscarProductos(q: string) {
    return this.http.get<PaginaResponse<Producto>>(`${this.url}/productos`, {
      params: { q, vendible: true, tamanio: 6 },
    }).pipe(map(p => p.contenido));
  }

  catalogo<T>(recurso: 'clientes' | 'productos', pagina = 0, acumulado: T[] = []): Observable<T[]> {
    return this.http.get<PaginaResponse<T>>(`${this.url}/${recurso}`, { params: { pagina, tamanio: 100 } })
      .pipe(switchMap(p => {
        const datos = [...acumulado, ...p.contenido];
        return p.ultima ? of(datos) : this.catalogo<T>(recurso, pagina + 1, datos);
      }));
  }
}
