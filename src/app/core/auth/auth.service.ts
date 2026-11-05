import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, Permiso, Session } from './auth.model';

const KEY = 'pharmasoft.sesion';
const MAX_TIMEOUT = 2_147_483_647;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly state = signal<Session | null>(this.read());
  private expirationTimer?: ReturnType<typeof setTimeout>;

  readonly session = this.state.asReadonly();
  readonly authenticated = computed(() => this.state() !== null);

  constructor() {
    const restored = this.state();
    if (restored) this.scheduleExpiration(restored);
  }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      map(response => ({
        token: response.token,
        username: response.username,
        nombreCompleto: response.nombreCompleto,
        roles: response.roles,
        permisos: response.permisos,
        expiraEn: Date.now() + response.expiresIn * 1000
      }) satisfies Session),
      tap(session => {
        sessionStorage.setItem(KEY, JSON.stringify(session));
        this.state.set(session);
        this.scheduleExpiration(session);
      })
    );
  }

  validSession(): Session | null {
    const session = this.state();
    if (session && session.expiraEn > Date.now()) return session;
    if (session) this.closeExpired();
    return null;
  }

  token(): string | null { return this.validSession()?.token ?? null; }
  has(permission: string): boolean { return this.validSession()?.permisos.includes(permission as Permiso) ?? false; }
  logout(): void { this.clear(); void this.router.navigate(['/login']); }

  closeExpired(returnUrl = this.router.url): void {
    this.clear();
    void this.router.navigate(['/login'], {
      queryParams: { expirada: '1', returnUrl: this.internalUrl(returnUrl) ? returnUrl : '/inicio' }
    });
  }

  private clear(): void {
    clearTimeout(this.expirationTimer);
    sessionStorage.removeItem(KEY);
    this.state.set(null);
  }

  private scheduleExpiration(session: Session): void {
    clearTimeout(this.expirationTimer);
    const remaining = session.expiraEn - Date.now();
    if (remaining <= 0) { this.closeExpired(); return; }
    this.expirationTimer = setTimeout(() => this.scheduleExpiration(session), Math.min(remaining, MAX_TIMEOUT));
  }

  private internalUrl(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//') && !url.includes('\\');
  }

  private read(): Session | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as Session;
      if (typeof session.token === 'string' && session.token &&
          typeof session.expiraEn === 'number' && session.expiraEn > Date.now() &&
          typeof session.username === 'string' &&
          typeof session.nombreCompleto === 'string' &&
          Array.isArray(session.roles) && Array.isArray(session.permisos)) return session;
    } catch { /* A damaged session is discarded below. */ }
    sessionStorage.removeItem(KEY);
    return null;
  }
}
