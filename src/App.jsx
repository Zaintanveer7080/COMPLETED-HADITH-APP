import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Browse from '@/pages/Browse';
import Collections from '@/pages/Collections';
import CollectionDetail from '@/pages/CollectionDetail';
import Import from '@/pages/Import';
import Settings from '@/pages/Settings';
import DetailView from '@/pages/DetailView';
import Notifications from '@/pages/Notifications';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`${theme} transition-colors duration-300`}>
      <Helmet>
        <title>Hadith & Quran CMS - Islamic Content Management</title>
        <meta name="description" content="Complete Islamic content management system for Hadith and Quran with advanced search, authentication, and real-time features." />
      </Helmet>
      
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="browse" element={<Browse />} />
          <Route path="collections" element={<Collections />} />
          <Route path="collections/:id" element={<CollectionDetail />} />
          <Route path="import" element={<Import />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="entry/:id" element={<DetailView />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;