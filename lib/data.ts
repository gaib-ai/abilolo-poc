import { Item, CategoryInfo, UserProfile, CommunityPost, ChatRoom, ChatMessage } from './types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'stroller-carseat',
    name: 'ベビーカー・チャイルドシート',
    iconName: 'Baby',
    subCategories: ['ベビーカー (A型/B型)', 'チャイルドシート', 'ベビーカーアクセサリ']
  },
  {
    id: 'carrier',
    name: '抱っこ紐・スリング',
    iconName: 'HeartHandshake',
    subCategories: ['抱っこ紐 (キャリア)', 'ヒップシート', 'スリング', '防寒ケープ']
  },
  {
    id: 'clothing',
    name: 'ベビー服・キッズ服',
    iconName: 'Shirt',
    subCategories: ['新生児 (50-70cm)', 'ベビー (80-95cm)', 'キッズ (100cm〜)', 'アウター・靴下']
  },
  {
    id: 'feeding',
    name: '授乳・お食事用品',
    iconName: 'Milk',
    subCategories: ['哺乳瓶・消毒器', '離乳食調理器・食器', 'ハイチェア', '授乳ケープ']
  },
  {
    id: 'bath-diaper',
    name: 'おむつ・お風呂・衛生',
    iconName: 'Bath',
    subCategories: ['おむつゴミ箱・ストッカー', 'ベビーバス・湯温計', '補助便座', '爪切り・体温計']
  },
  {
    id: 'bedding-furniture',
    name: '寝具・室内用品',
    iconName: 'BedDouble',
    subCategories: ['ベビーベッド・布団セット', 'バウンサー', 'ベビーゲート・サークル']
  },
  {
    id: 'toys',
    name: 'おもちゃ・知育玩具',
    iconName: 'Gamepad2',
    subCategories: ['知育玩具・積み木', 'メリー・ガラガラ', '絵本・布おもちゃ']
  }
];

export const PREFECTURES = [
  '東京都', '神奈川県', '埼玉県', '千葉県', '大阪府', '愛知県', '福岡県', '兵庫県', '北海道', '京都府', 'その他'
];

export const TOKYO_LOCATIONS = [
  { name: '新宿区 (西新宿)', lat: 35.6938, lng: 139.7034 },
  { name: '渋谷区 (代々木・恵比寿)', lat: 35.6580, lng: 139.7016 },
  { name: '世田谷区 (三軒茶屋・二子玉川)', lat: 35.6466, lng: 139.6533 },
  { name: '港区 (麻布・白金台)', lat: 35.6585, lng: 139.7514 },
  { name: '杉並区 (荻窪・高円寺)', lat: 35.6995, lng: 139.6358 },
  { name: '文京区 (本郷・小石川)', lat: 35.7078, lng: 139.7523 },
  { name: '目黒区 (中目黒・自由が丘)', lat: 35.6414, lng: 139.6981 },
  { name: '品川区 (大崎・五反田)', lat: 35.6092, lng: 139.7303 }
];

