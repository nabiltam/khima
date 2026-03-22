/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { LayoutDashboard, Users, PlusCircle, Search, Menu, X, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { User } from 'firebase/auth';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: User | null;
  onSignOut?: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, user, onSignOut }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'customers', label: 'سجل الزبائن', icon: Users },
    { id: 'bookings', label: 'الحجوزات', icon: Search },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#E6D5B8] selection:text-[#1A1A1A]">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-[#1A1A1A]/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">خيمتي</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#1A1A1A]/5 rounded-full transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#1A1A1A]/5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-8">
            <h1 className="text-3xl font-bold tracking-tighter mb-12 text-[#1A1A1A]">خيمتي</h1>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    activeTab === item.id 
                      ? "bg-[#1A1A1A] text-white shadow-lg shadow-[#1A1A1A]/20" 
                      : "text-[#1A1A1A]/60 hover:bg-[#1A1A1A]/5 hover:text-[#1A1A1A]"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {user && (
            <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-[#1A1A1A]/5 space-y-4">
              <div className="flex items-center gap-3">
                <img src={user.photoURL || ''} className="w-10 h-10 rounded-xl" alt={user.displayName || ''} />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-[#1A1A1A] truncate">{user.displayName}</p>
                  <p className="text-[10px] text-[#1A1A1A]/40 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={onSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={14} />
                تسجيل الخروج
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-4 lg:p-12 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setActiveTab('new-booking')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 group"
      >
        <PlusCircle size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
