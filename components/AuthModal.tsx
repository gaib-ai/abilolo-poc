'use client';

import React, { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/is-configured';
import { Locale } from '@/lib/i18n';
import { X, Mail, Lock, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  locale: Locale;
  onClose: () => void;
  onAuthSuccess?: (userEmail: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  locale,
  onClose,
  onAuthSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!isConfigured) {
      // Demo mock fallback if Supabase credentials are not set yet
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMessage({
          type: 'success',
          text: locale === 'en'
            ? 'Demo mode: Logged in successfully as ' + email
            : 'デモモード：' + email + ' としてログインしました'
        });
        if (onAuthSuccess) onAuthSuccess(email);
        setTimeout(onClose, 1200);
      }, 700);
      return;
    }

    setLoading(true);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({
        type: 'success',
        text: locale === 'en'
          ? 'Magic login link sent! Please check your email inbox to complete login.'
          : 'ログイン用の認証リンクをメールで送信しました。受信トレイをご確認ください。'
      });
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (!isConfigured) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMessage({
          type: 'success',
          text: locale === 'en' ? 'Demo mode login success' : 'デモモードでログインしました'
        });
        if (onAuthSuccess) onAuthSuccess(email);
        setTimeout(onClose, 1000);
      }, 700);
      return;
    }

    setLoading(true);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      setLoading(false);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: locale === 'en'
            ? 'Account created! Please check your email for the confirmation link.'
            : 'アカウントを登録しました！確認メール内のリンクをクリックしてください。'
        });
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      setLoading(false);
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: locale === 'en' ? 'Login successful!' : 'ログインしました！'
        });
        if (onAuthSuccess && data.user?.email) onAuthSuccess(data.user.email);
        setTimeout(onClose, 800);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative my-8 p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white mx-auto shadow-sm shadow-pink-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-gray-900">
            {locale === 'en' ? 'Welcome to Abilolo' : 'Abiloloへようこそ'}
          </h3>
          <p className="text-xs text-gray-500">
            {locale === 'en'
              ? 'Sign in to list items and request zero-cost baby goods'
              : '出品やお譲り申請を安全に行うためのアカウント認証'}
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs mb-4 flex items-start gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <p className="leading-snug">{message.text}</p>
          </div>
        )}

        {/* Form */}
        {!isPasswordMode ? (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {locale === 'en' ? 'Email Address' : 'メールアドレス'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>
                  {locale === 'en' ? 'Send Magic Login Link' : '認証リンクを送信 (パスワード不要)'}
                </span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsPasswordMode(true)}
                className="text-[11px] text-gray-500 hover:text-pink-600 font-medium"
              >
                {locale === 'en' ? 'Use password instead' : 'パスワードでログイン・登録する'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {locale === 'en' ? 'Email Address' : 'メールアドレス'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {locale === 'en' ? 'Password' : 'パスワード'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-xs text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>
                  {isSignUp
                    ? (locale === 'en' ? 'Create Account' : '新規アカウント登録')
                    : (locale === 'en' ? 'Log In' : 'ログイン')}
                </span>
              )}
            </button>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 font-medium">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="hover:text-pink-600 text-pink-700"
              >
                {isSignUp
                  ? (locale === 'en' ? 'Already have an account? Log in' : '登録済みの方はこちら')
                  : (locale === 'en' ? 'New user? Register' : '新規アカウント作成')}
              </button>

              <button
                type="button"
                onClick={() => setIsPasswordMode(false)}
                className="hover:text-gray-800"
              >
                {locale === 'en' ? 'Magic link' : '認証リンク式に戻す'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
