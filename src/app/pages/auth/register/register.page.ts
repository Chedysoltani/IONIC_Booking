import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth';
//import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class RegisterPage {
  email = '';
  password = '';
  displayName = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async register() {
    this.errorMessage = '';
    console.log('[Register] handler invoked');
    if (!this.email || !this.password || !this.displayName) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    try {
      const cred = await this.authService.register(this.email, this.password, this.displayName);
      console.log('[Register] authService.register success', cred?.user?.uid);
      // Naviguer directement vers /login sans toast
      console.log('[Register] navigating to /login');
      await this.router.navigate(['/login'], { replaceUrl: true });
    } catch (err: any) {
      this.errorMessage = err.message || 'Erreur lors de l’inscription';
      console.error('[Register] error', err);
    }
  }
}
