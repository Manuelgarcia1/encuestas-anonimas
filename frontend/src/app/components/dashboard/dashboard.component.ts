import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EncuestasService } from '../../services/encuestas.service';
import {
  LucideAngularModule,
  Plus,
  Filter,
  Search,
  Calendar,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Pencil,
  ChevronDown,
  Check,
} from 'lucide-angular';
import { HeaderDashboardComponent } from '../header/header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LucideAngularModule, HeaderDashboardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  forms: any[] = [];
  creadorEmail: string | null = null; // Nueva propiedad para el email del creador
  filters = [
    { id: 1, name: 'Fecha de creación', checked: false },
    { id: 2, name: 'Número de Respuestas', checked: false },
    { id: 3, name: 'Orden Alfabético', checked: false },
  ];
  icons = {
    Plus,
    Filter,
    Search,
    Calendar,
    FileText,
    MoreVertical,
    Edit,
    Trash2,
    Copy,
    Pencil,
    ChevronDown,
    Check,
  };
  menuOpenId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encuestasService: EncuestasService
  ) {
    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token');
      if (token) {
        document.cookie = `td=${token}; path=/; SameSite=Strict; Secure`;
        this.encuestasService.getEncuestasPorToken(token).subscribe({
          next: (response) => {
            let encuestas: any[] = [];
            if (Array.isArray(response.data)) {
              encuestas = response.data;
            } else if (response.data) {
              encuestas = [response.data];
            }
            console.log('Respuesta completa:', response);
            
            // Obtener el email del creador desde la respuesta
            if (response.creadorEmail) {
              this.creadorEmail = response.creadorEmail;
              console.log('Email del creador:', this.creadorEmail);
            }

            this.forms = encuestas.map((encuesta: any) => ({
              id: encuesta.id,
              name: encuesta.nombre,
              creationDate: encuesta.createdAt || '',
              status: encuesta.tipo?.toLowerCase() || 'borrador',
              ...encuesta,
            }));
          },
          error: (err) => {
            console.error('Error al obtener encuestas:', err);
          },
        });
      }
    });
  }

  navigateToCreateForm() {
    this.router.navigate(['/create']);
  }

  getStatusClasses(status: string) {
    const baseClasses = 'px-2 py-1 rounded text-xs';
    switch (status) {
      case 'borrador':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'publicada':
      case 'activo':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cerrada':
      case 'cerrado':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  toggleMenu(form: any) {
    this.menuOpenId = this.menuOpenId === form.id ? null : form.id;
  }

  closeAllMenus() {
    this.menuOpenId = null;
  }

  copyLink(form: any) {
    const url = `${window.location.origin}/form/${form.id}`;
    navigator.clipboard.writeText(url);
    alert('¡Enlace copiado!');
  }

  goToCreate(formId: string) {
    this.router.navigate(['/create', formId]);
  }
}