export const DEMO_PROFILES: Record<string, UserProfile> = {
  'user-sakura': {
    id: 'user-sakura',
    username: 'sakura_mom',
    displayName: 'さくらママ 🌸',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: '新宿区で1歳半の男の子を育児中。使わなくなった育児グッズを大切に使ってくださる方に0円でお譲りしています！お気軽にDMどうぞ✨',
    neighborhood: '東京都新宿区 (西新宿)',
    prefecture: '東京都',
    babyStages: ['1-2歳 (よちよち期)', '卒乳期'],
    followerCount: 128,
    followingCount: 84,
    isFollowing: false,
    listedCount: 6,
    givenCount: 5,
    badges: ['認証ママ', '迅速な発送', 'ゴールドギバー'],
    createdAt: '2026-08-15'
  },
  'user-ken': {
    id: 'user-ken',
    username: 'ken_dad',
    displayName: 'Ken_Dad 🍼',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: '渋谷区在住・2児のパパ（3歳女児＆0歳男児）。エルゴ抱っこ紐やベビーカーアクセサリーを出品中。週末の直接受け渡しも相談可！',
    neighborhood: '東京都渋谷区 (代々木)',
    prefecture: '東京都',
    babyStages: ['0-6ヶ月 (乳児)', '3-4歳 (未就学)'],
    followerCount: 95,
    followingCount: 42,
    isFollowing: true,
    listedCount: 4,
    givenCount: 3,
    badges: ['認証パパ', '丁寧な梱包'],
    createdAt: '2026-09-02'
  },
  'user-haru': {
    id: 'user-haru',
    username: 'haru_mom',
    displayName: 'HaruMom 🌿',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: '世田谷区でオーガニックコットンや北欧デザインのベビー服を中心に譲り合っています。洋服のサイズアウトが早くて出品多数！',
    neighborhood: '東京都世田谷区 (二子玉川)',
    prefecture: '東京都',
    babyStages: ['6-12ヶ月 (おすわり期)'],
    followerCount: 210,
    followingCount: 130,
    isFollowing: false,
    listedCount: 12,
    givenCount: 10,
    badges: ['認証ママ', 'スピード対応'],
    createdAt: '2026-07-10'
  }
};

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-1',
    title: 'コンビ (Combi) スゴカル 4キャス エッグショック ベビーカー',
    category: 'ベビーカー・チャイルドシート',
    subCategory: 'ベビーカー (A型/B型)',
    condition: '目立った傷や汚れなし',
    description: '生後1ヶ月から1歳半頃まで使用しました。室内保管でシートクッションも取り外して除菌洗濯済みです。タイヤ周りに使用に伴う小傷はありますが、走行や折りたたみ動作は非常にスムーズです。大切に使っていただける方にお譲りします。',
    targetAge: '1ヶ月〜36ヶ月頃 (体重15kg以下)',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'
    ],
    location: '東京都',
    neighborhood: '東京都新宿区 (西新宿)',
    latitude: 35.6938,
    longitude: 139.7034,
    shippingMethod: '着払い (ヤマト宅急便 160サイズ)',
    estimatedShippingFee: '約 2,100円〜2,500円',
    giverName: 'さくらママ 🌸',
    giverId: 'user-sakura',
    giverAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-25',
    status: 'available',
    views: 142,
    likes: 18
  },
  {
    id: 'item-2',
    title: 'エルゴベビー (Ergobaby) OMNI 360 クールエア 抱っこ紐 (ミッドナイトブルー)',
    category: '抱っこ紐・スリング',
    subCategory: '抱っこ紐 (キャリア)',
    condition: '未使用に近い',
    description: 'セカンド抱っこ紐として購入したため、実質5回程度しか使用していません。メッシュ素材で夏場も蒸れにくく快適です。ポーチ、説明書、日本正規品安全ベルト付きです。',
    targetAge: '新生児(3.2kg)〜4歳頃(20kg)',
    images: [
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80'
    ],
    location: '東京都',
    neighborhood: '東京都渋谷区 (代々木)',
    latitude: 35.6580,
    longitude: 139.7016,
    shippingMethod: '着払い (ヤマト宅急便 80サイズ)',
    estimatedShippingFee: '約 1,200円〜1,500円',
    giverName: 'Ken_Dad 🍼',
    giverId: 'user-ken',
    giverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-24',
    status: 'available',
    views: 205,
    likes: 27
  },
  {
    id: 'item-3',
    title: 'ベビービョルン バウンサー ブリス エアー (メッシュタイプ)',
    category: '寝具・室内用品',
    subCategory: 'バウンサー',
    condition: '目立った傷や汚れなし',
    description: '通気性の良いメッシュ素材で、汚れてもすぐに丸洗い・乾燥できて大変重宝しました。フレームのがたつきもなく、リクライニング3段階の切り替えも問題ありません。',
    targetAge: '生後1ヶ月〜2歳頃まで',
    images: [
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80'
    ],
    location: '東京都',
    neighborhood: '東京都世田谷区 (三軒茶屋)',
    latitude: 35.6466,
    longitude: 139.6533,
    shippingMethod: '着払い (ゆうパック 120サイズ)',
    estimatedShippingFee: '約 1,600円〜1,900円',
    giverName: 'HaruMom 🌿',
    giverId: 'user-haru',
    giverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-23',
    status: 'available',
    views: 89,
    likes: 12
  },
  {
    id: 'item-4',
    title: 'ミキハウス＆プチバトー 秋・冬物ロンパース 70-80cm 6枚まとめセット',
    category: 'ベビー服・キッズ服',
    subCategory: 'ベビー (80-95cm)',
    condition: '目立った傷や汚れなし',
    description: 'サイズアウトした男の子・女の子兼用の秋冬ベビー服まとめセットです。目立つシミや毛玉はなく綺麗な状態です。これからの季節の洗い替えにどうぞ。',
    targetAge: '生後6ヶ月〜1歳頃 (70〜80cm)',
    images: [
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80'
    ],
    location: '東京都',
    neighborhood: '東京都港区 (麻布十番)',
    latitude: 35.6585,
    longitude: 139.7514,
    shippingMethod: '着払い (宅急便コンパクト)',
    estimatedShippingFee: '約 600円〜800円',
    giverName: 'HaruMom 🌿',
    giverId: 'user-haru',
    giverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-22',
    status: 'available',
    views: 310,
    likes: 45
  },
  {
    id: 'item-5',
    title: 'ピジョン 哺乳瓶スチーム消毒・乾燥器 & ガラス製母乳実感 哺乳瓶2本セット',
    category: '授乳・お食事用品',
    subCategory: '哺乳瓶・消毒器',
    condition: '目立った傷や汚れなし',
    description: '電子レンジ不要でボタン一つで除菌から乾燥まで完了するスチーム器です。哺乳瓶（160ml/240ml）もお付けします。乳首部分は衛生面のため外しております。',
    targetAge: '生後0ヶ月〜授乳終了期',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'
    ],
    location: '東京都',
    neighborhood: '東京都文京区 (本郷)',
    latitude: 35.7078,
    longitude: 139.7523,
    shippingMethod: '着払い (ヤマト宅急便 100サイズ)',
    estimatedShippingFee: '約 1,400円〜1,600円',
    giverName: 'さくらママ 🌸',
    giverId: 'user-sakura',
    giverAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-21',
    status: 'claimed',
    claimedBy: {
      name: 'Tanaka S.',
      prefecture: '東京都',
      claimedAt: '2026-10-23'
    },
    views: 180,
    likes: 15
  },
  {
    id: 'item-6',
    title: 'エド・インター 森のあそび箱 / 木製知育パズル・ルーピングセット',
    category: 'おもちゃ・知育玩具',
    subCategory: '知育玩具・積み木',
    condition: 'やや傷や汚れあり',
    description: '5種類の遊びが楽しめる人気の木製知育トイです。天然木特有の角のすれや小傷がありますが、アルコール除菌済みで割れや欠けはなく安全に遊んでいただけます。',
    targetAge: '1歳〜3歳頃',
    images: [
      'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80'
    ],
    location: '東京都',
    neighborhood: '東京都杉並区 (荻窪)',
    latitude: 35.6995,
    longitude: 139.6358,
    shippingMethod: '着払い (ゆうパック 100サイズ)',
    estimatedShippingFee: '約 1,300円〜1,600円',
    giverName: 'Ken_Dad 🍼',
    giverId: 'user-ken',
    giverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-10-20',
    status: 'available',
    views: 94,
    likes: 9
  }
];

