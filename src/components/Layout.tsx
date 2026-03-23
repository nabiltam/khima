/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { LayoutDashboard, Users, PlusCircle, Search, Menu, X, Settings, Heart, Tent, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: User | null;
}

export default function Layout({ children, activeTab, setActiveTab, user }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'customers', label: 'سجل الزبائن', icon: Users },
    { id: 'bookings', label: 'الحجوزات', icon: Search },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
    { id: 'shams', label: 'شمس', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-foreground">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center border border-border">
            <Tent size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">أرتي تام</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-muted rounded-full transition-colors">
          {isSidebarOpen ? <X size={24} className="text-foreground" /> : <Menu size={24} className="text-foreground" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-8">
            <div className="flex flex-col items-center gap-4 mb-12">
              <div className="w-24 h-24 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center shadow-xl shadow-primary/20 border border-border">
                <Tent size={48} />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tighter text-foreground">أرتي تام</h1>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">لكراء الخيام والديكورات</p>
              </div>
            </div>
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
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* User Info & Logout */}
          <div className="mt-auto p-8 border-t border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-xl overflow-hidden border border-border">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Users size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{user?.displayName || 'مستخدم'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut(auth)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
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
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 group"
      >
        <PlusCircle size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
