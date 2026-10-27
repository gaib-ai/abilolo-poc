'use client';

import React, { useState, useRef } from 'react';
import { Item, ItemCondition, AiExtractionResult } from '@/lib/types';
import { CATEGORIES, PREFECTURES, DEMO_PRESET_IMAGES } from '@/lib/data';
import { Locale, DICTIONARY, ENGLISH_CATEGORIES, ENGLISH_PREFECTURES } from '@/lib/i18n';
import { compressImage } from '@/lib/image-utils';
import { uploadItemImageToStorage } from '@/lib/supabase/items';
import { X, Camera, Upload, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

interface ListingModalProps {
  isOpen: boolean;
  locale: Locale;
  currentUser?: { id?: string; email?: string } | null;
  onClose: () => void;
  onAddListing: (newItem: Item) => void;
}

export const ListingModal: React.FC<ListingModalProps> = ({
  isOpen,
  locale,
  currentUser,
  onClose,
  onAddListing
}) => {
  const t = DICTIONARY[locale];
  const categoryList = locale === 'en' ? ENGLISH_CATEGORIES : CATEGORIES;
  const prefectureList = locale === 'en' ? ENGLISH_PREFECTURES : PREFECTURES;

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('photo.jpg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiSuccess, setAiSuccess] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categoryList[0].name);
  const [condition, setCondition] = useState<ItemCondition>('目立った傷や汚れなし');
  const [targetAge, setTargetAge] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(locale === 'en' ? 'Tokyo' : '東京都');
  const [shippingMethod, setShippingMethod] = useState(
    locale === 'en' ? 'COD (Yamato Transport 100 Size)' : '着払い (ヤマト宅急便 100サイズ想定)'
  );
  const [estimatedShippingFee, setEstimatedShippingFee] = useState(
    locale === 'en' ? 'Approx. ¥1,200 ~ ¥1,500' : '約 1,200円〜1,500円'
  );
  const [giverName, setGiverName] = useState(
    currentUser?.email ? currentUser.email.split('@')[0] : (locale === 'en' ? 'Parent User' : 'ママユーザー')
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process image with AI API
  const handleAnalyzeImage = async (imgUrlOrBase64: string, presetData?: AiExtractionResult) => {
    setSelectedImage(imgUrlOrBase64);
    setIsAnalyzing(true);
    setAiSuccess(false);

    try {
      if (presetData) {
        // Fast path for preset samples
        await new Promise((r) => setTimeout(r, 900));
        applyAiResult(presetData);
      } else {
        const res = await fetch('/api/ai/describe-item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: imgUrlOrBase64.startsWith('http') ? imgUrlOrBase64 : undefined,
            imageBase64: imgUrlOrBase64.startsWith('data:') ? imgUrlOrBase64 : undefined,
            locale
          })
        });

        if (!res.ok) throw new Error('AI analysis failed');
        const data: AiExtractionResult = await res.json();
        applyAiResult(data);
      }
    } catch (err) {
      console.error(err);
      setTitle(locale === 'en' ? 'Baby Gear (AI Extracted)' : 'ベビー用品 (AI解析)');
      setDescription(
        locale === 'en'
          ? 'Minor scuffs from regular use, but in great working condition.'
          : '使用に伴う軽微な小傷はありますが、問題なくご使用いただけます。'
      );
    } finally {
      setIsAnalyzing(false);
      setAiSuccess(true);
    }
  };

  const applyAiResult = (data: AiExtractionResult) => {
    setTitle(data.title || '');
    if (data.category) setCategory(data.category);
    if (data.condition) setCondition(data.condition);
    if (data.targetAge) setTargetAge(data.targetAge);
    if (data.description) setDescription(data.description);
    if (data.estimatedShippingMethod) {
      setShippingMethod(data.estimatedShippingMethod);
      setEstimatedShippingFee(locale === 'en' ? 'Approx. ¥1,000 ~ ¥1,600 (COD)' : '約 1,000円〜1,600円 (着払い)');
    }
  };

  // Client-side downscaling and compression before upload
  const processAndCompressFile = async (file: File) => {
    try {
      setIsAnalyzing(true);
      const { base64, blob } = await compressImage(file, 1200, 1200, 0.8);
      setImageBlob(blob);
      setImageFileName(file.name);
      await handleAnalyzeImage(base64);
    } catch (err) {
      console.warn('Canvas compression error, reading raw file:', err);
      const reader = new FileReader();
      reader.onload = () => {
        handleAnalyzeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndCompressFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !title) return;

    let finalImageUrl = selectedImage;

    // If Supabase Storage is ready and we have the blob, upload to permanent storage
    if (imageBlob) {
      try {
        const uploadedUrl = await uploadItemImageToStorage(imageBlob, imageFileName);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload skipped/failed:', err);
      }
    }

    const newItem: Item = {
      id: `item-${Date.now()}`,
      title,
      category,
      condition,
      targetAge: targetAge || (locale === 'en' ? '0 to 3 years' : '0〜3歳頃'),
      description,
      images: [finalImageUrl],
      location,
      shippingMethod,
      estimatedShippingFee,
      giverName: giverName || (locale === 'en' ? 'Giver' : '出品者'),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'available',
      views: 1,
      likes: 0
    };

    onAddListing(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative my-8 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">{t.listingModalTitle}</h3>
              <p className="text-[11px] text-gray-500">{t.listingModalDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">

          {/* Image Upload Area */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700">
              {locale === 'en' ? 'Baby Goods Photo ' : '出品するベビー用品の写真 '}
              <span className="text-pink-600">*</span>
            </label>

            {selectedImage ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-pink-200 bg-gray-50 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                
                {/* Re-upload overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white text-gray-800 text-xs font-bold rounded-full shadow-md hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{t.changePhoto}</span>
                  </button>
                </div>

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold tracking-wide">{t.analyzingAiTitle}</p>
                      <p className="text-[11px] text-pink-200">{t.analyzingAiDesc}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Camera Trigger */}
                <div
                  onClick={() => cameraInputRef.current?.click()}
                  className="border-2 border-dashed border-pink-300 hover:border-pink-500 bg-pink-50/40 hover:bg-pink-50/80 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-pink-600 flex items-center justify-center mx-auto border border-pink-100 group-hover:scale-105 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      {locale === 'en' ? 'Take Photo with Camera' : 'カメラで今すぐ撮影'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {locale === 'en' ? 'Direct mobile camera' : 'スマホの背面カメラを起動'}
                    </p>
                  </div>
                </div>

                {/* File Picker */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-pink-300 bg-gray-50/50 hover:bg-pink-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-gray-600 flex items-center justify-center mx-auto border border-gray-100 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      {locale === 'en' ? 'Choose from Gallery' : 'アルバムから選択'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t.uploadFormats}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden Input: Generic Album */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Hidden Input: Native Mobile Rear Camera */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Quick Demo Preset Selector for Stakeholder Walkthrough */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-gray-500 block mb-2">
                {t.samplePhotoPrompt}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DEMO_PRESET_IMAGES.map((preset, idx) => {
                  const label = locale === 'en'
                    ? ['Stroller (Combi)', 'Carrier (Ergobaby)', 'Wooden Toy', 'Baby Romper Set'][idx] || preset.label
                    : preset.label;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAnalyzeImage(preset.url, preset.mockResult)}
                      className="p-2 rounded-xl border border-gray-200 hover:border-pink-400 hover:bg-pink-50/40 text-left transition-all flex items-center gap-2 group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.url}
                        alt={label}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-[11px] font-medium text-gray-700 truncate group-hover:text-pink-600">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Success Banner */}
          {aiSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.aiSuccessNotice}</span>
            </div>
          )}

          {/* Form Fields */}
          <form id="listing-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Title */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">{t.fieldTitle}</label>
              <input
                required
                type="text"
                placeholder={locale === 'en' ? 'Auto-generated by AI (editable)' : 'AIが自動生成します（手動編集も可能）'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900 font-medium"
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">{t.fieldCategory}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900 font-medium"
                >
                  {categoryList.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">{t.fieldCondition}</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ItemCondition)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900 font-medium"
                >
                  <option value="新品・未使用">{locale === 'en' ? 'Brand New' : '新品・未使用'}</option>
                  <option value="未使用に近い">{locale === 'en' ? 'Like New' : '未使用に近い'}</option>
                  <option value="目立った傷や汚れなし">{locale === 'en' ? 'Gently Used' : '目立った傷や汚れなし'}</option>
                  <option value="やや傷や汚れあり">{locale === 'en' ? 'Fair / Minor Marks' : 'やや傷や汚れあり'}</option>
                </select>
              </div>
            </div>

            {/* Target Age */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">{t.fieldAge}</label>
              <input
                type="text"
                placeholder={locale === 'en' ? 'e.g. 1 to 3 years old, up to 15kg' : '例: 生後1ヶ月〜3歳頃、体重15kgまで'}
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">{t.fieldDescription}</label>
              <textarea
                rows={3}
                placeholder={locale === 'en' ? 'Key features, cleanliness, material' : '商品の使用頻度やおすすめポイント'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900 leading-relaxed"
              />
            </div>

            {/* Location & Shipping Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">{t.fieldLocation}</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900 font-medium"
                >
                  {prefectureList.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">{t.fieldShipping}</label>
                <input
                  type="text"
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-900"
                />
              </div>
            </div>

          </form>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
          >
            {t.cancelBtn}
          </button>

          <button
            form="listing-form"
            type="submit"
            disabled={!selectedImage || !title || isAnalyzing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 text-white text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>{t.submitListingBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
