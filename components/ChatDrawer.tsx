'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatRoom, ChatMessage } from '@/lib/types';
import { Locale, DICTIONARY, ENGLISH_ITEMS } from '@/lib/i18n';
import { X, Send, ArrowLeft, MessageSquare, MapPin, CheckCheck, Package, Sparkles } from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  activeRoomId?: string | null;
  rooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  locale: Locale;
  currentUserId?: string | null;
  onClose: () => void;
  onSendMessage: (roomId: string, content: string) => void;
  onSelectRoom: (roomId: string) => void;
  onOpenProfile?: (userId: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  activeRoomId,
  rooms,
  messages,
  locale,
  currentUserId,
  onClose,
  onSendMessage,
  onSelectRoom,
  onOpenProfile
}) => {
  const t = DICTIONARY[locale];
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(activeRoomId || null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only sync when activeRoomId prop explicitly updates
  useEffect(() => {
    if (activeRoomId) {
      setSelectedRoomId(activeRoomId);
    }
  }, [activeRoomId]);

  // Mark room as read when open with active selection
  useEffect(() => {
    if (isOpen && selectedRoomId) {
      onSelectRoom(selectedRoomId);
    }
  }, [isOpen, selectedRoomId, onSelectRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedRoomId, messages]);

  if (!isOpen) return null;

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || null;
  const effectiveRoomId = currentRoom?.id || null;
  const currentMessages = effectiveRoomId && messages[effectiveRoomId] ? messages[effectiveRoomId] : [];

  // Deduplicate messages by ID to prevent rendering twins
  const uniqueMessages = (() => {
    const seen = new Set<string>();
    const list: ChatMessage[] = [];
    for (const m of currentMessages) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        list.push(m);
      }
    }
    return list;
  })();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !effectiveRoomId || isSending) return;
    setIsSending(true);
    setInputText('');
    onSendMessage(effectiveRoomId, text);
    setTimeout(() => setIsSending(false), 400);
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-[58px] md:inset-0 z-50 flex flex-col md:flex-row md:items-center md:justify-center md:p-4 md:bg-black/60 md:backdrop-blur-sm animate-fadeIn bg-white md:bg-transparent">
      <div 
        className="bg-white w-full h-full md:max-w-2xl md:h-[82vh] md:rounded-3xl md:shadow-2xl md:border md:border-gray-100 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Content: Split or Full Screen depending on active room selection */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Rooms Sidebar (visible on desktop or when no room is selected on mobile) */}
          <div className={`${selectedRoomId ? 'hidden md:flex' : 'flex'} w-full md:w-72 flex-col border-r border-gray-100 bg-gray-50/50`}>
            {/* Sidebar Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  aria-label="Close"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-5 h-5 text-pink-500" />
                  <h3 className="font-black text-gray-900 text-sm">{t.chatDrawerTitle}</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rooms List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {rooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                const roomItemTitle = locale === 'en'
                  ? (ENGLISH_ITEMS.find((i) => i.id === room.itemId)?.title || room.itemTitle)
                  : room.itemTitle;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedRoomId(room.id);
                      onSelectRoom(room.id);
                    }}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-white shadow-sm border border-pink-100 ring-2 ring-pink-500/10'
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={room.participant.avatar}
                        alt={room.participant.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-100"
                      />
                      {room.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {room.participant.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {room.lastMessageAt}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {room.lastMessage || t.chatStartPrompt}
                      </p>
                      {roomItemTitle && (
                        <div className="flex items-center gap-1 text-[10px] text-pink-600 mt-1 truncate">
                          <Package className="w-3 h-3 shrink-0" />
                          <span className="truncate">{roomItemTitle}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Conversation Pane */}
          {currentRoom ? (
            <div className={`${!selectedRoomId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white overflow-hidden`}>
              
              {/* Chat Header */}
              <div className="p-3.5 px-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoomId(null);
                      onSelectRoom?.('');
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div
                    onClick={() => onOpenProfile && onOpenProfile(currentRoom.participant.id)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <img
                      src={currentRoom.participant.avatar}
                      alt={currentRoom.participant.name}
                      className="w-10 h-10 rounded-full object-cover border border-pink-100"
                    />
                    <div>
                      <h4 className="text-xs font-black text-gray-900 group-hover:text-pink-600 transition-colors">
                        {currentRoom.participant.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-pink-500" />
                        {currentRoom.participant.neighborhood || 'Tokyo'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inquiring Item Card Banner */}
              {currentRoom.itemTitle && (() => {
                const activeItemTitle = locale === 'en'
                  ? (ENGLISH_ITEMS.find((i) => i.id === currentRoom.itemId)?.title || currentRoom.itemTitle)
                  : currentRoom.itemTitle;
                return (
                  <div className="px-4 py-2.5 bg-gradient-to-r from-pink-50 to-rose-50/50 border-b border-pink-100 flex items-center gap-3">
                    {currentRoom.itemImage && (
                      <img
                        src={currentRoom.itemImage}
                        alt={activeItemTitle}
                        className="w-10 h-10 rounded-xl object-cover border border-pink-200/50 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-pink-600 tracking-wider uppercase">
                        {t.inquiryItemBanner}
                      </span>
                      <h5 className="text-xs font-bold text-gray-900 truncate">
                        {activeItemTitle}
                      </h5>
                    </div>
                    <span className="text-xs font-black text-pink-600 bg-white px-2 py-0.5 rounded-full border border-pink-200 shadow-xs shrink-0">
                      {t.cardZeroYen}
                    </span>
                  </div>
                );
              })()}

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf9fa]">
                <div className="text-center my-2">
                  <span className="text-[10px] text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-2xs">
                    {t.chatSecureNotice}
                  </span>
                </div>

                {uniqueMessages.map((msg) => {
                  const isMine = Boolean(
                    msg.isMine ||
                    msg.senderId === 'me' ||
                    (currentUserId && msg.senderId === currentUserId)
                  );
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${
                        isMine ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isMine && (
                        <img
                          src={msg.senderAvatar || currentRoom.participant.avatar}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                        />
                      )}
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                          isMine
                            ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-br-xs'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                        <div
                          className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                            isMine ? 'text-pink-100' : 'text-gray-400'
                          }`}
                        >
                          <span>{msg.createdAt}</span>
                          {isMine && <CheckCheck className="w-3 h-3 text-pink-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.chatInputPlaceholder}
                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-pink-500/20 active:scale-95 transition-transform"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-center p-8 text-gray-400">
              <div>
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-xs">{t.chatSelectPrompt}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
