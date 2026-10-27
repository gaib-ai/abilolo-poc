'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Search, Gift, Globe } from 'lucide-react';
import { Locale, DICTIONARY } from '@/lib/i18n';

interface NavbarProps {
  locale: Locale;
  onOpenListing: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  onOpenListing,
  searchQuery,
  onSearchChange
}) => {
  const t = DICTIONARY[locale];
  const otherLocale = locale === 'ja' ? 'en' : 'ja';
  const otherLocalePath = otherLocale === 'en' ? '/en' : '/';
  const otherLocaleLabel = otherLocale === 'en' ? 'English' : '日本語';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link href={locale === 'en' ? '/en' : '/'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-sm shadow-pink-200 group-hover:scale-105 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-gray-900">{t.siteTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold">{t.pocBadge}</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium hidden sm:block">
                {t.siteTagline}
              </p>
            </div>
          </Link>

          {/* Search bar */}
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

          {/* Right Action CTA & Language Switcher */}
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-medium">
              <span>{t.priceBadge}</span>
            </div>

            {/* Language Switcher */}
            <Link
              href={otherLocalePath}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 text-xs font-bold text-gray-700 transition-all"
              title="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span>{otherLocaleLabel}</span>
            </Link>

            <button
              onClick={onOpenListing}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md shadow-pink-500/25 transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span>{t.aiListingBtn}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-800"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
