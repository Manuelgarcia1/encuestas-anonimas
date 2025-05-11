import { Component } from '@angular/core';
import { LucideAngularModule, Home, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-header-dashboard',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './header-dashboard.component.html',
})
export class HeaderDashboardComponent {
  // Iconos disponibles
  icons = { Home, ChevronRight };
  
  // Código de usuario aleatorio (simulando UUIDv4)
  userCode = this.generateRandomCode();
  
  private generateRandomCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'user-';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}