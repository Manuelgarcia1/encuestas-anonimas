import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderWelcomeComponent } from '../header/header-welcome/header-welcome.component';


@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, HeaderWelcomeComponent,RouterModule],
  templateUrl: './welcome.component.html',
  styles: []
})
export class WelcomeComponent {}