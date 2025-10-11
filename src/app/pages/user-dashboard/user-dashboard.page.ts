import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, AlertController, ToastController } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, switchMap, shareReplay, of, map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { Booking, BookingDoc } from '../../services/booking';
import { AdminDataService, Expert, Category } from '../../services/admin-data.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class UserDashboardPage implements OnInit, OnDestroy {
  bookings$!: Observable<BookingDoc[]>;
  experts$!: Observable<Expert[]>;
  categories$!: Observable<Category[]>;
  
  editingId: string | null = null;
  newDateISO: string | null = null;
  minDate: string;
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private booking: Booking,
    private adminData: AdminDataService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {
    // Set min date to today
    const today = new Date();
    this.minDate = today.toISOString();
  }

  ngOnInit() {
    // Load bookings
    this.bookings$ = this.auth.getCurrentUserId().pipe(
      switchMap(uid => uid ? this.booking.getBookingsByUser$(uid) : of([] as BookingDoc[])),
      shareReplay(1),
      takeUntil(this.destroy$)
    );

    // Load experts and categories
    this.experts$ = this.adminData.getExperts$().pipe(
      shareReplay(1),
      takeUntil(this.destroy$)
    );
    this.categories$ = this.adminData.getCategories$().pipe(
      shareReplay(1),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getExpertInitial(expertId: string): string {
    return expertId?.charAt(0).toUpperCase() || 'E';
  }

  getExpertName(expertId: string): Observable<string> {
    return this.experts$.pipe(
      map(experts => {
        const expert = experts.find(e => e.id === expertId);
        return expert ? expert.name : 'Expert inconnu';
      })
    );
  }

  getExpertCategory(expertId: string): Observable<string> {
    return this.experts$.pipe(
      switchMap(experts => {
        const expert = experts.find(e => e.id === expertId);
        if (!expert) return of('N/A');
        
        return this.categories$.pipe(
          map(categories => {
            const category = categories.find(c => c.id === expert.categoryId);
            return category ? category.name : 'N/A';
          })
        );
      })
    );
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time-outline';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Inconnu';
    }
  }

  beginEdit(booking: BookingDoc) {
    if (!booking.id) {
      this.showToast('Erreur: Réservation invalide', 'danger');
      return;
    }
    this.editingId = booking.id;
    this.newDateISO = booking.dateTime;
  }

  cancelEdit() {
    this.editingId = null;
    this.newDateISO = null;
  }

  async saveEdit(booking: BookingDoc) {
    if (!this.editingId || !this.newDateISO || !booking.id) {
      this.showToast('Veuillez choisir une date valide', 'warning');
      return;
    }

    // Vérifier que la date est dans le futur
    const selectedDate = new Date(this.newDateISO);
    const now = new Date();
    if (selectedDate <= now) {
      this.showToast('Veuillez choisir une date future', 'warning');
      return;
    }

    try {
      await this.booking.updateBooking(this.editingId, { dateTime: this.newDateISO });
      this.showToast("✓ Votre modification a été envoyée. L'expert examinera votre demande.", 'success');
    } catch (e: any) {
      console.error('Update error:', e);
      this.showToast(`Erreur lors de la mise à jour: ${e.message || 'Erreur inconnue'}`, 'danger');
    } finally {
      this.cancelEdit();
    }
  }

  async deleteBooking(booking: BookingDoc) {
    if (!booking.id) {
      this.showToast('Erreur: Réservation invalide', 'danger');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Annuler la réservation',
      message: 'Êtes-vous sûr de vouloir annuler cette réservation ?',
      buttons: [
        { text: 'Non', role: 'cancel' },
        { 
          text: 'Oui, annuler', 
          role: 'destructive', 
          handler: async () => {
            try {
              await this.booking.deleteBooking(booking.id!);
              this.showToast("✓ Votre réservation a été annulée. L'expert en sera informé.", 'success');
            } catch (e: any) {
              console.error('Delete error:', e);
              this.showToast(`Erreur lors de l'annulation: ${e.message || 'Erreur inconnue'}`, 'danger');
            }
          }
        }
      ]
    });
    alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }
}