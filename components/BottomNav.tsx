'use client';

import React from 'react';
import { Home, Sparkles, User, Map, MessageSquare, Users } from 'lucide-react';
import { Locale, DICTIONARY } from '@/lib/i18n';

interface BottomNavProps {
  locale: Locale;
  currentTab: 'market' | 'map' | 'community';
  unreadChatCount?: number;
  currentUser?: { email?: string } | null;
  onSelectTab: (tab: 'market' | 'map' | 'community') => void;
  onOpenListing: () => void;
  onOpenChat: () => void;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  locale,
  currentTab,
  unreadChatCount = 0,
  currentUser,
  onSelectTab,
  onOpenListing,
  onOpenChat,
  onOpenProfile
}) => {
  const t = DICTIONARY[locale];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg px-2 py-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)]"
    >
      <div className="flex items-center justify-between max-w-md mx-auto relative px-1">
        
        {/* 1. Market (Home) */}
        <button
          onClick={() => onSelectTab('market')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
            currentTab === 'market' ? 'text-pink-600 font-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold">{t.tabMarket}</span>
        </button>

        {/* 2. Map (ご近所マップ) */}
        <button
          onClick={() => onSelectTab('map')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
            currentTab === 'map' ? 'text-pink-600 font-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[9px] font-bold">{t.tabMap}</span>
        </button>

        {/* 3. Center elevated AI listing CTA */}
        <div className="relative -top-4">
          <button
            onClick={onOpenListing}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex flex-col items-center justify-center shadow-lg shadow-pink-500/35 border-3 border-white active:scale-95 transition-transform"
          >
            <Sparkles className="w-5 h-5 text-yellow-200" />
            <span className="text-[8px] font-black tracking-tight mt-0.5">
              {locale === 'en' ? 'AI List' : 'AI出品'}
            </span>
          </button>
        </div>

        {/* 4. Community (子育て掲示板) */}
        <button
          onClick={() => onSelectTab('community')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
            currentTab === 'community' ? 'text-pink-600 font-black' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-bold">{t.tabCommunity}</span>
        </button>

        {/* 5. Chat (メッセージ) */}
        <button
          onClick={onOpenChat}
          className="flex flex-col items-center gap-0.5 py-1 px-2 text-gray-500 hover:text-pink-600 transition-colors relative"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-pink-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow">
                {unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold">{t.tabChat}</span>
        </button>

        {/* 6. Profile / MyPage */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-0.5 py-1 px-2 text-gray-500 hover:text-pink-600 transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold">{t.tabProfile}</span>
        </button>

      </div>
    </nav>
  );
};