export const DEMO_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    userId: 'user-sakura',
    authorName: 'さくらママ 🌸',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    authorNeighborhood: '東京都新宿区 (西新宿)',
    category: 'tip',
    content: '新宿御苑でお散歩中☀️ 1歳児の靴選び、アシックスのスクスクシリーズが一番足首が安定して転びにくい気がします！皆様のおすすめファーストシューズは何ですか？👟',
    images: [
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80'
    ],
    neighborhood: '東京都新宿区 (西新宿)',
    latitude: 35.6938,
    longitude: 139.7034,
    likes: 24,
    isLiked: false,
    commentCount: 7,
    createdAt: '2026-11-04'
  },
  {
    id: 'post-2',
    userId: 'user-ken',
    authorName: 'Ken_Dad 🍼',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    authorNeighborhood: '東京都渋谷区 (代々木)',
    category: 'request',
    content: '【求む】渋谷〜代々木周辺で、B型コンパクトベビーカー（リベルやYOYO等）を使わなくなってお譲りいただける方いらっしゃいませんか？車移動が増えたため探しています！DMお待ちしています🙏',
    images: [],
    neighborhood: '東京都渋谷区 (代々木)',
    latitude: 35.6580,
    longitude: 139.7016,
    likes: 15,
    isLiked: true,
    commentCount: 4,
    createdAt: '2026-11-03'
  },
  {
    id: 'post-3',
    userId: 'user-haru',
    authorName: 'HaruMom 🌿',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    authorNeighborhood: '東京都世田谷区 (二子玉川)',
    category: 'tip',
    content: '離乳食中期のモグモグ期、シリコン製スチーマーとブレンダーの組み合わせで冷凍ストック作りが劇的に時短になりました！世田谷の小児科おすすめマップも作ろうかと考え中👶✨',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'
    ],
    neighborhood: '東京都世田谷区 (三軒茶屋)',
    latitude: 35.6466,
    longitude: 139.6533,
    likes: 38,
    isLiked: false,
    commentCount: 11,
    createdAt: '2026-11-02'
  }
];

