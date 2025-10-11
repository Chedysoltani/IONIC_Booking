import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, orderBy, getCountFromServer, where } from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Expert {
  id: string;
  name: string;
  email: string;
  bio: string;
  categoryId: string;
}

export interface UserDoc {
  uid?: string;
  id: string; // compatibility when using collectionData idField
  displayName?: string;
  email?: string;
  createdAt?: any;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  constructor(private firestore: Firestore) {}

  // Categories
  getCategories$(): Observable<Category[]> {
    const ref = collection(this.firestore, 'categories');
    const q = query(ref, orderBy('name'));
    return collectionData(q, { idField: 'id' }) as Observable<Category[]>;
    
  }

  addCategory(category: Omit<Category, 'id'>) {
    const ref = collection(this.firestore, 'categories');
    return addDoc(ref, category);
  }

  updateCategory(id: string, data: Partial<Category>) {
    const d = doc(this.firestore, `categories/${id}`);
    return updateDoc(d, data as any);
  }

  deleteCategory(id: string) {
    const d = doc(this.firestore, `categories/${id}`);
    return deleteDoc(d);
  }

  // Experts
  getExperts$(): Observable<Expert[]> {
    const ref = collection(this.firestore, 'experts');
    const q = query(ref, orderBy('name'));
    return collectionData(q, { idField: 'id' }) as Observable<Expert[]>;
  }

  getExpertsByCategory$(categoryId: string): Observable<Expert[]> {
    const ref = collection(this.firestore, 'experts');
    const q = query(ref, where('categoryId', '==', categoryId));
    return (collectionData(q, { idField: 'id' }) as Observable<Expert[]>)
      .pipe(map(list => [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''))));
  }

  addExpert(expert: Omit<Expert, 'id'>) {
    const ref = collection(this.firestore, 'experts');
    return addDoc(ref, expert);
  }

  updateExpert(id: string, data: Partial<Expert>) {
    const d = doc(this.firestore, `experts/${id}`);
    return updateDoc(d, data as any);
  }

  deleteExpert(id: string) {
    const d = doc(this.firestore, `experts/${id}`);
    return deleteDoc(d);
  }

  // Users
  getUsers$(): Observable<UserDoc[]> {
    const ref = collection(this.firestore, 'users');
    return collectionData(ref, { idField: 'id' }) as Observable<UserDoc[]>;
  }

  addUser(user: Omit<UserDoc, 'id'>) {
    const ref = collection(this.firestore, 'users');
    return addDoc(ref, user);
  }

  updateUserRole(id: string, role: string) {
    const d = doc(this.firestore, `users/${id}`);
    return updateDoc(d, { role });
  }

  deleteUser(id: string) {
    const d = doc(this.firestore, `users/${id}`);
    return deleteDoc(d);
  }

  updateUser(id: string, data: Partial<UserDoc>) {
    const d = doc(this.firestore, `users/${id}`);
    return updateDoc(d, data as any);
  }

  // Bookings count
  async getBookingsCount(): Promise<number> {
    const ref = collection(this.firestore, 'bookings');
    const snap = await getCountFromServer(ref);
    return snap.data().count;
  }
}
