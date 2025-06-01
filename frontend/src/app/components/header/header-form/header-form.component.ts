// header-form.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Home,
  ChevronRight,
  Edit,
  ListOrdered,
  Send, // Icono para Publicar
  Link, // Icono para Compartir (cuando ya está publicada)
  Menu,
  X,
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
  ) {}

  @Input() nombreEncuesta: string = 'Mi Formulario';
  @Input() encuestaId!: number;

  icons = { Home, ChevronRight, Edit, ListOrdered, Send, Link, Menu, X };
  activeTab: 'edit' | 'results' = 'edit';
  mobileMenuOpen = false;
  showPublishModal = false;
  showConfirmPublishModal = false;
  token: string | null = null;
  isSurveyPublished: boolean = false;
  isLoadingSurveyStatus: boolean = true;

  ngOnInit(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/results')) {
      this.activeTab = 'results';
    } else if (currentUrl.includes('/create')) {
      this.activeTab = 'edit';
    }

    this.route.params.subscribe(params => {
      const idFromRoute = +params['id'];
      if (idFromRoute) {
        this.encuestaId = idFromRoute;
        this.token = this.getCookie('td');
        if (this.token && this.encuestaId) {
          this.loadSurveyStatus(); // Esto se llamará cada vez que el ID cambie o se cargue la ruta
        } else {
          this.isLoadingSurveyStatus = false;
          console.error('Token o ID de encuesta no disponibles al iniciar.');
          // Considera un estado por defecto o mostrar un error
          this.isSurveyPublished = false; // Por ejemplo, asumir no publicada
        }
      } else {
          this.isLoadingSurveyStatus = false;
          console.error('ID de encuesta no encontrado en la ruta.');
          this.isSurveyPublished = false; // Estado por defecto
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
      this.isLoadingSurveyStatus = false; // Asegurar que se desactive si no hay parámetros
      return;
    }

    this.isLoadingSurveyStatus = true;
    this.encuestasService.getEncuestaPorId(this.token, this.encuestaId).subscribe({
      next: (response) => {
        if (response && response.data && typeof response.data.tipo === 'string') {
          // ***** CAMBIO CLAVE AQUÍ *****
          // Convertir a minúsculas antes de comparar
          this.isSurveyPublished = response.data.tipo.toLowerCase() === 'publicada';
          this.nombreEncuesta = response.data.nombre || this.nombreEncuesta;
        } else {
          // Si no hay 'tipo' o no es string, asumir no publicada o manejar como error
          this.isSurveyPublished = false;
          console.warn('El tipo de encuesta no se recibió o no es un string:', response.data);
        }
        this.isLoadingSurveyStatus = false;
      },
      error: (err) => {
        console.error('Error al cargar el estado de la encuesta:', err);
        this.showToast('Error al cargar datos de la encuesta.', true);
        this.isLoadingSurveyStatus = false;
        this.isSurveyPublished = false; // Asumir no publicada en caso de error
      }
    });
  }

  navigateToDashboard() {
    if (this.token) {
      this.router.navigate(['/dashboard'], { queryParams: { token: this.token } });
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  setActiveTab(tab: 'edit' | 'results') {
    this.activeTab = tab;
    this.mobileMenuOpen = false;
    const basePath = `/form/${this.encuestaId}`;
    if (tab === 'results') {
      this.router.navigate([`${basePath}/results`]);
    } else if (tab === 'edit') {
      this.router.navigate([`${basePath}/create`]);
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  handlePublishOrShareClick() {
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
      this.showToast('Error: No se puede publicar. Falta información.', true);
      return;
    }

    this.encuestasService.publicarEncuesta(this.token, this.encuestaId).subscribe({
      next: (response) => {
        this.showToast('¡Encuesta publicada con éxito!');
        this.isSurveyPublished = true;
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
