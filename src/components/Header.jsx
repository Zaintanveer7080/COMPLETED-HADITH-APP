import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const [islamicDate, setIslamicDate] = useState('Loading date...');

  useEffect(() => {
    const fetchIslamicDate = async () => {
      try {
        const response = await fetch('https://api.aladhan.com/v1/gToH');
        if (!response.ok) throw new Error('API response not OK');
        const data = await response.json();
        if (data.code === 200) {
          const hijri = data.data.hijri;
          setIslamicDate(`${hijri.day} ${hijri.month.en}, ${hijri.year} AH`);
        } else {
          throw new Error('Invalid API data');
        }
      } catch (error) {
        console.error("Failed to fetch Islamic date:", error);
        setIslamicDate('18 Shawwal, 1446 AH'); // Fallback for 2025-09-18
      }
    };

    fetchIslamicDate();
  }, []);

  const userInitial = user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'A');
  const userName = user?.user_metadata?.name || user?.email;
  const userRole = user?.user_metadata?.role || 'User';

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border h-[65px] px-6">
      <div className="flex items-center justify-between h-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-muted-foreground hidden sm:block"
        >
          {islamicDate}
        </motion.div>
        <div className="flex-1" />

        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow">
              <span className="text-sm font-medium text-primary-foreground">
                {userInitial}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;