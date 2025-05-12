import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Home, ChevronRight, Edit, ListOrdered, Send, Pencil, Menu, X } from 'lucide-angular';

@Component({
  selector: 'app-header-form',
  standalone: true,
  imports: [
    LucideAngularModule,
    FormsModule
  ],
  templateUrl: './header-form.component.html',
})
export class HeaderFormComponent {
  // Iconos disponibles
  icons = { Home, ChevronRight, Edit, ListOrdered, Send, Pencil, Menu, X };
  
  // Estado activo (edit/requests)
  activeTab: 'edit' | 'requests' = 'edit';
  
  // Nombre del formulario
  formName = 'Mi Formulario';
  isEditingName = false;
  
  // Estado del menú móvil
  mobileMenuOpen = false;

  setActiveTab(tab: 'edit' | 'requests') {
    this.activeTab = tab;
    this.mobileMenuOpen = false; // Cerramos el menú al seleccionar una opción
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
}