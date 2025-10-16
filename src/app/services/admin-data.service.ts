import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, orderBy, getCountFromServer, where, getDoc, getDocs } from '@angular/fire/firestore';
import { Observable, map, firstValueFrom } from 'rxjs';

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
  uid?: string;
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

  getExpertByUid$(uid: string): Observable<Expert[]> {
    const ref = collection(this.firestore, 'experts');
    const q = query(ref, where('uid', '==', uid));
    return collectionData(q, { idField: 'id' }) as Observable<Expert[]>;
  }

  getExpertByEmail$(email: string): Observable<Expert[]> {
    const ref = collection(this.firestore, 'experts');
    const q = query(ref, where('email', '==', email));
    return collectionData(q, { idField: 'id' }) as Observable<Expert[]>;
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

  getUserByUid$(uid: string): Observable<UserDoc[]> {
    const ref = collection(this.firestore, 'users');
    const q = query(ref, where('uid', '==', uid));
    return collectionData(q, { idField: 'id' }) as Observable<UserDoc[]>;
  }

  async getUserByIdDoc(uid: string): Promise<UserDoc | undefined> {
    const d = doc(this.firestore, `users/${uid}`);
    const snap = await getDoc(d);
    if (!snap.exists()) return undefined;
    return { id: uid, ...(snap.data() as any) } as UserDoc;
  }

  // Promise-based single fetch by uid for utility/backfill usage
  async getUserByUidOnce(uid: string): Promise<UserDoc | undefined> {
    const ref = collection(this.firestore, 'users');
    const qy = query(ref, where('uid', '==', uid));
    const list = await firstValueFrom(collectionData(qy, { idField: 'id' }) as Observable<UserDoc[]>);
    return list?.[0];
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
  async getUserByAnyId(userId: string): Promise<UserDoc | undefined> {
  // 1. Essayer par doc.id
  const docUser = await this.getUserByIdDoc(userId);
  if (docUser) return docUser;

  // 2. Sinon chercher par champ uid
  return this.getUserByUidOnce(userId);
}

}
