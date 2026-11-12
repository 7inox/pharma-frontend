import { Component, inject, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({ selector: 'app-header', imports: [RouterLink, DatePipe], templateUrl: './header.html', styleUrl: './header.css' })
export class Header {
    protected readonly production = environment.production;
    protected readonly auth = inject(AuthService);
    readonly toggleMenu = output<void>();
}
