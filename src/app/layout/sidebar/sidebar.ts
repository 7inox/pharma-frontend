import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MENU } from '../../core/config/menu';
@Component({ selector: 'app-sidebar', imports: [RouterLink, RouterLinkActive], templateUrl: './sidebar.html', styleUrl: './sidebar.css' })
export class Sidebar {
    protected readonly menu = MENU;
}
