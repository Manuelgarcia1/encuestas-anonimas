import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EncuestasService } from '../../services/encuestas.service';
import { Encuesta } from '../../interfaces/encuesta.interface'; // adaptá la ruta según tu estructura
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
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    HeaderDashboardComponent,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  forms: any[] = [];
  filteredForms: any[] = [];
  searchTerm: string = '';
  creadorEmail: string | null = null;
  filters = [
    { id: 1, name: 'Fecha de creación', checked: true }, // Cambiado a true
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
        this.loadForms(token);
      }
    });
  }

  private loadForms(token: string): void {
    document.cookie = `td=${token}; path=/; SameSite=Strict; Secure`;
    this.encuestasService.getEncuestasPorToken(token).subscribe({
      next: (response) => {
        let encuestas: Encuesta[] = Array.isArray(response.data)
          ? response.data
          : response.data
          ? [response.data]
          : [];

        if (response.creadorEmail) {
          this.creadorEmail = response.creadorEmail;
        }

        this.forms = encuestas.map((encuesta) => ({
          id: encuesta.id,
          name: encuesta.nombre,
          creationDate: encuesta.createdAt || '',
          status: encuesta.tipo?.toLowerCase() || 'borrador',
          ...encuesta,
        }));

        // Orden inicial por fecha de creación (más reciente primero)
        this.forms.sort(
          (a, b) =>
            new Date(b.creationDate).getTime() -
            new Date(a.creationDate).getTime()
        );

        this.updateDisplayedForms();
      },
      error: (err) => {
        console.error('Error al obtener encuestas:', err);
      },
    });
  }

  toggleFilter(filter: any): void {
    // Solo permitir un filtro activo a la vez
    this.filters.forEach((f) => {
      if (f.id !== filter.id) {
        f.checked = false;
      }
    });

    filter.checked = !filter.checked;
    this.updateDisplayedForms();
  }

  updateDisplayedForms(): void {
    // 1. Aplicar filtro de búsqueda primero
    let result = [...this.forms];

    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      result = result.filter((form) =>
        form.name.toLowerCase().includes(searchTermLower)
      );
    }

    // 2. Aplicar ordenamiento si hay un filtro activo
    const activeFilter = this.filters.find((f) => f.checked);
    if (activeFilter) {
      switch (activeFilter.id) {
        case 1: // Fecha de creación (más reciente primero)
          result.sort(
            (a, b) =>
              new Date(b.creationDate).getTime() -
              new Date(a.creationDate).getTime()
          );
          break;
        case 2: // Número de respuestas (implementar cuando tengamos los datos)
          // result.sort((a, b) => b.responses - a.responses);
          break;
        case 3: // Orden Alfabético
          result.sort((a, b) =>
            a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
          );
          break;
      }
    } else {
      // Si no hay filtros activos, ordenar por fecha de creación (más reciente primero)
      result.sort(
        (a, b) =>
          new Date(b.creationDate).getTime() -
          new Date(a.creationDate).getTime()
      );
    }

    this.filteredForms = result;
  }

  filterForms(): void {
    this.updateDisplayedForms();
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
