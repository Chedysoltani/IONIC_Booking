import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, query, where, collectionData, doc, updateDoc, deleteDoc, orderBy, getDocs, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface BookingDoc {
  id?: string;
  userId: string;
  expertId: string;
  dateTime: string; // ISO string
  createdAt?: any;
  status: 'pending' | 'confirmed' | 'declined';
  userDisplayName?: string;
  userEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Booking {
  constructor(private firestore: Firestore) {}

  createBooking(data: Omit<BookingDoc, 'id' | 'createdAt' | 'status'>) {
    const ref = collection(this.firestore, 'bookings');
    return addDoc(ref, {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  }

  getBookingsByUser$(userId: string): Observable<BookingDoc[]> {
    const ref = collection(this.firestore, 'bookings');
    const q = query(ref, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<BookingDoc[]>;
  }

  getBookingsByExpert$(expertId: string): Observable<BookingDoc[]> {
    const ref = collection(this.firestore, 'bookings');
    const q = query(ref, where('expertId', '==', expertId));
    return collectionData(q, { idField: 'id' }) as Observable<BookingDoc[]>;
  }

  updateBooking(id: string, data: Partial<BookingDoc>) {
    const d = doc(this.firestore, `bookings/${id}`);
    return updateDoc(d, data as any);
  }

  deleteBooking(id: string) {
    const d = doc(this.firestore, `bookings/${id}`);
    return deleteDoc(d);
  }

  // Backfill existing bookings with userDisplayName and userEmail
  async backfillUsersOnBookings(): Promise<{ total: number; updated: number; skipped: number; errors: number; }> {
    const bookingsRef = collection(this.firestore, 'bookings');
    const snap = await getDocs(bookingsRef);
    let total = 0, updated = 0, skipped = 0, errors = 0;
    for (const docSnap of snap.docs) {
      total++;
      const data = docSnap.data() as any;
      const userId: string | undefined = data?.userId;
      if (!userId) { skipped++; continue; }
      // Skip if already denormalized
      if (data?.userDisplayName || data?.userEmail) { skipped++; continue; }
      try {
        // Try direct user doc by id (users/{uid})
        let displayName: string | undefined;
        let email: string | undefined;
        const userDocRef = doc(this.firestore, `users/${userId}`);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const u: any = userDocSnap.data();
          displayName = u?.displayName;
          email = u?.email;
        } else {
          // Fallback: query by uid field
          const usersRef = collection(this.firestore, 'users');
          const qy = query(usersRef, where('uid', '==', userId));
          const qSnap = await getDocs(qy);
          const first = qSnap.docs[0]?.data() as any | undefined;
          if (first) {
            displayName = first?.displayName;
            email = first?.email;
          }
        }
        if (displayName || email) {
          await updateDoc(doc(this.firestore, `bookings/${docSnap.id}`), {
            userDisplayName: displayName ?? null,
            userEmail: email ?? null,
          } as any);
          updated++;
        } else {
          skipped++;
        }
      } catch (e) {
        console.warn('Backfill booking failed for', docSnap.id, e);
        errors++;
      }
    }
    return { total, updated, skipped, errors };
  }
}
