import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription, of, switchMap, map, distinctUntilChanged, take } from 'rxjs';
import { AuthService } from '../../services/auth';
import { AdminDataService, Expert, UserDoc } from '../../services/admin-data.service';
import { Booking, BookingDoc } from '../../services/booking';

@Component({
  selector: 'app-expert-dashboard',
  templateUrl: './expert-dashboard.page.html',
  styleUrls: ['./expert-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class ExpertDashboardPage implements OnInit, OnDestroy {
  expert: Expert | null = null;
  bookings: BookingDoc[] = [];
  users: UserDoc[] = [];
  loading = true;
  error = '';
  private subs: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private admin: AdminDataService,
    private booking: Booking,
    private router: Router,
  ) {}

ngOnInit() {
  const sub = this.auth.currentUser$
    .pipe(
      map(user => user?.uid ?? null),
      distinctUntilChanged(),
      switchMap(uid => {
        if (!uid) return of({ expert: null, bookings: [] as BookingDoc[] });
        // Lookup expert by authenticated uid
        return this.admin.getExpertByUid$(uid).pipe(
          switchMap(experts => {
            const exp = experts?.[0] ?? null;
            if (!exp) return of({ expert: null, bookings: [] as BookingDoc[] });
            return this.booking.getBookingsByExpert$(exp.id).pipe(
              map(bks => ({ expert: exp, bookings: bks }))
            );
          })
        );
      })
    )
    .subscribe({
      next: ({ expert, bookings }) => {
        this.expert = expert;
        this.bookings = bookings;
        this.loading = false;

        // Enrichir chaque booking avec infos utilisateur
        for (const b of this.bookings) {
          if (!b.userDisplayName || !b.userEmail) {
            const userId = b.userId;
            if (!userId) continue;

            this.admin.getUserByIdDoc(userId).then(async u => {
              let found = u;

              // si pas trouvé par doc.id → on tente par champ uid
              if (!found) {
                try { found = await this.admin.getUserByUidOnce(userId); } catch {}
              }

              if (found) {
                b.userDisplayName = b.userDisplayName ?? found.displayName;
                b.userEmail = b.userEmail ?? found.email;
                // Forcer Angular à redessiner
                this.bookings = [...this.bookings];
              }
            }).catch(() => {});
          }
        }

        // Précharger les utilisateurs manquants
        const missingIds = Array.from(new Set(
          bookings
            .map(b => b.userId)
            .filter(userId => !!userId && !this.users.some(u => u.id === userId || u.uid === userId))
        ));

        for (const id of missingIds) {
          this.admin.getUserByIdDoc(id).then(async u => {
            let toAdd = u;

            if (!toAdd) {
              try { toAdd = await this.admin.getUserByUidOnce(id); } catch {}
            }

            if (toAdd && !this.users.some(x => x.id === toAdd!.id || (x.uid && x.uid === toAdd!.uid))) {
              this.users = [...this.users, toAdd];
            }
          }).catch(() => {});
        }
      },
      error: () => {
        this.error = 'Erreur de chargement';
        this.loading = false;
      }
    });
  this.subs.push(sub);

  // Charger la liste des users une seule fois
  const subUsers = this.admin.getUsers$().pipe(take(1)).subscribe({
    next: (users) => (this.users = users),
    error: () => {},
  });
  this.subs.push(subUsers);
}
 handleRefresh(event: any) {
    this.refresh();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }


  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  async accept(booking: BookingDoc) {
    if (!booking.id) return;
    await this.booking.updateBooking(booking.id, { status: 'confirmed' });
  }

  async decline(booking: BookingDoc) {
    if (!booking.id) return;
    await this.booking.updateBooking(booking.id, { status: 'declined' });
  }

  getUser(userId: string): UserDoc | undefined {
    return this.users.find(u => u.id === userId || (u.uid && u.uid === userId));
  }

  getUserLabel(userId: string): string {
    const u = this.getUser(userId);
    if (!u) return 'Utilisateur inconnu';
    const name = u.displayName || 'Sans nom';
    return u.email ? `${name} (${u.email})` : name;
  }

  private enrichBookings(list: BookingDoc[]) {
    for (const b of list) {
      if (!b.userDisplayName || !b.userEmail) {
        const userId = b.userId;
        if (!userId) continue;
        this.admin.getUserByIdDoc(userId).then(async u => {
          let found = u;
          if (!found) {
            try { found = await this.admin.getUserByUidOnce(userId); } catch {}
          }
          if (found) {
            b.userDisplayName = b.userDisplayName ?? found.displayName;
            b.userEmail = b.userEmail ?? found.email;
            this.bookings = [...this.bookings];
          }
        }).catch(() => {});
      }
    }
  }

  refresh() {
    this.loading = true;
    if (this.expert?.id) {
      this.booking.getBookingsByExpert$(this.expert.id).pipe(take(1)).subscribe({
        next: (bks) => {
          this.bookings = bks;
          this.enrichBookings(this.bookings);
          const missingIds = Array.from(new Set(
            this.bookings
              .map(b => b.userId)
              .filter(userId => !!userId && !this.users.some(u => u.id === userId || u.uid === userId))
          ));
          for (const id of missingIds) {
            this.admin.getUserByIdDoc(id).then(async u => {
              let toAdd = u;
              if (!toAdd) {
                try { toAdd = await this.admin.getUserByUidOnce(id); } catch {}
              }
              if (toAdd && !this.users.some(x => x.id === toAdd!.id || (x.uid && x.uid === toAdd!.uid))) {
                this.users = [...this.users, toAdd];
              }
            }).catch(() => {});
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Erreur de rafraîchissement';
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  getConfirmedCount(): number {
    return this.bookings.filter(b => b.status === 'confirmed').length;
    
  }

  getPendingCount(): number {
    return this.bookings.filter(b => b.status === 'pending').length;
    
  }

  getClientInitial(b: BookingDoc): string {
    const label = b.userDisplayName || this.getUserLabel(b.userId) || '';
    const c = label.trim().charAt(0).toUpperCase();
    return c || '?';
  }

  getStatusIcon(status: BookingDoc['status']): string {
    if (status === 'confirmed') return 'checkmark-circle';
    if (status === 'declined') return 'close-circle';
    return 'time-outline';
  }

  getStatusLabel(status: BookingDoc['status']): string {
    if (status === 'confirmed') return 'Confirmée';
    if (status === 'declined') return 'Refusée';
    return 'En attente';
  }

  async goHome() {
    await this.router.navigateByUrl('/landing-page');
  }
}
