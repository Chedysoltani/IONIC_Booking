import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, query, where, collectionData, doc, updateDoc, deleteDoc, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface BookingDoc {
  id?: string;
  userId: string;
  expertId: string;
  dateTime: string; // ISO string
  createdAt?: any;
  status: 'pending' | 'confirmed' | 'declined';
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

  updateBooking(id: string, data: Partial<BookingDoc>) {
    const d = doc(this.firestore, `bookings/${id}`);
    return updateDoc(d, data as any);
  }

  deleteBooking(id: string) {
    const d = doc(this.firestore, `bookings/${id}`);
    return deleteDoc(d);
  }
}
