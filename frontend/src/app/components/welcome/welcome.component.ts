import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderWelcomeComponent } from '../header/header-welcome/header-welcome.component';
import { EmailModalComponent } from '../welcome/email-modal/email-modal.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, HeaderWelcomeComponent, EmailModalComponent],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
