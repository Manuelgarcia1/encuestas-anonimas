import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Home,
  ChevronRight,
  Edit,
  ListOrdered,
  Send,
  Menu,
  X,
} from 'lucide-angular';
import { ModalPublicarComponent } from '../../form/create/modal-publicar/modal-publicar.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-header-form',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, ModalPublicarComponent],
  templateUrl: './header-form.component.html',
})
export class HeaderFormComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) { }

  @Input() nombreEncuesta: string = 'Mi Formulario'; // Recibe el nombre desde el padre
  @Input() encuestaId!: number;

  icons = { Home, ChevronRight, Edit, ListOrdered, Send, Menu, X };
  activeTab: 'edit' | 'results' = 'edit';
  mobileMenuOpen = false;
  showPublishModal = false;
  token: string | null = null;

  ngOnInit(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/results')) {
      this.activeTab = 'results';
    } else if (currentUrl.includes('/create')) {
      this.activeTab = 'edit';
    }

    // Obtener el ID de la encuesta de la ruta
    this.route.params.subscribe(params => {
      this.encuestaId = +params['id'];
    });

    this.token = this.getCookie('td');
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
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

    if (tab === 'results') {
      this.router.navigate(['/results']);
    } else if (tab === 'edit') {
      this.router.navigate(['/create']);
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  openPublishModal() {
    // Obtener el ID de la encuesta de la URL
    const currentUrl = this.router.url;
    const encuestaId = currentUrl.split('/').pop();

    if (encuestaId && !isNaN(Number(encuestaId))) {
      this.showPublishModal = true;
    } else {
      console.error('No se pudo obtener el ID de la encuesta');
      // Mostrar mensaje de error al usuario
    }
  }

  onCloseModal() {
    this.showPublishModal = false;
  }
}
