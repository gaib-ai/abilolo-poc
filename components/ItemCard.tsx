'use client';

import React from 'react';
import { Item } from '@/lib/types';
import { MapPin, Eye } from 'lucide-react';
import { Locale, DICTIONARY } from '@/lib/i18n';

interface ItemCardProps {
  item: Item;
  locale: Locale;
  onSelect: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, locale, onSelect }) => {
  const isClaimed = item.status === 'claimed';
  const t = DICTIONARY[locale];

  // Condition color badges
  const conditionColorMap: Record<string, string> = {
    '新品・未使用': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    '未使用に近い': 'bg-blue-50 text-blue-700 border-blue-200',
    '目立った傷や汚れなし': 'bg-amber-50 text-amber-800 border-amber-200',
    'やや傷や汚れあり': 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const conditionDisplay = locale === 'en'
    ? {
        '新品・未使用': 'Brand New',
        '未使用に近い': 'Like New',
        '目立った傷や汚れなし': 'Gently Used',
        'やや傷や汚れあり': 'Fair Condition'
      }[item.condition] || item.condition
    : item.condition;

  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-xl hover:border-pink-200 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image Thumbnail with badges */}
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.images[0]}
          alt={item.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isClaimed ? 'grayscale opacity-75' : ''
          }`}
        />

        {/* Status Overlay if Claimed */}
        {isClaimed ? (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-wider border border-white/20">
              {t.cardClaimed}
            </span>
          </div>
        ) : (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-pink-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              {t.cardZeroYen}
            </span>
          </div>
        )}

        {/* Location pill */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />
          <span>{item.location}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                conditionColorMap[item.condition] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {conditionDisplay}
            </span>
            <span className="text-[10px] text-gray-400 font-medium truncate">
              {item.category}
            </span>
          </div>

          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-pink-600 transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Target Age & Shipping */}
        <div className="space-y-1 text-[11px] text-gray-500 pt-1 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">{t.targetAgeLabel}</span>
            <span className="font-semibold text-gray-700 truncate max-w-[150px]">{item.targetAge}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">{t.shippingFeeLabel}</span>
            <span className="text-pink-700 font-bold">{item.estimatedShippingFee || 'COD'}</span>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
          <span className="truncate max-w-[120px]">{t.giverLabel} {item.giverName}</span>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{item.views}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
