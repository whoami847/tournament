import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged as _onAuthStateChanged,
  updateProfile,
  type User,
  type UserCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import type { AuthUser } from '@/types';
import { createUserProfile } from './users-service';

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

export async function signUp(email: string, password: string, fullName: string): Promise<UserCredential> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Update the user's profile with the full name
  await updateProfile(userCredential.user, {
    displayName: fullName,
  });
  // Create the corresponding profile in Firestore
  await createUserProfile(userCredential.user);
  return userCredential;
}

export function signIn(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const userCredential = await signInWithPopup(auth, googleProvider);
  await createUserProfile(userCredential.user);
  return userCredential;
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}

export function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}
