import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Abilolo (アビロロ) | 日本のベビー＆キッズ用品 0円お譲りプラットフォーム',
  description: '写真1枚でAI自動出品。使わなくなった育児用品を必要とする家庭へ配送料（着払い）のみでお譲りするマッチングプラットフォーム (POC)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
    </html>
  );
}
