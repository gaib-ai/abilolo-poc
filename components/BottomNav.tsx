'use client';

import React from 'react';
import { Home, Sparkles, User, Package } from 'lucide-react';
import { Locale } from '@/lib/i18n';

interface BottomNavProps {
  locale: Locale;
  currentUser?: { email?: string } | null;
  onOpenListing: () => void;
  onOpenAuth: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  locale,
  currentUser,
  onOpenListing,
  onOpenAuth
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg px-4 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        
        {/* Home */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors py-1"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">
            {locale === 'en' ? 'Home' : 'ホーム'}
          </span>
        </button>

        {/* Center elevated AI listing CTA */}
        <div className="relative -top-5">
          <button
            onClick={onOpenListing}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex flex-col items-center justify-center shadow-lg shadow-pink-500/35 border-4 border-white active:scale-95 transition-transform"
          >
            <Sparkles className="w-6 h-6 text-yellow-200" />
            <span className="text-[8px] font-black tracking-tight mt-0.5">
              {locale === 'en' ? 'AI List' : 'AI出品'}
            </span>
          </button>
        </div>

        {/* Auth / Profile */}
        <button
          onClick={onOpenAuth}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-pink-600 transition-colors py-1"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">
            {currentUser
              ? (locale === 'en' ? 'Account' : 'マイページ')
              : (locale === 'en' ? 'Log In' : 'ログイン')}
          </span>
        </button>

      </div>
    </nav>
  );
};
