import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { authState } from 'rxfire/auth';
import { Observable, map, firstValueFrom } from 'rxjs';
import { setPersistence, browserSessionPersistence } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser$: Observable<import('@firebase/auth').User | null>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.currentUser$ = authState(this.auth);
    // Persist session only for the lifetime of the browser tab (Option A)
    setPersistence(this.auth as any, browserSessionPersistence).catch((e) => {
      console.warn('[AuthService] Failed to set session persistence:', e);
    });
  }

  async register(email: string, password: string, displayName: string, role: 'user' | 'expert' = 'user') {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = cred.user?.uid;
    if (!uid) return; // safety
    const userRef = doc(this.firestore, `users/${uid}`);
    // Fire-and-forget: ne pas bloquer la navigation sur un write Firestore en dev
    setDoc(userRef, {
      uid,
      email,
      displayName,
      role
    }).catch((e) => {
      console.warn('[AuthService] Firestore setDoc failed after register (non-blocking):', e);
    });
    return cred;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  getCurrentUserId(): Observable<string | null> {
    return this.currentUser$.pipe(map(u => u?.uid ?? null));
  }

  async getUserRole(uid?: string): Promise<'user' | 'expert' | null> {
    const resolvedUid = uid ?? await firstValueFrom(this.getCurrentUserId());
    if (!resolvedUid) return null;
    const userRef = doc(this.firestore, `users/${resolvedUid}`);
    const userDoc = await getDoc(userRef);
    const data = userDoc.data() as any;
    return data?.['role'] ?? null;
  }
}
