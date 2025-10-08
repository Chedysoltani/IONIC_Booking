import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  async register(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = cred.user?.uid;
    if (!uid) return; // safety
    const userRef = doc(this.firestore, `users/${uid}`);
    // Fire-and-forget: ne pas bloquer la navigation sur un write Firestore en dev
    setDoc(userRef, {
      uid,
      email,
      displayName,
      role: 'user'
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
}
