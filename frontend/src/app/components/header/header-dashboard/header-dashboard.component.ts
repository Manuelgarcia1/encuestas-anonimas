import { Component, Input } from '@angular/core';
import { LucideAngularModule, Home, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-header-dashboard',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './header-dashboard.component.html',
})
export class HeaderDashboardComponent {
  @Input() email: string | null = null;

  icons = { Home, ChevronRight };
}
