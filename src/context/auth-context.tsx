'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged } from '@/lib/auth-service';
import type { AuthUser, PlayerProfile } from '@/types';
import { getUserProfileStream } from '@/lib/users-service';

interface AuthContextType {
  user: AuthUser | null;
  profile: PlayerProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);

      // If there's a user, listen to their profile
      if (authUser?.uid) {
        // Clean up previous listener if it exists
        if (profileUnsubscribe) {
          profileUnsubscribe();
        }
        profileUnsubscribe = getUserProfileStream(authUser.uid, (userProfile) => {
          setProfile(userProfile);
          setLoading(false);
        });
      } else {
        // If no user, clear profile and stop loading
        if (profileUnsubscribe) {
          profileUnsubscribe();
          profileUnsubscribe = null;
        }
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  const value = { user, profile, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
