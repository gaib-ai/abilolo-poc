'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Search, Gift, Globe, User, LogOut } from 'lucide-react';
import { Locale, DICTIONARY } from '@/lib/i18n';

interface NavbarProps {
  locale: Locale;
  currentUser?: { email?: string } | null;
  onOpenListing: () => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  currentUser,
  onOpenListing,
  onOpenAuth,
  onLogout,
  searchQuery,
  onSearchChange
}) => {
  const t = DICTIONARY[locale];
  const otherLocale = locale === 'ja' ? 'en' : 'ja';
  const otherLocalePath = otherLocale === 'en' ? '/en' : '/';
  const otherLocaleLabel = otherLocale === 'en' ? 'EN' : '日本語';

  const userInitial = currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          
          {/* Brand Logo */}
          <Link href={locale === 'en' ? '/en' : '/'} className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-xs shadow-pink-200 group-hover:scale-105 transition-transform">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 whitespace-nowrap">
                Abilolo
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold whitespace-nowrap">
                {t.pocBadge}
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-gray-800"
              />
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Price Badge (Desktop Only) */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-medium whitespace-nowrap">
              <span>{t.priceBadge}</span>
            </div>

            {/* Language Switcher (Compact on mobile) */}
            <Link
              href={otherLocalePath}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 text-xs font-bold text-gray-700 transition-all whitespace-nowrap"
              title="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span>{otherLocaleLabel}</span>
            </Link>

            {/* User Auth Profile / Button (Hidden on mobile; handled in BottomNav) */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <div
                  title={currentUser.email}
                  className="w-8 h-8 rounded-full bg-pink-100 border border-pink-200 text-pink-700 font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer"
                >
                  {userInitial}
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title={locale === 'en' ? 'Log out' : 'ログアウト'}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 text-xs font-bold text-gray-700 transition-all whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span>{locale === 'en' ? 'Log In' : 'ログイン'}</span>
              </button>
            )}

            {/* Primary AI Listing CTA Button (Hidden on mobile; handled by BottomNav floating button) */}
            <button
              onClick={onOpenListing}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-sm shadow-pink-500/25 transition-all transform active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-yellow-200 shrink-0" />
              <span>{t.aiListingBtn}</span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar (Cleanly stacked with comfortable spacing) */}
        <div className="pb-3 pt-1 md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={locale === 'en' ? 'Search items...' : 'ベビーカー、抱っこ紐等で検索...'}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
