import { Component, Input } from '@angular/core';
import { LucideAngularModule, Home, ChevronRight } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-dashboard',
  standalone: true,
  imports: [LucideAngularModule, RouterModule],
  templateUrl: './header-dashboard.component.html',
})
export class HeaderDashboardComponent {
  @Input() creadorEmail: string | null = null; // Nueva propiedad de entrada
  @Input() token: string | null = null;

  icons = { Home, ChevronRight };
}
