'use client';

import React, { useState } from 'react';
import { CommunityPost, PostComment } from '@/lib/types';
import { Locale, DICTIONARY } from '@/lib/i18n';
import { TOKYO_LOCATIONS, DEFAULT_AVATAR_URL } from '@/lib/data';
import { Heart, MessageCircle, MapPin, Plus, Share2, Sparkles, X, Image as ImageIcon, Send, Check } from 'lucide-react';

interface CommunityFeedProps {
  posts: CommunityPost[];
  comments?: Record<string, PostComment[]>;
  locale: Locale;
  currentUser?: { id?: string; email?: string } | null;
  isCreateOpen: boolean;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onRequireAuth?: (target: 'post' | 'comment') => void;
  onOpenProfile: (userId: string) => void;
  onOpenAuth: () => void;
  onAddPost: (post: Omit<CommunityPost, 'id' | 'likes' | 'commentCount' | 'createdAt'>) => void;
  onToggleLikePost?: (postId: string) => void;
  onAddPostComment?: (postId: string, content: string) => void;
  onShowToast?: (msg: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  comments = {},
  locale,
  currentUser,
  isCreateOpen,
  onOpenCreate,
  onCloseCreate,
  onRequireAuth,
  onOpenProfile,
  onOpenAuth,
  onAddPost,
  onToggleLikePost,
  onAddPostComment,
  onShowToast
}) => {
  const t = DICTIONARY[locale];
  const [filter, setFilter] = useState<'all' | 'tip' | 'request'>('all');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handlePostCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth?.('comment');
      return;
    }
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    onAddPostComment?.(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleShare = (postId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#post-${postId}`);
      setCopiedPostId(postId);
      onShowToast?.(t.copiedToClipboard);
      setTimeout(() => setCopiedPostId(null), 2000);
    }
  };

  // New post form state
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'tip' | 'request' | 'chat'>('tip');
  const [neighborhood, setNeighborhood] = useState(TOKYO_LOCATIONS[0].name);
  const [imageUrl, setImageUrl] = useState('');

  const filteredPosts = posts.filter((p) => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  const getPostComments = (postId: string): PostComment[] => {
    if (comments[postId] && comments[postId].length > 0) return comments[postId];
    if (postId === 'a0000000-0000-0000-0000-000000000001') return comments['post-1'] || [];
    if (postId === 'a0000000-0000-0000-0000-000000000002') return comments['post-2'] || [];
    if (postId === 'a0000000-0000-0000-0000-000000000003') return comments['post-3'] || [];
    return [];
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth?.('post');
      return;
    }
    if (!content.trim()) return;

    const loc = TOKYO_LOCATIONS.find((l) => l.name === neighborhood) || TOKYO_LOCATIONS[0];

    onAddPost({
      userId: 'user-me',
      authorName: locale === 'en' ? 'You (My Account)' : 'あなた (マイアカウント)',
      authorAvatar: DEFAULT_AVATAR_URL,
      authorNeighborhood: locale === 'en' ? neighborhood : `東京都${neighborhood}`,
      content: content.trim(),
      images: imageUrl ? [imageUrl] : [],
      neighborhood: locale === 'en' ? neighborhood : `東京都${neighborhood}`,
      latitude: loc.lat,
      longitude: loc.lng,
      category
    });

    setContent('');
    setImageUrl('');
    onCloseCreate();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      
      {/* Top Banner & CTA */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl shadow-pink-500/20 mb-6 flex items-center justify-between">
        <div>
          <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
            Community Space
          </span>
          <h2 className="text-xl sm:text-2xl font-black">{t.communityTitle}</h2>
          <p className="text-xs text-pink-100 mt-1 max-w-md leading-relaxed">
            {t.communitySubtitle}
          </p>
        </div>
        <button
          onClick={() => {
            if (!currentUser) {
              onRequireAuth?.('post');
              return;
            }
            onOpenCreate();
          }}
          className="bg-white text-pink-600 font-black text-xs px-4 py-3 rounded-2xl shadow-lg hover:bg-pink-50 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t.newPostBtn}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            filter === 'all'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
          }`}
        >
          {t.allPosts}
        </button>
        <button
          onClick={() => setFilter('tip')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            filter === 'tip'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
          }`}
        >
          💡 {t.tipPosts}
        </button>
        <button
          onClick={() => setFilter('request')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            filter === 'request'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
          }`}
        >
          🎁 {t.requestPosts}
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Author info */}
            <div className="flex items-center justify-between mb-3">
              <div
                onClick={() => onOpenProfile(post.userId)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-10 h-10 rounded-full object-cover border border-pink-100 group-hover:ring-2 ring-pink-400 transition-all"
                />
                <div>
                  <h4 className="text-xs font-black text-gray-900 group-hover:text-pink-600 transition-colors">
                    {post.authorName}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-pink-500 shrink-0" />
                    <span>{post.neighborhood || post.authorNeighborhood}</span>
                    <span>·</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  post.category === 'tip'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                }`}
              >
                {post.category === 'tip'
                  ? (locale === 'en' ? '💡 Parenting Tips' : '💡 育児Tips')
                  : (locale === 'en' ? '🎁 Item Request' : '🎁 お譲りリクエスト')}
              </span>
            </div>

            {/* Post Content */}
            <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line mb-3">
              {post.content}
            </p>

            {/* Post Image */}
            {post.images && post.images.length > 0 && (
              <div className="rounded-2xl overflow-hidden mb-3 border border-gray-100 aspect-video bg-gray-50">
                <img
                  src={post.images[0]}
                  alt="Post attachment"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Actions (Like, Comment, Share) - Locked 3-column grid so layout never alters on click */}
            <div className="grid grid-cols-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <button
                type="button"
                onClick={() => onToggleLikePost?.(post.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-all active:scale-105 ${
                  post.isLiked ? 'text-pink-600 font-bold bg-pink-50/40' : 'hover:text-pink-600 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 shrink-0 ${post.isLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
                <span className="tabular-nums">{post.likes}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleComments(post.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl transition-colors ${
                  expandedComments[post.id] ? 'text-pink-600 font-bold bg-pink-50/40' : 'hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span className="tabular-nums">
                  {getPostComments(post.id).length > 0 ? getPostComments(post.id).length : post.commentCount}{' '}
                  {t.postCommentsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleShare(post.id)}
                className="flex items-center justify-center gap-1.5 py-1.5 rounded-xl hover:text-gray-700 hover:bg-gray-50 transition-colors"
                title={t.shareBtn}
              >
                {copiedPostId === post.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-600 font-bold">{locale === 'en' ? 'Copied' : 'コピー済'}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.shareBtn}</span>
                  </>
                )}
              </button>
            </div>

            {/* Expandable Comments Section */}
            {expandedComments[post.id] && (() => {
              const currentPostComments = getPostComments(post.id);
              return (
                <div className="mt-3 pt-3 border-t border-gray-50 space-y-3 animate-fadeIn">
                  {/* Existing comments */}
                  {currentPostComments.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {currentPostComments.map((c) => (
                        <div key={c.id} className="bg-gray-50 rounded-xl p-2.5 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => onOpenProfile(c.authorId)}
                              className="flex items-center gap-1.5 font-bold text-gray-800 hover:text-pink-600 transition-colors"
                            >
                              <img src={c.authorAvatar} alt={c.authorName} className="w-4 h-4 rounded-full object-cover" />
                              <span>{c.authorName}</span>
                            </button>
                            <span className="text-[10px] text-gray-400">{c.createdAt}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed pl-5.5">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 text-center py-2 bg-gray-50 rounded-xl">
                      {locale === 'en' ? 'No replies yet. Start the conversation!' : 'まだ返信はありません。最初のコメントを投稿してみましょう！'}
                    </p>
                  )}

                  {/* Comment input form */}
                  <form onSubmit={(e) => handlePostCommentSubmit(post.id, e)} className="flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onFocus={() => {
                        if (!currentUser) {
                          onRequireAuth?.('comment');
                        }
                      }}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))
                      }
                      placeholder={t.postCommentPlaceholder}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-gray-800"
                    />
                    <button
                      type="submit"
                      disabled={!(commentInputs[post.id] || '').trim()}
                      className="px-3.5 py-1.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                    >
                      <Send className="w-3 h-3" />
                      <span>{t.postCommentSubmit}</span>
                    </button>
                  </form>
                </div>
              );
            })()}
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-black text-gray-900">
                {locale === 'en' ? 'Create Community Post' : 'コミュニティに投稿する'}
              </h3>
              <button
                onClick={onCloseCreate}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              {/* Category picker */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {t.postCategoryLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('tip')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      category === 'tip'
                        ? 'bg-pink-50 text-pink-700 border-pink-500 ring-2 ring-pink-500/10'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {t.postCategoryTip}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('request')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      category === 'request'
                        ? 'bg-amber-50 text-amber-700 border-amber-500 ring-2 ring-amber-500/10'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {t.postCategoryRequest}
                  </button>
                </div>
              </div>

              {/* Location ward */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {t.postAreaLabel}
                </label>
                <select
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                >
                  {TOKYO_LOCATIONS.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {locale === 'en' ? loc.name : `東京都 ${loc.name}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content textarea */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {t.postContentLabel}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder={
                    category === 'tip'
                      ? t.postPlaceholderTip
                      : t.postPlaceholderRequest
                  }
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              {/* Optional photo URL */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  {t.postPhotoLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80')}
                    className="px-3 py-2 bg-pink-50 text-pink-700 rounded-xl text-[10px] font-bold hover:bg-pink-100"
                  >
                    {t.postSamplePhotoBtn}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseCreate}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/25 hover:opacity-95 disabled:opacity-50"
                >
                  {t.postPublishBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
