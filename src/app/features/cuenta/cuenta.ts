import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cuenta', imports: [FormsModule],
  template: `<p class="eyebrow">SEGURIDAD</p><h1>Mi cuenta</h1>
    <p class="subtitulo">Cambia tu contraseña. Al guardarla, deberás volver a iniciar sesión.</p>
    <form class="card form-card" (ngSubmit)="save()">
      @if(error()){<p class="alerta" role="alert">{{error()}}</p>}
      <div class="campo"><label for="current">Contraseña actual</label><input id="current" type="password" name="current" autocomplete="current-password" required [(ngModel)]="current"></div>
      <div class="campo"><label for="next">Contraseña nueva</label><input id="next" type="password" name="next" autocomplete="new-password" minlength="8" maxlength="72" required [(ngModel)]="next"><small class="ayuda">8 a 72 caracteres; incluye letras y números.</small></div>
      <button class="btn primario" type="submit" [disabled]="busy()">{{busy()?'Guardando…':'Cambiar contraseña'}}</button>
    </form>`,
  styles: [`input[type=password]{width:100%;padding:12px 14px;border:1px solid #cfd9e5;border-radius:7px;font:inherit}`]
})
export class Cuenta {
  private readonly http=inject(HttpClient);
  private readonly auth=inject(AuthService);
  current=''; next='';
  readonly busy=signal(false); readonly error=signal('');
  save(){
    if(this.busy())return;
    if(this.next.length<8 || this.next.length>72 || !/[A-Za-z]/.test(this.next) || !/[0-9]/.test(this.next)){
      this.error.set('La contraseña nueva debe tener entre 8 y 72 caracteres, con letras y números.');return;
    }
    this.error.set('');this.busy.set(true);
    this.http.put<void>(`${environment.apiUrl}/auth/password`,{passwordActual:this.current,passwordNueva:this.next}).subscribe({
      next:()=>{this.current='';this.next='';this.auth.logout();},
      error:e=>{this.busy.set(false);this.error.set(e.error?.message??'No se pudo cambiar la contraseña');}
    });
  }
}
