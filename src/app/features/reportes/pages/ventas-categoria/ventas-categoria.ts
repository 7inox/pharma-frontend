import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../services/reporte-service';
import { VentaPorCategoria } from '../../models/reporte.model';

@Component({
  selector: 'app-ventas-categoria',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './ventas-categoria.html',
  styleUrl: './ventas-categoria.css'
})
export class VentasCategoria {
  private readonly servicio = inject(ReporteService);
  desde = '';
  hasta = '';
  readonly filas = signal<VentaPorCategoria[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly consultado = signal(false);
  readonly unidades = computed(() => this.filas().reduce((s, f) => s + f.cantidadVendida, 0));
  readonly monto = computed(() => this.filas().reduce((s, f) => s + Math.round(f.montoTotal * 100), 0) / 100);
  readonly mayor = computed(() => Math.max(0, ...this.filas().map(f => f.montoTotal)));
  porcentaje(fila: VentaPorCategoria) { return this.mayor() > 0 ? fila.montoTotal / this.mayor() * 100 : 0; }
  generar() {
    if (this.cargando()) return;
    this.error.set('');
    this.filas.set([]);
    this.consultado.set(false);
    if (this.desde && this.hasta && this.desde > this.hasta) {
      this.error.set('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }
    this.cargando.set(true);
    this.servicio.ventasPorCategoria(this.desde || null, this.hasta || null).subscribe({
      next: filas => { this.filas.set(filas); this.consultado.set(true); this.cargando.set(false); },
      error: respuesta => {
        const mensaje = respuesta.error?.mensaje ?? respuesta.error?.message;
        this.error.set(typeof mensaje === 'string' ? mensaje : 'No se pudo cargar el reporte. Comprueba la conexión con el backend.');
        this.cargando.set(false);
      }
    });
  }
}
