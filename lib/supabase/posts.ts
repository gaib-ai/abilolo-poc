import { CommunityPost } from '../types';
import { getSupabaseBrowserClient } from './client';

export async function fetchCommunityPostsFromSupabase(): Promise<CommunityPost[] | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching community posts:', error);
      return null;
    }

    if (!data || data.length === 0) return [];

    return (data as Record<string, any>[]).map((row) => ({
      id: row.id,
      userId: row.user_id || 'user-anon',
      authorName: row.author_name,
      authorAvatar: row.author_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      authorNeighborhood: row.author_neighborhood || '東京都新宿区',
      category: row.category as any,
      content: row.content,
      images: row.image_urls || [],
      neighborhood: row.neighborhood || '東京都新宿区',
      latitude: row.latitude ? parseFloat(row.latitude) : 35.6938,
      longitude: row.longitude ? parseFloat(row.longitude) : 139.7034,
      likes: row.likes || 0,
      isLiked: false,
      commentCount: row.comment_count || 0,
      createdAt: row.created_at ? row.created_at.split('T')[0] : ''
    }));
  } catch (err) {
    console.error('Failed to fetch community posts from Supabase:', err);
    return null;
  }
}

export async function insertCommunityPostToSupabase(
  post: Omit<CommunityPost, 'id' | 'likes' | 'commentCount' | 'createdAt'>
): Promise<CommunityPost | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: post.userId,
        author_name: post.authorName,
        author_avatar: post.authorAvatar,
        author_neighborhood: post.authorNeighborhood,
        category: post.category,
        content: post.content,
        image_urls: post.images,
        neighborhood: post.neighborhood || '東京都新宿区',
        latitude: post.latitude || 35.6938,
        longitude: post.longitude || 139.7034,
        likes: 0,
        comment_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting community post:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      authorName: data.author_name,
      authorAvatar: data.author_avatar,
      authorNeighborhood: data.author_neighborhood,
      category: data.category,
      content: data.content,
      images: data.image_urls || [],
      neighborhood: data.neighborhood,
      latitude: data.latitude ? parseFloat(data.latitude) : 35.6938,
      longitude: data.longitude ? parseFloat(data.longitude) : 139.7034,
      likes: data.likes || 0,
      isLiked: true,
      commentCount: 0,
      createdAt: data.created_at ? data.created_at.split('T')[0] : ''
    };
  } catch (err) {
    console.error('Failed to insert community post:', err);
    return null;
  }
}
