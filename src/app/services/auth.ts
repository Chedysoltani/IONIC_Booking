import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  async register(email: string, password: string, displayName: string) {
    const cred = await this.afAuth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user?.uid;
    return this.afs.doc(`users/${uid}`).set({
      uid,
      email,
      displayName,
      role: 'user'
    });
  }

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  logout() {
    return this.afAuth.signOut();
  }
}
