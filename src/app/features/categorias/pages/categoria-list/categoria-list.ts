import {Component,OnInit,computed,inject,signal} from '@angular/core';import {DatePipe} from '@angular/common';import {HttpErrorResponse} from '@angular/common/http';import {RouterLink,Router} from '@angular/router';import {finalize} from 'rxjs';import {CategoriaService} from '../../services/categoria-service';import {Categoria} from '../../models/categoria.model';import {mensajeError} from '../../../../core/utils/http-error';
@Component({selector:'app-categoria-list',imports:[RouterLink,DatePipe],templateUrl:'./categoria-list.html'})
export class CategoriaList implements OnInit {
private readonly service=inject(CategoriaService);private readonly router=inject(Router);
protected readonly categorias=signal<Categoria[]>([]);protected readonly filtro=signal('');protected readonly cargando=signal(false);protected readonly error=signal('');protected readonly exito=signal('');
protected readonly filtradas=computed(()=>{const t=this.filtro().trim().toLocaleLowerCase();return this.categorias().filter(c=>c.nombre.toLocaleLowerCase().includes(t));});
constructor(){this.exito.set(this.router.currentNavigation()?.extras.state?.['mensaje']??'');}
ngOnInit(){this.cargar();}
cargar(){this.cargando.set(true);this.error.set('');this.service.listar().pipe(finalize(()=>this.cargando.set(false))).subscribe({next:datos=>this.categorias.set(datos),error:(err:HttpErrorResponse)=>this.error.set(mensajeError(err))});}
}
