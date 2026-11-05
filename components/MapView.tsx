'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Item, CommunityPost } from '@/lib/types';
import { Locale, DICTIONARY } from '@/lib/i18n';
import { TOKYO_LOCATIONS } from '@/lib/data';
import { MapPin, Package, MessageSquare, Navigation, Layers, ChevronRight, X, ExternalLink } from 'lucide-react';

interface MapViewProps {
  items: Item[];
  posts: CommunityPost[];
  locale: Locale;
  onSelectItem: (item: Item) => void;
  onOpenProfile: (userId: string) => void;
  onStartChat: (userId: string, userName: string, userAvatar: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  items,
  posts,
  locale,
  onSelectItem,
  onOpenProfile,
  onStartChat
}) => {
  const t = DICTIONARY[locale];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [filterType, setFilterType] = useState<'all' | 'items' | 'posts'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<Item | null>(null);
  const [activePost, setActivePost] = useState<CommunityPost | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Add Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Check if map already initialized on this container
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Tokyo central coordinates
      const map = L.map(mapContainerRef.current, {
        center: [35.6895, 139.6917],
        zoom: 12,
        zoomControl: false
      });

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers whenever filter, items, or posts change
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const bounds = L.latLngBounds([]);

      // Add Item Markers
      if (filterType === 'all' || filterType === 'items') {
        items.forEach((item) => {
          if (item.latitude && item.longitude) {
            const itemIcon = L.divIcon({
              className: 'custom-map-marker',
              html: `
                <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 4px 8px; border-radius: 9999px; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(236,72,153,0.4); border: 2px solid white; cursor: pointer; white-space: nowrap; transform: translate(-50%, -100%);">
                  <span>🎁</span>
                  <span>¥0</span>
                </div>
              `,
              iconSize: [40, 24],
              iconAnchor: [20, 24]
            });

            const marker = L.marker([item.latitude, item.longitude], { icon: itemIcon }).addTo(map);
            marker.on('click', () => {
              setActiveItem(item);
              setActivePost(null);
            });
            markersRef.current.push(marker);
            bounds.extend([item.latitude, item.longitude]);
          }
        });
      }

      // Add Post Markers
      if (filterType === 'all' || filterType === 'posts') {
        posts.forEach((post) => {
          if (post.latitude && post.longitude) {
            const postIcon = L.divIcon({
              className: 'custom-map-marker',
              html: `
                <div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 9999px; font-weight: 800; font-size: 11px; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(16,185,129,0.35); border: 2px solid white; cursor: pointer; white-space: nowrap; transform: translate(-50%, -100%);">
                  <span>💬</span>
                  <span>Tips</span>
                </div>
              `,
              iconSize: [45, 24],
              iconAnchor: [22, 24]
            });

            const marker = L.marker([post.latitude, post.longitude], { icon: postIcon }).addTo(map);
            marker.on('click', () => {
              setActivePost(post);
              setActiveItem(null);
            });
            markersRef.current.push(marker);
            bounds.extend([post.latitude, post.longitude]);
          }
        });
      }
    });
  }, [isMapReady, filterType, items, posts]);

  // Handle flying to a specific ward area
  const handleFlyToArea = (areaName: string, lat?: number, lng?: number) => {
    setSelectedArea(areaName);
    if (!mapInstanceRef.current) return;

    if (lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo([35.6895, 139.6917], 12, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-68px)] sm:h-[calc(100vh-80px)] overflow-hidden flex flex-col">
      
      {/* Top Floating Filter & Area Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2 max-w-xl mx-auto pointer-events-none">
        
        {/* Filter Pills (Items vs Posts) */}
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.mapFilterAll}
            </button>
            <button
              onClick={() => setFilterType('items')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterType === 'items'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>🎁</span>
              <span>{t.mapFilterItems}</span>
            </button>
            <button
              onClick={() => setFilterType('posts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterType === 'posts'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>💬</span>
              <span>{t.mapFilterCommunity}</span>
            </button>
          </div>

          <div className="text-[10px] text-gray-400 font-bold px-2 hidden sm:block">
            {items.length + posts.length} 地点のピン
          </div>
        </div>

        {/* Quick Area Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
          <button
            onClick={() => handleFlyToArea('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all shadow-xs ${
              selectedArea === 'all'
                ? 'bg-pink-600 text-white border border-pink-700'
                : 'bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white border border-gray-200'
            }`}
          >
            東京全体
          </button>
          {TOKYO_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => handleFlyToArea(loc.name, loc.lat, loc.lng)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all shadow-xs ${
                selectedArea === loc.name
                  ? 'bg-pink-600 text-white border border-pink-700'
                  : 'bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white border border-gray-200'
              }`}
            >
              {loc.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#e5e3df]" />

      {/* Bottom Preview Drawer: Selected Item */}
      {activeItem && (
        <div className="absolute bottom-6 left-4 right-4 z-20 max-w-lg mx-auto animate-slideUp">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-pink-100 flex items-center gap-4 relative">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-md hover:bg-black transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <img
              src={activeItem.images[0]}
              alt={activeItem.title}
              className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-sm cursor-pointer"
              onClick={() => onSelectItem(activeItem)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  ¥0 お譲り
                </span>
                <span className="text-[10px] text-gray-400 truncate">
                  📍 {activeItem.neighborhood}
                </span>
              </div>
              <h4
                onClick={() => onSelectItem(activeItem)}
                className="text-xs font-black text-gray-900 truncate mt-1 cursor-pointer hover:text-pink-600 transition-colors"
              >
                {activeItem.title}
              </h4>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                {activeItem.shippingMethod}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => onSelectItem(activeItem)}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 transition-all active:scale-95 flex items-center gap-1"
                >
                  詳細を見る
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onStartChat(activeItem.giverId || 'user-sakura', activeItem.giverName, activeItem.giverAvatar || '')}
                  className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs hover:opacity-95 transition-all active:scale-95"
                >
                  チャットで相談
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Preview Drawer: Selected Post */}
      {activePost && (
        <div className="absolute bottom-6 left-4 right-4 z-20 max-w-lg mx-auto animate-slideUp">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-emerald-100 relative">
            <button
              onClick={() => setActivePost(null)}
              className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-md hover:bg-black transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <img
                src={activePost.authorAvatar}
                alt={activePost.authorName}
                className="w-10 h-10 rounded-full object-cover border border-emerald-200 cursor-pointer"
                onClick={() => onOpenProfile(activePost.userId)}
              />
              <div className="flex-1 min-w-0">
                <h4
                  onClick={() => onOpenProfile(activePost.userId)}
                  className="text-xs font-black text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors"
                >
                  {activePost.authorName}
                </h4>
                <p className="text-[10px] text-gray-400">
                  📍 {activePost.neighborhood} · {activePost.createdAt}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activePost.category === 'tip' ? '💡 育児Tips' : '🎁 リクエスト'}
              </span>
            </div>
            <p className="text-xs text-gray-800 line-clamp-2 leading-relaxed">
              {activePost.content}
            </p>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-400 text-[11px]">❤️ {activePost.likes} いいね</span>
              <button
                onClick={() => onOpenProfile(activePost.userId)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                プロフィールを見る
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
