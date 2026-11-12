import { mensajeError } from '../../../../core/utils/http-error';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { Cliente } from '../../../clientes/models/cliente.model';
import { Producto } from '../../../productos/models/producto.model';
import { VentaService } from '../../services/venta-service';
import { redondear } from '../../../../core/utils/numeros';
interface LineaForm { productoId:FormControl<number>; cantidad:FormControl<number>; }
@Component({selector:'app-venta-form',imports:[ReactiveFormsModule,RouterLink,CurrencyPipe],templateUrl:'./venta-form.html',styleUrl:'../../ventas.css'})
export class VentaForm {
  private readonly fb=inject(NonNullableFormBuilder);
  private readonly servicio=inject(VentaService);
  private readonly router=inject(Router);
  readonly clienteElegido = signal<Cliente | null>(null);
  private readonly productos = signal(new Map<number, Producto>());
  readonly confirmando=signal(false); readonly guardando=signal(false); readonly error=signal('');
  readonly imprimirAlRegistrar=signal(false);
  readonly form=this.fb.group({clienteId:this.fb.control<number|null>(null,Validators.required),detalles:this.fb.array<FormGroup<LineaForm>>([],Validators.required)});
  get detalles(){return this.form.controls.detalles;}
  readonly buscarCliente=new FormControl('',{nonNullable:true}); readonly buscarProducto=new FormControl('',{nonNullable:true});
  private readonly textoCliente = toSignal(this.buscarCliente.valueChanges.pipe(
    map(valor => valor.trim()), debounceTime(300), distinctUntilChanged(),
  ), { initialValue: '' });
  private readonly textoProducto = toSignal(this.buscarProducto.valueChanges.pipe(
    map(valor => valor.trim()), debounceTime(300), distinctUntilChanged(),
  ), { initialValue: '' });
  private readonly valor = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  readonly consultaClientes = rxResource({
    params: () => this.textoCliente() || undefined,
    stream: ({ params }) => this.servicio.buscarClientes(params),
  });
  readonly consultaProductos = rxResource({
    params: () => this.textoProducto() || undefined,
    stream: ({ params }) => this.servicio.buscarProductos(params),
  });
  readonly clientesEncontrados = computed(() => this.consultaClientes.hasValue() ? this.consultaClientes.value() : []);
  readonly productosEncontrados = computed(() => this.consultaProductos.hasValue() ? this.consultaProductos.value() : []);
  readonly lineas=computed(()=>(this.valor().detalles??[]).map(d=>{const producto=this.productos().get(d.productoId ?? 0);const cantidad=Number(d.cantidad)||0;const precio=producto?.precio??0;return {producto,cantidad,precio,subtotal:Number.isInteger(cantidad)&&cantidad>0?redondear(Math.round(precio*100)*cantidad/100):0,excedeStock:!!producto&&cantidad>producto.stock};}));
  readonly total=computed(()=>redondear(this.lineas().reduce((s,l)=>s+l.subtotal,0)));
  elegirCliente(cliente: Cliente): void {
    if (this.confirmando()) return;
    this.clienteElegido.set(cliente);
    this.form.controls.clienteId.setValue(cliente.id);
    this.buscarCliente.setValue('');
  }

  cambiarCliente(): void {
    this.clienteElegido.set(null);
    this.form.controls.clienteId.setValue(null);
  }
  agregarProducto(p:Producto){if(this.confirmando()||this.guardando())return;this.productos.update(productos => new Map(productos).set(p.id, p));const fila=this.detalles.controls.find(l=>l.controls.productoId.value===p.id);if(fila)fila.controls.cantidad.setValue(Number(fila.controls.cantidad.value)+1);else this.detalles.push(this.fb.group({productoId:this.fb.control(p.id,Validators.required),cantidad:this.fb.control(1,[Validators.required,Validators.min(1),Validators.pattern(/^\d+$/)])}));this.buscarProducto.setValue('');}
  agregarPrimero(e:Event){e.preventDefault();const p=this.productosEncontrados()[0];if(p)this.agregarProducto(p);}
  cantidadEnDetalle(id:number){return this.lineas().find(l=>l.producto?.id===id)?.cantidad??0;}
  quitarLinea(i:number){if(!this.confirmando())this.detalles.removeAt(i);}
  revisar(){this.form.markAllAsTouched();if(this.form.invalid||this.lineas().some(l=>l.excedeStock)||!this.clienteElegido()?.estado)return;this.error.set('');this.confirmando.set(true);}
  confirmar(){if(this.guardando()||!this.confirmando()||this.form.invalid||this.lineas().some(l=>l.excedeStock))return;const v=this.form.getRawValue();this.guardando.set(true);this.servicio.registrar({clienteId:Number(v.clienteId),detalles:v.detalles.map(d=>({productoId:Number(d.productoId),cantidad:Number(d.cantidad)}))}).subscribe({next:venta=>this.router.navigate(['/ventas',venta.id],{queryParams:{nueva:1,...(this.imprimirAlRegistrar()?{imprimir:1}:{})}}),error:e=>{this.guardando.set(false);this.confirmando.set(false);this.error.set(mensajeError(e, 'No se pudo registrar la venta'));if(e.status===409)this.actualizarProductos();}});}
  private actualizarProductos(): void {
    for (const { productoId } of this.detalles.getRawValue()) {
      this.servicio.obtenerProducto(productoId).subscribe({
        next: p => this.productos.update(productos => new Map(productos).set(p.id, p)),
        error: () => {},
      });
    }
  }
}
