'use client';

import React from 'react';
import { Item } from '@/lib/types';
import { X, MapPin, Truck, Sparkles, CheckCircle2, HeartHandshake, AlertCircle } from 'lucide-react';

interface ItemModalProps {
  item: Item | null;
  onClose: () => void;
  onRequestClaim: (item: Item) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  onClose,
  onRequestClaim
}) => {
  if (!item) return null;

  const isClaimed = item.status === 'claimed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative my-8 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Main Photo Gallery */}
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {isClaimed && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                <div className="bg-white/95 px-5 py-2.5 rounded-full shadow-lg text-center">
                  <span className="text-sm font-extrabold text-gray-900 tracking-wider">
                    🎉 マッチング成立済 (受付終了)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Title & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                ¥0 お譲り品
              </span>
              <span className="bg-pink-50 text-pink-700 border border-pink-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                {item.category}
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                状態: {item.condition}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
              {item.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                発送元: {item.location}
              </span>
              <span>出品者: {item.giverName}</span>
              <span>登録日: {item.createdAt}</span>
            </div>
          </div>

          {/* AI Generated Note Box */}
          <div className="bg-gradient-to-br from-pink-50/60 to-rose-50/40 rounded-2xl p-4 border border-pink-100/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-800">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>AI自動抽出されたアイテム情報</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div>
              <span className="text-gray-400 font-medium block">対象月齢・サイズ</span>
              <span className="font-bold text-gray-800 text-sm mt-0.5 block">{item.targetAge}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">配送・送料負担</span>
              <span className="font-bold text-pink-700 text-sm mt-0.5 block">{item.shippingMethod}</span>
              <span className="text-[11px] text-gray-500">{item.estimatedShippingFee}</span>
            </div>
          </div>

          {/* Important Notice */}
          <div className="rounded-xl p-3.5 bg-amber-50/80 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">配送料（着払い）について:</span>
              <p className="mt-0.5 text-amber-800">
                本品は無償譲渡品（0円）です。商品到着時に配送ドライバーへ着払い送料を直接お支払いいただきます。出品者への代金支払いや手数料は一切発生しません。
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <span className="text-xs text-gray-500 block">商品価格</span>
            <span className="text-2xl font-black text-pink-600">¥0</span>
            <span className="text-[10px] text-gray-400 ml-1">(送料のみ自己負担)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
            >
              閉じる
            </button>

            {isClaimed ? (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gray-300 text-gray-500 text-sm font-bold cursor-not-allowed"
              >
                マッチング成立済み
              </button>
            ) : (
              <button
                onClick={() => onRequestClaim(item)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>この品物を希望する</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
