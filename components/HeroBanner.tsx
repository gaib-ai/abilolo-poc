'use client';

import React from 'react';
import { Camera, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { Locale, DICTIONARY } from '@/lib/i18n';

interface HeroBannerProps {
  locale: Locale;
  onOpenListing: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ locale, onOpenListing }) => {
  const t = DICTIONARY[locale];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-pink-50/70 via-rose-50/30 to-white pt-5 pb-8 sm:pt-8 sm:pb-10 border-b border-pink-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            
            {/* Top Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/80 border border-pink-200 text-pink-800 text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <span>{t.heroTag}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-snug sm:leading-tight">
              {t.heroTitle1}
              <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500">
                {t.heroTitleHighlight}
              </span>
            </h1>

            {/* Description Paragraph */}
            <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
              {t.heroDesc}
            </p>

            {/* CTA Button Block */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
              <button
                onClick={onOpenListing}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md shadow-pink-500/20 transition-all transform active:scale-95"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>{t.heroBtn}</span>
                <ArrowRight className="w-4 h-4 ml-0.5 shrink-0" />
              </button>

              <span className="text-center sm:text-left text-[11px] sm:text-xs text-gray-400 font-medium">
                {t.heroNote}
              </span>
            </div>
          </div>

          {/* 3 Step Card in Hero */}
          <div className="lg:col-span-5 mt-2 lg:mt-0">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-xl shadow-pink-500/5 space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0"></span>
                <span>{t.howItWorks}</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug">{t.step1Title}</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">{t.step1Desc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug">{t.step2Title}</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">{t.step2Desc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug">{t.step3Title}</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">{t.step3Desc}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{t.zeroPaymentTrust}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{t.shippingCoverage}</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
