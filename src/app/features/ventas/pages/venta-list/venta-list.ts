import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VentaService } from '../../services/venta-service';
import { Cliente } from '../../../clientes/models/cliente.model';
import { EstadoVenta, FiltroVentas, Venta } from '../../models/venta.model';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
@Component({selector:'app-venta-list',imports:[ReactiveFormsModule,CurrencyPipe,DatePipe,RouterLink,SiPermiso],templateUrl:'./venta-list.html',styleUrl:'../../ventas.css'})
export class VentaList {
  private readonly servicio=inject(VentaService);private readonly fb=inject(NonNullableFormBuilder);
  readonly filtros=this.fb.group({clienteId:this.fb.control<number|null>(null),estado:this.fb.control<EstadoVenta|null>(null),desde:'',hasta:''});
  readonly clientes=signal<Cliente[]>([]);readonly pagina=signal<PaginaResponse<Venta>|null>(null);readonly cargando=signal(false);readonly error=signal('');readonly tamanio=5;
  readonly totalPagina=computed(()=>Math.round((this.pagina()?.contenido??[]).filter(v=>v.estado==='REGISTRADA').reduce((s,v)=>s+Math.round(v.total*100),0))/100);
  readonly aplicados=signal<FiltroVentas>({clienteId:null,estado:null,desde:null,hasta:null});
  constructor(){this.servicio.catalogo<Cliente>('clientes').subscribe({next:c=>this.clientes.set(c),error:e=>this.error.set(e.error?.message??'No se pudieron cargar clientes')});this.buscar();}
  buscar(numero=0){if(this.cargando())return;const f=this.filtros.getRawValue();this.error.set('');if(f.desde&&f.hasta&&f.desde>f.hasta){this.error.set('La fecha desde no puede ser posterior a la fecha hasta.');return;}
    const filtros:FiltroVentas={clienteId:f.clienteId,estado:f.estado,desde:f.desde||null,hasta:f.hasta||null};this.cargando.set(true);
    this.servicio.buscar(filtros,numero,this.tamanio).subscribe({next:p=>{this.pagina.set(p);this.aplicados.set(filtros);this.cargando.set(false);},error:e=>{this.error.set(e.error?.message??'No se pudo consultar ventas');this.cargando.set(false);}});
  }
  clienteFiltro(){return this.clientes().find(c=>c.id===this.aplicados().clienteId);}
  limpiar(){this.filtros.reset({clienteId:null,estado:null,desde:'',hasta:''});this.buscar();}
  imprimirConsulta(){window.print();}
}
