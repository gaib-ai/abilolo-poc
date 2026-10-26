'use client';

import React, { useState, useEffect } from 'react';
import { Item } from '@/lib/types';
import { CATEGORIES, PREFECTURES, INITIAL_ITEMS } from '@/lib/data';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { ItemCard } from '@/components/ItemCard';
import { ItemModal } from '@/components/ItemModal';
import { ClaimModal } from '@/components/ClaimModal';
import { ListingModal } from '@/components/ListingModal';
import { Filter, PackageOpen } from 'lucide-react';

export default function Home() {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'claimed'>('all');

  // Modals state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [claimingItem, setClaimingItem] = useState<Item | null>(null);
  const [isListingOpen, setIsListingOpen] = useState(false);

  // Load / Sync with localStorage for interactive demo persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem('abilolo_items');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read localStorage', e);
    }
  }, []);

  const saveItems = (newItems: Item[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('abilolo_items', JSON.stringify(newItems));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  // Add new item
  const handleAddListing = (newItem: Item) => {
    const updated = [newItem, ...items];
    saveItems(updated);
  };

  // Claim item
  const handleConfirmClaim = (
    itemId: string,
    recipientData: { name: string; prefecture: string; address: string; phone: string }
  ) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'claimed' as const,
          claimedBy: {
            name: recipientData.name,
            prefecture: recipientData.prefecture,
            claimedAt: new Date().toISOString().split('T')[0]
          }
        };
      }
      return item;
    });
    saveItems(updated);

    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem({
        ...selectedItem,
        status: 'claimed',
        claimedBy: {
          name: recipientData.name,
          prefecture: recipientData.prefecture,
          claimedAt: new Date().toISOString().split('T')[0]
        }
      });
    }
  };

  // Filtering
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchesPrefecture =
      selectedPrefecture === 'all' || item.location === selectedPrefecture;

    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPrefecture && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900 selection:bg-pink-100 selection:text-pink-900">
      
      {/* Top Navigation */}
      <Navbar
        onOpenListing={() => setIsListingOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Header with Value Proposition & 3 Steps */}
      <HeroBanner onOpenListing={() => setIsListingOpen(true)} />

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:bg-pink-50/40'
            }`}
          >
            すべて ({items.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-pink-600 text-white shadow-sm shadow-pink-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:bg-pink-50/40'
                }`}
              >
                {cat.name} {count > 0 && <span className="opacity-70 text-[10px] ml-1">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-2xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              絞り込み:
            </span>

            {/* Status Segmented Buttons */}
            <div className="inline-flex rounded-xl bg-gray-100 p-0.5 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                全件
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === 'available' ? 'bg-white text-pink-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                受付中のみ
              </button>
              <button
                onClick={() => setStatusFilter('claimed')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === 'claimed' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                成立済
              </button>
            </div>

            {/* Prefecture Selector */}
            <select
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              <option value="all">全国 (都道府県指定なし)</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            表示中: <strong className="text-gray-900">{filteredItems.length}</strong> 件
          </div>
        </div>

        {/* Item Cards Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={(selected) => setSelectedItem(selected)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
              <PackageOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">条件に一致するお譲り品がありません</h3>
              <p className="text-xs text-gray-400">
                検索キーワードや絞り込み条件を変更してお試しください。
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPrefecture('all');
                setStatusFilter('all');
              }}
              className="text-xs text-pink-600 font-bold hover:underline"
            >
              すべての条件をリセット
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 mt-12 text-center text-xs text-gray-400 space-y-2">
        <div className="flex items-center justify-center gap-2 font-bold text-gray-700 text-sm">
          <span>Abilolo (アビロロ)</span>
          <span className="text-pink-500">🍼</span>
        </div>
        <p>日本発・ベビー＆キッズ用品 0円お譲りマッチングプラットフォーム (POC)</p>
        <p className="text-[11px] text-gray-400 pt-2">
          ※本サイトはステークホルダー向け実証検証用 (POC) プロトタイプです。金銭売買は行われません。
        </p>
      </footer>

      {/* Modals */}
      <ItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onRequestClaim={(item) => {
          setSelectedItem(null);
          setClaimingItem(item);
        }}
      />

      <ClaimModal
        item={claimingItem}
        onClose={() => setClaimingItem(null)}
        onConfirmClaim={handleConfirmClaim}
      />

      <ListingModal
        isOpen={isListingOpen}
        onClose={() => setIsListingOpen(false)}
        onAddListing={handleAddListing}
      />

    </div>
  );
}
