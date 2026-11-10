'use client';

import React, { useState } from 'react';
import { Item, ItemComment } from '@/lib/types';
import { X, MapPin, Sparkles, HeartHandshake, AlertCircle, MessageCircle, User, Heart, Send } from 'lucide-react';
import { Locale, DICTIONARY } from '@/lib/i18n';

interface ItemModalProps {
  item: Item | null;
  locale: Locale;
  comments?: ItemComment[];
  onClose: () => void;
  onRequestClaim: (item: Item) => void;
  onOpenProfile?: (userId: string) => void;
  onStartChat?: (userId: string, userName: string, userAvatar: string, item?: Item) => void;
  onToggleLike?: (itemId: string) => void;
  onAddComment?: (itemId: string, content: string) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  locale,
  comments = [],
  onClose,
  onRequestClaim,
  onOpenProfile,
  onStartChat,
  onToggleLike,
  onAddComment
}) => {
  const [commentText, setCommentText] = useState('');

  if (!item) return null;

  const isClaimed = item.status === 'claimed';
  const t = DICTIONARY[locale];

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment?.(item.id, commentText.trim());
    setCommentText('');
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
                    🎉 {t.alreadyClaimedBtn}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Title & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {t.cardZeroYen}
              </span>
              <span className="bg-pink-50 text-pink-700 border border-pink-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                {item.category}
              </span>
              <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                {locale === 'en' ? 'Condition: ' : '状態: '}{conditionDisplay}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
              {item.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pink-500" />
                {item.neighborhood || item.location}
              </span>
              
              {/* Clickable Giver Profile Link */}
              <button
                onClick={() => onOpenProfile && onOpenProfile(item.giverId || 'user-sakura')}
                className="flex items-center gap-1.5 font-bold text-gray-800 hover:text-pink-600 transition-colors bg-gray-50 hover:bg-pink-50 px-2 py-1 rounded-lg border border-gray-100"
              >
                {item.giverAvatar ? (
                  <img
                    src={item.giverAvatar}
                    alt={item.giverName}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-gray-400" />
                )}
                <span>{item.giverName}</span>
                <span className="text-[10px] text-pink-600">({t.viewProfileBtn})</span>
              </button>

              <span>{locale === 'en' ? 'Listed: ' : '登録日: '}{item.createdAt}</span>
            </div>
          </div>

          {/* AI Generated Note Box */}
          <div className="bg-gradient-to-br from-pink-50/60 to-rose-50/40 rounded-2xl p-4 border border-pink-100/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-800">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>{t.aiNoteTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div>
              <span className="text-gray-400 font-medium block">{locale === 'en' ? 'Target Age / Size' : '対象月齢・サイズ'}</span>
              <span className="font-bold text-gray-800 text-sm mt-0.5 block">{item.targetAge}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium block">{locale === 'en' ? 'Shipping & Delivery' : '配送・送料負担'}</span>
              <span className="font-bold text-pink-700 text-sm mt-0.5 block">{item.shippingMethod}</span>
              <span className="text-[11px] text-gray-500">{item.estimatedShippingFee}</span>
            </div>
          </div>

          {/* Important Notice */}
          <div className="rounded-xl p-3.5 bg-amber-50/80 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{t.shippingAlertTitle}</span>
              <p className="mt-0.5 text-amber-800">
                {t.shippingAlertBody}
              </p>
            </div>
          </div>

          {/* Comments & Community Questions */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-pink-500" />
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                  {t.itemCommentsTitle} ({comments.length})
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">
                {locale === 'en' ? 'Public questions' : '出品者への公開質問'}
              </span>
            </div>

            {/* Comments list */}
            {comments.length > 0 ? (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-2xs text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onOpenProfile?.(c.authorId)}
                        className="flex items-center gap-1.5 font-bold text-gray-800 hover:text-pink-600 transition-colors"
                      >
                        <img src={c.authorAvatar} alt={c.authorName} className="w-5 h-5 rounded-full object-cover" />
                        <span>{c.authorName}</span>
                      </button>
                      <span className="text-[10px] text-gray-400">{c.createdAt}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed pl-6.5">{c.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-gray-400 bg-white/70 rounded-xl border border-dashed border-gray-200">
                {locale === 'en' ? 'No comments or questions yet. Be the first to ask!' : 'まだ質問はありません。気になる点を出品者に聞いてみましょう！'}
              </div>
            )}

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[t.itemCommentQuickTag1, t.itemCommentQuickTag2, t.itemCommentQuickTag3, t.itemCommentQuickTag4].map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCommentText(tag)}
                  className="text-[10px] bg-white hover:bg-pink-50 hover:text-pink-700 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t.itemCommentPlaceholder}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-800"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.itemCommentSubmit}</span>
              </button>
            </form>
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="hidden sm:block">
            <span className="text-xs text-gray-500 block">{locale === 'en' ? 'Item Price' : '商品価格'}</span>
            <span className="text-2xl font-black text-pink-600">¥0</span>
            <span className="text-[10px] text-gray-400 ml-1">({locale === 'en' ? 'Recipient covers shipping only' : '送料のみ自己負担'})</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => onToggleLike?.(item.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full border text-xs font-bold transition-all active:scale-95 ${
                item.isLiked
                  ? 'border-pink-300 bg-pink-50 text-pink-700 shadow-xs'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:text-pink-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
              <span>{item.isLiked ? t.likedItemBtn : t.likeItemBtn}</span>
              <span className="text-[11px] text-gray-400">({item.likes})</span>
            </button>

            {/* Message Giver CTA */}
            <button
              onClick={() => onStartChat && onStartChat(item.giverId || 'user-sakura', item.giverName, item.giverAvatar || '', item)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-pink-200 bg-pink-50 text-pink-700 text-xs font-bold hover:bg-pink-100 transition-colors active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t.messageGiverBtn}</span>
            </button>

            {isClaimed ? (
              <button
                disabled
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-gray-300 text-gray-500 text-xs font-bold cursor-not-allowed"
              >
                {t.alreadyClaimedBtn}
              </button>
            ) : (
              <button
                onClick={() => onRequestClaim(item)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>{t.requestItemBtn}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
