import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

interface Rol { id:number; nombre:string; descripcion:string; }
interface Usuario { id:number; username:string; empleado:string; roles:string[]; estado:boolean; }

@Component({
  selector:'app-usuarios',
  template:`<p class="eyebrow">ADMINISTRACIÓN</p><h1>Usuarios y roles</h1>
    <p class="subtitulo">Asigna permisos y activa o desactiva las cuentas del personal.</p>
    @if(error()){<p class="alerta" role="alert">{{error()}}</p>}
    @if(message()){<p class="alerta exito" role="status">{{message()}}</p>}
    @if(loading()){<p>Cargando usuarios…</p>}@else{
      <div class="card tabla-scroll"><table><thead><tr><th>Usuario</th><th>Empleado</th><th>Roles</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>@for(user of users();track user.id){<tr>
        <td>{{user.username}}</td><td>{{user.empleado}}</td>
        <td><div class="roles">@for(role of roles();track role.id){
          <label><input type="checkbox" [checked]="selected(user.id,role.id)" (change)="toggle(user.id,role.id,$event)"> {{role.nombre}}</label>
        }</div></td>
        <td><span class="estado" [class.activo]="user.estado">{{user.estado?'Activo':'Inactivo'}}</span></td>
        <td><div class="acciones"><button class="btn pequeno" type="button" [disabled]="busy()" (click)="saveRoles(user)">Guardar roles</button>
          <button class="btn pequeno" type="button" [disabled]="busy()" (click)="changeState(user)">{{user.estado?'Desactivar':'Activar'}}</button></div></td>
      </tr>}</tbody></table></div>
    }`,
  styles:[`.roles{display:flex;flex-wrap:wrap;gap:10px}.roles label{white-space:nowrap;font-size:13px}.roles input{accent-color:#0f2e5c}.acciones{min-width:190px}`]
})
export class Usuarios implements OnInit {
  private readonly http=inject(HttpClient);
  private readonly auth=inject(AuthService);
  private readonly url=`${environment.apiUrl}/usuarios`;
  readonly users=signal<Usuario[]>([]);readonly roles=signal<Rol[]>([]);
  readonly loading=signal(true);readonly busy=signal(false);readonly error=signal('');readonly message=signal('');
  readonly chosen=signal<Record<number,number[]>>({});
  ngOnInit(){this.load();}
  private load(){
    this.loading.set(true);
    forkJoin({users:this.http.get<Usuario[]>(this.url),roles:this.http.get<Rol[]>(`${environment.apiUrl}/roles`)}).subscribe({
      next:({users,roles})=>{this.users.set(users);this.roles.set(roles);
        this.chosen.set(Object.fromEntries(users.map(u=>[u.id,roles.filter(r=>u.roles.includes(r.nombre)).map(r=>r.id)])));
        this.loading.set(false);},
      error:e=>{this.loading.set(false);this.error.set(e.error?.message??'No se pudieron cargar los usuarios');}
    });
  }
  selected(id:number,role:number){return this.chosen()[id]?.includes(role)??false;}
  toggle(id:number,role:number,event:Event){
    const checked=(event.target as HTMLInputElement).checked;
    const current=this.chosen()[id]??[];
    this.chosen.update(all=>({...all,[id]:checked?[...current,role]:current.filter(r=>r!==role)}));
  }
  saveRoles(user:Usuario){
    const rolIds=this.chosen()[user.id]??[];
    if(!rolIds.length){this.error.set('Selecciona al menos un rol.');return;}
    this.error.set('');this.message.set('');this.busy.set(true);
    this.http.put<Usuario>(`${this.url}/${user.id}/roles`,{rolIds}).subscribe({
      next:updated=>{this.users.update(all=>all.map(u=>u.id===updated.id?updated:u));this.busy.set(false);
        this.message.set(`Roles de ${updated.username} actualizados.`);
        if(updated.username===this.auth.session()?.username) this.auth.logout();},
      error:e=>{this.busy.set(false);this.error.set(e.error?.message??'No se pudieron guardar los roles');}
    });
  }
  changeState(user:Usuario){
    this.error.set('');this.message.set('');this.busy.set(true);
    this.http.patch<Usuario>(`${this.url}/${user.id}/estado`,{estado:!user.estado}).subscribe({
      next:updated=>{this.users.update(all=>all.map(u=>u.id===updated.id?updated:u));this.busy.set(false);
        this.message.set(`${updated.username}: ${updated.estado?'activo':'inactivo'}.`);},
      error:e=>{this.busy.set(false);this.error.set(e.error?.message??'No se pudo cambiar el estado');}
    });
  }
}
