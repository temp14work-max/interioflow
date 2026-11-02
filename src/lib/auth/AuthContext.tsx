/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useClerk, useSession, useUser } from '@clerk/clerk-react';
import { UserAccount, UserRole } from '../../types';
import { setSupabaseAccessToken, supabase } from '../supabase/client';

interface AuthContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  logout: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  authModalMode: 'signin' | 'signup';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();
  const { signOut } = useClerk();

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Set during render, not in an effect: child effects run first and already query Supabase.
  setSupabaseAccessToken(async () => (session ? session.getToken() : null));

  const clerkUserId = isSignedIn ? user?.id : undefined;

  const loadProfile = useCallback(async () => {
    const { data, error } = await supabase.rpc('ensure_profile');
    if (error) {
      setAuthError(`Signed in, but Supabase rejected the session: ${error.message}`);
      return null;
    }
    setAuthError(null);
    setCurrentUser(data as UserAccount);
    return data as UserAccount;
  }, []);

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').is('deleted_at', null).order('created_at');
    if (error) console.warn('Could not load users:', error.message);
    else setUsers(data as UserAccount[]);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!clerkUserId) {
      setCurrentUser(null);
      setUsers([]);
      setAuthError(null);
      return;
    }
    setIsAuthModalOpen(false);
    loadProfile().then(profile => {
      if (profile) loadUsers();
    });

    const channel = supabase
      .channel(`profiles-${clerkUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadProfile();
        loadUsers();
      });
    supabase.realtime.setAuth().then(() => channel.subscribe());
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoaded, clerkUserId, loadProfile, loadUsers]);

  const logout = async () => {
    await signOut();
    setCurrentUser(null);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase.rpc('update_user_role', { p_user_id: userId, p_role: newRole });
    if (error) throw new Error(error.message);
    await Promise.all([loadProfile(), loadUsers()]);
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: !!currentUser,
        isAuthLoading: !isLoaded || (!!clerkUserId && !currentUser && !authError),
        authError,
        logout,
        updateUserRole,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
