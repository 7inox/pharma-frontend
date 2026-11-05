import { Component, computed, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({ selector: 'app-header', imports: [RouterLink], templateUrl: './header.html', styleUrl: './header.css' })
export class Header {
    protected readonly production = environment.production;
    protected readonly auth = inject(AuthService);
    private readonly clock = new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    });
    protected readonly expirationTime = computed(() => {
      const session = this.auth.session();
      return session ? this.clock.format(session.expiraEn) : '';
    });
    readonly toggleMenu = output<void>();
}