export const DEMO_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-1',
    participant: {
      id: 'user-sakura',
      name: 'さくらママ 🌸',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      neighborhood: '東京都新宿区'
    },
    itemId: 'item-1',
    itemTitle: 'コンビ スゴカル 4キャス ベビーカー',
    itemImage: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=400&q=80',
    lastMessage: '梱包が完了しました！明日ヤマト便の着払いで発送手配いたしますね。',
    lastMessageAt: '10:45',
    unreadCount: 1
  },
  {
    id: 'room-2',
    participant: {
      id: 'user-ken',
      name: 'Ken_Dad 🍼',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      neighborhood: '東京都渋谷区'
    },
    itemId: 'item-2',
    itemTitle: 'エルゴベビー OMNI 360 抱っこ紐',
    itemImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'お譲り希望ありがとうございます！安全ベルトも同梱しています。',
    lastMessageAt: '昨日',
    unreadCount: 0
  }
];

export const DEMO_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'room-1': [
    {
      id: 'msg-1',
      roomId: 'room-1',
      senderId: 'me',
      senderName: 'あなた',
      content: '初めまして！コンビのベビーカーのお譲りを希望させていただきました。まだ受付可能でしょうか？',
      createdAt: '10:15',
      isMine: true
    },
    {
      id: 'msg-2',
      roomId: 'room-1',
      senderId: 'user-sakura',
      senderName: 'さくらママ 🌸',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      content: 'お問い合わせありがとうございます！はい、もちろん大丈夫です。着払いでの配送になりますが問題ございませんか？',
      createdAt: '10:22',
      isMine: false
    },
    {
      id: 'msg-3',
      roomId: 'room-1',
      senderId: 'me',
      senderName: 'あなた',
      content: 'はい！着払い送料は問題ありません。よろしくお願いいたします。',
      createdAt: '10:30',
      isMine: true
    },
    {
      id: 'msg-4',
      roomId: 'room-1',
      senderId: 'user-sakura',
      senderName: 'さくらママ 🌸',
      senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      content: '梱包が完了しました！明日ヤマト便の着払いで発送手配いたしますね。伝票番号が出ましたらこちらで共有します！',
      createdAt: '10:45',
      isMine: false
    }
  ],
  'room-2': [
    {
      id: 'msg-201',
      roomId: 'room-2',
      senderId: 'user-ken',
      senderName: 'Ken_Dad 🍼',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      content: 'お譲り希望ありがとうございます！安全ベルトも同梱しています。',
      createdAt: '昨日 15:30',
      isMine: false
    }
  ]
};

