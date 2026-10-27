'use client';

import React, { useState, useEffect } from 'react';
import { Locale } from '@/lib/i18n';
import { Download, X, Share, PlusSquare } from 'lucide-react';

interface PwaInstallPromptProps {
  locale: Locale;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ locale }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Check if dismissed during this session
    if (sessionStorage.getItem('abilolo_pwa_dismissed')) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // Show iOS prompt after 3s
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('abilolo_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <aside
      aria-label="App Installation"
      className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-pink-100 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shrink-0 shadow-sm">
          <Download className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-gray-900">
              {locale === 'en' ? 'Install Abilolo App' : 'Abiloloアプリをインストール'}
            </h4>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-gray-500 leading-snug">
            {locale === 'en'
              ? 'Add to home screen for instant camera AI listing & offline browsing.'
              : 'ホーム画面に追加すると、写真撮影からワンタップで即時出品できます。'}
          </p>

          {isIos ? (
            <div className="pt-2 text-[11px] text-pink-700 bg-pink-50/70 p-2 rounded-xl border border-pink-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Share className="w-3.5 h-3.5" />
                <span>{locale === 'en' ? '1. Tap Safari Share button' : '1. Safariの「共有」ボタンをタップ'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <PlusSquare className="w-3.5 h-3.5" />
                <span>{locale === 'en' ? '2. Select "Add to Home Screen"' : '2.「ホーム画面に追加」を選択'}</span>
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={handleInstallClick}
                className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs rounded-xl shadow-xs hover:from-pink-600 hover:to-rose-600 transition-all"
              >
                {locale === 'en' ? 'Add to Home Screen' : 'ホーム画面に追加する'}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
