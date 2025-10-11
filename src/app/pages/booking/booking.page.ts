import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ToastController } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Booking } from '../../services/booking';
import { AuthService } from '../../services/auth';
import { AdminDataService, Expert, Category } from '../../services/admin-data.service';
import { firstValueFrom, Observable, map, combineLatest, shareReplay } from 'rxjs';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
})
export class BookingPage implements OnInit {
  expertId: string | null = null;
  dateTimeISO: string | null = null;
  expertView$!: Observable<{ expert: Expert, categoryName: string } | undefined>;
  
  minDate: string;
  maxDate: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private booking: Booking,
    private auth: AuthService,
    private adminData: AdminDataService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.expertId = this.route.snapshot.queryParamMap.get('expertId');
    
    // Set min date to today
    const today = new Date();
    this.minDate = today.toISOString();
    
    // Set max date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    this.maxDate = maxDate.toISOString();
  }

  ngOnInit() {
    if (this.expertId) {
      this.expertView$ = combineLatest([this.adminData.getExperts$(), this.adminData.getCategories$()]).pipe(
        map(([experts, categories]) => {
          const expert = experts.find(e => e.id === this.expertId);
          if (!expert) return undefined;
          const categoryName = categories.find(c => c.id === expert.categoryId)?.name ?? 'N/A';
          return { expert, categoryName };
        }),
        shareReplay(1)
      );
    }
  }

  async confirm() {
    if (!this.expertId || !this.dateTimeISO) {
      const t = await this.toastCtrl.create({ 
        message: 'Veuillez choisir une date et une heure.', 
        duration: 2000, 
        color: 'warning',
        position: 'top'
      });
      t.present();
      return;
    }

    // Vérifier que la date est dans le futur
    const selectedDate = new Date(this.dateTimeISO);
    const now = new Date();
    if (selectedDate <= now) {
      const t = await this.toastCtrl.create({ 
        message: 'Veuillez choisir une date future.', 
        duration: 2000, 
        color: 'warning',
        position: 'top'
      });
      t.present();
      return;
    }

    const uid = await firstValueFrom(this.auth.getCurrentUserId());
    if (!uid) {
      this.router.navigate(['/login'], { 
        queryParams: { 
          redirectTo: '/booking', 
          expertId: this.expertId 
        } 
      });
      return;
    }

    try {
      await this.booking.createBooking({ 
        userId: uid, 
        expertId: this.expertId, 
        dateTime: this.dateTimeISO 
      });
      
      const alert = await this.alertCtrl.create({
        header: '✓ Réservation envoyée',
        message: "Votre demande de réservation a été envoyée avec succès. L'expert vous confirmera la consultation par email.",
        buttons: [
          { 
            text: 'OK', 
            handler: () => this.router.navigate(['/user-dashboard']) 
          }
        ]
      });
      await alert.present();
      
    } catch (e) {
      console.error('Booking error:', e);
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: "La réservation a échoué. Veuillez réessayer plus tard.",
        buttons: ['Fermer']
      });
      await alert.present();
    }
  }
}