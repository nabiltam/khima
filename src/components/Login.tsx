/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Tent, LogIn } from 'lucide-react';
import { auth, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (error) {
      console.error("Login error:", error);
      // We don't use handleFirestoreError here as it's Auth, but we can log it
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-12 text-center relative z-10">
        <div className="space-y-6">
          <div className="w-24 h-24 bg-primary text-primary-foreground rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 border border-border animate-in zoom-in duration-700">
            <Tent size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tighter text-foreground">أرتي تام</h1>
            <p className="text-sm font-bold text-primary uppercase tracking-[0.2em]">نظام إدارة كراء الخيام</p>
          </div>
        </div>

        <div className="bg-card p-10 rounded-[3rem] border border-border shadow-2xl shadow-black/5 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">مرحباً بك مجدداً</h2>
            <p className="text-muted-foreground font-medium">سجل الدخول للوصول إلى حجوزاتك وبياناتك السحابية</p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 px-8 py-5 bg-foreground text-background rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-foreground/10"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" referrerPolicy="no-referrer" />
                <span>الدخول بواسطة جوجل</span>
              </>
            )}
          </button>

          <div className="pt-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              جميع بياناتك محفوظة بشكل آمن في السحابة
            </p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm font-medium">
          بواسطة <span className="text-foreground font-bold">أرتي تام</span> • ٢٠٢٦
        </p>
      </div>
    </div>
  );
}
