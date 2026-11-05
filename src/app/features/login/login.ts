import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { mensajeError } from '../../core/utils/http-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `<main class="login-wrap"><section class="card login-card">
    <p class="eyebrow">PHARMASOFT</p><h1>Iniciar sesión</h1>
    <p class="subtitulo">Accede con tu usuario de la botica.</p>
    @if (route.snapshot.queryParamMap.get('expirada')) {
      <p class="alerta aviso" role="status">Su sesión expiró. Inicie sesión nuevamente.</p>
    }
    @if (error()) { <p class="alerta" role="alert">{{ error() }}</p> }
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="campo"><label for="username">Usuario</label>
        <input id="username" formControlName="username" autocomplete="username" maxlength="50">
        @if (form.controls.username.touched && form.controls.username.invalid) {
          <small class="error-campo">Ingrese su usuario.</small>
        }
      </div>
      <div class="campo"><label for="password">Contraseña</label>
        <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" maxlength="72">
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <small class="error-campo">Ingrese su contraseña.</small>
        }
      </div>
      <label class="mostrar"><input type="checkbox" [checked]="showPassword()" (change)="showPassword.set(!showPassword())"> Mostrar contraseña</label>
      <button class="btn primario" type="submit" [disabled]="loading()">{{ loading() ? 'Ingresando…' : 'Ingresar' }}</button>
    </form>
  </section></main>`,
  styles: [`.login-wrap{min-height:100vh;display:grid;place-items:center;padding:24px;background:#edf3fa}
    .login-card{width:min(420px,100%)}.login-card form{display:grid;gap:14px}
    .login-card input:not([type=checkbox]){width:100%;padding:12px;border:1px solid #cfd9e5;border-radius:7px;font:inherit}
    .login-card button{width:100%}.mostrar{display:flex;align-items:center;gap:8px}
    .error-campo{color:#b42318}.aviso{background:#fff6dc;color:#7a5200}`]
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.maxLength(72)]]
  });
  readonly error = signal('');
  readonly loading = signal(false);
  readonly showPassword = signal(false);

  submit(): void {
    if (this.loading()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.loading.set(true);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => void this.router.navigateByUrl(this.destination()),
      error: (err: HttpErrorResponse) => {
        this.form.controls.password.reset();
        this.error.set(err.status === 401 ? 'Usuario o contraseña incorrectos' : mensajeError(err));
      }
    });
  }

  private destination(): string {
    const wanted = this.route.snapshot.queryParamMap.get('returnUrl');
    return wanted && wanted.startsWith('/') && !wanted.startsWith('//') && !wanted.includes('\\')
      ? wanted : '/inicio';
  }
}
