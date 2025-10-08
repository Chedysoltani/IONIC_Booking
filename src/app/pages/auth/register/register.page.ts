import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth';
//import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from "@ionic/angular";
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

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    this.errorMessage = '';
    if (!this.email || !this.password || !this.displayName) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    try {
      await this.authService.register(this.email, this.password, this.displayName);
      this.router.navigateByUrl('/login');
    } catch (err: any) {
      this.errorMessage = err.message || 'Erreur lors de l’inscription';
    }
  }
}
