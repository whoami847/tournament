import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged as _onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import type { AuthUser } from '@/types';

export function onAuthStateChanged(callback: (user: AuthUser | null) => void) {
  return _onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    } else {
      callback(null);
    }
  });
}

export function signUp(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}
