import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { VentaPorCategoria } from '../models/reporte.model';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  ventasPorCategoria(desde: string | null, hasta: string | null) {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<(VentaPorCategoria & { unidadesVendidas?: number })[]>(`${environment.apiUrl}/reportes/ventas-por-categoria`, { params }).pipe(
      map(filas => filas.map(fila => ({ ...fila, cantidadVendida: fila.cantidadVendida ?? fila.unidadesVendidas ?? 0 })))
    );
  }
}
