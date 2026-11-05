'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Search, Gift, Globe, User, LogOut, Map, MessageSquare, Users, Home } from 'lucide-react';
import { Locale, DICTIONARY } from '@/lib/i18n';

interface NavbarProps {
  locale: Locale;
  currentTab: 'market' | 'map' | 'community';
  onSelectTab: (tab: 'market' | 'map' | 'community') => void;
  currentUser?: { email?: string } | null;
  unreadChatCount?: number;
  onOpenListing: () => void;
  onOpenAuth: () => void;
  onOpenChat: () => void;
  onOpenProfile: () => void;
  onLogout?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  currentTab,
  onSelectTab,
  currentUser,
  unreadChatCount = 0,
  onOpenListing,
  onOpenAuth,
  onOpenChat,
  onOpenProfile,
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
          
          {/* Brand Logo & Desktop Nav Tabs */}
          <div className="flex items-center gap-6">
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

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 pl-2">
              <button
                onClick={() => onSelectTab('market')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'market'
                    ? 'bg-pink-50 text-pink-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{t.tabMarket}</span>
              </button>

              <button
                onClick={() => onSelectTab('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'map'
                    ? 'bg-pink-50 text-pink-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>{t.tabMap}</span>
              </button>

              <button
                onClick={() => onSelectTab('community')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'community'
                    ? 'bg-pink-50 text-pink-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{t.tabCommunity}</span>
              </button>
            </nav>
          </div>

          {/* Desktop Search Bar */}
          {currentTab === 'market' && (
            <div className="flex-1 max-w-sm hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-gray-800"
                />
              </div>
            </div>
          )}

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Desktop Messages CTA */}
            <button
              onClick={onOpenChat}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 text-xs font-bold text-gray-700 transition-all relative"
            >
              <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
              <span>{t.tabChat}</span>
              {unreadChatCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <Link
              href={otherLocalePath}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 text-xs font-bold text-gray-700 transition-all whitespace-nowrap"
              title="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span>{otherLocaleLabel}</span>
            </Link>

            {/* User Auth Profile / Button */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <div
                  onClick={onOpenProfile}
                  title={currentUser.email}
                  className="w-8 h-8 rounded-full bg-pink-100 border border-pink-200 text-pink-700 font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer hover:ring-2 ring-pink-400 transition-all"
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

            {/* Primary AI Listing CTA Button */}
            <button
              onClick={onOpenListing}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span>{t.aiListingBtn}</span>
            </button>

          </div>
        </div>

        {/* Mobile Search Bar */}
        {currentTab === 'market' && (
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
        )}

      </div>
    </header>
  );
};
