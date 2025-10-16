import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { AdminDataService, Category } from '../../../services/admin-data.service';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register-expert',
  templateUrl: './register-expert.page.html',
  styleUrls: ['./register-expert.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule],
})
export class RegisterExpertPage implements OnInit, OnDestroy {
  // form fields
  name = '';
  email = '';
  password = '';
  bio = '';
  categoryId = '';

  // ui state
  errorMessage = '';
  loading = false;

  categories: Category[] = [];
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private adminDataService: AdminDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const sub = this.adminDataService.getCategories$().subscribe({
      next: (cats) => (this.categories = cats),
      error: () => (this.errorMessage = "Erreur lors du chargement des catégories"),
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  async registerExpert() {
    this.errorMessage = '';
    if (!this.name || !this.email || !this.password || !this.categoryId) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    try {
      // 1) create auth user with role expert
      const cred = await this.authService.register(this.email, this.password, this.name, 'expert');
      const uid = cred?.user?.uid || null;

      // 2) create expert profile document (store uid from cred to avoid race)
      await this.adminDataService.addExpert({
        name: this.name,
        email: this.email,
        bio: this.bio,
        categoryId: this.categoryId,
        uid: uid || undefined,
      });

      // 3) redirect to expert dashboard (or login if you prefer)
      await this.router.navigateByUrl('/expert-dashboard');
    } catch (e: any) {
      this.errorMessage = e?.message || "Erreur lors de l'inscription expert";
    } finally {
      this.loading = false;
    }
  }
}
