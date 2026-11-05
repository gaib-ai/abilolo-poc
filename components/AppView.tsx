'use client';

import React, { useState, useEffect } from 'react';
import { Item, CommunityPost, UserProfile, ChatRoom, ChatMessage } from '@/lib/types';
import { CATEGORIES, PREFECTURES, INITIAL_ITEMS, DEMO_POSTS, DEMO_PROFILES, DEMO_CHAT_ROOMS, DEMO_CHAT_MESSAGES } from '@/lib/data';
import { Locale, DICTIONARY, ENGLISH_CATEGORIES, ENGLISH_PREFECTURES, ENGLISH_ITEMS } from '@/lib/i18n';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/is-configured';
import {
  fetchItemsFromSupabase,
  insertItemToSupabase,
  submitClaimToSupabase
} from '@/lib/supabase/items';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { ItemCard } from '@/components/ItemCard';
import { ItemModal } from '@/components/ItemModal';
import { ClaimModal } from '@/components/ClaimModal';
import { ListingModal } from '@/components/ListingModal';
import { AuthModal } from '@/components/AuthModal';
import { BottomNav } from '@/components/BottomNav';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { ProfileModal } from '@/components/ProfileModal';
import { CommunityFeed } from '@/components/CommunityFeed';
import { ChatDrawer } from '@/components/ChatDrawer';
import { MapView } from '@/components/MapView';
import { Filter, PackageOpen } from 'lucide-react';

interface AppViewProps {
  locale: Locale;
}

