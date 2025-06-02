// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EncuestasService } from '../../services/encuestas.service';
import {
  LucideAngularModule, Plus, Filter, Search, Calendar, FileText, MoreVertical, Edit,
  Trash2, Copy, Pencil, ChevronDown, Check, ChevronLeft, ChevronRight,
} from 'lucide-angular';
import { HeaderDashboardComponent } from '../header/header-dashboard/header-dashboard.component';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { finalize, map, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface EncuestaFromApi {
  id: number | string;
  nombre: string;
  token_respuesta?: string;
  token_resultados?: string;
  tipo?: string;
  preguntas?: any[];
  respuestas: any[];
  createdAt: string;
  updatedAt?: string;
}

interface FormItem {
  id: number | string;
  name: string;
  token_respuesta?: string;
  token_resultados?: string;
  tipo?: string;
  preguntas?: any[];
  respuestas?: any[];
  createdAt: string;
  updatedAt?: string;
  creationDate: string;
  status: string;
  totalRespuestas: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, HeaderDashboardComponent, FormsModule],
  providers: [DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  displayableForms: FormItem[] = [];
  private formsInternal: FormItem[] = [];

  searchTerm: string = '';
  creadorEmail: string | null = null;

  // CAMBIO: Actualizado array de filtros.
  // 'totalRespuestasLocal' indica ordenamiento frontend.
  filters = [
    { id: 1, name: 'Fecha de creación', checked: true, sortBy: 'createdAt', order: 'DESC' }, // Ordenamiento backend
    { id: 2, name: 'Nº Respuestas (Más a Menos)', checked: false, sortBy: 'totalRespuestasLocal', order: 'DESC' }, // Ordenamiento frontend
    { id: 3, name: 'Orden Alfabético (A-Z)', checked: false, sortBy: 'nombre', order: 'ASC' }, // Ordenamiento backend
  ];
  activeSortBy: string = 'createdAt'; // Default
  activeOrder: string = 'DESC';     // Default

  icons = { Plus, Filter, Search, Calendar, FileText, MoreVertical, Edit, Trash2, Copy, Pencil, ChevronDown, Check, ChevronLeft, ChevronRight };
  menuOpenId: string | number | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;

  currentDashboardToken: string | null = null;

  public readonly Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encuestasService: EncuestasService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    const initialFilter = this.filters.find(f => f.checked);
    if (initialFilter) {
      this.activeSortBy = initialFilter.sortBy;
      this.activeOrder = initialFilter.order;
    }

    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token');
      const pageFromUrl = params.get('page');

      if (token) {
        this.currentDashboardToken = token;
        document.cookie = `td=${token}; path=/; SameSite=Strict; Secure`;
        const targetPage = pageFromUrl ? parseInt(pageFromUrl, 10) : 1;
        this.currentPage = (isNaN(targetPage) || targetPage < 1) ? 1 : targetPage;

        const urlNeedsUpdate = !pageFromUrl || parseInt(pageFromUrl, 10) !== this.currentPage;
        if (urlNeedsUpdate) {
          this.updateUrlWithPage(false);
        }
        this.loadForms();
      } else {
        console.error("Dashboard: Token no encontrado en la URL.");
        this.router.navigate(['/']);
      }
    });
  }

  loadForms(): void {
    if (!this.currentDashboardToken) {
      console.error("No se puede cargar formularios: token de dashboard no disponible.");
      return;
    }
    this.isLoading = true;

    let backendSortBy = this.activeSortBy;
    let backendOrder = this.activeOrder;

    // Si el ordenamiento es local por totalRespuestas, el backend debe usar un ordenamiento por defecto (ej. fecha)
    // para asegurar que la paginación sea consistente.
    if (this.activeSortBy === 'totalRespuestasLocal') {
      backendSortBy = 'createdAt'; // O el sortBy por defecto de tu API si es diferente
      backendOrder = 'DESC';       // O el order por defecto de tu API
    }

    this.encuestasService.getEncuestasPorToken(
      this.currentDashboardToken,
      this.currentPage,
      this.itemsPerPage,
      backendSortBy,  // Usar el sortBy para el backend
      backendOrder    // Usar el order para el backend
    ).pipe(
      map(response => {
        if (response && response.data && Array.isArray(response.data)) {
          this.creadorEmail = response.creadorEmail || this.creadorEmail;
          this.totalItems = response.total || 0;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

          let encuestasProcesadas: FormItem[] = response.data.map((encuesta: EncuestaFromApi) => ({
            ...encuesta,
            id: encuesta.id,
            name: encuesta.nombre,
            creationDate: this.datePipe.transform(encuesta.createdAt, 'dd/MM/yyyy HH:mm') || encuesta.createdAt,
            status: encuesta.tipo?.toLowerCase() || 'borrador',
            totalRespuestas: encuesta.respuestas ? encuesta.respuestas.length : 0,
          }));

          // CAMBIO: Aplicar ordenamiento local si es el filtro activo
          if (this.activeSortBy === 'totalRespuestasLocal' && encuestasProcesadas.length > 0) {
            // this.activeOrder será 'DESC' para 'Más a Menos'
            encuestasProcesadas.sort((a, b) => {
              if (this.activeOrder === 'DESC') {
                return b.totalRespuestas - a.totalRespuestas;
              } else { // Aunque 'ASC' no se usa para totalRespuestasLocal ahora, es buena práctica
                return a.totalRespuestas - b.totalRespuestas;
              }
            });
          }
          return encuestasProcesadas;
        } else {
          this.creadorEmail = response.creadorEmail || this.creadorEmail;
          this.totalItems = 0;
          this.totalPages = 0;
          return [];
        }
      }),
      tap((encuestasFinales: FormItem[]) => { // encuestasFinales ya están ordenadas (por backend o localmente)
        this.formsInternal = encuestasFinales;
        this.applySearchFilter(); // Aplicar búsqueda sobre los datos ya ordenados
      }),
      catchError((err: any) => {
        console.error('Error obteniendo encuestas:', err);
        this.formsInternal = [];
        this.displayableForms = [];
        this.totalItems = 0;
        this.totalPages = 0;
        return of([]);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe({
      error: (err: any) => {
        console.error('Error en la suscripción final de carga de encuestas:', err);
        if (this.isLoading) this.isLoading = false;
        this.formsInternal = [];
        this.displayableForms = [];
        this.totalItems = 0;
        this.totalPages = 0;
      }
    });
  }

  applySearchFilter(): void {
    // La búsqueda se aplica sobre formsInternal, que ya está ordenado
    // (ya sea por el backend o localmente si activeSortBy === 'totalRespuestasLocal')
    if (!this.searchTerm.trim()) {
      this.displayableForms = [...this.formsInternal];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      this.displayableForms = this.formsInternal.filter(form =>
        form.name.toLowerCase().includes(searchTermLower)
      );
    }
  }

  goToPage(page: string | number): void {
    const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.currentPage) {
      return;
    }
    this.currentPage = pageNumber;
    this.updateUrlWithPage();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  private updateUrlWithPage(triggerReloadByNavigation: boolean = true): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge',
    });
  }

  handleMobileFilterChange(event: Event): void {
    const selectedId = parseInt((event.target as HTMLSelectElement).value, 10);
    const selectedFilter = this.filters.find(f => f.id === selectedId);
    if (selectedFilter) {
      this.applySortFilter(selectedFilter);
    }
  }

  applySortFilter(selectedFilter: any): void {
    this.filters.forEach(f => f.checked = (f.id === selectedFilter.id));
    this.activeSortBy = selectedFilter.sortBy;
    this.activeOrder = selectedFilter.order;
    this.currentPage = 1; // Siempre resetear a la primera página al cambiar el filtro/orden

    this.updateUrlWithPage(false); // Actualizar solo la página en la URL

    this.loadForms(); // Recargará los datos y aplicará el ordenamiento 
  }

  filterForms(): void { // Llamado por el input de búsqueda
    this.applySearchFilter();
  }

  navigateToCreateForm() { this.router.navigate(['/create']); }

  getStatusClasses(status: string) {
    const base = 'inline-block px-2 py-1 rounded-full text-xs font-semibold';
    switch (status?.toLowerCase()) {
      case 'borrador': return `${base} bg-yellow-100 text-yellow-700`;
      case 'publicada': case 'activo': return `${base} bg-green-100 text-green-700`;
      case 'cerrada': case 'cerrado': return `${base} bg-red-100 text-red-700`;
      default: return `${base} bg-gray-100 text-gray-700`;
    }
  }

  toggleMenu(formId: string | number) { this.menuOpenId = this.menuOpenId === formId ? null : formId; }
  closeAllMenus() { this.menuOpenId = null; }

  copyLink(form: FormItem, event?: MouseEvent) {
    event?.stopPropagation();
    if (form.token_respuesta) {
      navigator.clipboard.writeText(`${window.location.origin}/response/${form.token_respuesta}`)
        .then(() => alert('¡Enlace copiado!'))
        .catch(e => console.error('Error al copiar enlace:', e));
    } else {
      alert('Token de respuesta no encontrado.');
    }
    this.closeAllMenus();
  }

  goToCreate(formId: string | number) { this.router.navigate(['/create', formId]); }

  renameForm(form: FormItem, event: MouseEvent) {
    event.stopPropagation();
    console.log("Renombrar encuesta:", form.id);
    this.closeAllMenus();
  }

  deleteForm(form: FormItem, event: MouseEvent) {
    event.stopPropagation();
    if (confirm(`¿Estás seguro de que quieres borrar la encuesta "${form.name}"? Esta acción no se puede deshacer.`)) {
      console.log("Borrar encuesta:", form.id);
      // Lógica de borrado...
    }
    this.closeAllMenus();
  }

  getPageNumbers(): (number | string)[] {
    const pageCount = this.totalPages; const currentPage = this.currentPage; const delta = 1;
    const rangeWithDots: (number | string)[] = []; let l: number | undefined;
    rangeWithDots.push(1);
    let left = Math.max(2, currentPage - delta);
    let right = Math.min(pageCount - 1, currentPage + delta);
    if (currentPage - delta <= 1) { right = Math.min(pageCount - 1, 1 + (delta * 2)); }
    if (currentPage + delta >= pageCount) { left = Math.max(2, pageCount - (delta * 2)); }
    for (let i = left; i <= right; i++) { rangeWithDots.push(i); }
    if (pageCount > 1) { rangeWithDots.push(pageCount); }
    const uniquePages = [...new Set(rangeWithDots)].sort((a, b) => (typeof a === 'string' ? Infinity : Number(a)) - (typeof b === 'string' ? Infinity : Number(b)));
    const finalPages: (number | string)[] = []; l = undefined;
    for (const page of uniquePages) {
      if (typeof page === 'number') {
        if (l !== undefined) {
          if (page - l === 2) { finalPages.push(l + 1); }
          else if (page - l > 2) { finalPages.push('...'); }
        }
        finalPages.push(page); l = page;
      }
    } return finalPages;
  }
}
