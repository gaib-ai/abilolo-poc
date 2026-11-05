export type ItemCondition = 
  | '新品・未使用'
  | '未使用に近い'
  | '目立った傷や汚れなし'
  | 'やや傷や汚れあり';

export type ItemStatus = 'available' | 'claimed';

export interface Item {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  condition: ItemCondition;
  description: string;
  targetAge: string;
  images: string[];
  location: string; // Prefecture (e.g., "東京都", "神奈川県")
  neighborhood?: string; // Ward / district (e.g., "東京都新宿区西新宿")
  latitude?: number;
  longitude?: number;
  shippingMethod: string; // e.g., "着払い (ヤマト宅急便 100サイズ想定)"
  estimatedShippingFee?: string; // e.g., "約 1,000円〜1,500円"
  giverName: string;
  giverId?: string;
  giverAvatar?: string;
  createdAt: string;
  status: ItemStatus;
  claimedBy?: {
    name: string;
    prefecture: string;
    claimedAt: string;
  };
  views: number;
  likes: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  subCategories: string[];
}

export interface AiExtractionResult {
  title: string;
  category: string;
  subCategory: string;
  condition: ItemCondition;
  targetAge: string;
  description: string;
  estimatedShippingMethod: string;
  tags: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  neighborhood: string; // e.g., "東京都新宿区"
  prefecture: string;
  babyStages: string[]; // e.g., ["0-6ヶ月 (乳児)", "1-2歳 (よちよち期)"]
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  listedCount: number;
  givenCount: number;
  badges: string[];
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  authorNeighborhood: string;
  content: string;
  images: string[];
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  likes: number;
  isLiked?: boolean;
  commentCount: number;
  createdAt: string;
  category: 'tip' | 'request' | 'chat';
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  isMine?: boolean;
}

export interface ChatRoom {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    neighborhood?: string;
  };
  itemId?: string;
  itemTitle?: string;
  itemImage?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}
