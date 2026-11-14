'use client';

import React, { useState } from 'react';
import { UserProfile, Item, CommunityPost } from '@/lib/types';
import { Locale, DICTIONARY } from '@/lib/i18n';
import {
  X,
  MessageCircle,
  UserPlus,
  UserCheck,
  MapPin,
  Award,
  Package,
  Heart,
  Edit3,
  CheckCircle2,
  Bookmark,
  Share2,
  Calendar,
  Sparkles,
  Check
} from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  items: Item[];
  posts: CommunityPost[];
  locale: Locale;
  isMyProfile?: boolean;
  onClose: () => void;
  onStartChat: (userId: string, userName: string, userAvatar: string) => void;
  onSelectItem: (item: Item) => void;
  onToggleLikeItem?: (itemId: string) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onShowToast?: (msg: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  items,
  posts,
  locale,
  isMyProfile = false,
  onClose,
  onStartChat,
  onSelectItem,
  onToggleLikeItem,
  onUpdateProfile,
  onShowToast
}) => {
  const t = DICTIONARY[locale];
  const [activeTab, setActiveTab] = useState<'listings' | 'posts' | 'liked'>('listings');
  const [listingFilter, setListingFilter] = useState<'all' | 'available' | 'claimed'>('all');
  const [isFollowing, setIsFollowing] = useState<boolean>(profile.isFollowing || false);
  const [followerCount, setFollowerCount] = useState<number>(profile.followerCount);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(profile.displayName);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editNeighborhood, setEditNeighborhood] = useState(profile.neighborhood);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter items authored by this user
  const userItems = items.filter(
    (item) =>
      (item.giverId && item.giverId === profile.id) ||
      (profile.id === 'user-me' && (item.giverId === 'user-me' || item.giverName.includes('あなた') || item.giverName.includes('You'))) ||
      (profile.displayName && item.giverName.toLowerCase() === profile.displayName.toLowerCase())
  );

  const matchedCount = userItems.filter((item) => item.status === 'claimed').length;

  const filteredUserItems = userItems.filter((item) => {
    if (listingFilter === 'all') return true;
    return item.status === listingFilter;
  });

  // Filter posts authored by this user
  const userPosts = posts.filter(
    (post) =>
      post.userId === profile.id ||
      (profile.id === 'user-me' && (post.userId === 'user-me' || post.authorName.includes('あなた') || post.authorName.includes('You'))) ||
      (profile.displayName && post.authorName.toLowerCase() === profile.displayName.toLowerCase())
  );

  // Items liked by the user
  const likedItems = items.filter((item) => item.isLiked);

  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile?.({
      displayName: editName.trim() || profile.displayName,
      bio: editBio.trim() || profile.bio,
      neighborhood: editNeighborhood.trim() || profile.neighborhood
    });
    setIsEditing(false);
  };

  const handleShareProfile = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const shareUrl = `${window.location.origin}${locale === 'en' ? '/en' : ''}?user=${encodeURIComponent(profile.username || profile.id)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      onShowToast?.(t.copiedToClipboard);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-[58px] md:inset-0 z-50 flex flex-col md:flex-row md:items-center md:justify-center md:p-4 md:bg-black/60 md:backdrop-blur-sm animate-fadeIn bg-white md:bg-transparent">
      <div
        className="bg-white w-full h-full md:max-w-xl md:max-h-[92vh] md:rounded-3xl md:shadow-2xl md:border md:border-gray-100 overflow-y-auto flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-500 tracking-wider">
              @{profile.username}
            </span>
            {isMyProfile && (
              <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                {locale === 'en' ? 'My Profile' : 'マイページ'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              title={t.shareBtn}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center justify-center shrink-0"
              aria-label={t.shareBtn}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Banner & Info */}
        <div className="relative">
          {/* Subtle decorative cover */}
          <div className="h-24 bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 opacity-80" />

          <div className="px-6 pb-4 -mt-12 relative">
            <div className="flex items-end justify-between gap-4">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-22 h-22 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-pink-500/20 bg-white"
              />

              {/* Action Buttons: Edit or Follow/Message */}
              <div className="flex items-center gap-2 pb-1">
                {isMyProfile ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-pink-300 flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                    <span>{t.profileEditBtn}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleToggleFollow}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 min-w-[96px] ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/25 hover:opacity-95'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.followingBtn}</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{t.followBtn}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onStartChat(profile.id, profile.displayName, profile.avatarUrl)}
                      className="px-3 py-2 rounded-xl font-bold text-xs bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 flex items-center gap-1 transition-all active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{t.messageGiverBtn}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Names & Badges */}
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-gray-900">{profile.displayName}</h2>
                <CheckCircle2 className="w-4 h-4 text-pink-500 fill-pink-50" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>{profile.neighborhood}</span>
                <span className="text-gray-300">·</span>
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{locale === 'en' ? 'Joined' : '登録'} {profile.createdAt}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {profile.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-200/60"
                  >
                    <Award className="w-2.5 h-2.5" />
                    {badge}
                  </span>
                ))}
              </div>

              {/* Bio & Baby Stages */}
              <p className="text-xs text-gray-700 mt-3 leading-relaxed whitespace-pre-line bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                {profile.bio}
              </p>

              {profile.babyStages && profile.babyStages.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] font-bold text-gray-400">
                    {t.profileBabyStages}:
                  </span>
                  {profile.babyStages.map((stage, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200/60"
                    >
                      🍼 {stage}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Community Stats Bar */}
            <div className="grid grid-cols-4 gap-2 mt-4 py-3 px-3 bg-gradient-to-br from-pink-50/50 to-rose-50/30 rounded-2xl text-center border border-pink-100/70">
              <div>
                <div className="text-base font-black text-gray-900">{userItems.length}</div>
                <div className="text-[10px] text-gray-500 font-bold">{t.profileTabListings}</div>
              </div>
              <div>
                <div className="text-base font-black text-emerald-600">{isMyProfile ? matchedCount : profile.givenCount}</div>
                <div className="text-[10px] text-gray-500 font-bold">{locale === 'en' ? 'Matched' : '成立数'}</div>
              </div>
              <div>
                <div className="text-base font-black text-gray-900">{followerCount}</div>
                <div className="text-[10px] text-gray-500 font-bold">{locale === 'en' ? 'Followers' : 'フォロワー'}</div>
              </div>
              <div>
                <div className="text-base font-black text-gray-900">{profile.followingCount}</div>
                <div className="text-[10px] text-gray-500 font-bold">{locale === 'en' ? 'Following' : 'フォロー'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Sub-Modal */}
        {isEditing && (
          <div className="p-6 bg-pink-50/60 border-t border-b border-pink-100 space-y-3 animate-fadeIn">
            <h3 className="text-xs font-black text-pink-900 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" />
              {t.profileEditBtn}
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">{t.profileDisplayName}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">{t.profileNeighborhood}</label>
                <input
                  type="text"
                  value={editNeighborhood}
                  onChange={(e) => setEditNeighborhood(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">{t.profileBio}</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-xs"
                >
                  {t.profileSaveBtn}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs: Listings | Posts | Liked Items */}
        <div className="flex border-b border-gray-100 px-6 bg-white sticky top-12 z-10">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'listings'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t.profileTabListings} ({userItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'posts'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.profileTabPosts} ({userPosts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'liked'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t.profileTabLiked} ({likedItems.length})</span>
          </button>
        </div>

        {/* Tab 1: Listings with sub-filters */}
        <div className="p-6 flex-1 bg-gray-50/40">
          {activeTab === 'listings' && (
            <div className="space-y-4">
              {/* Sub-filter pills */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setListingFilter('all')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    listingFilter === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {t.profileFilterAll} ({userItems.length})
                </button>
                <button
                  onClick={() => setListingFilter('available')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    listingFilter === 'available'
                      ? 'bg-pink-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {t.profileFilterAvailable} ({userItems.filter((i) => i.status === 'available').length})
                </button>
                <button
                  onClick={() => setListingFilter('claimed')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    listingFilter === 'claimed'
                      ? 'bg-gray-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {t.profileFilterClaimed} ({userItems.filter((i) => i.status === 'claimed').length})
                </button>
              </div>

              {/* Items Grid */}
              {filteredUserItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredUserItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectItem(item);
                        onClose();
                      }}
                      className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-md hover:border-pink-200 transition-all flex flex-col"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                          ¥0
                        </span>
                        {item.status === 'claimed' && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center text-white text-xs font-bold">
                            {t.statusClaimed}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLikeItem?.(item.id);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-pink-600 transition-all"
                        >
                          <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
                        </button>
                      </div>
                      <div className="p-3 space-y-1">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-pink-600 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                          <span className="truncate">{item.category}</span>
                          <span className="flex items-center gap-1 font-semibold text-pink-600">
                            <Heart className={`w-3 h-3 ${item.isLiked ? 'fill-pink-600' : ''}`} />
                            {item.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  {t.profileEmptyListings}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Community Posts */}
          {activeTab === 'posts' && (
            <div className="space-y-3">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="font-bold text-gray-700">
                        {post.category === 'tip'
                          ? (locale === 'en' ? '💡 Parenting Tips' : '💡 育児Tips')
                          : (locale === 'en' ? '🎁 Item Request' : '🎁 お譲りリクエスト')}
                      </span>
                      <span>{post.createdAt}</span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line">{post.content}</p>
                    {post.images && post.images.length > 0 && (
                      <img
                        src={post.images[0]}
                        alt="Post media"
                        className="rounded-xl w-full h-36 object-cover"
                      />
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-50">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                        <span>{post.likes}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.commentCount}</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  {t.profileEmptyPosts}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Liked Items */}
          {activeTab === 'liked' && (
            <div className="space-y-3">
              {likedItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {likedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectItem(item);
                        onClose();
                      }}
                      className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                          ¥0
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLikeItem?.(item.id);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-pink-600 shadow-xs"
                        >
                          <Heart className="w-3.5 h-3.5 fill-pink-600" />
                        </button>
                      </div>
                      <div className="p-2.5">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-pink-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.giverName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  {t.profileEmptyLiked}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
