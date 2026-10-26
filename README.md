# Abilolo (アビロロ) — POC

日本発・ベビー＆キッズ用品 0円お譲りマッチングプラットフォーム (Proof of Concept)

---

## 🎯 概要 (Overview)
**Abilolo** は、使わなくなった育児用品・ベビー服・ベビーカーなどを「0円で無償譲渡」したい家庭と、必要とする子育て家庭を直接マッチングするプラットフォームです。

### 解決する課題
1. **フリマ出品の負担解消**: メルカリ等の二手フリマでの価格設定・値下げ交渉・メッセージやり取りの手間を全廃。
2. **写真1枚でAI自動出品**: スマホで撮影するだけで、AI（Gemini / GPT-4o-mini）が商品名・カテゴリ・状態ランク・丁寧な紹介文・想定送料を自動生成。
3. **ノーリスク・0円決済**: プラットフォーム内での金銭売買は行わず、受取人が着払い送料（ヤマト宅急便／日本郵便）のみを負担するシンプル設計。

---

## 🛠 技術スタック (Tech Stack)
- **Framework**: Next.js (App Router) + TypeScript + React 19
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **AI Vision Engine**: Google Gemini 2.5 Flash / OpenAI Vision API (`/api/ai/describe-item`)
- **Persistence**: クライアントサイド自動永続化 (`localStorage`) ＋ サーバーレス連携対応
- **Deployment**: Vercel (Zero-config)

---

## 🚀 ローカル起動方法 (Local Setup)

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev
```
ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

### 環境変数 (任意)
AI画像認識のライブ呼び出しを行う場合、`.env.local` または Vercel Project Settings に設定します:
```bash
GEMINI_API_KEY=your_gemini_api_key
# または
OPENAI_API_KEY=your_openai_api_key
```
※ APIキー未設定の場合でも、デモ用サンプル写真による自動シミュレーションが作動し、ステークホルダーへのプレゼンが完結します。

---

## 📦 Vercel へのデプロイ手順 (Zero DevOps)
1. [Vercel Dashboard](https://vercel.com/dashboard) で **Add New Project** を選択。
2. GitHub リポジトリ `gaib-ai/abilolo-poc` をインポート。
3. Framework Preset が `Next.js` であることを確認。
4. **Deploy** をクリック（約60秒で完了）。
5. 発行された `https://abilolo-poc.vercel.app` をステークホルダーへ共有。
