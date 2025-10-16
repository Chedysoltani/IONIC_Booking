import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { IonicModule } from "@ionic/angular";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class LoginPage {
  email = '';
  password = '';
  rememberMe = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  async login() {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    try {
      await this.authService.login(this.email, this.password);
      const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');
      const categoryId = this.route.snapshot.queryParamMap.get('categoryId');
      if (redirectTo) {
        if (categoryId) {
          this.router.navigate([redirectTo], { queryParams: { categoryId } });
        } else {
          this.router.navigateByUrl(redirectTo);
        }
      } else {
        const role = await this.authService.getUserRole();
        if (role === 'expert') {
          this.router.navigateByUrl('/expert-dashboard');
        } else {
          this.router.navigateByUrl('/landing-page');
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        this.errorMessage = 'Aucun compte trouvé avec cet email';
      } else if (err.code === 'auth/wrong-password') {
        this.errorMessage = 'Mot de passe incorrect';
      } else if (err.code === 'auth/invalid-email') {
        this.errorMessage = 'Format d\'email invalide';
      } else if (err.code === 'auth/too-many-requests') {
        this.errorMessage = 'Trop de tentatives. Réessayez plus tard';
      } else {
        this.errorMessage = err.message || 'Erreur lors de la connexion';
      }
    }
  }
}