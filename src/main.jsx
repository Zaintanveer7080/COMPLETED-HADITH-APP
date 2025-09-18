import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { DataProvider } from '@/contexts/DataContext';
import { Toaster } from '@/components/ui/toaster';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <DataProvider>
              <App />
              <Toaster />
            </DataProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);