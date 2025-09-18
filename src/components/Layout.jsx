import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();

  return (
    <div className="h-screen flex bg-background text-foreground">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'ml-[80px]' : 'ml-[256px]'
      }`}>
        <Header sidebarCollapsed={sidebarCollapsed} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;