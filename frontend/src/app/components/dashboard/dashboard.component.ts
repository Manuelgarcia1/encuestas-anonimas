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
import { finalize, switchMap, map, tap, catchError } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';

interface EncuestaFromApi {
  id: number | string;
  nombre: string;
  token_respuesta?: string;
  token_resultados?: string;
  tipo?: string;
  preguntas?: any[];
  createdAt: string;
  updatedAt?: string;
  // totalRespuestas?: number; // Ya no lo esperamos aquí
}

interface FormItem {
  id: number | string;
  name: string;
  token_respuesta?: string;
  token_resultados?: string;
  tipo?: string;
  preguntas?: any[];
  createdAt: string;
  updatedAt?: string;
  creationDate: string;
  status: string;
  totalRespuestas: number; // Este se seguirá llenando
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ CommonModule, LucideAngularModule, HeaderDashboardComponent, FormsModule ],
  providers: [DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  // displayableForms contendrá las encuestas con sus conteos, listas para mostrar
  displayableForms: FormItem[] = [];
  // forms se usará internamente para la data cruda de la página actual antes de la búsqueda
  private formsInternal: FormItem[] = [];


  searchTerm: string = '';
  creadorEmail: string | null = null;

  // MODIFICADO: Eliminado el filtro por número de respuestas
  filters = [
    { id: 1, name: 'Fecha de creación', checked: true, sortBy: 'createdAt', order: 'DESC' },
    { id: 3, name: 'Orden Alfabético', checked: false, sortBy: 'nombre', order: 'ASC' },
  ];
  activeSortBy: string = 'createdAt'; // Valor inicial por defecto
  activeOrder: string = 'DESC';     // Valor inicial por defecto

  icons = { Plus, Filter, Search, Calendar, FileText, MoreVertical, Edit, Trash2, Copy, Pencil, ChevronDown, Check, ChevronLeft, ChevronRight };
  menuOpenId: string | number | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  isLoading: boolean = false;
  // isLoadingResponsesCount puede fusionarse con isLoading si la UX lo permite

  currentDashboardToken: string | null = null;

  public readonly Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private encuestasService: EncuestasService,
    private datePipe: DatePipe
  ) {}

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
        this.loadFormsAndResponseCounts();
      } else {
        console.error("Dashboard: Token no encontrado en la URL.");
        this.router.navigate(['/']);
      }
    });
  }

  loadFormsAndResponseCounts(): void {
    if (!this.currentDashboardToken) {
      console.error("No se puede cargar formularios: token de dashboard no disponible.");
      return;
    }
    this.isLoading = true;

    this.encuestasService.getEncuestasPorToken(
      this.currentDashboardToken,
      this.currentPage,
      this.itemsPerPage,
      this.activeSortBy, 
      this.activeOrder  
    ).pipe(
      switchMap(response => {
        if (response && response.data && Array.isArray(response.data)) {
          this.creadorEmail = response.creadorEmail || this.creadorEmail;
          this.totalItems = response.total || 0;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

          const encuestasBase: FormItem[] = response.data.map((encuesta: EncuestaFromApi) => ({
            ...encuesta,
            id: encuesta.id,
            name: encuesta.nombre,
            creationDate: this.datePipe.transform(encuesta.createdAt, 'dd/MM/yyyy HH:mm') || encuesta.createdAt,
            status: encuesta.tipo?.toLowerCase() || 'borrador',
            totalRespuestas: 0, // Inicializar, se llenará después
            token_resultados: encuesta.token_resultados
          } as FormItem));

          if (encuestasBase.length === 0) {
            this.formsInternal = []; // Usar el array interno
            this.displayableForms = [];
            return of([]);
          }

          const countObservables: Observable<FormItem>[] = encuestasBase.map((encuesta: FormItem) => {
            if (encuesta.token_resultados) {
              return this.encuestasService.getResultadosPorTokenResultados(encuesta.token_resultados).pipe(
                map(resData => {
                  const count = resData?.data?.encuesta?.totalRespuestas ?? 0;
                  return { ...encuesta, totalRespuestas: count };
                }),
                catchError((err: any) => {
                  console.error(`Error obteniendo conteo para encuesta ${encuesta.id}:`, err);
                  return of({ ...encuesta, totalRespuestas: 0 });
                })
              );
            } else {
              return of({ ...encuesta, totalRespuestas: 0 });
            }
          });
          return forkJoin(countObservables);
        } else {
          this.formsInternal = [];
          this.displayableForms = [];
          this.totalItems = 0;
          this.totalPages = 0;
          return of([]);
        }
      }),
      tap((encuestasConConteos: FormItem[]) => {
        this.formsInternal = encuestasConConteos; // Guardar en el array interno
        this.applySearchFilter(); // Aplicar solo la búsqueda
      }),
      finalize(() => this.isLoading = false)
    ).subscribe({
      error: (err: any) => {
        console.error('Error en el flujo de carga de encuestas y conteos:', err);
        this.formsInternal = [];
        this.displayableForms = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.isLoading = false;
      },
    });
  }

  // Solo aplica el filtro de búsqueda por término
  applySearchFilter(): void {
    let resultsToFilter = [...this.formsInternal]; // Empezar con los datos que tienen conteos

    if (!this.searchTerm.trim()) {
      this.displayableForms = resultsToFilter;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      this.displayableForms = resultsToFilter.filter(form =>
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
    this.currentPage = 1;
    this.loadFormsAndResponseCounts(); // Recargar con el nuevo ordenamiento del backend
  }

  filterForms(): void { // Llamado por el input de búsqueda
    this.applySearchFilter(); // Aplicar solo búsqueda sobre los datos ya cargados/ordenados
  }

  navigateToCreateForm() { this.router.navigate(['/create']); }
  getStatusClasses(status: string) {
    const base = 'inline-block px-2 py-1 rounded-full text-xs font-semibold';
    switch(status?.toLowerCase()){
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
    if(form.token_respuesta){
      navigator.clipboard.writeText(`${window.location.origin}/response/${form.token_respuesta}`)
        .then(() => alert('¡Enlace copiado!'))
        .catch(e => console.error(e));
    } else {
      alert('Token de respuesta no encontrado.');
    }
    this.closeAllMenus();
  }
  goToCreate(formId: string | number) { this.router.navigate(['/create', formId]); }
  renameForm(form: FormItem, event: MouseEvent) { event.stopPropagation(); console.log("Renombrar", form.id); this.closeAllMenus(); }
  deleteForm(form: FormItem, event: MouseEvent) {
    event.stopPropagation();
    if(confirm(`Borrar "${form.name}"?`)){
      console.log("Borrar", form.id);
    }
    this.closeAllMenus();
  }
  getPageNumbers(): (number | string)[] {
    const pageCount = this.totalPages; const currentPage = this.currentPage; const delta = 1;
    const rangeWithDots: (number | string)[] = []; let l: number | undefined;
    rangeWithDots.push(1);
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(pageCount - 1, currentPage + delta); i++) { rangeWithDots.push(i); }
    if (pageCount > 1) { rangeWithDots.push(pageCount); }
    const uniquePages = [...new Set(rangeWithDots)].sort((a,b) => (typeof a === 'string' ? Infinity : a) - (typeof b === 'string' ? Infinity : b) );
    const finalPages:(number | string)[] = []; l = undefined;
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
