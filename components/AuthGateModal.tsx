'use client';

import React from 'react';
import { Locale, DICTIONARY } from '@/lib/i18n';
import { X, MessageSquare, User, Lock, CheckCircle2, ArrowRight, Users, MessageCircle, HeartHandshake } from 'lucide-react';

export type AuthGateTarget = 'messages' | 'profile' | 'post' | 'comment' | 'claim' | 'general';

interface AuthGateModalProps {
  isOpen: boolean;
  target: AuthGateTarget;
  locale: Locale;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  target,
  locale,
  onClose,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  const t = DICTIONARY[locale];

  let title = t.authGateTitleMessages;
  let description = t.authGateDescMessages;
  let benefits = [t.authGateBenefit1Messages, t.authGateBenefit2Messages, t.authGateBenefit3Messages];
  let IconComponent = MessageSquare;

  if (target === 'profile') {
    title = t.authGateTitleProfile;
    description = t.authGateDescProfile;
    benefits = [t.authGateBenefit1Profile, t.authGateBenefit2Profile, t.authGateBenefit3Profile];
    IconComponent = User;
  } else if (target === 'post') {
    title = t.authGateTitlePost;
    description = t.authGateDescPost;
    benefits = [t.authGateBenefit1Post, t.authGateBenefit2Post, t.authGateBenefit3Post];
    IconComponent = Users;
  } else if (target === 'comment') {
    title = t.authGateTitleComment;
    description = t.authGateDescComment;
    benefits = [t.authGateBenefit1Comment, t.authGateBenefit2Comment, t.authGateBenefit3Comment];
    IconComponent = MessageCircle;
  } else if (target === 'claim') {
    title = t.authGateTitleClaim;
    description = t.authGateDescClaim;
    benefits = [t.authGateBenefit1Claim, t.authGateBenefit2Claim, t.authGateBenefit3Claim];
    IconComponent = HeartHandshake;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Category Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" />
              <span>{locale === 'en' ? 'Account Required' : 'ログインが必要です'}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 mt-0.5 leading-snug">
              {title}
            </h3>
          </div>
        </div>

        {/* Friendly explanation */}
        <p className="text-xs text-gray-600 leading-relaxed mb-4 whitespace-pre-line bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
          {description}
        </p>

        {/* Benefits List */}
        <div className="space-y-2 mb-6">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {locale === 'en' ? 'Features unlocked with free account:' : 'アカウント作成で利用できる機能:'}
          </p>
          {benefits.map((b, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:opacity-95 text-white shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span>{t.authGateLoginBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
          >
            {t.authGateBrowseBtn}
          </button>
        </div>

        {/* Gentle note */}
        <p className="text-[10px] text-gray-400 text-center mt-3">
          {locale === 'en'
            ? '※ Browsing items, map and community feed remains free without login'
            : '※ お譲り品の閲覧・近所マップ・子育て掲示板はログインなしでも自由にご覧いただけます'}
        </p>
      </div>
    </div>
  );
};
