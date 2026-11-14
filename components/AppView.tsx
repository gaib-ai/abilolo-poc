'use client';

import React, { useState, useEffect } from 'react';
import { Item, CommunityPost, UserProfile, ChatRoom, ChatMessage, ItemComment, PostComment } from '@/lib/types';
import { CATEGORIES, PREFECTURES, INITIAL_ITEMS, DEMO_POSTS, DEMO_PROFILES, DEMO_CHAT_ROOMS, DEMO_CHAT_MESSAGES, DEMO_ITEM_COMMENTS, DEMO_POST_COMMENTS, DEFAULT_AVATAR_URL } from '@/lib/data';
import { Locale, DICTIONARY, ENGLISH_CATEGORIES, ENGLISH_PREFECTURES, ENGLISH_ITEMS, ENGLISH_CHAT_ROOMS, ENGLISH_CHAT_MESSAGES } from '@/lib/i18n';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/is-configured';
import {
  fetchItemsFromSupabase,
  insertItemToSupabase,
  submitClaimToSupabase
} from '@/lib/supabase/items';
import {
  fetchCommunityPostsFromSupabase,
  insertCommunityPostToSupabase,
  fetchPostCommentsFromSupabase,
  insertPostCommentToSupabase
} from '@/lib/supabase/posts';
import {
  fetchUserProfileFromSupabase,
  upsertUserProfileToSupabase
} from '@/lib/supabase/profiles';
import {
  fetchChatRoomsFromSupabase,
  fetchChatMessagesFromSupabase,
  insertChatMessageToSupabase,
  markChatRoomAsReadInSupabase
} from '@/lib/supabase/chats';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { ItemCard } from '@/components/ItemCard';
import { ItemModal } from '@/components/ItemModal';
import { ClaimModal } from '@/components/ClaimModal';
import { ListingModal } from '@/components/ListingModal';
import { AuthModal } from '@/components/AuthModal';
import { AuthGateModal, AuthGateTarget } from '@/components/AuthGateModal';
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
  const initialChatRooms = locale === 'en' ? ENGLISH_CHAT_ROOMS : DEMO_CHAT_ROOMS;
  const initialChatMessages = locale === 'en' ? ENGLISH_CHAT_MESSAGES : DEMO_CHAT_MESSAGES;
  const storageKey = `abilolo_items_${locale}`;

  // Main active tab
  const [currentTab, setCurrentTab] = useState<'market' | 'map' | 'community'>('market');

  // Items State (Full remote persistence)
  const [items, setItems] = useState<Item[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'claimed'>('all');

  // Social & Community State (Full remote persistence)
  const [posts, setPosts] = useState<CommunityPost[]>(DEMO_POSTS);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(DEMO_PROFILES);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [itemComments, setItemComments] = useState<Record<string, ItemComment[]>>(DEMO_ITEM_COMMENTS);
  const [postComments, setPostComments] = useState<Record<string, PostComment[]>>(DEMO_POST_COMMENTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Chat State (Full remote persistence + Realtime)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(initialChatRooms);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(initialChatMessages);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authGateReason, setAuthGateReason] = useState<AuthGateTarget | null>(null);
  const [pendingGatedAction, setPendingGatedAction] = useState<AuthGateTarget | null>(null);

  // Sync / create real user profile synchronously in state + async in Supabase
  const syncCurrentUserProfile = (user: { id?: string; email?: string }) => {
    if (!user.id) return;
    const uid = user.id;
    const emailPrefix = user.email ? user.email.split('@')[0] : 'user';
    const cleanUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_') || `user_${uid.slice(0, 5)}`;

    if (typeof window !== 'undefined') {
      localStorage.setItem('abilolo_auth_user', JSON.stringify(user));
    }

    // 1. Try loading cached profile from localStorage
    let loaded: UserProfile | null = null;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`abilolo_profile_${uid}`);
      if (saved) {
        try {
          loaded = JSON.parse(saved);
          if (loaded && (loaded.avatarUrl?.includes('photo-1544005313-94ddf0286df2') || !loaded.avatarUrl)) {
            loaded.avatarUrl = DEFAULT_AVATAR_URL;
            localStorage.setItem(`abilolo_profile_${uid}`, JSON.stringify(loaded));
          }
        } catch (e) {
          console.warn('Failed to parse cached profile:', e);
        }
      }
    }

    // 2. Initialize real profile from user's email
    if (!loaded) {
      loaded = {
        id: uid,
        username: cleanUsername,
        displayName: emailPrefix || (locale === 'en' ? 'Parent User' : 'マイアカウント'),
        avatarUrl: DEFAULT_AVATAR_URL,
        bio: locale === 'en'
          ? 'Sharing outgrown baby & kids supplies with local families in Tokyo!'
          : '都内在住。使わなくなった子ども用品を大切に次のご家族へ0円でお譲りしています✨',
        neighborhood: '東京都新宿区',
        prefecture: '東京都',
        babyStages: ['0-6ヶ月 (乳児)'],
        followerCount: 0,
        followingCount: 0,
        isFollowing: false,
        listedCount: 0,
        givenCount: 0,
        badges: ['認証アカウント', '登録メンバー'],
        createdAt: new Date().toISOString().split('T')[0]
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`abilolo_profile_${uid}`, JSON.stringify(loaded));
      }
    }

    setProfiles((prev) => ({
      ...prev,
      [uid]: loaded!,
      'user-me': loaded!
    }));

    // 3. Background remote Supabase sync
    if (isSupabaseConfigured()) {
      fetchUserProfileFromSupabase(uid).then((remote) => {
        if (remote) {
          setProfiles((prev) => ({
            ...prev,
            [uid]: remote,
            'user-me': remote
          }));
        } else {
          upsertUserProfileToSupabase(uid, loaded!);
        }
      });
    }

    return loaded!;
  };

  // Modals state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [claimingItem, setClaimingItem] = useState<Item | null>(null);
  const [isListingOpen, setIsListingOpen] = useState(false);

  // 1. Initial Load & Realtime Subscriptions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('abilolo_auth_user');
        if (saved) {
          const u = JSON.parse(saved);
          setCurrentUser(u);
          syncCurrentUserProfile(u);
        }
      } catch (e) {}
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        // Auth check
        supabase.auth.getUser().then((res: any) => {
          if (res?.data?.user) {
            const u = { id: res.data.user.id, email: res.data.user.email };
            setCurrentUser(u);
            syncCurrentUserProfile(u);
          }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
          if (session?.user) {
            const u = { id: session.user.id, email: session.user.email };
            setCurrentUser(u);
            syncCurrentUserProfile(u);
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('abilolo_auth_user');
            }
          }
        });

        // 1. Fetch real items from remote Supabase DB
        fetchItemsFromSupabase().then((remoteItems) => {
          if (remoteItems && remoteItems.length > 0) {
            setItems(remoteItems);
          }
        });

        // 2. Fetch real community posts from remote Supabase DB & their comments
        fetchCommunityPostsFromSupabase().then((remotePosts) => {
          if (remotePosts && remotePosts.length > 0) {
            setPosts(remotePosts);
            remotePosts.forEach((p) => {
              fetchPostCommentsFromSupabase(p.id).then((cList) => {
                if (cList && cList.length > 0) {
                  setPostComments((prev) => ({
                    ...prev,
                    [p.id]: cList
                  }));
                }
              });
            });
          }
        });

        // 3. Fetch real chat rooms & initial messages from remote Supabase DB
        fetchChatRoomsFromSupabase().then((remoteRooms) => {
          if (remoteRooms && remoteRooms.length > 0) {
            setChatRooms(remoteRooms);
            // Fetch messages for each room
            remoteRooms.forEach((r) => {
              fetchChatMessagesFromSupabase(r.id, currentUser?.id).then((msgs) => {
                if (msgs) {
                  setChatMessages((prev) => ({
                    ...prev,
                    [r.id]: msgs
                  }));
                }
              });
            });
          }
        });

        // 4. Realtime Subscription on chat_messages (with deduplication against optimistic items)
        const realtimeChannel = supabase
          .channel('public:chat_messages')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat_messages' },
            (payload: any) => {
              const row = payload.new;
              if (row && row.room_id) {
                const incomingMsg: ChatMessage = {
                  id: row.id,
                  roomId: row.room_id,
                  senderId: row.sender_id,
                  senderName: row.sender_name,
                  senderAvatar: row.sender_avatar,
                  content: row.content,
                  createdAt: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isMine: row.sender_id === (currentUser?.id || 'me')
                };

                setChatMessages((prev) => {
                  const existingList = prev[row.room_id] || [];
                  // If message already exists by exact real id, do nothing
                  if (existingList.some((m) => m.id === incomingMsg.id)) {
                    return prev;
                  }
                  // If sent by this user, replace any matching pending optimistic message
                  if (incomingMsg.isMine) {
                    const pendingIdx = existingList.findIndex(
                      (m) => m.id.startsWith('msg-') && m.content === incomingMsg.content
                    );
                    if (pendingIdx !== -1) {
                      const updated = [...existingList];
                      updated[pendingIdx] = incomingMsg;
                      return {
                        ...prev,
                        [row.room_id]: updated
                      };
                    }
                  }
                  return {
                    ...prev,
                    [row.room_id]: [...existingList, incomingMsg]
                  };
                });
              }
            }
          )
          .subscribe();

        return () => {
          authListener.subscription.unsubscribe();
          supabase.removeChannel(realtimeChannel);
        };
      }
    }
  }, [storageKey, currentUser?.id]);

  // Deep-link to user profile via ?user=..., ?profile=..., or #profile-...
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user') || params.get('profile');
    const hash = window.location.hash;
    const hashUser = hash && hash.startsWith('#profile-') ? decodeURIComponent(hash.slice(9)) : null;

    const targetUser = userParam || hashUser;
    if (targetUser) {
      const found =
        Object.values(profiles).find(
          (p) =>
            p.id.toLowerCase() === targetUser.toLowerCase() ||
            p.username?.toLowerCase() === targetUser.toLowerCase()
        ) ||
        (targetUser === 'user-me' ? profiles['user-me'] : null);

      if (found) {
        setActiveProfile(found);
      } else if (isSupabaseConfigured()) {
        fetchUserProfileFromSupabase(targetUser).then((remote) => {
          if (remote) setActiveProfile(remote);
        });
      }
    }
  }, [profiles]);

  // Add new item with DB persistence
  const handleAddListing = async (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);

    if (isSupabaseConfigured()) {
      const persisted = await insertItemToSupabase(newItem, currentUser?.id);
      if (persisted) {
        setItems((prev) => [persisted, ...prev.filter((i) => i.id !== newItem.id)]);
      }
    }
  };

  // Claim item with DB persistence
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
    setItems(updated);

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
    // If opening own profile and not logged in, hint user to log in
    if (userId === 'user-me' || userId === currentUser?.id) {
      if (!currentUser) {
        setAuthGateReason('profile');
        return;
      }
      userId = currentUser.id || 'user-me';
    }

    const emailPrefix = currentUser?.email ? currentUser.email.split('@')[0] : '';
    const currentProfile = profiles[userId] || {
      id: userId,
      username: emailPrefix ? emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_') : 'user_' + userId.slice(-4),
      displayName: emailPrefix || (locale === 'en' ? 'Parent User' : 'マイアカウント'),
      avatarUrl: DEFAULT_AVATAR_URL,
      bio: '使わなくなったベビー服や知育玩具を大切にお譲りしています！お気軽にDMどうぞ✨',
      neighborhood: '東京都新宿区',
      prefecture: '東京都',
      babyStages: ['0-6ヶ月 (乳児)'],
      followerCount: 0,
      followingCount: 0,
      isFollowing: false,
      listedCount: 0,
      givenCount: 0,
      badges: ['認証アカウント', '登録メンバー'],
      createdAt: '2026-11-01'
    };

    // Calculate real dynamic stats for self
    if (currentUser && (userId === currentUser.id || userId === 'user-me')) {
      const myListings = items.filter((i) => i.giverId === userId || i.giverId === currentUser.id);
      currentProfile.listedCount = myListings.length;
      currentProfile.givenCount = myListings.filter((i) => i.status === 'claimed').length;
    }

    setIsCreatePostOpen(false);
    setIsListingOpen(false);
    setSelectedItem(null);
    setIsChatOpen(false);
    setActiveProfile(currentProfile);
  };

  const handleOpenMessages = () => {
    if (!currentUser) {
      setAuthGateReason('messages');
      return;
    }
    setIsCreatePostOpen(false);
    setIsListingOpen(false);
    setSelectedItem(null);
    setActiveProfile(null);
    setIsChatOpen(true);
  };

  const handleSelectRoom = (roomId: string) => {
    setActiveChatRoomId(roomId);
    if (roomId) {
      setChatRooms((prev) =>
        prev.map((r) => (r.id === roomId && r.unreadCount > 0 ? { ...r, unreadCount: 0 } : r))
      );
      if (isSupabaseConfigured()) {
        markChatRoomAsReadInSupabase(roomId);
      }
    }
  };

  // Start chat with user / about item
  const handleStartChat = async (userId: string, userName: string, userAvatar: string, item?: Item) => {
    if (!currentUser) {
      setAuthGateReason('messages');
      return;
    }
    setIsCreatePostOpen(false);
    setIsListingOpen(false);
    setActiveProfile(null);

    let room = chatRooms.find((r) => r.participant.id === userId);

    if (!room) {
      const newRoom: ChatRoom = {
        id: `c0000000-0000-0000-${Math.floor(Math.random() * 8999 + 1000)}-${Date.now().toString(16).slice(-12).padStart(12, '0')}`,
        participant: {
          id: userId,
          name: userName,
          avatar: userAvatar || DEFAULT_AVATAR_URL,
          neighborhood: item?.neighborhood || (locale === 'en' ? 'Tokyo Shinjuku' : '東京都新宿区')
        },
        itemId: item?.id,
        itemTitle: item?.title,
        itemImage: item?.images[0],
        lastMessage: item
          ? (locale === 'en' ? `Inquiry regarding ${item.title}` : `${item.title} についての問い合わせ`)
          : (locale === 'en' ? 'New message' : '新しいメッセージ'),
        lastMessageAt: locale === 'en' ? 'Now' : '今',
        unreadCount: 0
      };

      setChatRooms((prev) => [newRoom, ...prev]);
      room = newRoom;

      // Persist new chat room to Supabase DB
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          await supabase.from('chat_rooms').insert({
            id: newRoom.id,
            participant_id: userId,
            participant_name: userName,
            participant_avatar: userAvatar || null,
            participant_neighborhood: item?.neighborhood || (locale === 'en' ? 'Tokyo Shinjuku' : '東京都新宿区'),
            item_id: item?.id && item.id.includes('-') && item.id.length === 36 ? item.id : null,
            item_title: item?.title || null,
            item_image: item?.images[0] || null,
            last_message: newRoom.lastMessage,
            unread_count: 0
          });
        }
      }
    } else if (room.unreadCount > 0) {
      setChatRooms((prev) =>
        prev.map((r) => (r.id === room!.id ? { ...r, unreadCount: 0 } : r))
      );
      if (isSupabaseConfigured()) {
        markChatRoomAsReadInSupabase(room.id);
      }
    }

    setActiveChatRoomId(room.id);
    setIsChatOpen(true);
  };

  // Send message with remote DB write & optimistic deduplication
  const handleSendMessage = async (roomId: string, content: string) => {
    const tempId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: tempId,
      roomId,
      senderId: currentUser?.id || 'me',
      senderName: currentUser?.email?.split('@')[0] || (locale === 'en' ? 'You' : 'あなた'),
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    };

    // Optimistic UI update
    setChatMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg]
    }));

    setChatRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, lastMessage: content, lastMessageAt: locale === 'en' ? 'Now' : '今' }
          : r
      )
    );

    // Persist message to Supabase DB & reconcile optimistic tempId
    if (isSupabaseConfigured()) {
      insertChatMessageToSupabase(
        roomId,
        content,
        currentUser?.id || 'me',
        currentUser?.email?.split('@')[0] || (locale === 'en' ? 'You' : 'あなた')
      ).then((saved) => {
        if (saved) {
          setChatMessages((prev) => {
            const list = prev[roomId] || [];
            if (list.some((m) => m.id === saved.id)) {
              return {
                ...prev,
                [roomId]: list.filter((m) => m.id !== tempId)
              };
            }
            return {
              ...prev,
              [roomId]: list.map((m) => (m.id === tempId ? saved : m))
            };
          });
        }
      });
    }
  };

  // Add Community Post with remote DB write
  const handleAddPost = async (newPostData: Omit<CommunityPost, 'id' | 'likes' | 'commentCount' | 'createdAt'>) => {
    // Optimistic UI update
    const tempPost: CommunityPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      likes: 0,
      isLiked: false,
      commentCount: 0,
      createdAt: locale === 'en' ? 'Today' : '今日'
    };
    setPosts((prev) => [tempPost, ...prev]);

    // Persist to Supabase DB
    if (isSupabaseConfigured()) {
      const persisted = await insertCommunityPostToSupabase(newPostData);
      if (persisted) {
        setPosts((prev) => [persisted, ...prev.filter((p) => p.id !== tempPost.id)]);
      }
    }
    showToast(locale === 'en' ? 'Post published!' : '投稿を公開しました！');
  };

  // Toggle Like on Item
  const handleToggleLikeItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const willBeLiked = !item.isLiked;
          return {
            ...item,
            isLiked: willBeLiked,
            likes: Math.max(0, item.likes + (willBeLiked ? 1 : -1))
          };
        }
        return item;
      })
    );

    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem((prev) => {
        if (!prev) return null;
        const willBeLiked = !prev.isLiked;
        return {
          ...prev,
          isLiked: willBeLiked,
          likes: Math.max(0, prev.likes + (willBeLiked ? 1 : -1))
        };
      });
    }

    showToast(locale === 'en' ? 'Updated favorites' : 'いいねを更新しました');
  };

  // Add Comment on Item
  const handleAddItemComment = (itemId: string, content: string) => {
    const userProfile = profiles[currentUser?.id || 'user-me'] || profiles['user-me'];
    const newComment: ItemComment = {
      id: `ic-${Date.now()}`,
      itemId,
      authorId: userProfile.id,
      authorName: userProfile.displayName,
      authorAvatar: userProfile.avatarUrl,
      content,
      createdAt: locale === 'en' ? 'Just now' : 'たった今'
    };

    setItemComments((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), newComment]
    }));

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, commentCount: (item.commentCount || 0) + 1 }
          : item
      )
    );

    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem((prev) =>
        prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null
      );
    }

    showToast(locale === 'en' ? 'Question/comment posted!' : '質問・コメントを送信しました！');
  };

  // Toggle Like on Community Post
  const handleToggleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const willBeLiked = !p.isLiked;
          return {
            ...p,
            isLiked: willBeLiked,
            likes: Math.max(0, p.likes + (willBeLiked ? 1 : -1))
          };
        }
        return p;
      })
    );
  };

  // Add Comment on Community Post
  const handleAddPostComment = (postId: string, content: string) => {
    const userProfile = profiles[currentUser?.id || 'user-me'] || profiles['user-me'] || {
      id: currentUser?.id || 'user-me',
      displayName: currentUser?.email?.split('@')[0] || (locale === 'en' ? 'Parent User' : '子育てユーザー'),
      avatarUrl: DEFAULT_AVATAR_URL
    };

    const tempCommentId = `pc-${Date.now()}`;
    const newComment: PostComment = {
      id: tempCommentId,
      postId,
      authorId: userProfile.id,
      authorName: userProfile.displayName,
      authorAvatar: userProfile.avatarUrl,
      content,
      createdAt: locale === 'en' ? 'Just now' : 'たった今'
    };

    setPostComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentCount: ((postComments[postId] || []).length || p.commentCount || 0) + 1 }
          : p
      )
    );

    if (isSupabaseConfigured()) {
      insertPostCommentToSupabase(
        postId,
        content,
        currentUser?.id,
        userProfile.displayName,
        userProfile.avatarUrl
      ).then((savedComment) => {
        if (savedComment) {
          setPostComments((prev) => ({
            ...prev,
            [postId]: (prev[postId] || []).map((c) => (c.id === tempCommentId ? savedComment : c))
          }));
        }
      });
    }

    showToast(locale === 'en' ? 'Reply posted!' : '返信コメントを送信しました！');
  };

  // Update Profile
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const targetId = activeProfile?.id || currentUser?.id || 'user-me';
    setProfiles((prev) => {
      const current = prev[targetId] || DEMO_PROFILES['user-me'];
      const merged = { ...current, ...updated };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`abilolo_profile_${targetId}`, JSON.stringify(merged));
      }
      return {
        ...prev,
        [targetId]: merged
      };
    });

    if (activeProfile) {
      setActiveProfile((prev) => (prev ? { ...prev, ...updated } : null));
    }

    if (isSupabaseConfigured() && currentUser?.id === targetId) {
      upsertUserProfileToSupabase(targetId, updated);
    }

    showToast(locale === 'en' ? 'Profile updated!' : 'プロフィールを更新しました！');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('abilolo_auth_user');
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
        onOpenChat={handleOpenMessages}
        onOpenProfile={() => handleOpenProfile('user-me')}
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
                    onToggleLike={handleToggleLikeItem}
                    onOpenProfile={handleOpenProfile}
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
          comments={postComments}
          locale={locale}
          currentUser={currentUser}
          isCreateOpen={isCreatePostOpen}
          onOpenCreate={() => setIsCreatePostOpen(true)}
          onCloseCreate={() => setIsCreatePostOpen(false)}
          onRequireAuth={(target) => setAuthGateReason(target)}
          onOpenProfile={handleOpenProfile}
          onOpenAuth={() => setIsAuthOpen(true)}
          onAddPost={handleAddPost}
          onToggleLikePost={handleToggleLikePost}
          onAddPostComment={handleAddPostComment}
          onShowToast={showToast}
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
        currentUser={currentUser}
        comments={selectedItem ? (itemComments[selectedItem.id] || []) : []}
        onClose={() => setSelectedItem(null)}
        onRequestClaim={(item) => {
          if (!currentUser) {
            setSelectedItem(null);
            setAuthGateReason('claim');
            return;
          }
          setSelectedItem(null);
          setClaimingItem(item);
        }}
        onOpenProfile={handleOpenProfile}
        onStartChat={(userId, name, avatar, itm) => {
          setSelectedItem(null);
          handleStartChat(userId, name, avatar, itm);
        }}
        onToggleLike={handleToggleLikeItem}
        onAddComment={handleAddItemComment}
        onRequireAuth={(target) => setAuthGateReason(target)}
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
        onClose={() => {
          setIsAuthOpen(false);
          setPendingGatedAction(null);
        }}
        onAuthSuccess={(userEmail) => {
          const u = { id: currentUser?.id || `user-${Date.now().toString(36)}`, email: userEmail };
          setCurrentUser(u);
          const prof = syncCurrentUserProfile(u);
          const targetAction = pendingGatedAction || authGateReason;
          if (targetAction === 'messages') {
            setIsChatOpen(true);
          } else if (targetAction === 'profile') {
            setActiveProfile(prof || null);
          } else if (targetAction === 'post') {
            setIsCreatePostOpen(true);
          }
          setPendingGatedAction(null);
          setAuthGateReason(null);
        }}
      />

      {/* Auth Gate for Personal Pages (Messages & Profile) */}
      <AuthGateModal
        isOpen={!!authGateReason}
        target={authGateReason || 'general'}
        locale={locale}
        onClose={() => {
          setAuthGateReason(null);
          setPendingGatedAction(null);
        }}
        onOpenAuth={() => {
          setPendingGatedAction(authGateReason);
          setAuthGateReason(null);
          setIsAuthOpen(true);
        }}
      />

      {/* Instagram-style Profile Modal */}
      {activeProfile && (
        <ProfileModal
          profile={activeProfile}
          items={items}
          posts={posts}
          locale={locale}
          isMyProfile={activeProfile.id === 'user-me' || activeProfile.id === (currentUser?.id || '')}
          onClose={() => setActiveProfile(null)}
          onStartChat={(uid, uname, uavatar) => {
            setActiveProfile(null);
            handleStartChat(uid, uname, uavatar);
          }}
          onSelectItem={(itm) => {
            setActiveProfile(null);
            setSelectedItem(itm);
          }}
          onToggleLikeItem={handleToggleLikeItem}
          onUpdateProfile={handleUpdateProfile}
          onShowToast={showToast}
        />
      )}

      {/* Real-time Direct Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        activeRoomId={activeChatRoomId}
        rooms={chatRooms}
        messages={chatMessages}
        locale={locale}
        currentUserId={currentUser?.id}
        onClose={() => {
          setIsChatOpen(false);
          setActiveChatRoomId(null);
        }}
        onSendMessage={handleSendMessage}
        onSelectRoom={handleSelectRoom}
        onOpenProfile={handleOpenProfile}
      />

      {/* PWA Mobile Navigation & Install Prompt */}
      <BottomNav
        locale={locale}
        currentTab={
          isChatOpen
            ? 'chat'
            : (activeProfile && (activeProfile.id === 'user-me' || activeProfile.id === currentUser?.id))
              ? 'profile'
              : currentTab
        }
        unreadChatCount={totalUnreadChats}
        currentUser={currentUser}
        onSelectTab={(tab) => {
          setIsCreatePostOpen(false);
          if (tab === 'chat') {
            handleOpenMessages();
            return;
          }
          if (tab === 'profile') {
            handleOpenProfile('user-me');
            return;
          }
          setIsChatOpen(false);
          setActiveProfile(null);
          setCurrentTab(tab);
        }}
        onOpenListing={() => setIsListingOpen(true)}
        onOpenChat={handleOpenMessages}
        onOpenProfile={() => handleOpenProfile('user-me')}
      />

      {!isChatOpen && !activeProfile && <PwaInstallPrompt locale={locale} />}

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 bg-gray-900/95 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 animate-fadeIn">
          <span className="text-pink-400">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
