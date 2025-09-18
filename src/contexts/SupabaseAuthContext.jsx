import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    } else {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    } else {
       toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }

    return { error };
  }, [toast]);

  const updateUserMetadata = useCallback(async (data) => {
    const { error } = await supabase.auth.updateUser({ data });
    if (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update profile.",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    }
    return { error };
  }, [toast]);

  const updateUserPassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({
        variant: "destructive",
        title: "Password Update Failed",
        description: error.message || "Could not update password.",
      });
    } else {
      toast({
        title: "Password Updated",
        description: "Your password has been changed. Please log in again.",
      });
      await signOut();
    }
    return { error };
  }, [toast, signOut]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserMetadata,
    updateUserPassword,
  }), [user, session, loading, signUp, signIn, signOut, updateUserMetadata, updateUserPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};