export const AppView: React.FC<AppViewProps> = ({ locale }) => {
  const t = DICTIONARY[locale];
  const initialData = locale === 'en' ? ENGLISH_ITEMS : INITIAL_ITEMS;
  const categoryList = locale === 'en' ? ENGLISH_CATEGORIES : CATEGORIES;
  const prefectureList = locale === 'en' ? ENGLISH_PREFECTURES : PREFECTURES;
  const storageKey = `abilolo_items_${locale}`;
  const postsKey = `abilolo_posts_${locale}`;
  const chatsKey = `abilolo_chats_${locale}`;
  const msgsKey = `abilolo_msgs_${locale}`;

  // Main active tab
  const [currentTab, setCurrentTab] = useState<'market' | 'map' | 'community'>('market');

  // Items State
  const [items, setItems] = useState<Item[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'claimed'>('all');

  // Social & Community State
  const [posts, setPosts] = useState<CommunityPost[]>(DEMO_POSTS);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(DEMO_PROFILES);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  // Chat State
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(DEMO_CHAT_ROOMS);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(DEMO_CHAT_MESSAGES);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Modals state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [claimingItem, setClaimingItem] = useState<Item | null>(null);
  const [isListingOpen, setIsListingOpen] = useState(false);

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    // 1. Items
    try {
      const savedItems = localStorage.getItem(storageKey);
      if (savedItems) setItems(JSON.parse(savedItems));
      
      const savedPosts = localStorage.getItem(postsKey);
      if (savedPosts) setPosts(JSON.parse(savedPosts));

      const savedRooms = localStorage.getItem(chatsKey);
      if (savedRooms) setChatRooms(JSON.parse(savedRooms));

      const savedMsgs = localStorage.getItem(msgsKey);
      if (savedMsgs) setChatMessages(JSON.parse(savedMsgs));
    } catch (e) {
      console.warn('Could not read localStorage', e);
    }

    // 2. Supabase live sync if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        supabase.auth.getUser().then((res: any) => {
          if (res?.data?.user) {
            setCurrentUser({ id: res.data.user.id, email: res.data.user.email });
          }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
          if (session?.user) {
            setCurrentUser({ id: session.user.id, email: session.user.email });
          } else {
            setCurrentUser(null);
          }
        });

        fetchItemsFromSupabase().then((remoteItems) => {
          if (remoteItems && remoteItems.length > 0) {
            setItems(remoteItems);
          }
        });

        return () => {
          authListener.subscription.unsubscribe();
        };
      }
    }
  }, [storageKey, postsKey, chatsKey, msgsKey]);

  const saveItems = (newItems: Item[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  const savePosts = (newPosts: CommunityPost[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem(postsKey, JSON.stringify(newPosts));
    } catch (e) {
      console.warn('Could not save posts', e);
    }
  };

  // Add new item
  const handleAddListing = async (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);

    if (isSupabaseConfigured()) {
      const persisted = await insertItemToSupabase(newItem, currentUser?.id);
      if (persisted) {
        setItems((prev) => [persisted, ...prev.filter((i) => i.id !== newItem.id)]);
        saveItems([persisted, ...items.filter((i) => i.id !== newItem.id)]);
      } else {
        saveItems([newItem, ...items]);
      }
    } else {
      saveItems([newItem, ...items]);
    }
  };

  // Claim item
  const handleConfirmClaim = async (
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

    if (isSupabaseConfigured()) {
      await submitClaimToSupabase(
        itemId,
        {
          name: recipientData.name,
          prefecture: recipientData.prefecture,
          postalCode: '000-0000',
          address: recipientData.address,
          phone: recipientData.phone
        },
        currentUser?.id
      );
    }
  };

  // Open profile modal
  const handleOpenProfile = (userId: string) => {
    const found = profiles[userId] || {
      id: userId,
      username: 'user_' + userId.slice(-4),
      displayName: '子育てユーザー 🌸',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      bio: '使わなくなったベビー服や知育玩具を大切にお譲りしています！',
      neighborhood: '東京都新宿区',
      prefecture: '東京都',
      babyStages: ['0-6ヶ月 (乳児)'],
      followerCount: 42,
      followingCount: 20,
      listedCount: 3,
      givenCount: 2,
      badges: ['認証ママ'],
      createdAt: '2026-10-01'
    };
    setActiveProfile(found);
  };

  // Start chat with user / about item
  const handleStartChat = (userId: string, userName: string, userAvatar: string, item?: Item) => {
    let room = chatRooms.find((r) => r.participant.id === userId);

    if (!room) {
      room = {
        id: `room-${Date.now()}`,
        participant: {
          id: userId,
          name: userName,
          avatar: userAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
          neighborhood: item?.neighborhood || '東京都新宿区'
        },
        itemId: item?.id,
        itemTitle: item?.title,
        itemImage: item?.images[0],
        lastMessage: item ? `${item.title} についての問い合わせ` : '新しいメッセージ',
        lastMessageAt: '今',
        unreadCount: 0
      };

      const updatedRooms = [room, ...chatRooms];
      setChatRooms(updatedRooms);
      try {
        localStorage.setItem(chatsKey, JSON.stringify(updatedRooms));
      } catch (e) {
        console.warn('save rooms', e);
      }
    }

    setActiveChatRoomId(room.id);
    setIsChatOpen(true);
  };

  // Send message
  const handleSendMessage = (roomId: string, content: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: 'me',
      senderName: 'あなた',
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    };

    const updated = {
      ...chatMessages,
      [roomId]: [...(chatMessages[roomId] || []), newMsg]
    };
    setChatMessages(updated);

    // Update room last message
    const updatedRooms = chatRooms.map((r) =>
      r.id === roomId
        ? { ...r, lastMessage: content, lastMessageAt: '今' }
        : r
    );
    setChatRooms(updatedRooms);

    try {
      localStorage.setItem(msgsKey, JSON.stringify(updated));
      localStorage.setItem(chatsKey, JSON.stringify(updatedRooms));
    } catch (e) {
      console.warn('save chat', e);
    }

    // Friendly auto-response simulation after 1.5s
    setTimeout(() => {
      const room = chatRooms.find((r) => r.id === roomId);
      if (room) {
        const replyMsg: ChatMessage = {
          id: `reply-${Date.now()}`,
          roomId,
          senderId: room.participant.id,
          senderName: room.participant.name,
          senderAvatar: room.participant.avatar,
          content: 'ご連絡ありがとうございます！着払いでの発送手続き、喜んで対応させていただきますね✨',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: false
        };

        setChatMessages((prev) => {
          const next = {
            ...prev,
            [roomId]: [...(prev[roomId] || []), replyMsg]
          };
          try {
            localStorage.setItem(msgsKey, JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }
    }, 1500);
  };

  // Add Community Post
  const handleAddPost = (newPostData: Omit<CommunityPost, 'id' | 'likes' | 'commentCount' | 'createdAt'>) => {
    const newPost: CommunityPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      likes: 1,
      isLiked: true,
      commentCount: 0,
      createdAt: '今日'
    };
    savePosts([newPost, ...posts]);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setCurrentUser(null);
  };

  // Filtering for Market catalog
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

  const totalUnreadChats = chatRooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900 selection:bg-pink-100 selection:text-pink-900 pb-28 sm:pb-32 md:pb-12">
      
      {/* Top Navigation */}
      <Navbar
        locale={locale}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        unreadChatCount={totalUnreadChats}
        onOpenListing={() => setIsListingOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenProfile={() => handleOpenProfile('user-sakura')}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* View Switcher: Market vs Map vs Community */}
      {currentTab === 'market' && (
        <>
          {/* Hero Header */}
          <HeroBanner locale={locale} onOpenListing={() => setIsListingOpen(true)} />

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
                {t.allCategory} ({items.length})
              </button>

              {categoryList.map((cat) => {
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
                  {t.filterLabel}
                </span>

                {/* Status Segmented Buttons */}
                <div className="inline-flex rounded-xl bg-gray-100 p-0.5 text-xs">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      statusFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {t.statusAll}
                  </button>
                  <button
                    onClick={() => setStatusFilter('available')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      statusFilter === 'available' ? 'bg-white text-pink-600 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {t.statusAvailable}
                  </button>
                  <button
                    onClick={() => setStatusFilter('claimed')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      statusFilter === 'claimed' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {t.statusClaimed}
                  </button>
                </div>

                {/* Prefecture Selector */}
                <select
                  value={selectedPrefecture}
                  onChange={(e) => setSelectedPrefecture(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                >
                  <option value="all">{t.prefectureAll}</option>
                  {prefectureList.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-gray-500 font-medium">
                {t.showingCount.replace('{count}', filteredItems.length.toString())}
              </div>
            </div>

            {/* Item Cards Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    locale={locale}
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
                  <h3 className="text-base font-bold text-gray-800">{t.noItemsTitle}</h3>
                  <p className="text-xs text-gray-400">
                    {t.noItemsDesc}
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
                  {t.resetFilters}
                </button>
              </div>
            )}

          </main>
        </>
      )}

      {currentTab === 'map' && (
        <MapView
          items={items}
          posts={posts}
          locale={locale}
          onSelectItem={(selected) => setSelectedItem(selected)}
          onOpenProfile={handleOpenProfile}
          onStartChat={handleStartChat}
        />
      )}

      {currentTab === 'community' && (
        <CommunityFeed
          posts={posts}
          locale={locale}
          onOpenProfile={handleOpenProfile}
          onOpenAuth={() => setIsAuthOpen(true)}
          onAddPost={handleAddPost}
        />
      )}

      {/* Footer */}
      {currentTab !== 'map' && (
        <footer className="bg-white border-t border-gray-100 py-10 mt-12 text-center text-xs text-gray-400 space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-gray-700 text-sm">
            <span>{t.siteTitle}</span>
            <span className="text-pink-500">🍼</span>
          </div>
          <p>{t.footerSubtitle}</p>
          <p className="text-[11px] text-gray-400 pt-2">
            {t.footerDisclaimer}
          </p>
        </footer>
      )}

      {/* Modals & Drawers */}
      <ItemModal
        item={selectedItem}
        locale={locale}
        onClose={() => setSelectedItem(null)}
        onRequestClaim={(item) => {
          setSelectedItem(null);
          setClaimingItem(item);
        }}
        onOpenProfile={handleOpenProfile}
        onStartChat={(userId, name, avatar, itm) => {
          setSelectedItem(null);
          handleStartChat(userId, name, avatar, itm);
        }}
      />

      <ClaimModal
        item={claimingItem}
        locale={locale}
        onClose={() => setClaimingItem(null)}
        onConfirmClaim={handleConfirmClaim}
      />

      <ListingModal
        isOpen={isListingOpen}
        locale={locale}
        currentUser={currentUser}
        onClose={() => setIsListingOpen(false)}
        onAddListing={handleAddListing}
      />

      <AuthModal
        isOpen={isAuthOpen}
        locale={locale}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userEmail) => {
          setCurrentUser({ email: userEmail });
        }}
      />

      {/* Instagram-style Profile Modal */}
      {activeProfile && (
        <ProfileModal
          profile={activeProfile}
          items={items}
          posts={posts}
          locale={locale}
          onClose={() => setActiveProfile(null)}
          onStartChat={(uid, uname, uavatar) => {
            setActiveProfile(null);
            handleStartChat(uid, uname, uavatar);
          }}
          onSelectItem={(itm) => {
            setActiveProfile(null);
            setSelectedItem(itm);
          }}
        />
      )}

      {/* Real-time Direct Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        activeRoomId={activeChatRoomId}
        rooms={chatRooms}
        messages={chatMessages}
        locale={locale}
        onClose={() => {
          setIsChatOpen(false);
          setActiveChatRoomId(null);
        }}
        onSendMessage={handleSendMessage}
        onSelectRoom={(rid) => setActiveChatRoomId(rid)}
        onOpenProfile={handleOpenProfile}
      />

      {/* PWA Mobile Navigation & Install Prompt */}
      <BottomNav
        locale={locale}
        currentTab={currentTab}
        unreadChatCount={totalUnreadChats}
        currentUser={currentUser}
        onSelectTab={setCurrentTab}
        onOpenListing={() => setIsListingOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenProfile={() => handleOpenProfile('user-sakura')}
      />

      <PwaInstallPrompt locale={locale} />

    </div>
  );
};
