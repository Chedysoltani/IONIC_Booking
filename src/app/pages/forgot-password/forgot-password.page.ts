import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class ForgotPasswordPage {
  email = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  async resetPassword() {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.email) {
      this.errorMessage = 'Veuillez entrer votre adresse email';
      return;
    }

    // Validation simple du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Format d\'email invalide';
      return;
    }

    this.isLoading = true;

    try {
      //await this.authService.resetPassword(this.email);
      this.successMessage = 'Un email de réinitialisation a été envoyé à votre adresse. Vérifiez votre boîte de réception.';
      this.email = ''; // Réinitialiser le champ email
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 3000);
      
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        this.errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (err.code === 'auth/invalid-email') {
        this.errorMessage = 'Format d\'email invalide';
      } else if (err.code === 'auth/too-many-requests') {
        this.errorMessage = 'Trop de tentatives. Réessayez plus tard';
      } else {
        this.errorMessage = err.message || 'Erreur lors de l\'envoi de l\'email';
      }
    } finally {
      this.isLoading = false;
    }
  }
}