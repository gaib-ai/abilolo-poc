import { NextResponse } from 'next/server';
import { DEMO_PRESET_IMAGES } from '@/lib/data';
import { AiExtractionResult } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { imageBase64, imageUrl, locale = 'ja' } = await req.json();

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const isEn = locale === 'en';

    // Check if matching preset URL exists
    if (imageUrl) {
      const presetIndex = DEMO_PRESET_IMAGES.findIndex((p) => p.url === imageUrl);
      if (presetIndex !== -1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const matched = DEMO_PRESET_IMAGES[presetIndex];
        
        if (isEn) {
          const englishPresets: AiExtractionResult[] = [
            {
              title: 'Combi Sugocal 4-Cas EggShock Compact Stroller',
              category: 'Strollers & Car Seats',
              subCategory: 'Strollers (Type A/B)',
              condition: '目立った傷や汚れなし',
              targetAge: '1 to 36 months (up to 15kg)',
              description: 'Lightweight Japanese Combi stroller with EggShock safety cushion. Wheels roll smoothly and fabric canopy is in very good condition with no tears. Indoor stored.',
              estimatedShippingMethod: 'COD (Yamato Transport 160 Size)',
              tags: ['Combi', 'Stroller', 'Lightweight', 'EggShock']
            },
            {
              title: 'Ergobaby OMNI 360 Cool Air Mesh Carrier',
              category: 'Baby Carriers & Slings',
              subCategory: 'Ergonomic Carriers',
              condition: '未使用に近い',
              targetAge: 'Newborn (3.2kg) to 48 months (20kg)',
              description: 'Breathable 3D mesh carrier in excellent condition. Buckles and straps are tight and secure. Freshly laundered with infant-safe detergent.',
              estimatedShippingMethod: 'COD (Yamato Transport 80 Size)',
              tags: ['Ergobaby', 'Carrier', 'Omni360', 'Mesh']
            },
            {
              title: 'Natural Wood Montessori Activity Maze & Shape Sorter',
              category: 'Toys & Educational',
              subCategory: 'Wooden & Montessori',
              condition: '目立った傷や汚れなし',
              targetAge: '10 months to 3 years old',
              description: 'Multi-functional wooden activity toy with bead coaster and shape puzzle. Smooth rounded corners with non-toxic finish. Sanitized and wiped down.',
              estimatedShippingMethod: 'COD (Yu-Pack 100 Size)',
              tags: ['Montessori', 'Wooden Toy', 'Puzzle', 'Toddler']
            },
            {
              title: 'Organic Cotton Long-Sleeve Romper Set 70cm (3 pcs)',
              category: 'Baby & Kids Clothing',
              subCategory: 'Newborn (50-70cm)',
              condition: '未使用に近い',
              targetAge: '3 to 9 months (60-70cm)',
              description: 'Soft 100% organic cotton coveralls with easy front snap buttons. Minimal wear, clean with no stains or fabric pilling.',
              estimatedShippingMethod: 'COD (Compact Box / Nekopos)',
              tags: ['Baby Clothing', 'Rompers', 'Organic Cotton', '70cm']
            }
          ];
          return NextResponse.json(englishPresets[presetIndex] || matched.mockResult);
        }

        return NextResponse.json(matched.mockResult);
      }
    }

    // 1. Try Token Kiosk API (Primary)
    const tokenKioskKey = process.env.TOKEN_KIOSK_API_KEY;
    if (tokenKioskKey) {
      try {
        const kioskResult = await callOpenAiVision({
          apiKey: tokenKioskKey,
          baseUrl: process.env.TOKEN_KIOSK_BASE_URL || 'https://api-token-kiosk.gaib.ai/v1',
          model: process.env.TOKEN_KIOSK_MODEL || 'gemini/gemini-2.5-flash',
          imageSource: imageBase64 || imageUrl,
          isEn
        });
        if (kioskResult) {
          return NextResponse.json(kioskResult);
        }
      } catch (err) {
        console.warn('Token Kiosk vision error, checking fallback keys:', err);
      }
    }

    // 2. Try Gemini API if key is present
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const geminiResult = await callGeminiVision(geminiKey, imageBase64 || imageUrl);
        if (geminiResult) {
          return NextResponse.json(geminiResult);
        }
      } catch (err) {
        console.warn('Gemini vision error, falling back:', err);
      }
    }

    // 3. Try OpenAI API if key is present
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      try {
        const openAiResult = await callOpenAiVision({
          apiKey: openAiKey,
          imageSource: imageBase64 || imageUrl,
          isEn
        });
        if (openAiResult) {
          return NextResponse.json(openAiResult);
        }
      } catch (err) {
        console.warn('OpenAI vision error, falling back:', err);
      }
    }

    // 3. Fallback demo response with believable AI parsing
    await new Promise((resolve) => setTimeout(resolve, 1400));
    const fallback: AiExtractionResult = {
      title: 'ベビー・キッズ用品 (AI自動検出)',
      category: 'ベビーカー・チャイルドシート',
      subCategory: 'ベビーカー (A型/B型)',
      condition: '目立った傷や汚れなし',
      targetAge: '生後6ヶ月〜2歳頃',
      description: 'AI画像認識により自動抽出されました。目立った損傷や破れは見られず、通常使用が可能な状態です。詳細な仕様や使用期間は適宜編集の上で出品してください。',
      estimatedShippingMethod: '着払い (ヤマト宅急便 100〜120サイズ想定)',
      tags: ['ベビー用品', 'キッズ', '状態良好', 'お譲り']
    };

    return NextResponse.json(fallback);
  } catch (error) {
    console.error('AI describe-item error:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}

async function callGeminiVision(apiKey: string, imageSource: string): Promise<AiExtractionResult | null> {
  let inlineDataPart;

  if (imageSource.startsWith('data:image')) {
    const [header, base64] = imageSource.split(',');
    const mimeType = header.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
    inlineDataPart = { inline_data: { mime_type: mimeType, data: base64 } };
  } else if (imageSource.startsWith('http')) {
    const res = await fetch(imageSource);
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = res.headers.get('content-type') || 'image/jpeg';
    inlineDataPart = { inline_data: { mime_type: mimeType, data: base64 } };
  } else {
    inlineDataPart = { inline_data: { mime_type: 'image/jpeg', data: imageSource } };
  }

  const prompt = `あなたは日本の中古ベビー・キッズ用品お譲りプラットフォーム「Abilolo」のAI出品アシスタントです。
画像に写っているベビー用品を詳細に分析し、以下のJSON形式のみで回答してください。Markdownのコードブロック(例: \`\`\`json)も含めず、純粋なJSON文字列のみを出力してください。

{
  "title": "ブランド名・商品名・モデルを含めた自然な日本語タイトル (例: コンビ メチャカル ハンディ オート4キャス)",
  "category": "以下のいずれか1つ: ベビーカー・チャイルドシート / 抱っこ紐・スリング / ベビー服・キッズ服 / 授乳・お食事用品 / おむつ・お風呂・衛生 / 寝具・室内用品 / おもちゃ・知育玩具",
  "subCategory": "該当する詳細サブカテゴリ",
  "condition": "外観・摩耗度から推定される状態 (以下のいずれか厳格に一致: 新品・未使用 / 未使用に近い / 目立った傷や汚れなし / やや傷や汚れあり)",
  "targetAge": "推定される対象年齢・月齢・サイズ (例: 生後1ヶ月〜3歳頃、70〜80cm)",
  "description": "丁寧な出品紹介文(2〜3文)。素材感、使用感、清掃・除菌の推奨、おすすめポイントを含める。",
  "estimatedShippingMethod": "梱包サイズの想定 (例: 着払い (ヤマト宅急便 120サイズ想定))",
  "tags": ["関連タグ1", "タグ2", "タグ3"]
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }, inlineDataPart]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  return parseJsonCleanly(rawText);
}

function parseJsonCleanly(text: string): AiExtractionResult {
  const cleaned = text
    .replace(/^```json/gim, '')
    .replace(/^```/gim, '')
    .trim();
  return JSON.parse(cleaned) as AiExtractionResult;
}

async function callOpenAiVision({
  apiKey,
  baseUrl = 'https://api.openai.com/v1',
  model = 'gpt-4o-mini',
  imageSource,
  isEn
}: {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  imageSource: string;
  isEn: boolean;
}): Promise<AiExtractionResult | null> {
  const imageUrl = imageSource.startsWith('data:') || imageSource.startsWith('http')
    ? imageSource
    : `data:image/jpeg;base64,${imageSource}`;

  const prompt = isEn
    ? `You are an AI assistant for "Abilolo", a Japan baby goods gifting platform.
Analyze the baby goods in the image and return ONLY a valid JSON object (no markdown, no backticks):
{
  "title": "Natural product title with brand and model",
  "category": "One of: Strollers & Car Seats / Baby Carriers & Slings / Baby & Kids Clothing / Feeding & Nursing / Bath, Diapers & Hygiene / Bedding & Nursery Furniture / Toys & Educational",
  "subCategory": "Specific subcategory",
  "condition": "One of: 新品・未使用 / 未使用に近い / 目立った傷や汚れなし / やや傷や汚れあり",
  "targetAge": "Estimated age or size",
  "description": "Polite, helpful description (2-3 sentences)",
  "estimatedShippingMethod": "Estimated box size (e.g. COD (Yamato Transport 100 Size))",
  "tags": ["tag1", "tag2"]
}`
    : `あなたは日本の中古ベビー・キッズ用品お譲りプラットフォーム「Abilolo」のAI出品アシスタントです。
画像に写っているベビー用品を詳細に分析し、以下のJSON形式のみで回答してください。Markdownのコードブロック(例: \`\`\`json)も含めず、純粋なJSON文字列のみを出力してください。
{
  "title": "ブランド名・商品名・モデルを含めた自然な日本語タイトル",
  "category": "以下のいずれか1つ: ベビーカー・チャイルドシート / 抱っこ紐・スリング / ベビー服・キッズ服 / 授乳・お食事用品 / おむつ・お風呂・衛生 / 寝具・室内用品 / おもちゃ・知育玩具",
  "subCategory": "該当する詳細サブカテゴリ",
  "condition": "以下のいずれか厳格に一致: 新品・未使用 / 未使用に近い / 目立った傷や汚れなし / やや傷や汚れあり",
  "targetAge": "推定される対象年齢・月齢・サイズ (例: 生後1ヶ月〜3歳頃、70〜80cm)",
  "description": "丁寧な出品紹介文(2〜3文)",
  "estimatedShippingMethod": "梱包サイズの想定 (例: 着払い (ヤマト宅急便 100サイズ想定))",
  "tags": ["関連タグ1", "タグ2"]
}`;

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vision API error from ${endpoint} (${res.status}): ${text}`);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) return null;

  return parseJsonCleanly(rawText);
}
