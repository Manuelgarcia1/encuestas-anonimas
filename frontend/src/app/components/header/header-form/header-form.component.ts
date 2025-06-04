import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Home,
  ChevronRight,
  Edit,
  ListOrdered,
  Send,
  Link,
  Menu,
  X,
  BarChart3,
} from 'lucide-angular';
import { ModalPublicarComponent } from '../../form/create/modal-publicar/modal-publicar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { EncuestasService } from '../../../services/encuestas.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-form',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    FormsModule,
    ModalPublicarComponent
  ],
  templateUrl: './header-form.component.html',
})
export class HeaderFormComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private encuestasService: EncuestasService
  ) { }
  @Output() surveyStatusChanged = new EventEmitter<boolean>();
  @Input() nombreEncuesta: string = 'Mi Formulario';
  @Input() encuestaId!: number;

  icons = { Home, ChevronRight, Edit, ListOrdered, Send, Link, Menu, X, BarChart3 }
  activeTab: 'edit' | 'results' | 'estadisticas' = 'edit';
  mobileMenuOpen = false;
  showPublishModal = false;
  showConfirmPublishModal = false;
  token: string | null = null;
  isSurveyPublished: boolean = false;
  isLoadingSurveyStatus: boolean = true;

  ngOnInit(): void {
    this.token = this.getCookie('td');
    const currentPath = this.router.url;
    if (currentPath.includes('/results/')) {
      this.activeTab = 'results';
    } else if (currentPath.includes('/estadisticas/')) {
      this.activeTab = 'estadisticas';
    } else if (currentPath.includes('/create')) {
      this.activeTab = 'edit';
    }


    this.route.params.subscribe(params => {
      const idFromRouteString = params['id'];
      if (idFromRouteString) {
        const idFromRoute = +idFromRouteString;
        if (!isNaN(idFromRoute)) {
          this.encuestaId = idFromRoute;
          if (this.token && this.encuestaId) {
            this.loadSurveyStatus();
          } else {
            this.isLoadingSurveyStatus = false;
            if (!this.token) console.warn('Header: Token de dashboard (td) no encontrado.');
            this.isSurveyPublished = false;
          }
        } else {
          console.error('Header: ID de encuesta inválido en la ruta:', idFromRouteString);
          this.isLoadingSurveyStatus = false;
          this.isSurveyPublished = false;
        }
      } else {
        this.isLoadingSurveyStatus = false;
        this.isSurveyPublished = false;
      }
    });
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  loadSurveyStatus(): void {
    if (!this.token || !this.encuestaId) {
      this.isLoadingSurveyStatus = false;
      this.surveyStatusChanged.emit(false);
      if (!this.token) console.warn("loadSurveyStatus: No hay token para cargar estado.");
      if (!this.encuestaId) console.warn("loadSurveyStatus: No hay encuestaId para cargar estado.");
      return;
    }

    this.isLoadingSurveyStatus = true;
    this.encuestasService.getEncuestaPorId(this.token, this.encuestaId).subscribe({
      next: (response) => {
        if (response && response.data && typeof response.data.tipo === 'string') {
          this.isSurveyPublished = response.data.tipo.toLowerCase() === 'publicada';
          this.nombreEncuesta = response.data.nombre || this.nombreEncuesta;
        } else {
          this.isSurveyPublished = false;
          console.warn('El tipo de encuesta no se recibió o no es un string:', response.data);
        }
        this.isLoadingSurveyStatus = false;
        this.surveyStatusChanged.emit(this.isSurveyPublished);
      },
      error: (err) => {
        console.error('Error al cargar el estado de la encuesta:', err);
        this.showToast('Error al cargar datos de la encuesta.', true);
        this.isLoadingSurveyStatus = false;
        this.isSurveyPublished = false;
        this.surveyStatusChanged.emit(false);
      }
    });
  }

  navigateToDashboard() {
    if (this.token) {
      this.router.navigate(['/dashboard'], { queryParams: { token: this.token } });
    } else {
      console.warn('No se encontró el token de dashboard al intentar volver al dashboard.');
      this.router.navigate(['/dashboard']);
    }
  }

  // Se actualiza el tipo del parámetro 'tab'
  setActiveTab(tab: 'edit' | 'results' | 'estadisticas') {
    this.activeTab = tab;
    this.mobileMenuOpen = false;

    if (this.encuestaId) {
      if (tab === 'results') {
        this.router.navigate(['/results', this.encuestaId]);
      } else if (tab === 'edit') {
        this.router.navigate(['/create', this.encuestaId]);
      } else if (tab === 'estadisticas') {
        this.router.navigate(['/estadisticas', this.encuestaId]);
      }
    } else {
      if (tab === 'edit') {
        this.router.navigate(['/create']);
      } else if (tab === 'results' || tab === 'estadisticas') {
        this.showToast('Guarda la encuesta primero para ver sus resultados o estadísticas.', true);
        console.warn(`Intento de navegar a ${tab} sin encuestaId (nueva encuesta).`);
      }
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  handlePublishOrShareClick() {
    if (!this.encuestaId && !this.isSurveyPublished) {
      this.showToast('Guarda la encuesta primero para poder publicarla o compartirla.', true);
      return;
    }
    if (this.isSurveyPublished) {
      this.openShareModal();
    } else {
      this.showConfirmPublishModal = true;
    }
    this.mobileMenuOpen = false;
  }

  confirmPublish() {
    this.showConfirmPublishModal = false;
    if (!this.token || !this.encuestaId) {
      this.showToast('Error: No se puede publicar. Falta información (token o ID de encuesta).', true);
      return;
    }

    this.encuestasService.publicarEncuesta(this.token, this.encuestaId).subscribe({
      next: (response) => {
        this.showToast('¡Encuesta publicada con éxito!');
        this.isSurveyPublished = true;
        this.surveyStatusChanged.emit(true);
        this.loadSurveyStatus();
        this.openShareModal();
      },
      error: (err) => {
        console.error('Error al publicar la encuesta:', err);
        const errorMessage = err.error?.message || 'Error al publicar la encuesta. Inténtalo de nuevo.';
        this.showToast(errorMessage, true);
      }
    });
  }

  openShareModal() {
    if (this.encuestaId) {
      this.showPublishModal = true;
    } else {
      console.error('No se puede abrir el modal de compartir: ID de encuesta no disponible.');
      this.showToast('Error: No se puede compartir la encuesta en este momento.', true);
    }
  }

  onCloseModal() {
    this.showPublishModal = false;
  }

  private showToast(message: string, isError: boolean = false) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 p-4 rounded-md text-white shadow-lg transition-opacity duration-300 ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2700);
  }
}
