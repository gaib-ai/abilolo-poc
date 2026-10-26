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
  shippingMethod: string; // e.g., "着払い (ヤマト宅急便 100サイズ想定)"
  estimatedShippingFee?: string; // e.g., "約 1,000円〜1,500円"
  giverName: string;
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
