import {Component,output} from '@angular/core';import {RouterLink} from '@angular/router';
@Component({selector:'app-header',imports:[RouterLink],templateUrl:'./header.html',styleUrl:'./header.css'}) export class Header {readonly toggleMenu=output<void>();}

