import { ChatRoom, ChatMessage } from '../types';
import { getSupabaseBrowserClient } from './client';

export async function fetchChatRoomsFromSupabase(): Promise<ChatRoom[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.warn('Error fetching chat rooms:', error);
      return null;
    }

    if (!data || data.length === 0) return [];

    return (data as Record<string, any>[]).map((row) => ({
      id: row.id,
      participant: {
        id: row.participant_id,
        name: row.participant_name,
        avatar: row.participant_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        neighborhood: row.participant_neighborhood || '東京都新宿区'
      },
      itemId: row.item_id,
      itemTitle: row.item_title,
      itemImage: row.item_image,
      lastMessage: row.last_message,
      lastMessageAt: row.last_message_at ? new Date(row.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      unreadCount: row.unread_count || 0
    }));
  } catch (err) {
    console.error('Failed to fetch chat rooms:', err);
    return null;
  }
}

export async function fetchChatMessagesFromSupabase(roomId: string): Promise<ChatMessage[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching messages for room:', roomId, error);
      return null;
    }

    return (data as Record<string, any>[]).map((row) => ({
      id: row.id,
      roomId: row.room_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      senderAvatar: row.sender_avatar,
      content: row.content,
      createdAt: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      isMine: row.sender_id === 'me'
    }));
  } catch (err) {
    console.error('Failed to query messages:', err);
    return null;
  }
}

export async function insertChatMessageToSupabase(
  roomId: string,
  content: string,
  senderId: string = 'me',
  senderName: string = 'あなた',
  senderAvatar?: string
): Promise<ChatMessage | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar || null,
        content
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving chat message:', error);
      return null;
    }

    // Also update room's last message
    await supabase
      .from('chat_rooms')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString()
      })
      .eq('id', roomId);

    return {
      id: data.id,
      roomId: data.room_id,
      senderId: data.sender_id,
      senderName: data.sender_name,
      senderAvatar: data.sender_avatar,
      content: data.content,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: data.sender_id === 'me'
    };
  } catch (err) {
    console.error('Failed to send message to Supabase:', err);
    return null;
  }
}
