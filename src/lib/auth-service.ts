import type { AuthUser, PlayerProfile } from '@/types';
import { mockUsers, mockAdmin } from './mock-data';

let currentUser: AuthUser | null = null;
const listeners: ((user: AuthUser | null) => void)[] = [];

// Simulate a logged-in user for demo purposes.
// Switch between mockUser and mockAdmin to test different roles.
const MOCK_AUTH_USER_ID = 'usr_player_1'; // or 'usr_player_1'
const activeMockUser = mockUsers.find(u => u.id === MOCK_AUTH_USER_ID) || mockAdmin;

if (activeMockUser) {
    currentUser = {
        uid: activeMockUser.id,
        email: activeMockUser.email,
        displayName: activeMockUser.name,
        photoURL: activeMockUser.avatar,
    };
}


export function onAuthStateChanged(callback: (user: AuthUser | null) => void) {
  listeners.push(callback);
  // Immediately notify with the current user state
  setTimeout(() => callback(currentUser), 100);

  // Return an unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

const notifyListeners = () => {
    for(const listener of listeners) {
        listener(currentUser);
    }
}

export async function signUp(email: string, password: string, fullName: string) {
    console.log("Mock SignUp:", { email, password, fullName });
    const newUser: PlayerProfile = {
        id: `usr_${Date.now()}`,
        name: fullName,
        email: email,
        avatar: 'https://placehold.co/96x96.png',
        gamerId: `player_${Date.now()}`,
        joined: new Date().toISOString(),
        role: 'Player',
        winrate: 0,
        games: 0,
        balance: 100, // Welcome bonus
        pendingBalance: 0,
        status: 'active',
        wins: 0,
    };
    mockUsers.push(newUser);
    currentUser = {
        uid: newUser.id,
        email: newUser.email,
        displayName: newUser.name,
        photoURL: newUser.avatar,
    };
    notifyListeners();
    return { user: currentUser };
}

export async function signIn(email: string, password: string) {
    console.log("Mock SignIn:", { email, password });
    let foundUser = mockUsers.find(u => u.email === email);
    if(email === mockAdmin.email) foundUser = mockAdmin;
    
    if (!foundUser) {
        throw new Error("User not found in mock data.");
    }
    
    currentUser = {
        uid: foundUser.id,
        email: foundUser.email,
        displayName: foundUser.name,
        photoURL: foundUser.avatar,
    };
    notifyListeners();
    return { user: currentUser };
}

export async function signInWithGoogle() {
  console.log("Mock SignInWithGoogle");
  // For demo, just sign in the default player
  const userToSignIn = mockUsers.find(u => u.id === 'usr_player_1') || mockUsers[0];
  if (!userToSignIn) {
      throw new Error("No mock players available for Google Sign-in");
  }

  currentUser = {
      uid: userToSignIn.id,
      email: userToSignIn.email,
      displayName: userToSignIn.name,
      photoURL: userToSignIn.avatar,
  };
  notifyListeners();
  return { user: currentUser };
}

export function signOutUser(): Promise<void> {
    console.log("Mock SignOut");
    currentUser = null;
    notifyListeners();
    return Promise.resolve();
}

export function sendPasswordReset(email: string): Promise<void> {
  console.log(`Mock: Password reset email sent to ${email}`);
  return Promise.resolve();
}

// Add a function to ensure a profile exists. In mock mode, it always does.
export const ensureUserProfile = async (user: AuthUser) => {
    const userExists = mockUsers.some(u => u.id === user.uid);
    if (!userExists) {
        const newUser: PlayerProfile = {
            id: user.uid,
            name: user.displayName || 'New Player',
            email: user.email || '',
            avatar: user.photoURL || 'https://placehold.co/96x96.png',
            gamerId: `player_${Date.now()}`,
            joined: new Date().toISOString(),
            role: 'Player',
            winrate: 0,
            games: 0,
            balance: 100,
            pendingBalance: 0,
            status: 'active',
            wins: 0,
        };
        mockUsers.push(newUser);
    }
    return Promise.resolve();
};
