import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured, localDb, DEMO_ADMIN, DEMO_USER } from '../lib/supabase';

export const ADMIN_EMAIL = 'shivuba005@gmail.com';
export const ADMIN_PASSWORD = 'shivu@2k26';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isSupabaseActive: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchUserRole: (role: 'student' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            if (profile) {
              setUser({
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name || 'Candidate',
                avatarUrl: profile.avatar_url,
                role: profile.role || 'student',
                targetRole: profile.target_role || 'Software Developer',
                experienceLevel: profile.experience_level || 'Fresher',
                preferredLanguage: profile.preferred_language || 'English',
                createdAt: profile.created_at,
              });
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Supabase session load error, falling back to local state:', e);
        }
      }

      // Local storage fallback
      const localUser = localDb.getCurrentUser();
      setUser(localUser);
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'Password123!',
        });
        if (error) throw error;
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const u: UserProfile = {
            id: data.user.id,
            email: data.user.email!,
            fullName: profile?.full_name || 'Candidate',
            avatarUrl: profile?.avatar_url,
            role: profile?.role || 'student',
            targetRole: profile?.target_role || 'Software Developer',
            experienceLevel: profile?.experience_level || 'Fresher',
            preferredLanguage: profile?.preferred_language || 'English',
            createdAt: profile?.created_at || new Date().toISOString(),
          };
          setUser(u);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Supabase login failed' };
      }
    }

    // Local / Student / Admin Login
    const normalizedEmail = email.toLowerCase().trim();
    const isAdminUser = normalizedEmail === ADMIN_EMAIL.toLowerCase();

    // Strict password verification for Admin (Shivu)
    if (isAdminUser) {
      if (password !== ADMIN_PASSWORD) {
        setIsLoading(false);
        return { success: false, error: 'Incorrect admin password. Please try again.' };
      }
    }

    const users = localDb.getUsers();
    let found = users.find((u) => u.email.toLowerCase().trim() === normalizedEmail);

    if (!found) {
      // Auto-register student or admin account
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: normalizedEmail,
        fullName: isAdminUser ? 'Shivu' : email.split('@')[0],
        role: isAdminUser ? 'admin' : 'student',
        targetRole: isAdminUser ? 'Engineering Manager & Lead Interviewer' : 'Software Developer',
        experienceLevel: isAdminUser ? 'Experienced' : 'Fresher',
        preferredLanguage: 'English',
        createdAt: new Date().toISOString(),
      };
      const updatedList = [...users, newUser];
      localStorage.setItem('ai_interviewer_users', JSON.stringify(updatedList));
      found = newUser;
    } else {
      found.role = isAdminUser ? 'admin' : 'student';
      if (isAdminUser) {
        found.fullName = 'Shivu';
      }
    }

    localDb.setCurrentUser(found);
    setUser(found);
    setIsLoading(false);
    return { success: true };
  };

  const signup = async (email: string, password?: string, fullName?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const normalizedEmail = email.toLowerCase().trim();
    const isAdminUser = normalizedEmail === ADMIN_EMAIL.toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password || 'Password123!',
          options: {
            data: { full_name: fullName || email.split('@')[0] },
          },
        });
        if (error) throw error;
        if (data.user) {
          const u: UserProfile = {
            id: data.user.id,
            email: data.user.email!,
            fullName: fullName || email.split('@')[0],
            role: isAdminUser ? 'admin' : 'student',
            targetRole: 'Software Developer',
            experienceLevel: 'Fresher',
            preferredLanguage: 'English',
            createdAt: new Date().toISOString(),
          };
          setUser(u);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || 'Signup failed' };
      }
    }

    // Local Signup
    const users = localDb.getUsers();
    if (users.some((u) => u.email.toLowerCase().trim() === normalizedEmail)) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: normalizedEmail,
      fullName: fullName || email.split('@')[0],
      role: isAdminUser ? 'admin' : 'student',
      targetRole: 'Software Developer',
      experienceLevel: 'Fresher',
      preferredLanguage: 'English',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('ai_interviewer_users', JSON.stringify([...users, newUser]));
    localDb.setCurrentUser(newUser);
    setUser(newUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localDb.setCurrentUser(null);
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    // Simulation
    return { success: true };
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localDb.updateUserProfile(data);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.fullName,
            avatar_url: updated.avatarUrl,
            target_role: updated.targetRole,
            experience_level: updated.experienceLevel,
            preferred_language: updated.preferredLanguage,
            role: updated.role,
          })
          .eq('id', user.id);
      } catch (e) {
        console.warn('Error updating Supabase profile:', e);
      }
    }
  };

  const switchUserRole = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      setUser(DEMO_ADMIN);
      localDb.setCurrentUser(DEMO_ADMIN);
    } else {
      setUser(DEMO_USER);
      localDb.setCurrentUser(DEMO_USER);
    }
  };

  const isAdmin = Boolean(user && user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase());

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSupabaseActive: isSupabaseConfigured,
        isAdmin,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
        switchUserRole,
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

