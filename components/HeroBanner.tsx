'use client';

import React from 'react';
import { Camera, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onOpenListing: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenListing }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-pink-50/70 via-rose-50/30 to-white pt-8 pb-10 border-b border-pink-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/80 border border-pink-200 text-pink-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>写真1枚でかんたん出品・AIが自動入力</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              使わなくなった育児用品、<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500">
                次の家族へ0円でお譲り。
              </span>
            </h1>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl">
              「値段をつけるほどではないけれど捨てるのはもったいない」。
              Abiloloなら出品手数料・売買交渉ゼロ。写真を撮るだけでAIが商品情報を自動生成し、配送料（着払い）のみで必要とする家庭へ届けます。
            </p>

            <div className="pt-2 flex flex-wrap gap-3 items-center">
              <button
                onClick={onOpenListing}
                className="flex items-center gap-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-500/20 transition-all transform active:scale-95"
              >
                <Camera className="w-5 h-5" />
                <span>写真をとってAI出品する</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <span className="text-xs text-gray-400 font-medium">※登録無料・即時マッチング</span>
            </div>
          </div>

          {/* 3 Step Card in Hero */}
          <div className="lg:col-span-5">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-pink-100 shadow-xl shadow-pink-500/5 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                Abiloloのシンプルな仕組み
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">スマホで写真を撮る</h4>
                    <p className="text-xs text-gray-500 mt-0.5">AIがブランド・状態・紹介文を数秒で自動生成。面倒な文字入力は不要。</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">欲しい人がワンタップで希望</h4>
                    <p className="text-xs text-gray-500 mt-0.5">全品0円。値引き交渉なし。最初に希望した受取人と自動マッチング。</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">着払いでそのまま発送</h4>
                    <p className="text-xs text-gray-500 mt-0.5">出品者の金銭負担なし。ヤマト運輸や郵便局の着払い便で送るだけ。</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  安心のゼロ決済設計
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  全国ヤマト・ゆうパック対応
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
