import { Component, inject, input, signal, OnInit, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { switchMap, catchError, of, map } from 'rxjs';
import { VentaService } from '../../services/venta-service';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Venta } from '../../models/venta.model';
import { Cliente } from '../../../clientes/models/cliente.model';
@Component({selector:'app-venta-detalle',imports:[CurrencyPipe,DatePipe,RouterLink],templateUrl:'./venta-detalle.html',styleUrl:'../../ventas.css'})
export class VentaDetalle implements OnInit {
  private readonly servicio=inject(VentaService);private readonly clientes=inject(ClienteService);
  readonly id=input.required<string>();readonly nueva=input<string>();readonly imprimir=input<string>();
  readonly venta=signal<Venta|null>(null);readonly cliente=signal<Cliente|null>(null);readonly error=signal('');readonly fechaImpresion=new Date();
  readonly numero=computed(()=>String(this.venta()?.id??'').padStart(6,'0'));
  readonly unidades=computed(()=>(this.venta()?.detalles??[]).reduce((s,d)=>s+d.cantidad,0));
  ngOnInit(){this.servicio.obtener(Number(this.id())).pipe(switchMap(venta=>this.clientes.obtener(venta.clienteId).pipe(catchError(()=>of(null)),map(cliente=>({venta,cliente}))))).subscribe({next:r=>{this.venta.set(r.venta);this.cliente.set(r.cliente);if(this.imprimir())requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));},error:e=>this.error.set(e.error?.message??'No se pudo obtener la venta')});}
  imprimirComprobante(){window.print();}
}
