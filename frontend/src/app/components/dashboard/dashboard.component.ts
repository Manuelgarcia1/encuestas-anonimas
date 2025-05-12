import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, Filter, Search, Calendar, FileText, MoreVertical, Edit, Trash2, Copy, Pencil } from 'lucide-angular';
import { HeaderDashboardComponent } from '../header/header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LucideAngularModule, HeaderDashboardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {

  constructor(private router: Router) { }

  // Iconos disponibles
  icons = { Plus, Filter, Search, Calendar, FileText, MoreVertical, Edit, Trash2, Copy, Pencil };

  // Datos de ejemplo para la tabla
  forms = [
    {
      id: 1,
      name: 'Evaluación de la plataforma',
      response: 3,
      creationDate: '26 May 2012',
      status: 'publicada',
      showMenu: false
    },
    {
      id: 2,
      name: 'Encuesta de satisfacción',
      response: 11,
      creationDate: '17 Jun 2025',
      status: 'borrador',
      showMenu: false
    },
    {
      id: 3,
      name: 'Análisis de datos',
      response: 8,
      creationDate: '26 Feb 2025',
      status: 'cerrada',
      showMenu: false
    }
  ];

  // Filtros
  filters = [
    { id: 1, name: 'Fecha de creación', checked: false },
    { id: 2, name: 'Número de Respuestas', checked: false },
    { id: 3, name: 'Orden Alfabético', checked: false }
  ];

  // Método para obtener las clases CSS según el estado
  getStatusClasses(status: string): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

    switch (status) {
      case 'borrador':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'publicada':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cerrada':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }
  toggleMenu(form: any) {
    form.showMenu = !form.showMenu;
  }

  closeAllMenus() {
    this.forms.forEach(form => form.showMenu = false);
  }

  // Método para redirigir a create-form
  navigateToCreateForm() {
    this.router.navigate(['/create']);
  }

  copyLink(form: any) {
    // Lógica para copiar el link
    console.log('Link copiado para:', form.name);
    form.showMenu = false;
  }
}
