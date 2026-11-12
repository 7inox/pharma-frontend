import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { Direccion, OrdenProducto, Producto, ProductoRequest } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + '/productos';
  listar(pagina = 0, tamanio = 10, ordenarPor: OrdenProducto = 'nombre', direccion: Direccion = 'asc', categoriaId: number | null = null) {
    let params = new HttpParams().set('pagina', pagina).set('tamanio', tamanio).set('ordenarPor', ordenarPor).set('direccion', direccion);
    if (categoriaId !== null) params = params.set('categoriaId', categoriaId);
    return this.http.get<PaginaResponse<Producto>>(this.url, { params });
  }
  obtener(id: number) { return this.http.get<Producto>(`${this.url}/${id}`); }
  crear(dto: ProductoRequest) { return this.http.post<Producto>(this.url, dto); }
  actualizar(id: number, dto: ProductoRequest) { return this.http.put<Producto>(`${this.url}/${id}`, dto); }
  darDeBaja(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}
