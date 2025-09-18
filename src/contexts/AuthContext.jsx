import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      if (email === 'admin@example.com' && password === 'password') {
        const userData = {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        };
        
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const register = async (userData) => {
    try {
      toast({
        title: "🚧 Registration Feature",
        description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      });
      return { success: false };
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const updateUser = (updatedData) => {
    if (user) {
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      return newUserData;
    }
    return null;
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};