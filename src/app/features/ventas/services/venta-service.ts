import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { FiltroVentas, Venta, VentaRequest } from '../models/venta.model';
@Injectable({providedIn:'root'})
export class VentaService {
  private readonly http=inject(HttpClient);
  private readonly url=environment.apiUrl;
  registrar(dto:VentaRequest):Observable<Venta> { return this.http.post<Venta>(`${this.url}/ventas`,dto); }
  obtener(id:number):Observable<Venta> { return this.http.get<Venta>(`${this.url}/ventas/${id}`); }
  buscar(f:FiltroVentas,pagina=0,tamanio=5):Observable<PaginaResponse<Venta>> {
    let params=new HttpParams().set('pagina',pagina).set('tamanio',tamanio).set('ordenarPor','fecha').set('direccion','desc');
    if(f.clienteId)params=params.set('clienteId',f.clienteId);
    if(f.estado)params=params.set('estado',f.estado);
    if(f.desde)params=params.set('desde',f.desde);
    if(f.hasta)params=params.set('hasta',f.hasta);
    return this.http.get<PaginaResponse<Venta>|Venta[]>(`${this.url}/ventas/buscar`,{params}).pipe(map(r=>Array.isArray(r)?{contenido:r.slice(pagina*tamanio,(pagina+1)*tamanio),pagina,tamanio,totalElementos:r.length,totalPaginas:Math.ceil(r.length/tamanio),ultima:(pagina+1)*tamanio>=r.length}:r));
  }
  catalogo<T>(recurso:'clientes'|'productos',pagina=0,acumulado:T[]=[]):Observable<T[]> {
    return this.http.get<PaginaResponse<T>>(`${this.url}/${recurso}`,{params:new HttpParams().set('pagina',pagina).set('tamanio',100)}).pipe(switchMap(r=>{const datos=[...acumulado,...r.contenido];return pagina+1<r.totalPaginas?this.catalogo<T>(recurso,pagina+1,datos):of(datos);}));
  }
}
