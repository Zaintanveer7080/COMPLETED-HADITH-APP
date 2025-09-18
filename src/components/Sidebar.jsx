import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  BookOpen, 
  Upload, 
  Settings, 
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Browse', path: '/browse' },
    { icon: BookOpen, label: 'Collections', path: '/collections' },
    { icon: Upload, label: 'Import', path: '/import' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const SidebarItem = ({ item, collapsed }) => {
    const isActive = location.pathname.startsWith(item.path);
    
    const content = (
      <NavLink
        to={item.path}
        className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 group relative ${
          isActive 
            ? 'bg-primary text-primary-foreground shadow-lg' 
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <item.icon className={`${collapsed ? 'mx-auto w-6 h-6' : 'w-5 h-5 mr-4'} transition-all`} />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="font-medium"
          >
            {item.label}
          </motion.span>
        )}
        {isActive && (
          <motion.div 
            layoutId="active-indicator"
            className="absolute left-0 top-0 h-full w-1 bg-primary-foreground rounded-r-full"
            initial={false}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 h-full bg-card border-r border-border shadow-lg z-50 flex flex-col"
      >
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center border-b border-border transition-all duration-300 ${collapsed ? 'h-[65px] justify-center' : 'h-[65px] px-6'}`}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg tracking-tight">Islamic CMS</span>
              </motion.div>
            )}
             {collapsed && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
             )}
          </div>

          {/* Toggle Button */}
          <div className="absolute top-1/2 -right-[14px] transform -translate-y-1/2 z-10">
            <Button
              variant="secondary"
              size="icon"
              onClick={onToggle}
              className="rounded-full w-7 h-7 shadow-md border hover:bg-primary hover:text-primary-foreground"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <SidebarItem key={item.path} item={item} collapsed={collapsed} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={signOut}
                    className="w-full hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                onClick={signOut}
                className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="w-5 h-5 mr-4" />
                <span className="font-medium">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default Sidebar;