export const DEMO_PRESET_IMAGES = [
  {
    label: 'ベビーカー (Combi)',
    url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    mockResult: {
      title: 'Combi (コンビ) メチャカル ハンディ オート4キャス エッグショック',
      category: 'ベビーカー・チャイルドシート',
      subCategory: 'ベビーカー (A型/B型)',
      condition: '目立った傷や汚れなし' as const,
      targetAge: '生後1ヶ月〜36ヶ月 (体重15kg以下)',
      description: '軽量で扱いやすい人気モデルのコンビA型ベビーカーです。シートや日よけキャノピーに破れや大きな汚れはなく良好な状態です。車輪周りもスムーズに回転します。',
      estimatedShippingMethod: '着払い (ヤマト宅急便 160サイズ想定)',
      tags: ['コンビ', 'ベビーカー', '軽量', 'エッグショック']
    }
  },
  {
    label: '抱っこ紐 (Ergobaby)',
    url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    mockResult: {
      title: 'エルゴベビー (Ergobaby) OMNI 360 クールエア メッシュキャリア',
      category: '抱っこ紐・スリング',
      subCategory: '抱っこ紐 (キャリア)',
      condition: '未使用に近い' as const,
      targetAge: '新生児 (3.2kg) 〜 48ヶ月 (20kg)',
      description: 'エルゴベビーの通気性抜群なメッシュ素材抱っこ紐です。バックルの緩みや生地のほつれはなく、ホームクリーニング済みです。前向き抱っこ、おんぶにも対応しています。',
      estimatedShippingMethod: '着払い (ヤマト宅急便 80サイズ想定)',
      tags: ['エルゴベビー', '抱っこ紐', 'オムニ360', 'メッシュ']
    }
  },
  {
    label: '木製知育トイ',
    url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80',
    mockResult: {
      title: '天然木 知育ルーピング＆型はめパズル ボックス',
      category: 'おもちゃ・知育玩具',
      subCategory: '知育玩具・積み木',
      condition: '目立った傷や汚れなし' as const,
      targetAge: '生後10ヶ月〜3歳頃',
      description: 'ビーズコースターや型はめパズルが付いた木製知育玩具です。無害塗料仕上げで角も丸く処理されています。除菌アルコール拭き取り済みです。',
      estimatedShippingMethod: '着払い (ゆうパック 100サイズ想定)',
      tags: ['知育玩具', '木のおもちゃ', '型はめ', 'モンテッソーリ']
    }
  },
  {
    label: 'ベビーロンパースセット',
    url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
    mockResult: {
      title: 'オーガニックコットン ベビー長袖ロンパース 70cm 3枚セット',
      category: 'ベビー服・キッズ服',
      subCategory: '新生児 (50-70cm)',
      condition: '未使用に近い' as const,
      targetAge: '生後3ヶ月〜9ヶ月頃 (60〜70cm)',
      description: '肌に優しいオーガニックコットン100%の前開きロンパースセットです。お着替えさせやすいスナップボタン式。目立つ毛羽立ちや汚れはありません。',
      estimatedShippingMethod: '着払い (ネコポス / 宅急便コンパクト)',
      tags: ['ベビー服', 'ロンパース', 'オーガニックコットン', '70cm']
    }
  }
];
