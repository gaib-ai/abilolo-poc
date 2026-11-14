import { UserProfile } from '../types';
import { DEFAULT_AVATAR_URL } from '../data';
import { getSupabaseBrowserClient } from './client';

export async function fetchUserProfileFromSupabase(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile from Supabase:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      username: data.username || `user_${data.id.slice(0, 6)}`,
      displayName: data.display_name || '子育てユーザー',
      avatarUrl: data.avatar_url || DEFAULT_AVATAR_URL,
      bio: data.bio || '子ども用品を気持ちよく譲り合いたいママ/パパです。',
      neighborhood: data.neighborhood || '東京都新宿区',
      prefecture: data.prefecture || '東京都',
      babyStages: data.baby_stages || ['0-6ヶ月 (乳児)'],
      followerCount: data.follower_count || 0,
      followingCount: data.following_count || 0,
      isFollowing: false,
      listedCount: 0,
      givenCount: 0,
      badges: ['認証メンバー'],
      createdAt: data.created_at ? data.created_at.split('T')[0] : '2026-11-01'
    };
  } catch (err) {
    console.error('Failed to fetch profile from Supabase:', err);
    return null;
  }
}

export async function upsertUserProfileToSupabase(
  userId: string,
  profile: Partial<UserProfile>
): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: profile.username,
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
        bio: profile.bio,
        neighborhood: profile.neighborhood,
        prefecture: profile.prefecture || '東京都',
        baby_stages: profile.babyStages,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error upserting profile in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to upsert profile:', err);
    return false;
  }
}
