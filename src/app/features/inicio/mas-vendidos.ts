import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ReporteService } from '../reportes/services/reporte-service';

@Component({
  selector: 'app-mas-vendidos',
  imports: [CurrencyPipe],
  templateUrl: './mas-vendidos.html',
})
export class MasVendidos {
  protected readonly filas = toSignal(
    inject(ReporteService).productosMasVendidos().pipe(catchError(() => of(null))),
  );
}
