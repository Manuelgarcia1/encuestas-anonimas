import { Component } from '@angular/core';
import { LucideAngularModule, Plus, Filter, Search, Calendar, Edit, Trash2, FileText } from 'lucide-angular';
import { HeaderDashboardComponent } from '../header/header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LucideAngularModule, HeaderDashboardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  // Iconos disponibles
  icons = { Plus, Filter, Search, Calendar, Edit, Trash2, FileText };

  // Datos de ejemplo para la tabla
  forms = [
    { 
      id: 1, 
      name: 'Creo Familiaris', 
      response: 3, 
      creationDate: '26 May 2012',
      status: 'publicada' // Puede ser: 'borrador', 'publicada' o 'cerrada'
    },
    { 
      id: 2, 
      name: 'Ticket de consulta', 
      response: 11, 
      creationDate: '17 Jun 2025',
      status: 'borrador'
    },
    { 
      id: 3, 
      name: 'Upload actualizado', 
      response: 8, 
      creationDate: '26 Feb 2025',
      status: 'cerrada'
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
    
    switch(status) {
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
}