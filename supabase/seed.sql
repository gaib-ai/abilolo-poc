-- Update items with diverse Tokyo ward locations & coordinates
UPDATE items SET 
  neighborhood = '東京都新宿区 (西新宿)',
  latitude = 35.6938,
  longitude = 139.7034,
  giver_id = 'user-sakura',
  giver_avatar = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
WHERE title LIKE '%コンビ%';

UPDATE items SET 
  neighborhood = '東京都渋谷区 (代々木)',
  latitude = 35.6580,
  longitude = 139.7016,
  giver_id = 'user-ken',
  giver_avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
WHERE title LIKE '%エルゴベビー%';

UPDATE items SET 
  neighborhood = '東京都世田谷区 (三軒茶屋)',
  latitude = 35.6466,
  longitude = 139.6533,
  giver_id = 'user-haru',
  giver_avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
WHERE title LIKE '%ベビービョルン%';

UPDATE items SET 
  neighborhood = '東京都港区 (麻布十番)',
  latitude = 35.6585,
  longitude = 139.7514,
  giver_id = 'user-haru',
  giver_avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
WHERE title LIKE '%ミキハウス%';

UPDATE items SET 
  neighborhood = '東京都杉並区 (荻窪)',
  latitude = 35.6995,
  longitude = 139.6358,
  giver_id = 'user-ken',
  giver_avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
WHERE title LIKE '%エド・インター%';

-- Insert initial real persistent posts if table is empty
INSERT INTO community_posts (id, user_id, author_name, author_avatar, author_neighborhood, category, content, image_urls, neighborhood, latitude, longitude, likes, comment_count)
SELECT 
  'a0000000-0000-0000-0000-000000000001',
  'user-sakura',
  'さくらママ 🌸',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  '東京都新宿区 (西新宿)',
  'tip',
  '新宿御苑でお散歩中！1歳児の靴選び、アシックスのスクスクシリーズが一番足首が安定して転びにくい気がします！皆様のおすすめファーストシューズは何ですか？',
  ARRAY['https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80']::text[],
  '東京都新宿区 (西新宿)',
  35.6938,
  139.7034,
  24,
  7
WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE id = 'a0000000-0000-0000-0000-000000000001');

INSERT INTO community_posts (id, user_id, author_name, author_avatar, author_neighborhood, category, content, image_urls, neighborhood, latitude, longitude, likes, comment_count)
SELECT 
  'a0000000-0000-0000-0000-000000000002',
  'user-ken',
  'Ken_Dad 🍼',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  '東京都渋谷区 (代々木)',
  'request',
  '【求む】渋谷〜代々木周辺で、B型コンパクトベビーカー（リベルやYOYO等）を使わなくなってお譲りいただける方いらっしゃいませんか？車移動が増えたため探しています！DMお待ちしています！',
  ARRAY[]::text[],
  '東京都渋谷区 (代々木)',
  35.6580,
  139.7016,
  15,
  4
WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE id = 'a0000000-0000-0000-0000-000000000002');

INSERT INTO community_posts (id, user_id, author_name, author_avatar, author_neighborhood, category, content, image_urls, neighborhood, latitude, longitude, likes, comment_count)
SELECT 
  'a0000000-0000-0000-0000-000000000003',
  'user-haru',
  'HaruMom 🌿',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  '東京都世田谷区 (二子玉川)',
  'tip',
  '離乳食中期のモグモグ期、シリコン製スチーマーとブレンダーの組み合わせで冷凍ストック作りが劇的に時短になりました！世田谷の小児科おすすめマップも作ろうかと考え中',
  ARRAY['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80']::text[],
  '東京都世田谷区 (三軒茶屋)',
  35.6466,
  139.6533,
  38,
  11
WHERE NOT EXISTS (SELECT 1 FROM community_posts WHERE id = 'a0000000-0000-0000-0000-000000000003');

-- Insert initial chat rooms and messages if empty
INSERT INTO chat_rooms (id, participant_id, participant_name, participant_avatar, participant_neighborhood, item_title, last_message, last_message_at, unread_count)
SELECT
  'c0000000-0000-0000-0000-000000000001',
  'user-sakura',
  'さくらママ 🌸',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  '東京都新宿区',
  'コンビ (Combi) スゴカル 4キャス ベビーカー',
  '梱包が完了しました！明日ヤマト便の着払いで発送手配いたしますね。',
  now(),
  1
WHERE NOT EXISTS (SELECT 1 FROM chat_rooms WHERE id = 'c0000000-0000-0000-0000-000000000001');

INSERT INTO chat_messages (id, room_id, sender_id, sender_name, sender_avatar, content, created_at)
SELECT
  'm0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'me',
  'あなた',
  NULL,
  '初めまして！コンビのベビーカーのお譲りを希望させていただきました。まだ受付可能でしょうか？',
  now() - INTERVAL '30 minutes'
WHERE NOT EXISTS (SELECT 1 FROM chat_messages WHERE id = 'm0000000-0000-0000-0000-000000000001');

INSERT INTO chat_messages (id, room_id, sender_id, sender_name, sender_avatar, content, created_at)
SELECT
  'm0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  'user-sakura',
  'さくらママ 🌸',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'お問い合わせありがとうございます！はい、もちろん大丈夫です。着払いでの配送になりますが問題ございませんか？',
  now() - INTERVAL '20 minutes'
WHERE NOT EXISTS (SELECT 1 FROM chat_messages WHERE id = 'm0000000-0000-0000-0000-000000000002');

INSERT INTO chat_messages (id, room_id, sender_id, sender_name, sender_avatar, content, created_at)
SELECT
  'm0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000001',
  'user-sakura',
  'さくらママ 🌸',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  '梱包が完了しました！明日ヤマト便の着払いで発送手配いたしますね。伝票番号が出ましたらこちらで共有します！',
  now() - INTERVAL '5 minutes'
WHERE NOT EXISTS (SELECT 1 FROM chat_messages WHERE id = 'm0000000-0000-0000-0000-000000000003');
