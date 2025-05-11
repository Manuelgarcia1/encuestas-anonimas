import { Component } from '@angular/core';
import { LucideAngularModule, Home, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-header-welcome',
  imports: [LucideAngularModule], // Módulo de iconos
  templateUrl: './header-welcome.component.html',
})
export class HeaderWelcomeComponent {
  // Iconos disponibles para el template
  icons = { Home, ChevronRight };
}