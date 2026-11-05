'use client';

import React, { useState } from 'react';
import { UserProfile, Item, CommunityPost } from '@/lib/types';
import { Locale, DICTIONARY } from '@/lib/i18n';
import { X, MessageCircle, UserPlus, UserCheck, MapPin, Award, Calendar, Package, Heart } from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  items: Item[];
  posts: CommunityPost[];
  locale: Locale;
  onClose: () => void;
  onStartChat: (userId: string, userName: string, userAvatar: string) => void;
  onSelectItem: (item: Item) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  items,
  posts,
  locale,
  onClose,
  onStartChat,
  onSelectItem
}) => {
  const t = DICTIONARY[locale];
  const [activeTab, setActiveTab] = useState<'listings' | 'posts'>('listings');
  const [isFollowing, setIsFollowing] = useState<boolean>(profile.isFollowing || false);
  const [followerCount, setFollowerCount] = useState<number>(profile.followerCount);

  const userItems = items.filter(
    (item) => (item.giverId && item.giverId === profile.id) || item.giverName.includes(profile.displayName.slice(0, 3))
  );

  const userPosts = posts.filter(
    (post) => post.userId === profile.id || post.authorName.includes(profile.displayName.slice(0, 3))
  );

  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
            @{profile.username}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-5">
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-20 h-20 rounded-full object-cover border-4 border-pink-100 shadow-md ring-2 ring-pink-500/20"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-gray-900 truncate">
                {profile.displayName}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span className="truncate">{profile.neighborhood}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200/50"
                  >
                    <Award className="w-2.5 h-2.5" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Followers & Impact Stats */}
          <div className="grid grid-cols-4 gap-2 mt-5 py-3 px-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
            <div>
              <div className="text-sm font-black text-gray-900">{userItems.length}</div>
              <div className="text-[10px] text-gray-500 font-medium">
                {locale === 'en' ? 'Gifts' : 'お譲り'}
              </div>
            </div>
            <div>
              <div className="text-sm font-black text-emerald-600">{profile.givenCount}</div>
              <div className="text-[10px] text-gray-500 font-medium">
                {locale === 'en' ? 'Matched' : '成立数'}
              </div>
            </div>
            <div>
              <div className="text-sm font-black text-gray-900">{followerCount}</div>
              <div className="text-[10px] text-gray-500 font-medium">
                {locale === 'en' ? 'Followers' : 'フォロワー'}
              </div>
            </div>
            <div>
              <div className="text-sm font-black text-gray-900">{profile.followingCount}</div>
              <div className="text-[10px] text-gray-500 font-medium">
                {locale === 'en' ? 'Following' : 'フォロー'}
              </div>
            </div>
          </div>

          {/* Bio & Baby Stages */}
          <div className="mt-4">
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
            {profile.babyStages && profile.babyStages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[11px] font-semibold text-gray-400 self-center">
                  {locale === 'en' ? 'Stage:' : '育児ステージ:'}
                </span>
                {profile.babyStages.map((stage, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg border border-amber-200"
                  >
                    🍼 {stage}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons: Follow & DM */}
          <div className="flex items-center gap-2 mt-4 pt-2">
            <button
              onClick={handleToggleFollow}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/25 hover:opacity-95'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  {t.followingBtn}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {t.followBtn}
                </>
              )}
            </button>
            <button
              onClick={() => onStartChat(profile.id, profile.displayName, profile.avatarUrl)}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              {t.messageGiverBtn}
            </button>
          </div>
        </div>

        {/* Tab Switcher (Instagram-like) */}
        <div className="flex border-b border-gray-100 mt-2 px-6">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'listings'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Package className="w-4 h-4" />
            {t.listingsTab} ({userItems.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'posts'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Heart className="w-4 h-4" />
            {t.postsTab} ({userPosts.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1">
          {activeTab === 'listings' ? (
            userItems.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {userItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-100 bg-gray-50/50 hover:shadow-md transition-all flex flex-col"
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
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold">
                          成立済
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-pink-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {item.shippingMethod}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">
                {locale === 'en' ? 'No active listings' : '現在出品中のお譲り品はありません'}
              </div>
            )
          ) : (
            userPosts.length > 0 ? (
              <div className="space-y-3">
                {userPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                    <p className="text-gray-800 leading-relaxed">{post.content}</p>
                    {post.images && post.images.length > 0 && (
                      <img
                        src={post.images[0]}
                        alt="Post media"
                        className="mt-2.5 rounded-xl w-full h-36 object-cover"
                      />
                    )}
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-200/60">
                      <span>📍 {post.neighborhood}</span>
                      <span>❤️ {post.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">
                {locale === 'en' ? 'No posts yet' : 'まだ投稿がありません'}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
