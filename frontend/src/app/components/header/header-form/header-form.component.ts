import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Home,
  ChevronRight,
  Edit,
  ListOrdered,
  Send,
  Pencil,
  Menu,
  X,
} from 'lucide-angular';
import { ModalPublicarComponent } from '../../form/create/modal-publicar/modal-publicar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-form',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, ModalPublicarComponent],
  templateUrl: './header-form.component.html',
})
export class HeaderFormComponent implements OnInit {
  constructor(private router: Router) {}

  icons = { Home, ChevronRight, Edit, ListOrdered, Send, Pencil, Menu, X };
  activeTab: 'edit' | 'results' = 'edit';
  formName = 'Mi Formulario';
  isEditingName = false;
  mobileMenuOpen = false;
  showPublishModal = false;

  ngOnInit(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/results')) {
      this.activeTab = 'results';
    } else if (currentUrl.includes('/create')) {
      this.activeTab = 'edit';
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

  toggleEditName() {
    this.isEditingName = !this.isEditingName;
  }

  saveFormName(newName: string) {
    this.formName = newName || 'Mi Formulario';
    this.isEditingName = false;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // Método para abrir el modal de publicación
  openPublishModal() {
    this.showPublishModal = true;
  }

  // Método para manejar el cierre del modal
  onCloseModal() {
    this.showPublishModal = false;
  }
}
