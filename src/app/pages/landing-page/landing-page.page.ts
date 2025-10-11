import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminDataService, Category } from '../../services/admin-data.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-landing',
  templateUrl: './landing-page.page.html',
  styleUrls: ['./landing-page.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class LandingPage {

  categories$!: Observable<Category[]>;

  isLoggedIn = false;

  constructor(private router: Router, private adminData: AdminDataService, private auth: AuthService) {
    this.categories$ = this.adminData.getCategories$();
    this.auth.currentUser$.subscribe(u => {
      this.isLoggedIn = !!u;
    });
  }

  navigateToRegister() {
    this.router.navigateByUrl('/register');
  }

  navigateToExperts(categoryId?: string) {
    if (!this.isLoggedIn) {
      const params: any = { redirectTo: '/experts' };
      if (categoryId) params.categoryId = categoryId;
      this.router.navigate(['/login'], { queryParams: params });
      return;
    }
    if (categoryId) {
      this.router.navigate(['/experts'], { queryParams: { categoryId } });
    } else {
      this.router.navigateByUrl('/experts');
    }
  }

  navigateToLogin() {
    this.router.navigateByUrl('/login');
  }

  async logout() {
    try {
      await this.auth.logout();
    } finally {
      this.router.navigateByUrl('/login');
    }
  }

  trackById(index: number, c: Category) {
    return c.id;
  }

  private normalize(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();
  }

  getCategoryClass(name: string): string {
    const n = this.normalize(name);
    if (n.includes('coach') || n.includes('developpement') || n.includes('carriere')) return 'coaching';
    if (n.includes('juridique') || n.includes('droit')) return 'legal';
    if (n.includes('business') || n.includes('marketing') || n.includes('strategie') || n.includes('entreprise')) return 'business';
    if (n.includes('sante') || n.includes('bien-etre') || n.includes('bienetre') || n.includes('psy') || n.includes('nutrition')) return 'health';
    if (n.includes('tech') || n.includes('it') || n.includes('code') || n.includes('informatique')) return 'tech';
    if (n.includes('finance') || n.includes('comptable') || n.includes('fiscal')) return 'finance';
    return 'coaching'; // default style
  }

  getCategoryIcon(name: string): string {
    const n = this.normalize(name);
    if (n.includes('coach') || n.includes('developpement') || n.includes('carriere')) return 'fitness-outline';
    if (n.includes('juridique') || n.includes('droit')) return 'document-text-outline';
    if (n.includes('business') || n.includes('marketing') || n.includes('strategie') || n.includes('entreprise')) return 'briefcase-outline';
    if (n.includes('sante') || n.includes('bien-etre') || n.includes('bienetre') || n.includes('psy') || n.includes('nutrition')) return 'medkit-outline';
    if (n.includes('tech') || n.includes('it') || n.includes('code') || n.includes('informatique')) return 'code-slash-outline';
    if (n.includes('finance') || n.includes('comptable') || n.includes('fiscal')) return 'cash-outline';
    return 'pricetag-outline'; // fallback icon
  }
}
