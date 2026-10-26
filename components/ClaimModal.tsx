'use client';

import React, { useState } from 'react';
import { Item } from '@/lib/types';
import { X, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';

interface ClaimModalProps {
  item: Item | null;
  onClose: () => void;
  onConfirmClaim: (itemId: string, recipientData: { name: string; prefecture: string; address: string; phone: string }) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  onClose,
  onConfirmClaim
}) => {
  const [name, setName] = useState('');
  const [prefecture, setPrefecture] = useState('東京都');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmClaim(item.id, {
        name: name || 'テスト希望者',
        prefecture,
        address,
        phone
      });
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative my-8 p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">マッチングが成立しました！</h3>
              <p className="text-xs text-gray-500">
                出品者へ配送先情報が共有されました。発送準備をお待ちください。
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl text-left text-xs space-y-1 border border-gray-100">
              <div className="text-gray-400 font-medium">お譲り品:</div>
              <div className="font-bold text-gray-800">{item.title}</div>
              <div className="text-pink-600 font-semibold pt-1">
                着払い想定送料: {item.estimatedShippingFee || '約1,000円〜'}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
            >
              トップへ戻る
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-[11px] font-bold text-pink-600 tracking-wide block uppercase">
                お譲り希望の申請 (受取人情報入力)
              </span>
              <h3 className="text-lg font-black text-gray-900 leading-snug mt-1">
                {item.title}
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">お名前 (受取人氏名) *</label>
                <input
                  required
                  type="text"
                  placeholder="例: 山田 花子"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">都道府県 *</label>
                  <select
                    value={prefecture}
                    onChange={(e) => setPrefecture(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900 font-medium"
                  >
                    <option value="東京都">東京都</option>
                    <option value="神奈川県">神奈川県</option>
                    <option value="埼玉県">埼玉県</option>
                    <option value="千葉県">千葉県</option>
                    <option value="大阪府">大阪府</option>
                    <option value="愛知県">愛知県</option>
                    <option value="福岡県">福岡県</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">郵便番号 *</label>
                  <input
                    required
                    type="text"
                    placeholder="例: 150-0001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">市区町村・番地・建物名 *</label>
                <input
                  required
                  type="text"
                  placeholder="例: 渋谷区神宮前1-2-3 ○○マンション101"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">連絡先電話番号 *</label>
                <input
                  required
                  type="tel"
                  placeholder="例: 090-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900"
                />
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-pink-50/60 border border-pink-100 hover:bg-pink-50 transition-colors">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-pink-600 focus:ring-pink-500 h-4 w-4"
                />
                <span className="text-[11px] text-gray-700 leading-snug">
                  <span className="font-bold text-pink-900">【着払い送料自己負担への同意】</span>
                  <br />
                  商品代金は0円ですが、配達時に配送ドライバー（ヤマト運輸・日本郵便等）へ着払い送料を直接支払うことに同意します。
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreed || isSubmitting}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold text-sm shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>マッチング処理中...</span>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>この内容でお譲り希望を確定する (¥0)</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
